import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthStoreService } from '../services/auth-store.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authStore: AuthStoreService,
    private authService: AuthService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Don't add token to Keycloak token requests
    if (this.isKeycloakTokenRequest(request)) {
      return next.handle(request);
    }

    // Get the current access token
    const accessToken = this.authStore.getAccessToken();

    if (accessToken) {
      // Clone the request and add the authorization header
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return next.handle(authRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle token expiration
          if (error.status === 401 && !this.isKeycloakTokenRequest(request)) {
            return this.handle401Error(request, next);
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(request);
  }

  private isKeycloakTokenRequest(request: HttpRequest<any>): boolean {
    return request.url.includes('/protocol/openid-connect/token');
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Check if we have a refresh token and token is not expired
    const refreshToken = this.authStore.getRefreshToken();

    if (refreshToken && !this.authStore.isTokenExpiringSoon(0)) {
      // Try to refresh the token
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          // Get the new token and retry the request
          const newAccessToken = this.authStore.getAccessToken();
          if (newAccessToken) {
            const authRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            });
            return next.handle(authRequest);
          }

          // If we can't get a new token, clear auth state
          this.authStore.clearAll();
          return throwError(() => new Error('Authentication failed'));
        }),
        catchError((error) => {
          // Refresh failed, clear auth state
          this.authStore.clearAll();
          return throwError(() => error);
        })
      );
    }

    // No refresh token or it's expired, clear auth state
    this.authStore.clearAll();
    return throwError(() => new Error('Authentication required'));
  }
}
