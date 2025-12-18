import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-details.html',
  styleUrls: ['./employee-details.css']
})
export class EmployeeDetails implements OnInit {

  employee: Employee | null = null;
  loading: boolean = false;

  constructor(
    private empService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get employee ID from route params
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(+id);
    } else {
      alert('Invalid employee ID');
      this.router.navigate(['/']);
    }
  }

  loadEmployee(id: number) {
    this.loading = true;
    this.empService.getEmployeeById(id).subscribe({
      next: data => {
        this.employee = data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        alert('Failed to load employee details');
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  editEmployee() {
    if (this.employee && this.employee.id) {
      this.router.navigate(['/employee/edit', this.employee.id]);
    }
  }

  deleteEmployee() {
    if (!this.employee || !this.employee.id) return;

    if (confirm(`Are you sure you want to delete ${this.employee.name}?`)) {
      this.empService.deleteEmployee(this.employee.id).subscribe({
        next: () => {
          alert('Employee deleted successfully!');
          this.router.navigate(['/']);
        },
        error: err => {
          console.error(err);
          alert('Failed to delete employee. Please try again.');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}