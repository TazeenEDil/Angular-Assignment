import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AttendanceService } from '../../services/attendance';
import { EmployeeService } from '../../services/employee';
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
export class CheckInOutComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  employeeId: number | null = null;
  todayAttendance: Attendance | null = null;
  workMode: string = 'In-Office';
  dailyReport: string = '';
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  
  loading = false;
  isOnBreak = false;

  ngOnInit() {
    console.log('🚀 Check-In/Out Component Initialized');
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
          const empEmail = e.Email || e.email || e.EMAIL;
          return empEmail?.toLowerCase() === email.toLowerCase();
        });
        
        if (employee) {
          console.log('✅ Employee found:', employee);
          console.log('📋 Employee object keys:', Object.keys(employee));
          
          // Try all possible ID property names
          this.employeeId = employee.employeeId || employee.EmployeeId || 
                           employee.EMPLOYEEID || employee.Id || 
                           employee.id || employee.ID || null;
          
          console.log('✅ Employee ID extracted:', this.employeeId);
          
          if (!this.employeeId || this.employeeId === 0 || isNaN(this.employeeId)) {
            console.error('❌ Invalid employee ID:', this.employeeId);
            console.error('   Employee object:', employee);
            this.showMessage('Error', 'Invalid employee ID. Please contact support.');
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }
          
          this.loadTodayAttendance();
        } else {
          console.error('❌ Employee not found in list');
          console.error('   Looking for email:', email);
          console.error('   Available employees:', employees?.map(e => ({
            email: e.Email || e.email || e.EMAIL,
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

  async loadTodayAttendance() {
    if (!this.employeeId) {
      console.error('❌ No employee ID');
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    
    console.log('📊 Loading today\'s attendance for employee:', this.employeeId);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      console.log('⏰ Loading today\'s attendance...');
      console.log('  - Employee ID:', this.employeeId);
      console.log('  - Date:', today);
      
      const records = await firstValueFrom(
        this.attendanceService.getEmployeeAttendance(this.employeeId, today, today)
      );
      this.todayAttendance = records && records.length > 0 ? records[0] : null;
      console.log('✅ Today\'s attendance loaded:', this.todayAttendance ? 'Found' : 'None');
      
      this.isOnBreak = !!(this.todayAttendance?.breakStart && !this.todayAttendance?.breakEnd);
      
      console.log('✅ Data loaded successfully!');
      
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      console.error('  - Status:', error.status);
      console.error('  - Error body:', error.error);
      
      // Don't show error for 404 (no attendance record yet) - this is normal
      if (error.status === 404) {
        console.log('ℹ️ No attendance record found for today - this is normal');
        this.todayAttendance = null;
      } else {
        this.showMessage('Error', 'Failed to load data: ' + (error.error?.message || error.message));
      }
    } finally {
      this.loading = false;
      console.log('🎉 Loading set to false, triggering change detection');
      this.cdr.detectChanges();
      console.log('✅ Change detection complete - page should render now');
    }
  }

  async clockIn() {
    if (!this.employeeId) return;
    
    try {
      await firstValueFrom(this.attendanceService.clockIn(this.workMode));
      this.showMessage('Success', 'Clocked in successfully');
      await this.loadTodayAttendance();
    } catch (error: any) {
      this.showMessage('Error', error.error?.message || 'Failed to clock in');
    }
  }

  async clockOut() {
    if (!this.employeeId) return;
    
    try {
      await firstValueFrom(this.attendanceService.clockOut());
      this.showMessage('Success', 'Clocked out successfully');
      await this.loadTodayAttendance();
    } catch (error: any) {
      this.showMessage('Error', error.error?.message || 'Failed to clock out');
    }
  }

  async startBreak() {
    if (!this.employeeId) return;
    
    try {
      await firstValueFrom(this.attendanceService.startBreak());
      this.isOnBreak = true;
      this.showMessage('Success', 'Break started');
      await this.loadTodayAttendance();
    } catch (error: any) {
      this.showMessage('Error', error.error?.message || 'Failed to start break');
    }
  }

  async endBreak() {
    if (!this.employeeId) return;
    
    try {
      await firstValueFrom(this.attendanceService.endBreak());
      this.isOnBreak = false;
      this.showMessage('Success', 'Break ended');
      await this.loadTodayAttendance();
    } catch (error: any) {
      this.showMessage('Error', error.error?.message || 'Failed to end break');
    }
  }

  async submitDailyReport() {
    if (!this.employeeId || !this.dailyReport.trim()) {
      this.showMessage('Error', 'Please enter a daily report');
      return;
    }
    
    try {
      await firstValueFrom(this.attendanceService.submitDailyReport(this.dailyReport));
      this.showMessage('Success', 'Daily report submitted successfully');
      this.dailyReport = '';
      await this.loadTodayAttendance();
    } catch (error: any) {
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