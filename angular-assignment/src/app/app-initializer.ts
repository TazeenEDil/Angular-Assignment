import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './services/auth/auth-service';

export function initializeApp() {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  return (): Promise<void> => {
    return new Promise((resolve) => {
      // Only run in browser
      if (!isPlatformBrowser(platformId)) {
        resolve();
        return;
      }

      const isLoggedIn = authService.isLoggedIn();
      const currentPath = window.location.pathname;

      console.log('APP_INITIALIZER - Is Logged In:', isLoggedIn);
      console.log('APP_INITIALIZER - Current Path:', currentPath);

      // Determine target route
      if (isLoggedIn) {
        if (currentPath === '/login' || currentPath === '/' || currentPath === '') {
          console.log('APP_INITIALIZER - Logged in user on login page, redirecting to /home');
          window.history.replaceState(null, '', '/home');
        }
      } else {
        if (currentPath !== '/login' && !currentPath.startsWith('/register')) {
          console.log('APP_INITIALIZER - Not logged in, redirecting to /login');
          window.history.replaceState(null, '', '/login');
        }
      }

      // Resolve immediately after setting the URL
      resolve();
    });
  };
}