import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee';

@Component({
  selector: 'app-employee-list',
  imports: [CommonModule],
  templateUrl: './employee-list.html'
})
export class EmployeeList {

  selectedId: number | null = null;

  constructor(public empService: EmployeeService) {}

  select(id: number) {
    this.selectedId = id;
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure?')) {
      this.empService.deleteEmployee(id);
    }
  }
}
