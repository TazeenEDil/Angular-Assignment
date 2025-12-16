import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private employees: Employee[] = [];
  
  // Add new employee
  addEmployee(emp: Employee) {
    this.employees.push(emp);
  }
  // Get all employees
  getEmployees(): Employee[] {
    return this.employees;
  }

  // Get single employee by id
  getEmployeeById(id: number): Employee | undefined {
    return this.employees.find(e => e.id === id);
  }

  // Update employee
  updateEmployee(updatedEmp: Employee) {
    const index = this.employees.findIndex(e => e.id === updatedEmp.id);
    if (index !== -1) {
      this.employees[index] = updatedEmp;
    }
  }
  // Delete employee
  deleteEmployee(id: number) {
    this.employees = this.employees.filter(e => e.id !== id);
  }
}