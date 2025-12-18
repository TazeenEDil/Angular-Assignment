import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-update',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './employee-update.html',
  styleUrls: ['./employee-update.css']
})
export class EmployeeUpdate implements OnInit {

  employeeId: number = 0;
  employee: Omit<Employee, 'id' | 'createdAt'> = {
    name: '',
    email: '',
    position: ''
  };

  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private empService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get employee ID from route params
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.employeeId = +id;
      this.loadEmployee();
    } else {
      alert('Invalid employee ID');
      this.router.navigate(['/']);
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
        alert('Failed to load employee details');
        this.router.navigate(['/']);
      }
    });
  }

  updateEmployee() {
    // Validate form
    if (!this.employee.name || !this.employee.email || !this.employee.position) {
      this.errorMessage = 'All fields are required!';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.empService.updateEmployee(this.employeeId, this.employee).subscribe({
      next: res => {
        console.log('Employee updated:', res);
        alert('Employee updated successfully!');
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
          this.errorMessage = 'Failed to update employee. Please try again.';
        }
      }
    });
  }

  cancel() {
    this.router.navigate(['/']);
  }
}