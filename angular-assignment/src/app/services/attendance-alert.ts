import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendanceAlert } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceAlertService {
  private apiUrl = 'http://localhost:5224/api/AttendanceAlerts';

  constructor(private http: HttpClient) {}

  getMyAlerts(): Observable<AttendanceAlert[]> {
    return this.http.get<AttendanceAlert[]>(`${this.apiUrl}/my-alerts`);
  }

  markAlertAsRead(alertId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${alertId}/read`, {});
  }
}