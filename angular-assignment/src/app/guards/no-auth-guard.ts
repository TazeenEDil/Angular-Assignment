import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';

// This guard prevents logged-in users from accessing login/register pages
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('No-Auth Guard - Is Logged In:', authService.isLoggedIn());

  if (!authService.isLoggedIn()) {
    // Not logged in, allow access to login/register
    console.log('No-Auth Guard - Access granted to', state.url);
    return true;
  }

  // Already logged in, redirect to home
  console.log('No-Auth Guard - Already logged in, redirecting to /home');
  router.navigate(['/home'], { replaceUrl: true });
  return false;
};