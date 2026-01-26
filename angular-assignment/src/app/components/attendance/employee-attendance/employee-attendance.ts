import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AttendanceService } from '../../../services/attendance';
import { EmployeeService } from '../../../services/employee';
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
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  employeeId: number | null = null;
  stats: AttendanceStats | null = null;
  attendanceRecords: Attendance[] = [];
  alerts: AttendanceAlert[] = [];
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  
  loading = false;

  ngOnInit() {
    console.log('🚀 Employee Attendance Component Initialized');
    this.loadEmployeeData();
  }

  loadEmployeeData() {
    this.loading = true;
    console.log('📥 Loading employee data...');
    
    const email = this.authService.getUserEmail();
    console.log('📧 User email from auth:', email);
    
    if (!email) {
      console.error('❌ No email found');
      this.loading = false;
      this.showMessage('Error', 'User email not found');
      return;
    }

    this.employeeService.getEmployees().subscribe({
      next: (employees: any[]) => {
        console.log('✅ Received employees:', employees?.length);
        console.log('📋 First employee structure:', employees?.[0]);
        
        const employee = employees?.find((e: any) => {
          const empEmail = e.Email || e.email;
          return empEmail?.toLowerCase() === email.toLowerCase();
        });
        
        if (employee) {
          console.log('✅ Employee found:', employee);
          
          // Try all possible ID property names
          this.employeeId = employee.employeeId || employee.EmployeeId || 
                           employee.Id || employee.id || 
                           employee.ID || null;
          
          console.log('✅ Employee ID extracted:', this.employeeId);
          
          if (!this.employeeId || this.employeeId === 0) {
            console.error('❌ Invalid employee ID:', this.employeeId);
            console.error('   Employee object:', employee);
            this.showMessage('Error', 'Invalid employee ID');
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }
          
          this.loadAllData();
        } else {
          console.error('❌ Employee not found in list');
          console.error('   Looking for email:', email);
          console.error('   Available employees:', employees?.map(e => ({
            email: e.Email || e.email,
            id: e.employeeId || e.EmployeeId || e.Id || e.id
          })));
          this.showMessage('Error', 'Employee not found');
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('❌ Error loading employee data:', error);
        this.showMessage('Error', 'Failed to load employee data: ' + (error.error?.message || error.message));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  async loadAllData() {
    if (!this.employeeId) {
      console.error('❌ No employee ID');
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    
    console.log('📊 Loading all data for employee:', this.employeeId);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      console.log('📅 Date range:', startDate.toISOString().split('T')[0], 'to', today);
      
      // Load stats for current month
      console.log('📈 Loading stats...');
      this.stats = await firstValueFrom(
        this.attendanceService.getEmployeeStats(
          this.employeeId,
          now.getFullYear(),
          now.getMonth() + 1
        )
      );
      console.log('✅ Stats loaded');
      
      // Load attendance records for last 30 days
      console.log('📋 Loading attendance records...');
      this.attendanceRecords = await firstValueFrom(
        this.attendanceService.getEmployeeAttendance(
          this.employeeId,
          startDate.toISOString().split('T')[0],
          today
        )
      ) || [];
      console.log('✅ Attendance records loaded:', this.attendanceRecords.length);
      
      // Load alerts
      console.log('🔔 Loading alerts...');
      try {
        this.alerts = await firstValueFrom(this.alertService.getMyAlerts()) || [];
        console.log('✅ Alerts loaded:', this.alerts.length);
      } catch (alertError: any) {
        console.error('⚠️ Error loading alerts:', alertError);
        this.alerts = [];
      }
      
      console.log('✅ All data loaded successfully!');
      
    } catch (error: any) {
      console.error('❌ Error in loadAllData:', error);
      this.showMessage('Error', 'Failed to load data: ' + (error.error?.message || error.message));
    } finally {
      this.loading = false;
      console.log('🎉 Loading set to false, triggering change detection');
      this.cdr.detectChanges();
      console.log('✅ Change detection complete - page should render now');
    }
  }

  async markAlertAsRead(alertId: number) {
    try {
      await firstValueFrom(this.alertService.markAlertAsRead(alertId));
      await this.loadAllData();
    } catch (error) {
      console.error('Error marking alert as read:', error);
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

  showMessage(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    console.log('🚪 Closing modal');
    this.showModal = false;
    this.modalTitle = '';
    this.modalMessage = '';
    this.cdr.detectChanges();
    console.log('✅ Modal closed');
  }
}