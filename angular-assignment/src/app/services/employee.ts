import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private apiUrl = 'https://localhost:5001/api/employees';

  constructor(private http: HttpClient) {}

  // GET ALL Employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // GET Single Employee by ID
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  // CREATE Employee
  addEmployee(emp: Omit<Employee, 'id' | 'createdAt'>): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, emp);
  }

  // UPDATE Employee
  updateEmployee(id: number, emp: Omit<Employee, 'id' | 'createdAt'>): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, emp);
  }

  // DELETE Employee
  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}