import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance, AttendanceStats, AttendanceAlert } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:5224/api/attendance';

  constructor(private http: HttpClient) {}

  // Get my own attendance (uses token, no employeeId needed)
  getMyAttendance(startDate: string, endDate: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/me`, {
      params: { startDate, endDate }
    });
  }

  // Get my stats (uses token, no employeeId needed)
  getMyStats(year: number, month: number): Observable<AttendanceStats> {
    // Note: This endpoint might not exist yet, we'll need to create it
    // For now, we'll get all attendance and calculate stats
    return this.http.get<AttendanceStats>(`${this.apiUrl}/me/stats`, {
      params: { 
        year: year.toString(), 
        month: month.toString() 
      }
    });
  }

  // Clock in/out methods (use token)
  clockIn(workMode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/clock-in`, { workMode });
  }

  clockOut(): Observable<any> {
    return this.http.post(`${this.apiUrl}/clock-out`, {});
  }

  startBreak(): Observable<any> {
    return this.http.post(`${this.apiUrl}/break/start`, {});
  }

  endBreak(): Observable<any> {
    return this.http.post(`${this.apiUrl}/break/end`, {});
  }

  submitDailyReport(report: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/daily-report`, { report });
  }

  // For admin only - specific employee by ID
  getEmployeeAttendance(employeeId: number, startDate: string, endDate: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/employee/${employeeId}`, {
      params: { startDate, endDate }
    });
  }

  getEmployeeStats(employeeId: number, year: number, month: number): Observable<AttendanceStats> {
    return this.http.get<AttendanceStats>(`${this.apiUrl}/stats/${employeeId}`, {
      params: { year: year.toString(), month: month.toString() }
    });
  }
}