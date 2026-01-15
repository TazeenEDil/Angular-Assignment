import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee.model';
import { AuthService } from '../../services/auth/auth-service';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, Modal],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css']
})
export class EmployeeList implements OnInit {
  private empService = inject(EmployeeService);
  private router = inject(Router);
  private authService = inject(AuthService);

  employees: Employee[] = [];
  paginatedEmployees: Employee[] = [];
  selectedId: number | null = null;
  loading: boolean = false;
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showCancelButton = false;
  employeeToDelete: number | null = null;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.empService.getEmployees().subscribe({
      next: data => {
        this.employees = data;
        this.totalPages = Math.ceil(this.employees.length / this.pageSize);
        this.updatePaginatedEmployees();
        this.loading = false;
        console.log('Employees loaded:', data.length);
      },
      error: err => {
        console.error('Failed to load employees:', err);
        this.showErrorModal('Failed to load employees. Please try again.');
        this.loading = false;
      }
    });
  }

  updatePaginatedEmployees() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmployees = this.employees.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedEmployees();
    this.selectedId = null;
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

  select(id: number) {
    this.selectedId = id;
  }

  viewDetails(id: number) {
    this.router.navigate(['/employee', id]);
  }

  updateEmployee(id: number) {
    if (!this.isAdmin) {
      this.showErrorModal('Only administrators can update employees.');
      return;
    }
    this.router.navigate(['/employee/edit', id]);
  }

  deleteEmployee(id: number) {
    if (!this.isAdmin) {
      this.showErrorModal('Only administrators can delete employees.');
      return;
    }

    const employee = this.employees.find(e => e.id === id);
    if (!employee) return;

    this.employeeToDelete = id;
    this.modalTitle = 'Confirm Delete';
    this.modalMessage = `Are you sure you want to delete ${employee.name}?`;
    this.showCancelButton = true;
    this.showModal = true;
  }

  confirmDelete() {
    if (this.employeeToDelete === null) return;

    const idToDelete = this.employeeToDelete;
    console.log('Deleting employee:', idToDelete);

    this.empService.deleteEmployee(idToDelete).subscribe({
      next: () => {
        console.log('Employee deleted successfully');
        this.employees = this.employees.filter(e => e.id !== idToDelete);
        this.totalPages = Math.ceil(this.employees.length / this.pageSize);
        
        // Adjust current page if necessary
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        }
        
        this.updatePaginatedEmployees();
        this.selectedId = null;
        this.employeeToDelete = null;
        this.showCancelButton = false;
        this.showSuccessModal('Employee deleted successfully!');
      },
      error: err => {
        console.error('Failed to delete employee:', err);
        this.employeeToDelete = null;
        this.showCancelButton = false;
        
        if (err.status === 403) {
          this.showErrorModal('You do not have permission to delete employees.');
        } else {
          this.showErrorModal('Failed to delete employee. Please try again.');
        }
      }
    });
  }

  navigateToAdd() {
    this.router.navigate(['/employee/add']);
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
    this.employeeToDelete = null;
    this.showCancelButton = false;
  }
}