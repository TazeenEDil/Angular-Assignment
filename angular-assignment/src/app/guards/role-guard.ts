import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as string;

  console.log('Role Guard - Required Role:', requiredRole);
  console.log('Role Guard - User Role:', authService.getUserRole());

  if (!authService.isAuthReady()) {
    return false;
  }

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  const userRole = authService.getUserRole();

  if (userRole === requiredRole || userRole === 'Admin') {
    console.log('Role Guard - Access granted');
    return true;
  }

  console.log('Role Guard - Access denied, redirecting to home');
  router.navigate(['/home'], { replaceUrl: true });
  return false;
};
