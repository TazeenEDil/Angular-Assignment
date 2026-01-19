import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface LoginResponse {
  token: string;
  email: string;
  name: string;
  role: string;
  expiresAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = 'http://localhost:5224/api';
  private tokenKey = 'jwt_token';
  private userRoleKey = 'user_role';
  private userEmailKey = 'user_email';
  private userNameKey = 'user_name';

  private authReady = false;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string>('');
  public userRole$ = this.userRoleSubject.asObservable();

  constructor() {
    console.log('🔧 AuthService constructor called');
    
    // Initialize auth state from localStorage
    if (this.isBrowser()) {
      const token = this.getToken();
      const role = this.getUserRole();
      
      console.log('📦 Token from localStorage:', token ? 'EXISTS' : 'NULL');
      console.log('👤 Role from localStorage:', role || 'NONE');

      if (token) {
        console.log('✅ User is authenticated (token found)');
        this.isAuthenticatedSubject.next(true);
        this.userRoleSubject.next(role);
      } else {
        console.log('❌ User is NOT authenticated (no token)');
        this.isAuthenticatedSubject.next(false);
      }
    }
    
    this.authReady = true;
  }

  isAuthReady(): boolean {
    return this.authReady;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    console.log('🔐 Login attempt for:', email);
    
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            console.log('✅ Login successful');
            console.log('📝 Saving token and user info');
            
            this.setToken(response.token);
            this.setUserInfo(response.email, response.name, response.role);
            this.isAuthenticatedSubject.next(true);
            this.userRoleSubject.next(response.role);
            
            console.log('✅ Auth state updated');
          }
        })
      );
  }

  register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    positionId?: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  logout(): void {
    console.log('🚪 Logging out');
    
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userRoleKey);
      localStorage.removeItem(this.userEmailKey);
      localStorage.removeItem(this.userNameKey);
    }

    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next('');

    this.router.navigate(['/login'], { replaceUrl: true });
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.tokenKey);
  }

  getUserRole(): string {
    if (!this.isBrowser()) return '';
    return localStorage.getItem(this.userRoleKey) || '';
  }

  getUserEmail(): string {
    if (!this.isBrowser()) return '';
    return localStorage.getItem(this.userEmailKey) || '';
  }

  getUserName(): string {
    if (!this.isBrowser()) return '';
    return localStorage.getItem(this.userNameKey) || '';
  }

  isAdmin(): boolean {
    const role = this.getUserRole();
    const isAdminUser = role === 'Admin';
    console.log('🔍 isAdmin check - Role:', role, 'Result:', isAdminUser);
    return isAdminUser;
  }

  isEmployee(): boolean {
    return this.getUserRole() === 'Employee';
  }

  // 🔥 FIXED: Now checks token existence, not just BehaviorSubject
  isLoggedIn(): boolean {
    const token = this.getToken();
    const loggedIn = !!token;
    
    console.log('🔍 isLoggedIn check');
    console.log('  - Token exists:', !!token);
    console.log('  - Result:', loggedIn);
    
    // Update BehaviorSubject if it's out of sync
    if (this.isAuthenticatedSubject.value !== loggedIn) {
      console.log('⚠️ Syncing BehaviorSubject to match token state');
      this.isAuthenticatedSubject.next(loggedIn);
      
      if (loggedIn) {
        const role = this.getUserRole();
        this.userRoleSubject.next(role);
      }
    }
    
    return loggedIn;
  }

  private setToken(token: string): void {
    if (!this.isBrowser()) return;
    console.log('💾 Saving token to localStorage');
    localStorage.setItem(this.tokenKey, token);
  }

  private setUserInfo(email: string, name: string, role: string): void {
    if (!this.isBrowser()) return;
    console.log('💾 Saving user info - Role:', role);
    localStorage.setItem(this.userEmailKey, email);
    localStorage.setItem(this.userNameKey, name);
    localStorage.setItem(this.userRoleKey, role);
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}