import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

/**
 * Modern Angular Application Configuration
 * Angular concepts demonstrated:
 * - Standalone application bootstrapping without NgModules
 * - provideRouter with withComponentInputBinding()
 * - provideHttpClient() for modern HttpClient injection
 * - provideAnimations() for smooth UI transitions
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    provideAnimations(),
  ],
};
