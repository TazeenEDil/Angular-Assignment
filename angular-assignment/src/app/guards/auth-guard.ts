import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ Auth Guard activated');
  console.log('  - Target URL:', state.url);
  console.log('  - Checking authentication...');

  const isLoggedIn = authService.isLoggedIn();
  console.log('  - isLoggedIn():', isLoggedIn);

  if (isLoggedIn) {
    console.log('  ✅ Access granted');
    return true;
  }

  console.log('  ❌ Access denied - redirecting to login');
  console.log('  - Attempted URL will be:', state.url);
  
  // Redirect to login with return URL
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};