import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Auth Guard - Is Logged In:', authService.isLoggedIn());
  console.log('Auth Guard - Attempting to access:', state.url);

  if (authService.isLoggedIn()) {
    return true;
  }

  console.log('Auth Guard - Redirecting to login');
  router.navigate(['/login']);
  return false;
};