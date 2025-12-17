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

  constructor(
    private empService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.empService.getEmployees().subscribe({
      next: data => this.employees = data,
      error: err => console.error(err)
    });
  }

  
  select(id: number) {
    this.selectedId = id;
  }

  viewDetails(id: number) {
    alert('Details not supported yet');
  }

  updateEmployee(id: number) {
    alert('Update not supported yet');
  }

  deleteEmployee(id: number) {
    alert('Delete not supported yet');
  }
}
