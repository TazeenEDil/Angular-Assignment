import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:5224/api/employees';

  constructor(private http: HttpClient) {}

  // Alias method for consistency
  getAll(): Observable<Employee[]> {
    return this.getEmployees();
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }
getMyProfile(): Observable<Employee> {
  return this.http.get<Employee>(`${this.apiUrl}/me`);
}
  // Alias for getAllEmployeesAsync (used in backend)
  getAllAsync(): Observable<Employee[]> {
    return this.getEmployees();
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  addEmployee(emp: { name: string; email: string; positionId: number }): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, emp);
  }

  updateEmployee(id: number, emp: { name: string; email: string; positionId: number }): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, emp);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}