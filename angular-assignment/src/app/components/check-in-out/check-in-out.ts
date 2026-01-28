import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AttendanceService } from '../../services/attendance';
import { AuthService } from '../../services/auth/auth-service';
import { Modal } from '../modal/modal';
import { Attendance } from '../../models/attendance.model';

@Component({
  selector: 'app-check-in-out',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './check-in-out.html',
  styleUrls: ['./check-in-out.css']
})
export class CheckInOut implements OnInit {
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);
  private router = inject(Router);

  todayAttendance: Attendance | null = null;
  workMode: string = 'In-Office';
  dailyReport: string = '';

  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showCancelButton = false;
  
  loading = false;
  isOnBreak = false;
  actionInProgress = false;

  ngOnInit() {
    console.log('Check-in/out component initialized for user:', this.authService.getUserEmail());
    this.loadTodayAttendance();
  }

  loadTodayAttendance() {
    this.loading = true;
    const today = new Date().toISOString().split('T')[0];
    
    this.attendanceService.getMyAttendance(today, today).subscribe({
      next: (records) => {
        if (records && records.length > 0) {
          this.todayAttendance = records[0];
          this.isOnBreak = !!(this.todayAttendance?.breakStart && !this.todayAttendance?.breakEnd);
          console.log('Today attendance loaded:', this.todayAttendance);
        } else {
          this.todayAttendance = null;
          this.isOnBreak = false;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load attendance:', error);
        if (error.status === 404) {
          this.todayAttendance = null;
          this.isOnBreak = false;
        } else if (error.status === 401 || error.status === 403) {
          this.showErrorModal('Session expired. Please login again.');
          this.router.navigate(['/login']);
        } else {
          this.showErrorModal('Failed to load attendance data. Please try again.');
        }
        this.loading = false;
      }
    });
  }

  clockIn() {
    if (this.actionInProgress) return;
    
    this.actionInProgress = true;
    this.attendanceService.clockIn(this.workMode).subscribe({
      next: () => {
        this.showSuccessModal('Clocked in successfully!');
        this.loadTodayAttendance();
        this.actionInProgress = false;
      },
      error: (error) => {
        console.error('Clock in error:', error);
        if (error.status === 400) {
          this.showErrorModal(error.error?.message || 'Cannot clock in at this time');
        } else if (error.status === 401 || error.status === 403) {
          this.showErrorModal('Session expired. Please login again.');
          this.router.navigate(['/login']);
        } else {
          this.showErrorModal('Failed to clock in. Please try again.');
        }
        this.actionInProgress = false;
      }
    });
  }

  clockOut() {
    if (this.actionInProgress || !this.todayAttendance?.clockIn) return;
    
    this.actionInProgress = true;
    this.attendanceService.clockOut().subscribe({
      next: () => {
        this.showSuccessModal('Clocked out successfully!');
        this.loadTodayAttendance();
        this.actionInProgress = false;
      },
      error: (error) => {
        console.error('Clock out error:', error);
        if (error.status === 400) {
          this.showErrorModal(error.error?.message || 'Cannot clock out at this time');
        } else if (error.status === 401 || error.status === 403) {
          this.showErrorModal('Session expired. Please login again.');
          this.router.navigate(['/login']);
        } else {
          this.showErrorModal('Failed to clock out. Please try again.');
        }
        this.actionInProgress = false;
      }
    });
  }

  startBreak() {
    if (this.actionInProgress || !this.todayAttendance?.clockIn || this.todayAttendance.clockOut) return;
    
    this.actionInProgress = true;
    this.attendanceService.startBreak().subscribe({
      next: () => {
        this.isOnBreak = true;
        this.showSuccessModal('Break started!');
        this.loadTodayAttendance();
        this.actionInProgress = false;
      },
      error: (error) => {
        console.error('Start break error:', error);
        this.showErrorModal(error.error?.message || 'Failed to start break');
        this.actionInProgress = false;
      }
    });
  }

  endBreak() {
    if (this.actionInProgress || !this.isOnBreak) return;
    
    this.actionInProgress = true;
    this.attendanceService.endBreak().subscribe({
      next: () => {
        this.isOnBreak = false;
        this.showSuccessModal('Break ended!');
        this.loadTodayAttendance();
        this.actionInProgress = false;
      },
      error: (error) => {
        console.error('End break error:', error);
        this.showErrorModal(error.error?.message || 'Failed to end break');
        this.actionInProgress = false;
      }
    });
  }

  submitDailyReport() {
    if (!this.dailyReport.trim()) {
      this.showErrorModal('Please enter a daily report');
      return;
    }
    
    if (this.actionInProgress) return;
    
    this.actionInProgress = true;
    this.attendanceService.submitDailyReport(this.dailyReport).subscribe({
      next: () => {
        this.showSuccessModal('Daily report submitted successfully!');
        this.dailyReport = '';
        this.loadTodayAttendance();
        this.actionInProgress = false;
      },
      error: (error) => {
        console.error('Submit report error:', error);
        this.showErrorModal(error.error?.message || 'Failed to submit report');
        this.actionInProgress = false;
      }
    });
  }

  formatTime(dateTime: string | null): string {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(duration: string | null): string {
    if (!duration) return '-';
    const [h, m] = duration.split(':');
    return `${h}h ${m}m`;
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

  showSuccessModal(message: string) {
    this.modalTitle = 'Success';
    this.modalMessage = message;
    this.showCancelButton = false;
    this.showModal = true;
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