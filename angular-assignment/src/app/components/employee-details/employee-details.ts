import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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

  employee: Employee | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empService: EmployeeService
  ) {}

  ngOnInit() {
    // Get employee id from route parameters
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // Fetch employee from service
    this.employee = this.empService.getEmployeeById(id);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}