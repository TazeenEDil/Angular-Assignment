import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AttendanceService } from '../../../services/attendance';
import { LeaveService } from '../../../services/leave';
import { AttendanceAlertService } from '../../../services/attendance-alert';
import { EmployeeService } from '../../../services/employee';
import { AuthService } from '../../../services/auth/auth-service';
import { Modal } from '../../modal/modal';
import { Attendance, AttendanceStats, AttendanceAlert } from '../../../models/attendance.model';
import { LeaveType, LeaveRequest } from '../../../models/leave.model';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './employee-attendance.html',
  styleUrls: ['./employee-attendance.css']
})
export class EmployeeAttendanceComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private leaveService = inject(LeaveService);
  private alertService = inject(AttendanceAlertService);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);

  employeeId: number | null = null;
  todayAttendance: Attendance | null = null;
  stats: AttendanceStats | null = null;
  attendanceRecords: Attendance[] = [];
  leaveTypes: LeaveType[] = [];
  myLeaveRequests: LeaveRequest[] = [];
  alerts: AttendanceAlert[] = [];
  
  workMode: string = 'In-Office';
  dailyReport: string = '';
  
  // Leave request form
  showLeaveModal = false;
  leaveForm = {
    leaveTypeId: 0,
    startDate: '',
    endDate: '',
    reason: ''
  };
  
  // Modal
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  
  loading = false;
  isOnBreak = false;

  ngOnInit() {
    this.loadEmployeeData();
  }

  loadEmployeeData() {
    this.loading = true;
    const email = this.authService.getUserEmail();
    
    if (!email) {
      this.loading = false;
      this.showMessage('Error', 'User email not found');
      return;
    }

    this.employeeService.getEmployees().subscribe({
      next: (employees: any[]) => {
        const employee = employees?.find((e: any) => {
          const empEmail = e.Email || e.email;
          return empEmail?.toLowerCase() === email.toLowerCase();
        });
        
        if (employee) {
          this.employeeId = employee.Id || employee.id;
          this.loadAllData();
        } else {
          this.showMessage('Error', 'Employee not found');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading employee data:', error);
        this.showMessage('Error', 'Failed to load employee data');
        this.loading = false;
      }
    });
  }

  async loadAllData() {
    if (!this.employeeId) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      // Load today's attendance
      const records = await firstValueFrom(
        this.attendanceService.getEmployeeAttendance(this.employeeId, today, today)
      );
      this.todayAttendance = records && records.length > 0 ? records[0] : null;
      
      // Check if on break
      this.isOnBreak = !!(this.todayAttendance?.breakStart && !this.todayAttendance?.breakEnd);
      
      // Load stats for current month
      this.stats = await firstValueFrom(
        this.attendanceService.getEmployeeStats(
          this.employeeId,
          now.getFullYear(),
          now.getMonth() + 1
        )
      );
      
      // Load attendance records for last 30 days
      this.attendanceRecords = await firstValueFrom(
        this.attendanceService.getEmployeeAttendance(
          this.employeeId,
          startDate.toISOString().split('T')[0],
          today
        )
      ) || [];
      
      // Load leave types
      this.leaveTypes = await firstValueFrom(this.leaveService.getLeaveTypes()) || [];
      
      // Load my leave requests
      this.myLeaveRequests = await firstValueFrom(this.leaveService.getMyLeaveRequests()) || [];
      
      // Load alerts
      this.alerts = await firstValueFrom(this.alertService.getMyAlerts()) || [];
      
      this.loading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      this.loading = false;
    }
  }

  async clockIn() {
    if (!this.employeeId) return;
    
    try {
      await firstValueFrom(this.attendanceService.clockIn(this.workMode));
      this.showMessage('Success', 'Clocked in successfully');
      await this.loadAllData();
    } catch (error: any) {
      this.showMessage('Error', error.error?.message || 'Failed to clock in');
    }
  }

  async clockOut() {
    if (!this.employeeId) return;
    
    try {
      await firstValueFrom(this.attendanceService.clockOut());
      this.showMessage('Success', 'Clocked out successfully');
      await this.loadAllData();
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
      await this.loadAllData();
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
      await this.loadAllData();
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
      await this.loadAllData();
    } catch (error: any) {
      this.showMessage('Error', error.error?.message || 'Failed to submit report');
    }
  }

  openLeaveModal() {
    this.showLeaveModal = true;
    this.leaveForm = {
      leaveTypeId: this.leaveTypes.length > 0 ? this.leaveTypes[0].leaveTypeId : 0,
      startDate: '',
      endDate: '',
      reason: ''
    };
  }

  closeLeaveModal() {
    this.showLeaveModal = false;
  }

  async submitLeaveRequest() {
    if (!this.leaveForm.leaveTypeId || !this.leaveForm.startDate || !this.leaveForm.endDate || !this.leaveForm.reason) {
      this.showMessage('Error', 'Please fill all fields');
      return;
    }
    
    try {
      await firstValueFrom(this.leaveService.createLeaveRequest(this.leaveForm));
      this.showMessage('Success', 'Leave request submitted successfully');
      this.closeLeaveModal();
      await this.loadAllData();
    } catch (error: any) {
      this.showMessage('Error', error.error?.message || 'Failed to submit leave request');
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

  getLeaveStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'leave-approved';
      case 'Rejected': return 'leave-rejected';
      case 'Pending': return 'leave-pending';
      default: return '';
    }
  }

  showMessage(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}