import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  name: string;
  email: string;
  business_id?: number | null;
  business_name?: string;
  business_type?: string;
  is_active: boolean;
  roles: string[];
  permissions?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/auth`;

  // State management using Signals
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkInitialState();
  }

  private checkInitialState() {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (e) {
        this.clearAuthData();
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setAuthData(response.token, response.user);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  sendVerificationCode(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-verification-code`, { email });
  }

  verifyEmailCode(email: string, code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/verify-email-code`, { email, code });
  }

  register(payload: {
    email: string;
    code: string;
    name: string;
    business_name: string;
    business_address: string;
    business_phone: string;
    password: string;
    password_confirmation: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(response => {
        this.setAuthData(response.token, response.user);
      }),
      catchError(error => throwError(() => error))
    );
  }

  sendResetCode(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-reset-code`, { email });
  }

  resetPassword(payload: {
    email: string;
    code: string;
    password: string;
    password_confirmation: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, payload);
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('auth_token');

    // Attempt backend logout if token exists
    const request$ = token ?
      this.http.post(`${this.apiUrl}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }) : new Observable(sub => { sub.next(null); sub.complete(); });

    return request$.pipe(
      tap(() => {
        this.clearAuthData();
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        // Even if the backend call fails, clear local state
        this.clearAuthData();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  private setAuthData(token: string, user: User) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  /** Rafraîchit les données de l'utilisateur depuis le backend. */
  refreshProfile(): Observable<{ data: User }> {
    return this.http.get<{ data: User }>(`${environment.apiUrl}/user/profile`).pipe(
      tap(res => {
        this.updateCurrentUser(res.data);
      })
    );
  }

  /** Met à jour l'utilisateur courant (ex. après édition du profil). */
  updateCurrentUser(user: User): void {
    this.currentUser.set(user);
    const token = localStorage.getItem('auth_token');
    if (token) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Roles bypass
    const roles = user.roles || [];
    if (
      roles.includes('admin') ||
      roles.includes('admin_business') ||
      roles.includes('super-admin')
    ) {
      return true;
    }

    if (!permission) return true;

    return user.permissions?.includes(permission) ?? false;
  }
}



