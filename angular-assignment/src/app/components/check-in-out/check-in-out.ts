import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AttendanceService } from '../../services/attendance';
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
  private cdr = inject(ChangeDetectorRef);

  todayAttendance: Attendance | null = null;
  workMode: string = 'In-Office';
  dailyReport: string = '';

  showModal = false;
  modalTitle = '';
  modalMessage = '';

  loading = false;
  isOnBreak = false;

  ngOnInit() {
    console.log('🚀 Check-In/Out Component Init');
    this.loadTodayAttendance();
  }

  async loadTodayAttendance() {
    this.loading = true;
    console.log('📊 Loading today\'s attendance using /me endpoint...');

    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Today:', today);

      const records = await firstValueFrom(
        this.attendanceService.getMyAttendance(today, today)
      );

      console.log('✅ Response:', records);

      if (records && records.length > 0) {
        this.todayAttendance = records[0];
        this.isOnBreak = !!(this.todayAttendance?.breakStart && !this.todayAttendance?.breakEnd);
        console.log('✅ Today attendance loaded');
        console.log('   Clock In:', this.todayAttendance.clockIn);
        console.log('   Clock Out:', this.todayAttendance.clockOut);
        console.log('   On Break:', this.isOnBreak);
      } else {
        console.log('ℹ️ No attendance record for today');
        this.todayAttendance = null;
        this.isOnBreak = false;
      }

    } catch (error: any) {
      console.error('❌ Error loading attendance:', error);

      if (error.status === 404) {
        console.log('ℹ️ 404 - No record (normal)');
        this.todayAttendance = null;
      } else if (error.status === 401) {
        this.showMessage('Authentication Error', 'Please log out and log in again.');
      } else {
        this.showMessage('Error', error.error?.message || 'Failed to load attendance');
      }

    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async clockIn() {
    console.log('⏰ Clocking in...');
    try {
      await firstValueFrom(this.attendanceService.clockIn(this.workMode));
      console.log('✅ Clocked in');
      this.showMessage('Success', 'Clocked in successfully');
      await this.loadTodayAttendance();
    } catch (error: any) {
      console.error('❌ Clock in error:', error);
      this.showMessage('Error', error.error?.message || 'Failed to clock in');
    }
  }

  async clockOut() {
    console.log('⏰ Clocking out...');
    try {
      await firstValueFrom(this.attendanceService.clockOut());
      console.log('✅ Clocked out');
      this.showMessage('Success', 'Clocked out successfully');
      await this.loadTodayAttendance();
    } catch (error: any) {
      console.error('❌ Clock out error:', error);
      this.showMessage('Error', error.error?.message || 'Failed to clock out');
    }
  }

  async startBreak() {
    console.log('☕ Starting break...');
    try {
      await firstValueFrom(this.attendanceService.startBreak());
      this.isOnBreak = true;
      console.log('✅ Break started');
      this.showMessage('Success', 'Break started');
      await this.loadTodayAttendance();
    } catch (error: any) {
      console.error('❌ Start break error:', error);
      this.showMessage('Error', error.error?.message || 'Failed to start break');
    }
  }

  async endBreak() {
    console.log('☕ Ending break...');
    try {
      await firstValueFrom(this.attendanceService.endBreak());
      this.isOnBreak = false;
      console.log('✅ Break ended');
      this.showMessage('Success', 'Break ended');
      await this.loadTodayAttendance();
    } catch (error: any) {
      console.error('❌ End break error:', error);
      this.showMessage('Error', error.error?.message || 'Failed to end break');
    }
  }

  async submitDailyReport() {
    if (!this.dailyReport.trim()) {
      this.showMessage('Error', 'Please enter a daily report');
      return;
    }

    console.log('📝 Submitting daily report...');
    try {
      await firstValueFrom(this.attendanceService.submitDailyReport(this.dailyReport));
      console.log('✅ Report submitted');
      this.showMessage('Success', 'Daily report submitted successfully');
      this.dailyReport = '';
      await this.loadTodayAttendance();
    } catch (error: any) {
      console.error('❌ Submit report error:', error);
      this.showMessage('Error', error.error?.message || 'Failed to submit report');
    }
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

  showMessage(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.modalTitle = '';
    this.modalMessage = '';
    this.cdr.detectChanges();
  }
}