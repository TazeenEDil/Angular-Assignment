import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [FormsModule, CommonModule,],
  templateUrl: './employee-form.html',
  styleUrls: ['./employee-form.css']  

})
export class EmployeeForm {

  employee: Employee = {
    name: '',
    email: '',
    position: ''
  };
position: any;

  constructor(
    private empService: EmployeeService,
    private router: Router
  ) {}


  addEmployee() {
  this.empService.addEmployee(this.employee).subscribe({
    next: res => {
      console.log(res);
      this.router.navigate(['/']);
    },
    error: err => console.error(err)
  });
}
}

