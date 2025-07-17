import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { SignUpService } from './signup.service';

export interface AuthUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface SignInRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly keycloakUrl = 'http://localhost:6005';
  private readonly realm = 'myrealm';
  private readonly clientId = 'frontend-app';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private signUpService: SignUpService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadTokenFromStorage();
  }

  signIn(credentials: SignInRequest): Observable<AuthResponse> {
    const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams({
      grant_type: 'password',
      username: credentials.username,
      password: credentials.password,
      client_id: this.clientId,
      scope: 'openid profile email',
    });

    console.log('Attempting to authenticate with:', {
      url: tokenUrl,
      username: credentials.username,
      clientId: this.clientId,
      realm: this.realm,
    });

    return this.http
      .post<AuthResponse>(tokenUrl, body.toString(), { headers })
      .pipe(
        tap((response) => {
          console.log('Authentication successful:', response);
          this.setToken(response.access_token);
          this.loadUserInfo();
        })
      );
  }

  signUp(userData: SignUpRequest): Observable<any> {
    return this.signUpService.registerUser(userData).pipe(
      switchMap((response) => {
        // After successful registration, attempt to sign in
        return this.signIn({
          username: userData.username,
          password: userData.password,
        });
      })
    );
  }

  signOut(): void {
    this.clearToken();
    this.currentUserSubject.next(null);
  }

  private loadUserInfo(): void {
    const token = this.getToken();
    if (token) {
      const userInfoUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      console.log('Attempting to load user info from:', userInfoUrl);
      console.log('Token (first 50 chars):', token.substring(0, 50) + '...');

      this.http.get<any>(userInfoUrl, { headers }).subscribe({
        next: (userInfo) => {
          console.log('User info loaded successfully:', userInfo);
          const user: AuthUser = {
            username: userInfo.preferred_username,
            email: userInfo.email,
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
            roles: userInfo.realm_access?.roles || [],
          };
          this.currentUserSubject.next(user);
        },
        error: (error) => {
          console.error('Error loading user info:', error);
          console.error('Error status:', error.status);
          console.error('Error details:', error.error);
          this.clearToken();
        },
      });
    }
  }

  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token);
    }
    this.tokenSubject.next(token);
  }

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private clearToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
    }
    this.tokenSubject.next(null);
  }

  private loadTokenFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
      if (token) {
        this.tokenSubject.next(token);
        this.loadUserInfo();
      }
    }
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!this.getToken();
    }
    return false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles.includes(role) || false;
  }
}
