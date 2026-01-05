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

  private apiUrl = 'http://localhost:5231/api';
  private tokenKey = 'jwt_token';
  private userRoleKey = 'user_role';
  private userEmailKey = 'user_email';
  private userNameKey = 'user_name';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string>('');
  public userRole$ = this.userRoleSubject.asObservable();

  constructor() {
    if (this.isBrowser() && this.hasToken()) {
      this.isAuthenticatedSubject.next(true);
      const role = localStorage.getItem(this.userRoleKey) || '';
      this.userRoleSubject.next(role);
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.token) {
            this.setToken(response.token);
            this.setUserInfo(response.email, response.name, response.role);
            this.isAuthenticatedSubject.next(true);
            this.userRoleSubject.next(response.role);
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userRoleKey);
      localStorage.removeItem(this.userEmailKey);
      localStorage.removeItem(this.userNameKey);
    }
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next('');
    this.router.navigate(['/login']);
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
    return this.getUserRole() === 'Admin';
  }

  isEmployee(): boolean {
    return this.getUserRole() === 'Employee';
  }

  private setToken(token: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.tokenKey, token);
  }

  private setUserInfo(email: string, name: string, role: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.userEmailKey, email);
    localStorage.setItem(this.userNameKey, name);
    localStorage.setItem(this.userRoleKey, role);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}