import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance, AttendanceStats, RealTimeStats } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:5224/api/attendance'; 

  constructor(private http: HttpClient) {}

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
    return this.http.post<Attendance>(`${this.apiUrl}/daily-report`, { report });
  }

  getEmployeeAttendance(employeeId: number, startDate?: string, endDate?: string): Observable<Attendance[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get<Attendance[]>(`${this.apiUrl}/employee/${employeeId}`, { params });
  }

  getEmployeeStats(employeeId: number, year?: number, month?: number): Observable<AttendanceStats> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());
    
    return this.http.get<AttendanceStats>(`${this.apiUrl}/stats/${employeeId}`, { params });
  }

  getRealTimeStats(date?: string): Observable<RealTimeStats> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    
    return this.http.get<RealTimeStats>(`${this.apiUrl}/realtime`, { params });
  }

  getReportSubmissionRate(date?: string): Observable<{ submissionRate: number }> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    
    return this.http.get<{ submissionRate: number }>(`${this.apiUrl}/report-submission-rate`, { params });
  }
}