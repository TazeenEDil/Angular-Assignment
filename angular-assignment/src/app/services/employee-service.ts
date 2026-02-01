import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/Employees`;

  constructor(private http: HttpClient) {}

  /**
   * Get all employees
   */
  getEmployees(): Observable<Employee[]> {
    console.log('🔗 GET /api/employees');
    return this.http.get<Employee[]>(this.apiUrl);
  }

  /**
   * Get my own profile (uses JWT token)
   */
  getMyProfile(): Observable<Employee> {
    console.log('🔗 GET /api/employees/me');
    return this.http.get<Employee>(`${this.apiUrl}/me`);
  }

  /**
   * Alias methods for consistency
   */
  getAll(): Observable<Employee[]> {
    return this.getEmployees();
  }

  getAllAsync(): Observable<Employee[]> {
    return this.getEmployees();
  }

  /**
   * Get employee by ID
   */
  getEmployeeById(id: number): Observable<Employee> {
    console.log('🔗 GET /api/employees/' + id);
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  /**
   * Add new employee (admin only)
   */
  addEmployee(emp: { name: string; email: string; positionId: number }): Observable<Employee> {
    console.log('🔗 POST /api/employees');
    return this.http.post<Employee>(this.apiUrl, emp);
  }

  /**
   * Update employee (admin only)
   */
  updateEmployee(id: number, emp: { name: string; email: string; positionId: number }): Observable<Employee> {
    console.log('🔗 PUT /api/employees/' + id);
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, emp);
  }

  /**
   * Delete employee (admin only)
   */
  deleteEmployee(id: number): Observable<any> {
    console.log('🔗 DELETE /api/employees/' + id);
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}