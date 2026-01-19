import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../services/employee';
import { Employee } from '../../../models/employee.model';
import { Modal } from '../../modal/modal';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, Modal],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css']
})
export class EmployeeListComponent implements OnInit {
  private empService = inject(EmployeeService);
  private router = inject(Router);

  employees: Employee[] = [];
  selectedId: number | null = null;
  loading: boolean = false;
  
  // Modal properties
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showCancelButton = false;
  employeeToDelete: number | null = null;

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.empService.getEmployees().subscribe({
      next: data => {
        this.employees = data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.showErrorModal('Failed to load employees. Please try again.');
        this.loading = false;
      }
    });
  }

  select(id: number) {
    this.selectedId = id;
  }

  viewDetails(id: number) {
    this.router.navigate(['/employee', id]);
  }

  updateEmployee(id: number) {
    this.router.navigate(['/employee/edit', id]);
  }

  deleteEmployee(id: number) {
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

    this.empService.deleteEmployee(this.employeeToDelete).subscribe({
      next: () => {
        this.employees = this.employees.filter(e => e.id !== this.employeeToDelete);
        this.selectedId = null;
        this.employeeToDelete = null;
        this.showSuccessModal('Employee deleted successfully!');
      },
      error: err => {
        console.error(err);
        this.employeeToDelete = null;
        this.showErrorModal('Failed to delete employee. Please try again.');
      }
    });
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
  }
}