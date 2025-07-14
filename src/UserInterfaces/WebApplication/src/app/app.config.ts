import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

// Create a custom HTTP interceptor function to handle self-signed certificates
const acceptSelfSignedCertificateInterceptor = (req: any, next: any) => {
  // Process will only be available in Node.js environment (SSR)
  if (typeof process !== 'undefined' && process?.versions?.node) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // Disable certificate validation in SSR
  }

  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([acceptSelfSignedCertificateInterceptor])
    ),
    provideAnimationsAsync(),
  ],
};
