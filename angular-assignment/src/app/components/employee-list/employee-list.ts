import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeService } from '../../services/employee';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css']
})
export class EmployeeList {

  selectedId: number | null = null;

  constructor(
    public empService: EmployeeService,
    private router: Router  // Inject router
  ) {}

  select(id: number) {
    this.selectedId = id;
  }

  // Navigate to details page
  viewDetails(id: number) {
    this.router.navigate(['/details', id]);
  }

  // Navigate to update page
  updateEmployee(id: number) {
    this.router.navigate(['/update', id]);
  }

  // Delete employee
  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.empService.deleteEmployee(id);
      console.log('Deleted employee with id:', id);
    }
  }
}