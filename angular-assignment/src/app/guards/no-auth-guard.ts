import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';

// Prevent logged-in users from accessing login/register pages
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('No-Auth Guard - Is Logged In:', authService.isLoggedIn());

  // wait until auth is restored
  if (!authService.isAuthReady()) {
    return false;
  }

  if (!authService.isLoggedIn()) {
    console.log('No-Auth Guard - Access granted to', state.url);
    return true;
  }

  console.log('No-Auth Guard - Already logged in, redirecting to /home');
  router.navigate(['/home'], { replaceUrl: true });
  return false;
};
