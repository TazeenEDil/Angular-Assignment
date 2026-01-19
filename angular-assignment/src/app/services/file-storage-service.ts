import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmployeeFile {
  employeeFileId: number;
  employeeId: number;
  employeeName: string;
  fileStorageId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileCategory?: string;
  fileStatus: string;
  uploadedAt: Date;
  assignedAt: Date;
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
export class FileStorageService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5224/api/filestorage';

  getAllFiles(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedResponse<EmployeeFile>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<PaginatedResponse<EmployeeFile>>(this.apiUrl, { params });
  }

  getFilesByEmployee(employeeId: number): Observable<EmployeeFile[]> {
    return this.http.get<EmployeeFile[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  uploadFile(employeeId: number, file: File, category?: string): Observable<EmployeeFile> {
    const formData = new FormData();
    formData.append('employeeId', employeeId.toString());
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }
    
    return this.http.post<EmployeeFile>(`${this.apiUrl}/upload`, formData);
  }

  downloadFile(employeeFileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${employeeFileId}`, {
      responseType: 'blob'
    });
  }

  getPreviewUrl(employeeFileId: number): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/preview/${employeeFileId}`);
  }

  deleteFile(employeeFileId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${employeeFileId}`);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}