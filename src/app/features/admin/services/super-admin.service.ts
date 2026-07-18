import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface BusinessAdminListItem {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  business_id: number;
  business_name?: string;
  created_at: string;
}

export interface RevenuePaymentItem {
  id: number;
  subscription_id: number;
  business_id: number;
  business_name?: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface RevenueFilters {
  year?: number;
  month?: number;
  date_from?: string; // YYYY-MM-DD
  date_to?: string;
}

export interface RevenueResponse {
  data: RevenuePaymentItem[];
  total: number;
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class SuperAdminService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/super-admin`;

  getBusinessAdmins(): Observable<{ data: BusinessAdminListItem[] }> {
    return this.http.get<{ data: BusinessAdminListItem[] }>(`${this.baseUrl}/business-admins`);
  }

  getRevenue(filters?: RevenueFilters): Observable<RevenueResponse> {
    let params = new HttpParams();
    if (filters?.year != null) params = params.set('year', filters.year);
    if (filters?.month != null) params = params.set('month', filters.month);
    if (filters?.date_from) params = params.set('date_from', filters.date_from);
    if (filters?.date_to) params = params.set('date_to', filters.date_to);
    return this.http.get<RevenueResponse>(`${this.baseUrl}/revenue`, { params });
  }
}




