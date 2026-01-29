import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// These match your backend DTOs exactly
export interface PositionDto {
  positionId: number;
  name: string;
  description?: string;
}

export interface PositionDetailDto {
  positionId: number;
  name: string;
  description?: string;
  createdAt: Date;
  employeeCount: number;
}

export interface CreatePositionDto {
  name: string;
  description?: string;
}

export interface UpdatePositionDto {
  name: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5224/api/Positions';

  // Get all positions (for dropdowns) - Returns PositionDto[]
  getPositions(): Observable<PositionDto[]> {
    return this.http.get<PositionDto[]>(this.apiUrl);
  }

  // Get paginated positions - Returns PaginatedResponse<PositionDetailDto>
  getPositionsPaginated(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedResponse<PositionDetailDto>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<PaginatedResponse<PositionDetailDto>>(`${this.apiUrl}/paginated`, { params });
  }

  // Get single position by ID - Returns PositionDetailDto
  getPositionById(id: number): Observable<PositionDetailDto> {
    return this.http.get<PositionDetailDto>(`${this.apiUrl}/${id}`);
  }

  // Create position - Returns PositionDto
  createPosition(dto: CreatePositionDto): Observable<PositionDto> {
    return this.http.post<PositionDto>(this.apiUrl, dto);
  }

  // Update position - Returns PositionDto
  updatePosition(id: number, dto: UpdatePositionDto): Observable<PositionDto> {
    return this.http.put<PositionDto>(`${this.apiUrl}/${id}`, dto);
  }

  // Delete position - Returns message object
  deletePosition(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}