import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { SignUpService } from './signup.service';
import { AuthStoreService, AuthUser, AuthTokens } from './auth-store.service';
import { environment } from '../../../environments/environment';

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
  private readonly keycloakUrl = environment.keycloakUrl;
  private readonly realm = environment.keycloakRealm;
  private readonly clientId = 'frontend-app';

  constructor(
    private http: HttpClient,
    private signUpService: SignUpService,
    private authStore: AuthStoreService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get currentUser$() {
    return this.authStore.user$;
  }

  get token$() {
    return this.authStore.tokens$.pipe(
      map((tokens) => tokens?.accessToken || null)
    );
  }

  get isAuthenticated$() {
    return this.authStore.isAuthenticated$;
  }

  get isLoading$() {
    return this.authStore.isLoading$;
  }

  get error$() {
    return this.authStore.error$;
  }

  signIn(credentials: SignInRequest): Observable<AuthResponse> {
    const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;

    this.authStore.setLoading(true);
    this.authStore.clearError();

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
        switchMap((response) => {
          console.log('Authentication successful:', response);
          const tokens: AuthTokens = {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            tokenType: response.token_type,
            expiresIn: response.expires_in,
            scope: response.scope,
          };

          this.authStore.setTokens(tokens);

          return this.loadUserInfoAsync().pipe(
            map(() => response),
            catchError((error: any) => {
              console.error('Error loading user info:', error);
              this.authStore.clearAll();
              return throwError(() => error);
            })
          );
        }),
        tap(() => {
          this.authStore.setLoading(false);
        }),
        catchError((error: any) => {
          this.authStore.setLoading(false);
          this.authStore.setError(this.getErrorMessage(error));
          return throwError(() => error);
        })
      );
  }

  signUp(userData: SignUpRequest): Observable<any> {
    return this.signUpService.registerUser(userData).pipe(
      switchMap((response) => {
        return this.signIn({
          username: userData.username,
          password: userData.password,
        });
      })
    );
  }

  signOut(): void {
    this.authStore.clearAll();
  }

  private loadUserInfoAsync(): Observable<AuthUser> {
    const token = this.authStore.getAccessToken();
    if (!token) {
      return throwError(() => new Error('No access token available'));
    }

    const userInfoUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('Attempting to load user info from:', userInfoUrl);
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');

    return this.http.get<any>(userInfoUrl, { headers }).pipe(
      map((userInfo) => {
        console.log('User info loaded successfully:', userInfo);
        const user: AuthUser = {
          id: userInfo.sub,
          username: userInfo.preferred_username,
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          roles: userInfo.realm_access?.roles || [],
        };
        this.authStore.setUser(user);
        return user;
      })
    );
  }

  private loadUserInfo(): void {
    this.loadUserInfoAsync().subscribe({
      next: (user) => {
        console.log('User info loaded:', user);
      },
      error: (error) => {
        console.error('Error loading user info:', error);
        this.authStore.clearAll();
      },
    });
  }

  isAuthenticated(): boolean {
    return this.authStore.isAuthenticated();
  }

  hasRole(role: string): boolean {
    return this.authStore.hasRole(role);
  }

  getAccessToken(): string | null {
    return this.authStore.getAccessToken();
  }

  getCurrentUser(): AuthUser | null {
    return this.authStore.getUser();
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.authStore.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
    });

    return this.http
      .post<AuthResponse>(tokenUrl, body.toString(), { headers })
      .pipe(
        tap((response) => {
          const tokens: AuthTokens = {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            tokenType: response.token_type,
            expiresIn: response.expires_in,
            scope: response.scope,
          };
          this.authStore.setTokens(tokens);
        })
      );
  }

  private getErrorMessage(error: any): string {
    console.error('Authentication error:', error);

    if (error.error?.error_description) {
      return error.error.error_description;
    }
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.status === 401) {
      return 'Invalid username or password';
    }
    if (error.status === 403) {
      return 'Access forbidden. Please check your credentials and try again.';
    }
    if (error.status === 0) {
      return 'Unable to connect to authentication server. Please check if Keycloak is running.';
    }
    return `An error occurred (${error.status}): ${
      error.statusText || 'Please try again.'
    }`;
  }
}
