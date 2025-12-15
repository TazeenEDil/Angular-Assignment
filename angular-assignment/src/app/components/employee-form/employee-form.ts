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
  templateUrl: './employee-form.html'
})
export class EmployeeForm {

  employee: Employee = {
    id: 0,
    name: '',
    email: '',
    department: ''
  };

  constructor(
    private empService: EmployeeService,
    private router: Router
  ) {}

  addEmployee() {
    this.employee.id = Date.now();
    this.empService.addEmployee(this.employee);
    this.router.navigate(['/']);
  }
}
