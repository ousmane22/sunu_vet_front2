import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { BusinessDashboardResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class BusinessDashboardService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/business/dashboard`;

  getStats(): Observable<BusinessDashboardResponse> {
    return this.http.get<BusinessDashboardResponse>(`${this.baseUrl}/stats`);
  }
}




