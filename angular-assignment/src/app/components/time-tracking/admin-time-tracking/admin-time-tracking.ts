import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AttendanceService } from '../../../services/attendance';
import { EmployeeService } from '../../../services/employee';
import { Modal } from '../../modal/modal';
import { Attendance } from '../../../models/attendance.model';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-admin-time-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './admin-time-tracking.html',
  styleUrls: ['./admin-time-tracking.css']
})
export class AdminTimeTracking implements OnInit {
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);

  // Data
  allEmployees: Employee[] = [];
  todayAttendances: Map<number, Attendance> = new Map();
  
  // UI state
  loading = false;
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  
  // Selected date (default to today)
  selectedDate: string = new Date().toISOString().split('T')[0];

  ngOnInit() {
    console.log('🚀 Admin Time Tracking Initialized');
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    console.log('📥 Loading employees and attendance...');

    try {
      // Load all employees
      const employees = await firstValueFrom(this.employeeService.getEmployees()) as any[];
      
      this.allEmployees = (employees || []).map((e: any) => ({
        id: Number(e.Id || e.id),
        name: e.Name || e.name || 'Unknown',
        email: e.Email || e.email || '',
        positionId: Number(e.PositionId || e.positionId || 0),
        positionName: e.PositionName || e.Position?.Name || e.positionName || 'N/A',
        createdAt: e.CreatedAt || e.createdAt
      })).filter(emp => emp.id && emp.id > 0);

      console.log('✅ Employees loaded:', this.allEmployees.length);

      // Load attendance for selected date
      await this.loadAttendanceForDate();

    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      this.showMessage('Error', 'Failed to load data: ' + (error.error?.message || error.message));
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async loadAttendanceForDate() {
    console.log('📅 Loading attendance for date:', this.selectedDate);

    try {
      // Load attendance for each employee
      const attendancePromises = this.allEmployees.map(async (emp) => {
        try {
          const records = await firstValueFrom(
            this.attendanceService.getEmployeeAttendance(
              emp.id!,
              this.selectedDate,
              this.selectedDate
            )
          );
          
          if (records && records.length > 0) {
            return { employeeId: emp.id!, attendance: records[0] };
          }
          return { employeeId: emp.id!, attendance: null };
        } catch {
          return { employeeId: emp.id!, attendance: null };
        }
      });

      const results = await Promise.all(attendancePromises);

      // Build map
      this.todayAttendances.clear();
      results.forEach(result => {
        if (result.attendance) {
          this.todayAttendances.set(result.employeeId, result.attendance);
        }
      });

      console.log('✅ Attendance loaded for', this.todayAttendances.size, 'employees');

    } catch (error: any) {
      console.error('❌ Error loading attendance:', error);
    }

    this.cdr.detectChanges();
  }

  async onDateChange() {
    console.log('📅 Date changed to:', this.selectedDate);
    await this.loadAttendanceForDate();
  }

  getAttendance(employeeId: number): Attendance | null {
    return this.todayAttendances.get(employeeId) || null;
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

  getStatusBadge(employeeId: number): string {
    const attendance = this.getAttendance(employeeId);
    if (!attendance) return 'No Record';
    return attendance.status || 'Unknown';
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