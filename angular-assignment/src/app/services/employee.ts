import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private employees: Employee[] = [];

  addEmployee(emp: Employee) {
    this.employees.push(emp);
  }

  getEmployees(): Employee[] {
    return this.employees;
  }

  deleteEmployee(id: number) {
    this.employees = this.employees.filter(e => e.id !== id);
  }
}
