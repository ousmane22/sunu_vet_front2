import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  business_id: number | null;
  is_active: boolean;
  roles: string[];
}

export interface UserProfileResponse {
  data: UserProfile;
  message?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/user`;

  getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.baseUrl}/profile`);
  }

  updateProfile(payload: UpdateProfilePayload): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(`${this.baseUrl}/profile`, payload);
  }

  updatePassword(payload: UpdatePasswordPayload): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/password`, payload);
  }
}


