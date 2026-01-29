import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  private router = inject(Router);
  private authService = inject(AuthService);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.authService.getUserRole() === 'Admin';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Navigate to Time Tracking module
   * Employees see Check-In/Out page
   * Admins see time tracking overview table
   */
  navigateToTimeTracking(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/time-tracking']);
    } else {
      this.router.navigate(['/employee/check-in-out']);
    }
  }

  /**
   * Navigate to Attendance module
   * Employees see their attendance records
   * Admins see all employees attendance management
   */
  navigateToAttendance(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/attendance']);
    } else {
      this.router.navigate(['/employee/attendance']);
    }
  }

  /**
   * Navigate to Leave Requests module
   * Employees see their leave requests
   * Admins see pending leave approvals
   */
  navigateToLeaveRequests(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/leave']);
    } else {
      this.router.navigate(['/employee/leave']);
    }
  }

  /**
   * Check if the current route is active
   */
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}