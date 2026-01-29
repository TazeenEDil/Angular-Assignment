import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../services/attendance';
import { AttendanceStats, Attendance } from '../../../models/attendance.model';
import { AuthService } from '../../../services/auth/auth-service';
import { Modal } from '../../modal/modal';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, Modal],
  templateUrl: './employee-attendance.html',
  styleUrls: ['./employee-attendance.css']
})
export class EmployeeAttendance implements OnInit {
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  stats: AttendanceStats | null = null;
  attendanceRecords: Attendance[] = [];

  currentYear: number;
  currentMonth: number;

  loading = false;
  error: string | null = null;

  showModal = false;
  modalTitle = '';
  modalMessage = '';

  constructor() {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth() + 1; // JS months are 0-based
  }

  ngOnInit(): void {
    console.log('🚀 Employee Attendance Component Init');
    this.loadAttendanceData();
  }

  loadAttendanceData(): void {
    this.loading = true;
    this.error = null;

    try {
      // Get date range for current month
      const startDate = new Date(this.currentYear, this.currentMonth - 1, 1);
      const endDate = new Date(this.currentYear, this.currentMonth, 0);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log(`📊 Loading attendance from ${startDateStr} to ${endDateStr}`);

      // ✅ Use /me endpoints (no employeeId needed)
      Promise.all([
        firstValueFrom(
          this.attendanceService.getMyStats(
            this.currentYear,
            this.currentMonth
          )
        ),
        firstValueFrom(
          this.attendanceService.getMyAttendance(startDateStr, endDateStr)
        )
      ]).then(([statsData, attendanceData]) => {
        this.stats = statsData;
        this.attendanceRecords = attendanceData || [];
        console.log('✅ Attendance data loaded:', {
          stats: this.stats,
          records: this.attendanceRecords.length
        });
        this.loading = false;
        this.cdr.detectChanges();
      }).catch((error) => {
        console.error('❌ Error loading attendance data:', error);
        this.error = 'Failed to load attendance data';
        
        if (error.status === 401) {
          this.showMessage(
            'Authentication Error',
            'Please log out and log in again.'
          );
        } else {
          this.showMessage(
            'Error',
            error.error?.message || 'Failed to load attendance data'
          );
        }
        
        this.loading = false;
        this.cdr.detectChanges();
      });
    } catch (err: any) {
      console.error('❌ Exception loading attendance:', err);
      this.error = 'An unexpected error occurred';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  onMonthChange(year: number, month: number): void {
    this.currentYear = year;
    this.currentMonth = month;
    this.loadAttendanceData();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      case 'Present':
        return 'status-present';
      case 'Late':
        return 'status-late';
      case 'Absent':
        return 'status-absent';
      case 'OnLeave':
        return 'status-leave';
      default:
        return '';
    }
  }

  showMessage(title: string, message: string): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
  }
}