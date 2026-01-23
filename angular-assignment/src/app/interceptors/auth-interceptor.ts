import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth-service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  console.log('🔒 Auth Interceptor triggered');
  console.log('  - URL:', req.url);
  console.log('  - Method:', req.method);
  console.log('  - Token exists:', !!token);
  if (token) {
    console.log('  - Token preview:', `${token.substring(0, 30)}...`);
    console.log('  - User role:', authService.getUserRole());
  }

  // Clone request and add authorization header if token exists
  if (token) {
    console.log('  ✅ Adding Authorization header');
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.log('  ⚠️ No token - request will fail if protected');
  }

  return next(req).pipe(
    catchError(error => {
      console.error('❌ HTTP Error in Interceptor');
      console.error('  - Status:', error.status);
      console.error('  - URL:', req.url);
      console.error('  - Message:', error.message);
      console.error('  - Error body:', error.error);
      
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        console.log('🚨 401 Unauthorized - Calling logout()');
        console.log('  - This means the token is invalid or expired');
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};