import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee.model';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [FormsModule, CommonModule, Modal],
  templateUrl: './employee-form.html',
  styleUrls: ['./employee-form.css']
})
export class EmployeeForm {
  private empService = inject(EmployeeService);
  private router = inject(Router);

  employee: Omit<Employee, 'id' | 'createdAt'> = {
    name: '',
    email: '',
    position: ''
  };

  loading: boolean = false;
  
  // Modal properties
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  addEmployee() {
    if (!this.employee.name || !this.employee.email || !this.employee.position) {
      this.modalTitle = 'Validation Error';
      this.modalMessage = 'All fields are required!';
      this.showModal = true;
      return;
    }

    this.loading = true;

    this.empService.addEmployee(this.employee).subscribe({
      next: res => {
        console.log('Employee created:', res);
        this.loading = false;
        this.modalTitle = 'Success';
        this.modalMessage = 'Employee added successfully!';
        this.showModal = true;
      },
      error: err => {
        console.error(err);
        this.loading = false;
        
        let errorMessage = 'Failed to add employee. Please try again.';
        
        if (err.status === 403) {
          errorMessage = 'You do not have permission to add employees.';
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.error && err.error.errors) {
          const errors = Object.values(err.error.errors).flat();
          errorMessage = errors.join(', ');
        }
        
        this.modalTitle = 'Error';
        this.modalMessage = errorMessage;
        this.showModal = true;
      }
    });
  }

  closeModal() {
    this.showModal = false;
    if (this.modalTitle === 'Success') {
      this.router.navigate(['/']);
    }
  }

  cancel() {
    this.router.navigate(['/']);
  }
}






