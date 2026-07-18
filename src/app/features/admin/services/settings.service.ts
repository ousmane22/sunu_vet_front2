import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SubscriptionPlanDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number;
  max_users: number | null;
  max_animals: number | null;
  max_storage_mb: number | null;
  features: string[] | null;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number | null;
  subscriptions_count?: number;
  created_at: string;
  updated_at: string;
}

export interface RoleDetail {
  id: number;
  name: string;
  guard_name: string;
  permissions: PermissionDetail[];
  users_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PermissionDetail {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/super-admin`;

  // Plans
  getPlans(): Observable<{ data: SubscriptionPlanDetail[] }> {
    return this.http.get<{ data: SubscriptionPlanDetail[] }>(`${this.baseUrl}/subscription-plans`);
  }

  createPlan(data: Partial<SubscriptionPlanDetail>): Observable<{ data: SubscriptionPlanDetail }> {
    return this.http.post<{ data: SubscriptionPlanDetail }>(`${this.baseUrl}/subscription-plans`, data);
  }

  updatePlan(id: number, data: Partial<SubscriptionPlanDetail>): Observable<{ data: SubscriptionPlanDetail; message: string }> {
    return this.http.put<{ data: SubscriptionPlanDetail; message: string }>(`${this.baseUrl}/subscription-plans/${id}`, data);
  }

  deletePlan(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/subscription-plans/${id}`);
  }

  togglePlanStatus(id: number): Observable<{ data: SubscriptionPlanDetail; message: string }> {
    return this.http.patch<{ data: SubscriptionPlanDetail; message: string }>(`${this.baseUrl}/subscription-plans/${id}/toggle-status`, {});
  }

  // Roles
  getRoles(): Observable<{ data: RoleDetail[] }> {
    return this.http.get<{ data: RoleDetail[] }>(`${this.baseUrl}/roles`);
  }

  createRole(data: { name: string; permissions?: string[] }): Observable<{ data: RoleDetail }> {
    return this.http.post<{ data: RoleDetail }>(`${this.baseUrl}/roles`, data);
  }

  updateRole(id: number, data: { name?: string; permissions?: string[] }): Observable<{ data: RoleDetail; message: string }> {
    return this.http.put<{ data: RoleDetail; message: string }>(`${this.baseUrl}/roles/${id}`, data);
  }

  deleteRole(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/roles/${id}`);
  }

  // Permissions
  getPermissions(): Observable<{ data: PermissionDetail[] }> {
    return this.http.get<{ data: PermissionDetail[] }>(`${this.baseUrl}/permissions`);
  }

  createPermission(data: { name: string }): Observable<{ data: PermissionDetail }> {
    return this.http.post<{ data: PermissionDetail }>(`${this.baseUrl}/permissions`, data);
  }

  updatePermission(id: number, data: { name: string }): Observable<{ data: PermissionDetail; message: string }> {
    return this.http.put<{ data: PermissionDetail; message: string }>(`${this.baseUrl}/permissions/${id}`, data);
  }

  deletePermission(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/permissions/${id}`);
  }
}




