import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendanceAlert } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceAlertService {
  private apiUrl = 'https://localhost:5224/api/attendancealerts';

  constructor(private http: HttpClient) {}

  getMyAlerts(): Observable<AttendanceAlert[]> {
    return this.http.get<AttendanceAlert[]>(`${this.apiUrl}/my-alerts`);
  }

  createAlert(alert: { employeeId: number; alertType: string; message: string }): Observable<AttendanceAlert> {
    return this.http.post<AttendanceAlert>(this.apiUrl, alert);
  }

  markAlertAsRead(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/read`, {});
  }
}