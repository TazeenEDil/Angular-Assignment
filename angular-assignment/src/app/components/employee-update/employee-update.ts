import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee.model';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-employee-update',
  standalone: true,
  imports: [FormsModule, CommonModule, Modal],
  templateUrl: './employee-update.html',
  styleUrls: ['./employee-update.css']
})
export class EmployeeUpdate implements OnInit {
  private empService = inject(EmployeeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  employeeId: number = 0;
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

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.employeeId = +id;
      this.loadEmployee();
    } else {
      this.modalTitle = 'Error';
      this.modalMessage = 'Invalid employee ID';
      this.showModal = true;
    }
  }

  loadEmployee() {
    this.loading = true;
    this.empService.getEmployeeById(this.employeeId).subscribe({
      next: data => {
        this.employee = {
          name: data.name,
          email: data.email,
          position: data.position
        };
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
        this.modalTitle = 'Error';
        this.modalMessage = 'Failed to load employee details';
        this.showModal = true;
      }
    });
  }

  updateEmployee() {
    if (!this.employee.name || !this.employee.email || !this.employee.position) {
      this.modalTitle = 'Validation Error';
      this.modalMessage = 'All fields are required!';
      this.showModal = true;
      return;
    }

    this.loading = true;

    this.empService.updateEmployee(this.employeeId, this.employee).subscribe({
      next: res => {
        console.log('Employee updated:', res);
        this.loading = false;
        this.modalTitle = 'Success';
        this.modalMessage = 'Employee updated successfully!';
        this.showModal = true;
      },
      error: err => {
        console.error(err);
        this.loading = false;
        
        let errorMessage = 'Failed to update employee. Please try again.';
        
        if (err.status === 403) {
          errorMessage = 'You do not have permission to update employees.';
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
    if (this.modalTitle === 'Success' || !this.employee.name) {
      this.router.navigate(['/']);
    }
  }

  cancel() {
    this.router.navigate(['/']);
  }
}