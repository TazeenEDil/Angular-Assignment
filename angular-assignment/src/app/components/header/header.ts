import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get userName(): string {
    return this.authService.getUserName();
  }

  get userRole(): string {
    return this.authService.getUserRole();
  }

  logout() {
    this.authService.logout();
  }

  navigateToAdd() {
    this.router.navigate(['/employee/add']);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}