import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Position {
  positionId: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PositionService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5224/api/positions';

  getPositions(): Observable<Position[]> {
    return this.http.get<Position[]>(this.baseUrl);
  }
}