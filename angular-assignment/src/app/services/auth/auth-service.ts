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
      
      console.log('📦 Initializing from localStorage:');
      console.log('   - Token exists:', token ? 'YES' : 'NO');
      console.log('   - Token length:', token?.length || 0);
      console.log('   - Role:', role || 'NONE');
      console.log('   - Email:', this.getUserEmail() || 'NONE');

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
    console.log('🔐 =========================');
    console.log('🔐 LOGIN ATTEMPT');
    console.log('🔐 =========================');
    console.log('📧 Email:', email);
    console.log('🔗 API URL:', `${this.apiUrl}/auth/login`);
    
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          console.log('📥 =========================');
          console.log('📥 LOGIN RESPONSE RECEIVED');
          console.log('📥 =========================');
          console.log('Response:', response);
          
          if (response && response.token) {
            console.log('✅ Login successful - Processing response');
            console.log('📝 Token length:', response.token.length);
            console.log('📝 Token preview:', response.token.substring(0, 50) + '...');
            console.log('📝 Role:', response.role);
            console.log('📝 Email:', response.email);
            console.log('📝 Name:', response.name);
            
            console.log('💾 Storing credentials in localStorage...');
            this.setToken(response.token);
            this.setUserInfo(response.email, response.name, response.role);
            
            console.log('🔄 Updating BehaviorSubjects...');
            this.isAuthenticatedSubject.next(true);
            this.userRoleSubject.next(response.role);
            
            // Verify storage immediately
            console.log('✅ =========================');
            console.log('✅ VERIFICATION');
            console.log('✅ =========================');
            const storedToken = localStorage.getItem(this.tokenKey);
            const storedRole = localStorage.getItem(this.userRoleKey);
            const storedEmail = localStorage.getItem(this.userEmailKey);
            const storedName = localStorage.getItem(this.userNameKey);
            
            console.log('Token stored:', !!storedToken, '| Length:', storedToken?.length || 0);
            console.log('Role stored:', storedRole || 'NOT FOUND');
            console.log('Email stored:', storedEmail || 'NOT FOUND');
            console.log('Name stored:', storedName || 'NOT FOUND');
            
            console.log('🎯 getToken() returns:', !!this.getToken());
            console.log('🎯 getUserRole() returns:', this.getUserRole());
            console.log('🎯 isLoggedIn() returns:', this.isLoggedIn());
            console.log('✅ Auth state fully updated');
          } else {
            console.error('❌ Invalid response - no token received');
            console.error('Response:', response);
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
    console.log('📝 Registration attempt for:', data.email);
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  logout(): void {
    console.log('🚪 =========================');
    console.log('🚪 LOGGING OUT');
    console.log('🚪 =========================');
    
    if (this.isBrowser()) {
      console.log('🗑️ Removing localStorage items...');
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userRoleKey);
      localStorage.removeItem(this.userEmailKey);
      localStorage.removeItem(this.userNameKey);
      console.log('✅ LocalStorage cleared');
    }

    console.log('🔄 Updating BehaviorSubjects to false...');
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next('');

    console.log('🔀 Navigating to login page...');
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      console.log('⚠️ Not in browser environment');
      return null;
    }
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      console.log('⚠️ getToken(): No token found in localStorage');
    }
    return token;
  }

  getUserRole(): string {
    if (!this.isBrowser()) return '';
    const role = localStorage.getItem(this.userRoleKey) || '';
    return role;
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
    return isAdminUser;
  }

  isEmployee(): boolean {
    return this.getUserRole() === 'Employee';
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const loggedIn = !!token;
    
    console.log('🔍 isLoggedIn() check:');
    console.log('   - Token exists:', !!token);
    console.log('   - Token length:', token?.length || 0);
    console.log('   - Result:', loggedIn);
    
    // Update BehaviorSubject if it's out of sync
    if (this.isAuthenticatedSubject.value !== loggedIn) {
      console.log('⚠️ BehaviorSubject out of sync - updating');
      this.isAuthenticatedSubject.next(loggedIn);
      
      if (loggedIn) {
        const role = this.getUserRole();
        console.log('🔄 Updating role BehaviorSubject to:', role);
        this.userRoleSubject.next(role);
      }
    }
    
    return loggedIn;
  }

  private setToken(token: string): void {
    if (!this.isBrowser()) {
      console.error('❌ Cannot set token - not in browser');
      return;
    }
    console.log('💾 setToken() - Saving to localStorage with key:', this.tokenKey);
    console.log('   Token length:', token.length);
    localStorage.setItem(this.tokenKey, token);
    
    // Verify immediately
    const verified = localStorage.getItem(this.tokenKey);
    console.log('✅ Verification: Token saved?', !!verified);
  }

  private setUserInfo(email: string, name: string, role: string): void {
    if (!this.isBrowser()) {
      console.error('❌ Cannot set user info - not in browser');
      return;
    }
    console.log('💾 setUserInfo() - Saving user data:');
    console.log('   Email:', email);
    console.log('   Name:', name);
    console.log('   Role:', role);
    
    localStorage.setItem(this.userEmailKey, email);
    localStorage.setItem(this.userNameKey, name);
    localStorage.setItem(this.userRoleKey, role);
    
    // Verify immediately
    console.log('✅ Verification:');
    console.log('   Email saved?', !!localStorage.getItem(this.userEmailKey));
    console.log('   Name saved?', !!localStorage.getItem(this.userNameKey));
    console.log('   Role saved?', !!localStorage.getItem(this.userRoleKey));
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Debug helper method
  debugAuthState(): void {
    console.log('🐛 =========================');
    console.log('🐛 AUTH STATE DEBUG');
    console.log('🐛 =========================');
    console.log('Token exists:', !!this.getToken());
    console.log('Token length:', this.getToken()?.length || 0);
    console.log('Token preview:', this.getToken()?.substring(0, 50) + '...' || 'NO TOKEN');
    console.log('Role:', this.getUserRole());
    console.log('Email:', this.getUserEmail());
    console.log('Name:', this.getUserName());
    console.log('isLoggedIn():', this.isLoggedIn());
    console.log('isAdmin():', this.isAdmin());
    console.log('isEmployee():', this.isEmployee());
    console.log('BehaviorSubject isAuthenticated:', this.isAuthenticatedSubject.value);
    console.log('BehaviorSubject userRole:', this.userRoleSubject.value);
    console.log('=========================');
  }
}