import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AttendanceService } from '../../../services/attendance';
import { EmployeeService } from '../../../services/employee';
import { Modal } from '../../modal/modal';
import { Employee } from '../../../models/employee.model';
import { AttendanceStats, Attendance } from '../../../models/attendance.model';

@Component({
  selector: 'app-admin-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './admin-attendance.html',
  styleUrls: ['./admin-attendance.css']
})
export class AdminAttendance implements OnInit {
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);

  // Employee data with stats
  allEmployees: (Employee & { stats?: AttendanceStats | null })[] = [];
  paginatedEmployees: (Employee & { stats?: AttendanceStats | null })[] = [];
  selectedEmployee: Employee | null = null;
  employeeStats: AttendanceStats | null = null;
  employeeAttendance: Attendance[] = [];

  // UI state
  loading = false;
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Filters
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;

  ngOnInit() {
    console.log('🚀 Admin Attendance Component Initialized');
    this.loadEmployees();
  }

  // ============================
  // LOAD EMPLOYEES
  // ============================
  async loadEmployees() {
    this.loading = true;
    console.log('📥 Loading employees...');

    try {
      const employees = await firstValueFrom(this.employeeService.getEmployees()) as any[];
      
      console.log('📦 Raw employees from backend:', employees);
      if (employees && employees.length > 0) {
        console.log('📋 First employee:', employees[0]);
        console.log('📋 Properties:', Object.keys(employees[0]));
      }

      // ✅ CRITICAL FIX: Backend returns capital letter properties
      // Map backend response to frontend model
      this.allEmployees = (employees || [])
        .map((backendEmp: any) => {
          // Backend DTO has: Id, Name, Email, PositionId, PositionName, CreatedAt
          const employee: Employee & { stats?: AttendanceStats | null } = {
            id: Number(backendEmp.Id || backendEmp.id),
            name: backendEmp.Name || backendEmp.name || 'Unknown',
            email: backendEmp.Email || backendEmp.email || '',
            positionId: Number(backendEmp.PositionId || backendEmp.positionId || 0),
            positionName: backendEmp.PositionName || backendEmp.Position?.Name || backendEmp.positionName || 'N/A',
            createdAt: backendEmp.CreatedAt || backendEmp.createdAt,
            stats: null
          };

          console.log(`✅ Mapped employee: ${employee.name} (ID: ${employee.id})`);
          return employee;
        })
        .filter(emp => emp.id && emp.id > 0); // Filter out invalid IDs

      console.log('✅ Total employees loaded:', this.allEmployees.length);
      
      this.totalPages = Math.ceil(this.allEmployees.length / this.pageSize);
      this.updatePaginatedEmployees();
      
      // Load stats for first page
      await this.loadStatsForCurrentPage();

    } catch (error: any) {
      console.error('❌ Error loading employees:', error);
      console.error('   Status:', error.status);
      console.error('   Error body:', error.error);
      this.showMessage('Error', 'Failed to load employees: ' + (error.error?.message || error.message));
      this.allEmployees = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ============================
  // LOAD STATS FOR CURRENT PAGE
  // ============================
  async loadStatsForCurrentPage() {
    console.log('📊 Loading stats for current page...');

    try {
      // Load stats for each employee on the current page
      const statsPromises = this.paginatedEmployees.map(async (emp) => {
        if (!emp.id || emp.id <= 0) {
          console.warn(`⚠️ Skipping employee with invalid ID:`, emp);
          return { employeeId: emp.id, stats: null };
        }

        try {
          console.log(`📊 Loading stats for: ${emp.name} (ID: ${emp.id})`);
          
          const stats = await firstValueFrom(
            this.attendanceService.getEmployeeStats(
              emp.id!,
              this.selectedYear,
              this.selectedMonth
            )
          );
          
          console.log(`✅ Stats loaded for ${emp.name}:`, stats);
          return { employeeId: emp.id!, stats };
        } catch (err: any) {
          console.error(`⚠️ Stats failed for ${emp.name} (${emp.id}):`, err.status, err.message);
          return { employeeId: emp.id!, stats: null };
        }
      });

      const results = await Promise.all(statsPromises);

      // Update employees with their stats
      results.forEach(result => {
        const emp = this.allEmployees.find(e => e.id === result.employeeId);
        if (emp) {
          emp.stats = result.stats;
        }
      });

      console.log('✅ Stats loaded successfully');
      this.cdr.detectChanges();

    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  }

  // ============================
  // PAGINATION
  // ============================
  updatePaginatedEmployees() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmployees = this.allEmployees.slice(startIndex, endIndex);
    console.log(`📄 Page ${this.currentPage}: Showing ${this.paginatedEmployees.length} employees`);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedEmployees();
    this.loadStatsForCurrentPage();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  // ============================
  // EMPLOYEE SELECTION
  // ============================
  async selectEmployee(employee: Employee) {
    if (!employee.id || employee.id <= 0) {
      console.error('❌ Invalid employee ID');
      this.showMessage('Error', 'Invalid employee selected');
      return;
    }

    console.log(`👤 Selected employee: ${employee.name} (ID: ${employee.id})`);
    this.selectedEmployee = employee;
    this.loading = true;
    this.cdr.detectChanges();

    try {
      // Load detailed stats
      console.log(`📊 Loading stats for employee ${employee.id}...`);
      this.employeeStats = await firstValueFrom(
        this.attendanceService.getEmployeeStats(
          employee.id,
          this.selectedYear,
          this.selectedMonth
        )
      );
      console.log('✅ Stats loaded:', this.employeeStats);

      // Load attendance records for the selected month
      const startDate = new Date(this.selectedYear, this.selectedMonth - 1, 1)
        .toISOString()
        .split('T')[0];
      const endDate = new Date(this.selectedYear, this.selectedMonth, 0)
        .toISOString()
        .split('T')[0];

      console.log(`📅 Loading attendance from ${startDate} to ${endDate}...`);
      
      this.employeeAttendance = await firstValueFrom(
        this.attendanceService.getEmployeeAttendance(
          employee.id,
          startDate,
          endDate
        )
      ) || [];
      
      console.log(`✅ Loaded ${this.employeeAttendance.length} attendance records`);

    } catch (error: any) {
      console.error('❌ Error loading employee details:', error);
      this.showMessage('Error', 'Failed to load employee details: ' + (error.error?.message || error.message));
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  closeEmployeeDetails() {
    console.log('🚪 Closing employee details');
    this.selectedEmployee = null;
    this.employeeStats = null;
    this.employeeAttendance = [];
    this.cdr.detectChanges();
  }

  // ============================
  // FILTER CHANGES
  // ============================
  async onMonthYearChange() {
    console.log(`📅 Filter changed: ${this.selectedYear}/${this.selectedMonth}`);
    
    // Clear existing stats
    this.allEmployees.forEach(emp => {
      emp.stats = null;
    });

    // If employee is selected, reload their details
    if (this.selectedEmployee && this.selectedEmployee.id) {
      await this.selectEmployee(this.selectedEmployee);
    } else {
      // Otherwise reload stats for current page
      await this.loadStatsForCurrentPage();
    }
  }

  // ============================
  // HELPER METHODS
  // ============================
  getAttendancePercentage(stats: AttendanceStats | null | undefined): number {
    if (!stats) return 0;
    
    const totalDays = stats.presentDays + stats.absentDays + stats.lateDays + stats.leaveDays;
    if (totalDays === 0) return 0;
    
    return ((stats.presentDays + stats.lateDays) / totalDays) * 100;
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
  }
}