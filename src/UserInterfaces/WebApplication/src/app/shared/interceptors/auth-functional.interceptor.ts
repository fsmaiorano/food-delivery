import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Skip authentication for Keycloak token requests
  if (req.url.includes('/protocol/openid-connect/token')) {
    return next(req);
  }

  // Only access localStorage in browser environment
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('access_token');

    if (token) {
      const authRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(authRequest);
    }
  }

  return next(req);
};
