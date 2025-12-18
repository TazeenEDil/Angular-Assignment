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

  // GET ALL
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // CREATE
  addEmployee(emp: Employee): Observable<any> {
    return this.http.post(this.apiUrl, emp);
  }
}
