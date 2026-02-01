import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Attendance, AttendanceStats } from '../models/attendance.model';
import { AuthService } from './auth/auth-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/Attendance`;

  constructor(private http: HttpClient, private authService: AuthService) {}

 
  getMyAttendance(startDate: string, endDate: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/me`, {
      params: { startDate, endDate }
    });
  }

  
  clockIn(workMode: string): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/clock-in`, { workMode });
  }

  
  clockOut(): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/clock-out`, {});
  }

  
  startBreak(): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/break/start`, {});
  }

  endBreak(): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/break/end`, {});
  }

  
  submitDailyReport(report: string): Observable<Attendance> {
    return this.http.post<Attendance>(
      `${this.apiUrl}/daily-report`,
      { report }
    );
  }

  getMyStats(year: number, month: number): Observable<AttendanceStats> {
    const employeeId = this.authService.getEmployeeId();
    if (!employeeId) {
      return throwError(() => new Error('Employee ID not found in token'));
    }

    return this.getEmployeeStats(employeeId, year, month);
  }

  getEmployeeAttendance(
    employeeId: number,
    startDate: string,
    endDate: string
  ): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(
      `${this.apiUrl}/employee/${employeeId}`,
      { params: { startDate, endDate } }
    );
  }

  getEmployeeStats(employeeId: number, year: number, month: number): Observable<AttendanceStats> {
    return this.http.get<AttendanceStats>(
      `${this.apiUrl}/stats/${employeeId}`,
      {
        params: {
          year: year.toString(),
          month: month.toString()
        }
      }
    );
  }
}
