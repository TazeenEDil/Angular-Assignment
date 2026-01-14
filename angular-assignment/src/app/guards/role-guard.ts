import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredRole = route.data['role'] as string;

  console.log('Role Guard - Required Role:', requiredRole);
  console.log('Role Guard - User Role:', authService.getUserRole());

  if (!authService.isLoggedIn()) {
    console.log('Role Guard - Not logged in, redirecting to login');
    router.navigate(['/login']);
    return false;
  }

  const userRole = authService.getUserRole();

  if (userRole === requiredRole || userRole === 'Admin') {
    console.log('Role Guard - Access granted');
    return true;
  }

  // Redirect to employee list if no permission
  console.log('Role Guard - Access denied, redirecting to home');
  router.navigate(['/home']);
  return false;
};