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
    if (this.isKeycloakTokenRequest(request)) {
      return next.handle(request);
    }

    const accessToken = this.authStore.getAccessToken();

    if (accessToken) {
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return next.handle(authRequest).pipe(
        catchError((error: HttpErrorResponse) => {
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
    const refreshToken = this.authStore.getRefreshToken();

    if (refreshToken && !this.authStore.isTokenExpiringSoon(0)) {
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          const newAccessToken = this.authStore.getAccessToken();
          if (newAccessToken) {
            const authRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            });
            return next.handle(authRequest);
          }

          this.authStore.clearAll();
          return throwError(() => new Error('Authentication failed'));
        }),
        catchError((error) => {
          this.authStore.clearAll();
          return throwError(() => error);
        })
      );
    }

    this.authStore.clearAll();
    return throwError(() => new Error('Authentication required'));
  }
}
