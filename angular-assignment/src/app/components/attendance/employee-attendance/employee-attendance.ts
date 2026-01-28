import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../services/attendance';
import { AuthService } from '../../../services/auth/auth-service';
import { AttendanceAlertService } from '../../../services/attendance-alert';
import { Modal } from '../../modal/modal';
import { Attendance, AttendanceStats, AttendanceAlert } from '../../../models/attendance.model';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './employee-attendance.html',
  styleUrls: ['./employee-attendance.css']
})
export class EmployeeAttendance implements OnInit {
  private attendanceService = inject(AttendanceService);
  private alertService = inject(AttendanceAlertService);
  private authService = inject(AuthService);

  stats: AttendanceStats | null = null;
  attendanceRecords: Attendance[] = [];
  alerts: AttendanceAlert[] = [];
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showCancelButton = false;
  
  loading = false;

  ngOnInit() {

  console.log('=== Employee Attendance Debug ===');
  
  // Check auth status
  console.log('🔐 Auth Status:');
  console.log('  - Token exists:', !!this.authService.getToken());
  console.log('  - Is logged in:', this.authService.isLoggedIn());
  console.log('  - User email:', this.authService.getUserEmail());
  console.log('  - User role:', this.authService.getUserRole());
  
  // Decode token to see contents
  const token = this.authService.getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('  - Token payload:', payload);
      console.log('  - Token expiration:', new Date(payload.exp * 1000));
      console.log('  - Current time:', new Date());
    } catch (e) {
      console.error('Failed to parse token:', e);
    }
  }
  
  this.loadAttendanceData();
}

  loadAttendanceData() {
    this.loading = true;
    
    // Load attendance records for last 30 days
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    console.log('📅 Loading attendance from:', startDateStr, 'to', today);
    
    this.attendanceService.getMyAttendance(startDateStr, today).subscribe({
      next: (records) => {
        console.log('✅ Attendance records loaded:', records?.length || 0);
        this.attendanceRecords = records || [];
        
        // Calculate stats from the records
        this.calculateStatsFromRecords();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Failed to load attendance records:', error);
        
        if (error.status === 401) {
          this.showErrorModal('Session expired. Please login again.');
        } else if (error.status === 403) {
          this.showErrorModal('You do not have permission to access attendance records.');
        } else if (error.status === 404) {
          // If /me endpoint doesn't work, try alternative approach
          this.tryAlternativeApproach(startDateStr, today);
        } else {
          this.showErrorModal('Failed to load attendance data. Please try again.');
          this.loading = false;
        }
      }
    });
    
    // Load alerts from AttendanceAlerts service
    if (this.alertService && this.alertService.getMyAlerts) {
      this.alertService.getMyAlerts().subscribe({
        next: (alerts) => {
          console.log('✅ Alerts loaded:', alerts?.length || 0);
          this.alerts = alerts || [];
        },
        error: (error) => {
          console.error('Failed to load alerts:', error);
          this.alerts = [];
        }
      });
    } else {
      console.log('ℹ️ Alert service not available');
      this.alerts = [];
    }
  }

  // Calculate stats from the attendance records
  calculateStatsFromRecords() {
    if (this.attendanceRecords.length === 0) {
      this.stats = {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        leaveDays: 0,
        attendancePercentage: 0,
        reportSubmissionRate: 0
      };
      return;
    }
    
    const stats = {
      totalDays: this.attendanceRecords.length,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      leaveDays: 0,
      reportsSubmitted: 0
    };
    
    this.attendanceRecords.forEach(record => {
      switch (record.status) {
        case 'Present':
          stats.presentDays++;
          break;
        case 'Absent':
          stats.absentDays++;
          break;
        case 'Late':
          stats.lateDays++;
          break;
        case 'OnLeave':
          stats.leaveDays++;
          break;
      }
      
      if (record.dailyReportSubmitted) {
        stats.reportsSubmitted++;
      }
    });
    
    this.stats = {
      totalDays: stats.totalDays,
      presentDays: stats.presentDays,
      absentDays: stats.absentDays,
      lateDays: stats.lateDays,
      leaveDays: stats.leaveDays,
      attendancePercentage: stats.totalDays > 0 
        ? ((stats.presentDays + stats.lateDays) * 100 / stats.totalDays) 
        : 0,
      reportSubmissionRate: stats.totalDays > 0 
        ? (stats.reportsSubmitted * 100 / stats.totalDays) 
        : 0
    };
    
    console.log('📊 Calculated stats:', this.stats);
  }

  // Alternative approach if /me endpoint doesn't work
  tryAlternativeApproach(startDate: string, endDate: string) {
    console.log('🔄 Trying alternative approach...');
    
    // We need to get the employee ID first
    // But let's skip this for now and show empty data
    this.attendanceRecords = [];
    this.stats = {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      leaveDays: 0,
      attendancePercentage: 0,
      reportSubmissionRate: 0
    };
    
    this.showErrorModal('Attendance data is not available at the moment. Please try again later or contact support.');
    this.loading = false;
  }

  markAlertAsRead(alertId: number) {
    if (this.alertService && this.alertService.markAlertAsRead) {
      this.alertService.markAlertAsRead(alertId).subscribe({
        next: () => {
          console.log('✅ Alert marked as read:', alertId);
          // Remove the alert from the list
          this.alerts = this.alerts.filter(alert => alert.alertId !== alertId);
        },
        error: (error) => {
          console.error('❌ Error marking alert as read:', error);
        }
      });
    }
  }

  formatTime(dateTime: string | null): string {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDuration(duration: string | null): string {
    if (!duration) return '-';
    const parts = duration.split(':');
    return `${parts[0]}h ${parts[1]}m`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Present': return 'status-present';
      case 'Late': return 'status-late';
      case 'Absent': return 'status-absent';
      case 'OnLeave': return 'status-leave';
      default: return '';
    }
  }

  showErrorModal(message: string) {
    this.modalTitle = 'Error';
    this.modalMessage = message;
    this.showCancelButton = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.showCancelButton = false;
  }
}