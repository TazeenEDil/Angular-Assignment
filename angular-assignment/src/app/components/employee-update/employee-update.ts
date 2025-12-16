import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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

  employee: Employee = {
    id: 0,
    name: '',
    email: '',
    department: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empService: EmployeeService
  ) {}

  ngOnInit() {
    // Get employee id from route
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // Fetch employee data
    const existingEmployee = this.empService.getEmployeeById(id);
    
    if (existingEmployee) {
      // Create a copy to avoid direct mutation
      this.employee = { ...existingEmployee };
    } else {
      // If employee not found, go back to list
      this.router.navigate(['/']);
    }
  }

  updateEmployee() {
    this.empService.updateEmployee(this.employee);
    this.router.navigate(['/']);
  }

  cancel() {
    this.router.navigate(['/']);
  }
}