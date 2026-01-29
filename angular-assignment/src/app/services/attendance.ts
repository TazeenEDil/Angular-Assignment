import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Attendance, AttendanceStats } from '../models/attendance.model';
import { AuthService } from './auth/auth-service';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:5224/api/Attendance';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // =====================================================
  // EMPLOYEE ENDPOINTS - Use JWT token (no employee ID needed)
  // =====================================================

  /**
   * Get my own attendance records (uses JWT token)
   */
  getMyAttendance(startDate: string, endDate: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/me`, {
      params: { startDate, endDate }
    });
  }

  /**
   * Clock in
   */
  clockIn(workMode: string): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/clock-in`, { workMode });
  }

  /**
   * Clock out
   */
  clockOut(): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/clock-out`, {});
  }

  /**
   * Start break
   */
  startBreak(): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/break/start`, {});
  }

  /**
   * End break
   */
  endBreak(): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.apiUrl}/break/end`, {});
  }

  /**
   * Submit daily report
   */
  submitDailyReport(report: string): Observable<Attendance> {
    return this.http.post<Attendance>(
      `${this.apiUrl}/daily-report`,
      { report }
    );
  }

  /**
   * ✅ Get my own monthly stats (uses JWT token via /me endpoint)
   * GET /api/attendance/me/stats?year=&month=
   */
  getMyStats(year: number, month: number): Observable<AttendanceStats> {
    const employeeId = this.authService.getEmployeeId();
    if (!employeeId) {
      return throwError(() => new Error('Employee ID not found in token'));
    }

    return this.getEmployeeStats(employeeId, year, month);
  }

  /**
   * Get specific employee attendance (admin only)
   * GET /api/attendance/employee/{employeeId}?startDate=&endDate=
   */
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

  /**
   * Get specific employee stats (admin only)
   * GET /api/Attendance/stats/{employeeId}?year=&month=
   */
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
