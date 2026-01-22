import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AttendanceService } from '../../../services/attendance';
import { LeaveService } from '../../../services/leave';
import { EmployeeService } from '../../../services/employee';
import { Modal } from '../../modal/modal';
import { Attendance, AttendanceStats } from '../../../models/attendance.model';
import { LeaveRequest } from '../../../models/leave.model';

@Component({
  selector: 'app-admin-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './admin-attendance.html',
  styleUrls: ['./admin-attendance.css']
})
export class AdminAttendance implements OnInit {
  private attendanceService = inject(AttendanceService);
  private leaveService = inject(LeaveService);
  private employeeService = inject(EmployeeService);

  // Employee data
  allEmployees: any[] = [];
  employees: any[] = [];
  selectedEmployee: any | null = null;
  employeeStats: AttendanceStats | null = null;
  employeeAttendance: Attendance[] = [];
  
  // Pagination for employees
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // Leave requests
  pendingLeaves: LeaveRequest[] = [];
  
  // Pagination for leave requests
  leavesCurrentPage = 1;
  leavesPageSize = 5;
  leavesTotalPages = 1;
  paginatedLeaves: LeaveRequest[] = [];
  
  selectedLeave: LeaveRequest | null = null;
  showLeaveModal = false;
  rejectionReason = '';
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  
  loading = false;
  processingLeave = false;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  
  // Search and filter
  searchQuery = '';
  filterStatus: 'all' | 'high' | 'medium' | 'low' = 'all';

  ngOnInit() {
    this.loadEmployeesWithStats();
    this.loadPendingLeaves();
  }

  loadEmployeesWithStats() {
    this.loading = true;
    
    this.employeeService.getEmployees().subscribe({
      next: (employees: any[]) => {
        this.allEmployees = employees;
        this.applyFiltersAndPagination();
        this.loadStatsForCurrentPage();
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    });
  }

  applyFiltersAndPagination() {
    // Apply search filter
    let filteredEmployees = this.allEmployees.filter(emp => {
      const name = (emp.Name || emp.name || '').toLowerCase();
      const position = (emp.Position || emp.position || '').toLowerCase();
      const query = this.searchQuery.toLowerCase();
      return name.includes(query) || position.includes(query);
    });
    
    // Apply status filter (based on attendance percentage)
    if (this.filterStatus !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => {
        const percentage = this.getAttendancePercentage(emp.stats);
        if (this.filterStatus === 'high') return percentage >= 90;
        if (this.filterStatus === 'medium') return percentage >= 70 && percentage < 90;
        if (this.filterStatus === 'low') return percentage < 70;
        return true;
      });
    }
    
    // Calculate pagination
    this.totalPages = Math.ceil(filteredEmployees.length / this.pageSize);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    
    // Get paginated employees
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.employees = filteredEmployees.slice(startIndex, endIndex);
  }

  loadStatsForCurrentPage() {
    // Only load stats for employees on current page
    const statsObservables = this.employees
      .filter(emp => !emp.stats) // Only load if not already loaded
      .map(emp => 
        this.attendanceService.getEmployeeStats(
          emp.Id || emp.id,
          this.selectedYear,
          this.selectedMonth
        ).pipe(
          map(stats => ({ employeeId: emp.Id || emp.id, stats })),
          catchError(error => {
            console.error(`Error loading stats for employee ${emp.Id || emp.id}:`, error);
            return of({ employeeId: emp.Id || emp.id, stats: null });
          })
        )
      );
    
    if (statsObservables.length > 0) {
      forkJoin(statsObservables).subscribe({
        next: (results) => {
          results.forEach(result => {
            const employee = this.allEmployees.find(e => 
              (e.Id || e.id) === result.employeeId
            );
            if (employee) {
              employee.stats = result.stats;
            }
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading employee stats:', error);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  onSearchChange() {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
    this.loadStatsForCurrentPage();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loading = true;
      this.applyFiltersAndPagination();
      this.loadStatsForCurrentPage();
    }
  }

  nextPage() {
    this.changePage(this.currentPage + 1);
  }

  previousPage() {
    this.changePage(this.currentPage - 1);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  async loadPendingLeaves() {
    try {
      this.pendingLeaves = await firstValueFrom(
        this.leaveService.getPendingRequests().pipe(
          catchError(error => {
            console.error('Error loading pending leaves:', error);
            return of([]);
          })
        )
      );
      this.updateLeavesPagination();
    } catch (error) {
      console.error('Error loading pending leaves:', error);
      this.pendingLeaves = [];
    }
  }

  updateLeavesPagination() {
    this.leavesTotalPages = Math.ceil(this.pendingLeaves.length / this.leavesPageSize);
    
    if (this.leavesCurrentPage > this.leavesTotalPages && this.leavesTotalPages > 0) {
      this.leavesCurrentPage = this.leavesTotalPages;
    }
    if (this.leavesCurrentPage < 1) {
      this.leavesCurrentPage = 1;
    }
    
    const startIndex = (this.leavesCurrentPage - 1) * this.leavesPageSize;
    const endIndex = startIndex + this.leavesPageSize;
    this.paginatedLeaves = this.pendingLeaves.slice(startIndex, endIndex);
  }

  changeLeavesPage(page: number) {
    if (page >= 1 && page <= this.leavesTotalPages) {
      this.leavesCurrentPage = page;
      this.updateLeavesPagination();
    }
  }

  nextLeavesPage() {
    this.changeLeavesPage(this.leavesCurrentPage + 1);
  }

  previousLeavesPage() {
    this.changeLeavesPage(this.leavesCurrentPage - 1);
  }

  get leavesPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.leavesTotalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  async selectEmployee(employee: any) {
    this.selectedEmployee = employee;
    this.loading = true;
    
    try {
      const employeeId = employee.Id || employee.id;
      
      const startDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
      const endDate = new Date(this.selectedYear, this.selectedMonth, 0);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const results = await firstValueFrom(
        forkJoin({
          stats: this.attendanceService.getEmployeeStats(employeeId, this.selectedYear, this.selectedMonth).pipe(
            catchError(error => {
              console.error('Error loading employee stats:', error);
              return of(null);
            })
          ),
          attendance: this.attendanceService.getEmployeeAttendance(employeeId, startDateStr, endDateStr).pipe(
            catchError(error => {
              console.error('Error loading employee attendance:', error);
              return of([]);
            })
          )
        })
      );
      
      this.employeeStats = results.stats;
      this.employeeAttendance = results.attendance || [];
      this.loading = false;
    } catch (error) {
      console.error('Error loading employee data:', error);
      this.loading = false;
    }
  }

  closeEmployeeDetails() {
    this.selectedEmployee = null;
    this.employeeStats = null;
    this.employeeAttendance = [];
  }

  openLeaveModal(leave: LeaveRequest) {
    this.selectedLeave = leave;
    this.showLeaveModal = true;
    this.rejectionReason = '';
  }

  closeLeaveModal() {
    this.showLeaveModal = false;
    this.selectedLeave = null;
    this.rejectionReason = '';
  }

  async approveLeave() {
    if (!this.selectedLeave) return;
    
    this.processingLeave = true;
    const employeeName = this.selectedLeave.employeeName;
    const leaveRequestId = this.selectedLeave.leaveRequestId;
    
    try {
      await firstValueFrom(
        this.leaveService.approveOrRejectLeave(leaveRequestId, true)
      );
      
      this.closeLeaveModal();
      
      const approvalDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      this.showMessage(
        'Leave Approved', 
        `Leave request has been approved. An email notification has been sent to ${employeeName} dated ${approvalDate}.`
      );
      
      this.loadPendingLeaves();
      
      if (this.selectedEmployee) {
        this.selectEmployee(this.selectedEmployee);
      }
      
      this.processingLeave = false;
    } catch (error: any) {
      this.processingLeave = false;
      this.closeLeaveModal();
      this.showMessage('Error', error.error?.message || 'Failed to approve leave request');
    }
  }

  async rejectLeave() {
    if (!this.selectedLeave) return;
    
    if (!this.rejectionReason.trim()) {
      this.showMessage('Validation Error', 'Please provide a reason for rejecting this leave request.');
      return;
    }
    
    this.processingLeave = true;
    const employeeName = this.selectedLeave.employeeName;
    const leaveRequestId = this.selectedLeave.leaveRequestId;
    
    try {
      await firstValueFrom(
        this.leaveService.approveOrRejectLeave(
          leaveRequestId,
          false,
          this.rejectionReason
        )
      );
      
      this.closeLeaveModal();
      
      const rejectionDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      this.showMessage(
        'Leave Rejected', 
        `Leave request has been rejected. An email notification has been sent to ${employeeName} dated ${rejectionDate}.`
      );
      
      this.loadPendingLeaves();
      
      if (this.selectedEmployee) {
        this.selectEmployee(this.selectedEmployee);
      }
      
      this.processingLeave = false;
    } catch (error: any) {
      this.processingLeave = false;
      this.closeLeaveModal();
      this.showMessage('Error', error.error?.message || 'Failed to reject leave request');
    }
  }

  getAttendancePercentage(stats: any): number {
    if (!stats || stats.totalDays === 0) return 0;
    return stats.attendancePercentage || 0;
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
  }

  closeModal() {
    this.showModal = false;
    this.closeEmployeeDetails();
  }

  get months() {
    return [
      { value: 1, name: 'January' },
      { value: 2, name: 'February' },
      { value: 3, name: 'March' },
      { value: 4, name: 'April' },
      { value: 5, name: 'May' },
      { value: 6, name: 'June' },
      { value: 7, name: 'July' },
      { value: 8, name: 'August' },
      { value: 9, name: 'September' },
      { value: 10, name: 'October' },
      { value: 11, name: 'November' },
      { value: 12, name: 'December' }
    ];
  }

  get years() {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }
}