import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-update',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './employee-update.html',
  styleUrls: ['./employee-update.css']
})
export class EmployeeUpdate {

  employee: Employee = {
    name: '',
    email: '',
    position: ''
  };

  constructor(private router: Router) {}

  updateEmployee() {
    alert('Update not supported by backend yet');
    this.router.navigate(['/']);
  }

  cancel() {
    this.router.navigate(['/']);
  }
}
