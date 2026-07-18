import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StatsResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/super-admin/dashboard/stats`;

  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(this.apiUrl);
  }
}




