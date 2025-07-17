import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip authentication for Keycloak token requests
    if (request.url.includes('/protocol/openid-connect/token')) {
      return next.handle(request);
    }

    // Only access localStorage in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');

      if (token) {
        const authRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next.handle(authRequest);
      }
    }

    return next.handle(request);
  }
}
