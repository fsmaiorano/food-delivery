import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  fullName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  expiresAt?: number;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStoreService {
  private readonly STORAGE_KEYS = {
    USER: 'auth_user',
    TOKENS: 'auth_tokens',
  };

  // Private state subjects
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  private tokensSubject = new BehaviorSubject<AuthTokens | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  public user$ = this.userSubject.asObservable();
  public tokens$ = this.tokensSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  // Computed observables
  public isAuthenticated$ = combineLatest([this.user$, this.tokens$]).pipe(
    map(([user, tokens]) => !!(user && tokens && tokens.accessToken))
  );

  public authState$ = combineLatest([
    this.user$,
    this.tokens$,
    this.isAuthenticated$,
    this.isLoading$,
    this.error$,
  ]).pipe(
    map(
      ([user, tokens, isAuthenticated, isLoading, error]): AuthState => ({
        user,
        tokens,
        isAuthenticated,
        isLoading,
        error,
      })
    )
  );

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadFromStorage();
  }

  // User management
  setUser(user: AuthUser | null): void {
    if (user) {
      // Add computed properties
      user.fullName = `${user.firstName} ${user.lastName}`.trim();
    }

    this.userSubject.next(user);
    this.saveToStorage('user', user);
  }

  getUser(): AuthUser | null {
    return this.userSubject.value;
  }

  updateUser(updates: Partial<AuthUser>): void {
    const currentUser = this.userSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.setUser(updatedUser);
    }
  }

  // Token management
  setTokens(tokens: AuthTokens | null): void {
    if (tokens) {
      // Calculate expiration time
      tokens.expiresAt = Date.now() + tokens.expiresIn * 1000;
    }

    this.tokensSubject.next(tokens);
    this.saveToStorage('tokens', tokens);
  }

  getTokens(): AuthTokens | null {
    return this.tokensSubject.value;
  }

  getAccessToken(): string | null {
    const tokens = this.tokensSubject.value;
    return tokens?.accessToken || null;
  }

  getRefreshToken(): string | null {
    const tokens = this.tokensSubject.value;
    return tokens?.refreshToken || null;
  }

  // Token validation
  isTokenValid(): boolean {
    const tokens = this.tokensSubject.value;
    if (!tokens || !tokens.accessToken) {
      return false;
    }

    if (tokens.expiresAt) {
      return Date.now() < tokens.expiresAt;
    }

    return true;
  }

  isTokenExpiringSoon(minutesBeforeExpiry: number = 5): boolean {
    const tokens = this.tokensSubject.value;
    if (!tokens?.expiresAt) {
      return false;
    }

    const expiryThreshold = Date.now() + minutesBeforeExpiry * 60 * 1000;
    return tokens.expiresAt <= expiryThreshold;
  }

  // Authentication state
  setAuthenticated(user: AuthUser, tokens: AuthTokens): void {
    this.setUser(user);
    this.setTokens(tokens);
    this.clearError();
  }

  isAuthenticated(): boolean {
    const user = this.userSubject.value;
    const tokens = this.tokensSubject.value;
    return !!(user && tokens && this.isTokenValid());
  }

  // Loading state
  setLoading(isLoading: boolean): void {
    this.isLoadingSubject.next(isLoading);
  }

  // Error state
  setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  // Role management
  hasRole(role: string): boolean {
    const user = this.userSubject.value;
    return user?.roles.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.userSubject.value;
    if (!user?.roles) return false;
    return roles.some((role) => user.roles.includes(role));
  }

  hasAllRoles(roles: string[]): boolean {
    const user = this.userSubject.value;
    if (!user?.roles) return false;
    return roles.every((role) => user.roles.includes(role));
  }

  // Clear all data
  clearAll(): void {
    this.userSubject.next(null);
    this.tokensSubject.next(null);
    this.isLoadingSubject.next(false);
    this.errorSubject.next(null);
    this.clearStorage();
  }

  // Storage management
  private saveToStorage(key: 'user' | 'tokens', data: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const storageKey =
        this.STORAGE_KEYS[key.toUpperCase() as keyof typeof this.STORAGE_KEYS];
      if (data) {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  }

  private loadFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      // Load user
      const userJson = localStorage.getItem(this.STORAGE_KEYS.USER);
      if (userJson) {
        const user = JSON.parse(userJson);
        this.userSubject.next(user);
      }

      // Load tokens
      const tokensJson = localStorage.getItem(this.STORAGE_KEYS.TOKENS);
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);

        // Check if tokens are still valid
        if (tokens.expiresAt && Date.now() >= tokens.expiresAt) {
          console.log('Stored tokens have expired, clearing...');
          this.clearAll();
        } else {
          this.tokensSubject.next(tokens);
        }
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error);
      this.clearStorage();
    }
  }

  private clearStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.removeItem(this.STORAGE_KEYS.USER);
      localStorage.removeItem(this.STORAGE_KEYS.TOKENS);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Utility methods
  getCurrentAuthState(): AuthState {
    return {
      user: this.userSubject.value,
      tokens: this.tokensSubject.value,
      isAuthenticated: this.isAuthenticated(),
      isLoading: this.isLoadingSubject.value,
      error: this.errorSubject.value,
    };
  }

  // Debug methods (for development)
  debugLogState(): void {
    console.log('Current Auth State:', {
      user: this.userSubject.value,
      tokens: this.tokensSubject.value
        ? {
            ...this.tokensSubject.value,
            accessToken:
              this.tokensSubject.value.accessToken.substring(0, 50) + '...',
          }
        : null,
      isAuthenticated: this.isAuthenticated(),
      isLoading: this.isLoadingSubject.value,
      error: this.errorSubject.value,
    });
  }
}
