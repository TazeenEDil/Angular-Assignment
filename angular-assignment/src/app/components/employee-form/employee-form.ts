import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './employee-form.html',
  styleUrls: ['./employee-form.css']  
})
export class EmployeeForm {

  employee: Omit<Employee, 'id' | 'createdAt'> = {
    name: '',
    email: '',
    position: ''
  };

  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private empService: EmployeeService,
    private router: Router
  ) {}

  addEmployee() {
    // Validate form
    if (!this.employee.name || !this.employee.email || !this.employee.position) {
      this.errorMessage = 'All fields are required!';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.empService.addEmployee(this.employee).subscribe({
      next: res => {
        console.log('Employee created:', res);
        alert('Employee added successfully!');
        this.router.navigate(['/']);
      },
      error: err => {
        console.error(err);
        this.loading = false;
        
        // Handle validation errors from backend
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.error && err.error.errors) {
          // Handle model validation errors
          const errors = Object.values(err.error.errors).flat();
          this.errorMessage = errors.join(', ');
        } else {
          this.errorMessage = 'Failed to add employee. Please try again.';
        }
      }
    });
  }

  cancel() {
    this.router.navigate(['/']);
  }
}