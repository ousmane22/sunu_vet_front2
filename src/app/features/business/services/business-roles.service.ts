import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  BusinessRoleListResponse,
  BusinessRoleSingleResponse,
  CreateBusinessRolePayload,
  UpdateBusinessRolePayload,
  GroupedPermissionsResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class BusinessRolesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/business`;

  getAvailablePermissions(): Observable<GroupedPermissionsResponse> {
    return this.http.get<GroupedPermissionsResponse>(`${this.baseUrl}/roles/available-permissions`);
  }

  getRoles(): Observable<BusinessRoleListResponse> {
    return this.http.get<BusinessRoleListResponse>(`${this.baseUrl}/roles`);
  }

  createRole(payload: CreateBusinessRolePayload): Observable<BusinessRoleSingleResponse> {
    return this.http.post<BusinessRoleSingleResponse>(`${this.baseUrl}/roles`, payload);
  }

  updateRole(id: number, payload: UpdateBusinessRolePayload): Observable<BusinessRoleSingleResponse> {
    return this.http.put<BusinessRoleSingleResponse>(`${this.baseUrl}/roles/${id}`, payload);
  }

  deleteRole(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/roles/${id}`);
  }
}




