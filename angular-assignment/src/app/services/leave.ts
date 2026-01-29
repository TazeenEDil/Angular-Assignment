import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LeaveType, LeaveRequest } from '../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = 'http://localhost:5224/api/Leave'; // ✅ Capitalized to match controller

  constructor(private http: HttpClient) {}

  /**
   * Get all leave types
   */
  getLeaveTypes(): Observable<LeaveType[]> {
    console.log('🔗 GET /api/Leave/types');
    return this.http.get<LeaveType[]>(`${this.apiUrl}/types`).pipe(
      tap(data => console.log('✅ Leave types received:', data)),
      catchError(this.handleError)
    );
  }

  /**
   * Create leave request (uses JWT token)
   */
  createLeaveRequest(request: {
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    reason: string;
  }): Observable<LeaveRequest> {
    console.log('🔗 POST /api/Leave/request');
    console.log('   Data:', request);
    return this.http.post<LeaveRequest>(`${this.apiUrl}/request`, request).pipe(
      tap(data => console.log('✅ Leave request created:', data)),
      catchError(this.handleError)
    );
  }

  /**
   * Get my leave requests (uses JWT token)
   */
  getMyLeaveRequests(): Observable<LeaveRequest[]> {
    console.log('🔗 GET /api/Leave/my-requests');
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/my-requests`).pipe(
      tap(data => console.log('✅ My leave requests received:', data)),
      catchError(this.handleError)
    );
  }

  /**
   * Get pending requests (admin only)
   */
  getPendingRequests(): Observable<LeaveRequest[]> {
    console.log('🔗 GET /api/Leave/pending');
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/pending`).pipe(
      tap(data => console.log('✅ Pending requests received:', data)),
      catchError(this.handleError)
    );
  }

  /**
   * Approve or reject leave (admin only)
   */
  approveOrRejectLeave(
    id: number,
    approve: boolean,
    rejectionReason?: string
  ): Observable<LeaveRequest> {
    console.log(`🔗 POST /api/Leave/${id}/approve`);
    console.log('   Approve:', approve);
    console.log('   Reason:', rejectionReason || 'N/A');
    
    const payload = { 
      approve, 
      rejectionReason: rejectionReason || null 
    };
    
    console.log('   Payload:', payload);
    
    return this.http.post<LeaveRequest>(
      `${this.apiUrl}/${id}/approve`,
      payload
    ).pipe(
      tap(data => console.log('✅ Leave request processed:', data)),
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    console.error('❌ HTTP Error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || 
                    error.message || 
                    `Error Code: ${error.status}`;
    }
    
    console.error('Error message:', errorMessage);
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}