import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css']
})
export class EmployeeList implements OnInit {

  employees: Employee[] = [];
  selectedId: number | null = null;
  loading: boolean = false;
  error: string = '';

  constructor(
    private empService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.error = '';
    this.empService.getEmployees().subscribe({
      next: data => {
        this.employees = data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Failed to load employees. Please try again.';
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

    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      this.empService.deleteEmployee(id).subscribe({
        next: () => {
          // Remove from local array
          this.employees = this.employees.filter(e => e.id !== id);
          this.selectedId = null;
          alert('Employee deleted successfully!');
        },
        error: err => {
          console.error(err);
          alert('Failed to delete employee. Please try again.');
        }
      });
    }
  }
}