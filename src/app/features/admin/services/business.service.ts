import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Business, PaginatedResponse, Subscription, SubscriptionPayment, SubscriptionPlan, User } from '../models';

interface BusinessesApiResponse {
  data: Business[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/super-admin/businesses`;
  private base = `${environment.apiUrl}/super-admin`;

  // ── Businesses ──────────────────────────────────────

  getBusinesses(page = 1, perPage = 15): Observable<PaginatedResponse<Business>> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);
    return this.http.get<BusinessesApiResponse>(this.apiUrl, { params }).pipe(
      map((res) => ({
        data: res.data ?? [],
        current_page: res.meta?.current_page ?? page,
        last_page: res.meta?.last_page ?? 1,
        total: res.meta?.total ?? res.data?.length ?? 0,
        per_page: perPage,
      }))
    );
  }

  getBusinessDetails(id: number): Observable<{ data: Business }> {
    return this.http.get<{ data: Business }>(`${this.apiUrl}/${id}`);
  }

  createBusiness(data: any): Observable<{ data: Business; message: string }> {
    return this.http.post<{ data: Business; message: string }>(this.apiUrl, data);
  }

  updateBusiness(id: number, data: Partial<Business>): Observable<{ data: Business; message: string }> {
    return this.http.put<{ data: Business; message: string }>(`${this.apiUrl}/${id}`, data);
  }

  toggleStatus(id: number): Observable<{ data: Business; message: string }> {
    return this.http.patch<{ data: Business; message: string }>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // ── Subscription Plans ────────────────────────────

  getSubscriptionPlans(): Observable<{ data: SubscriptionPlan[] }> {
    return this.http.get<{ data: SubscriptionPlan[] }>(`${this.base}/businesses/subscription-plans`);
  }

  // ── Subscriptions ─────────────────────────────────

  addSubscription(businessId: number, data: any): Observable<{ data: Subscription; message: string }> {
    return this.http.post<{ data: Subscription; message: string }>(`${this.apiUrl}/${businessId}/subscriptions`, data);
  }

  deleteSubscription(businessId: number, subId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${businessId}/subscriptions/${subId}`);
  }

  // ── Payments ──────────────────────────────────────

  addPayment(businessId: number, subId: number, data: any): Observable<{ data: SubscriptionPayment; message: string }> {
    return this.http.post<{ data: SubscriptionPayment; message: string }>(
      `${this.apiUrl}/${businessId}/subscriptions/${subId}/payments`, data
    );
  }

  updatePayment(businessId: number, subId: number, paymentId: number, data: any): Observable<{ data: SubscriptionPayment; message: string }> {
    return this.http.put<{ data: SubscriptionPayment; message: string }>(
      `${this.apiUrl}/${businessId}/subscriptions/${subId}/payments/${paymentId}`, data
    );
  }

  deletePayment(businessId: number, subId: number, paymentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${businessId}/subscriptions/${subId}/payments/${paymentId}`
    );
  }

  // ── Admins ────────────────────────────────────────

  addAdmin(businessId: number, data: any): Observable<{ data: User; message: string }> {
    return this.http.post<{ data: User; message: string }>(`${this.apiUrl}/${businessId}/admins`, data);
  }

  updateAdmin(businessId: number, userId: number, data: any): Observable<{ data: User }> {
    return this.http.put<{ data: User }>(`${this.apiUrl}/${businessId}/admins/${userId}`, data);
  }

  toggleAdminStatus(businessId: number, userId: number): Observable<{ data: User }> {
    return this.http.patch<{ data: User }>(`${this.apiUrl}/${businessId}/admins/${userId}/toggle-status`, {});
  }

  deleteAdmin(businessId: number, userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${businessId}/admins/${userId}`);
  }

  updateSubscription(businessId: number, subId: number, data: any): Observable<{ data: Subscription }> {
    return this.http.put<{ data: Subscription }>(`${this.apiUrl}/${businessId}/subscriptions/${subId}`, data);
  }
}




