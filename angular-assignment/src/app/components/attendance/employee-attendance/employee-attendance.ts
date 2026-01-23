import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

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
        
        const employee = employees?.find((e: any) => {
          const empEmail = e.Email || e.email;
          return empEmail?.toLowerCase() === email.toLowerCase();
        });
        
        if (employee) {
          this.employeeId = employee.Id || employee.id;
          console.log('✅ Employee found! ID:', this.employeeId);
          this.loadAllData();
        } else {
          console.error('❌ Employee not found in list');
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
      
      // Load today's attendance
      console.log('⏰ Loading today\'s attendance...');
      const records = await firstValueFrom(
        this.attendanceService.getEmployeeAttendance(this.employeeId, today, today)
      );
      this.todayAttendance = records && records.length > 0 ? records[0] : null;
      console.log('✅ Today\'s attendance loaded:', this.todayAttendance ? 'Found' : 'None');
      
      // Check if on break
      this.isOnBreak = !!(this.todayAttendance?.breakStart && !this.todayAttendance?.breakEnd);
      
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
      
      // Load leave types
      console.log('🏖️ Loading leave types...');
      this.leaveTypes = await firstValueFrom(this.leaveService.getLeaveTypes()) || [];
      console.log('✅ Leave types loaded:', this.leaveTypes.length);
      
      // Load my leave requests
      console.log('📝 Loading my leave requests...');
      try {
        this.myLeaveRequests = await firstValueFrom(this.leaveService.getMyLeaveRequests()) || [];
        console.log('✅ Leave requests loaded:', this.myLeaveRequests.length);
      } catch (leaveError: any) {
        console.error('⚠️ Error loading leave requests:', leaveError);
        this.myLeaveRequests = [];
      }
      
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
    console.log('📝 Opening leave modal');
    console.log('Available leave types:', this.leaveTypes);
    
    if (this.leaveTypes.length === 0) {
      console.error('❌ No leave types available');
      this.showMessage('Error', 'No leave types available. Please contact HR.');
      return;
    }
    
    this.showLeaveModal = true;
    this.leaveForm = {
      leaveTypeId: this.leaveTypes[0].leaveTypeId,
      startDate: '',
      endDate: '',
      reason: ''
    };
    
    console.log('✅ Leave modal opened');
    console.log('Initial form:', this.leaveForm);
    
    this.cdr.detectChanges();
  }

  closeLeaveModal() {
    console.log('🚪 Closing leave modal');
    this.showLeaveModal = false;
    
    this.leaveForm = {
      leaveTypeId: 0,
      startDate: '',
      endDate: '',
      reason: ''
    };
    
    this.cdr.detectChanges();
    console.log('✅ Leave modal closed');
  }

  async submitLeaveRequest() {
    console.log('📤 Submitting leave request');
    console.log('Form data:', this.leaveForm);
    
    // Validate form
    if (!this.leaveForm.leaveTypeId || this.leaveForm.leaveTypeId === 0) {
      console.error('❌ Leave type not selected');
      this.showMessage('Error', 'Please select a leave type');
      return;
    }
    
    if (!this.leaveForm.startDate) {
      console.error('❌ Start date not provided');
      this.showMessage('Error', 'Please select a start date');
      return;
    }
    
    if (!this.leaveForm.endDate) {
      console.error('❌ End date not provided');
      this.showMessage('Error', 'Please select an end date');
      return;
    }
    
    if (!this.leaveForm.reason || !this.leaveForm.reason.trim()) {
      console.error('❌ Reason not provided');
      this.showMessage('Error', 'Please provide a reason for leave');
      return;
    }
    
    // Validate dates
    const startDate = new Date(this.leaveForm.startDate);
    const endDate = new Date(this.leaveForm.endDate);
    
    if (startDate > endDate) {
      console.error('❌ Invalid date range');
      this.showMessage('Error', 'End date must be after start date');
      return;
    }
    
    try {
      console.log('🚀 Calling leave service...');
      
      await firstValueFrom(this.leaveService.createLeaveRequest(this.leaveForm));
      
      console.log('✅ Leave request created successfully');
      this.showMessage('Success', 'Leave request submitted successfully');
      this.closeLeaveModal();
      
      await this.loadAllData();
    } catch (error: any) {
      console.error('❌ Error submitting leave request:', error);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      console.error('Error body:', error.error);
      
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