import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-details.html',
  styleUrls: ['./employee-details.css']
})
export class EmployeeDetails {

  employee: Employee | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    alert('Employee details not supported by backend yet');
    this.router.navigate(['/']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
