import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CashRegisterService } from './cash-register.service';
import { PAGINATION } from '../../../core/config/pagination.config';
import type {
  Consultation,
  ConsultationListResponse,
} from '../models';

export interface ConsultationFilters {
  date?: string;
  user_id?: number;
  status?: string;
  client_id?: number;
  page?: number;
  per_page?: number;
}

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private http = inject(HttpClient);
  private cashRegisterService = inject(CashRegisterService);
  private apiBase = `${environment.apiUrl}/business/consultations`;

  getAll(filters?: ConsultationFilters): Observable<ConsultationListResponse> {
    const params: Record<string, string> = {};
    if (filters?.date) params['date'] = filters.date;
    if (filters?.user_id != null) params['user_id'] = String(filters.user_id);
    if (filters?.status) params['status'] = filters.status;
    if (filters?.client_id != null) params['client_id'] = String(filters.client_id);
    params['page'] = String(filters?.page ?? 1);
    params['per_page'] = String(filters?.per_page ?? PAGINATION.DEFAULT);
    return this.http.get<ConsultationListResponse>(this.apiBase, { params });
  }

  getOne(id: number): Observable<{ data: Consultation }> {
    return this.http.get<{ data: Consultation }>(`${this.apiBase}/${id}`);
  }

  create(payload: Record<string, unknown>): Observable<{ data: Consultation; message?: string }> {
    return this.http.post<{ data: Consultation; message?: string }>(this.apiBase, payload).pipe(
      tap({ next: () => this.cashRegisterService.invalidateCurrent() }),
    );
  }

  addPayment(id: number, payload: { amount: number; payment_method: string; note?: string }): Observable<{ data: Consultation; message?: string }> {
    return this.http.post<{ data: Consultation; message?: string }>(`${this.apiBase}/${id}/payments`, payload).pipe(
      tap({ next: () => this.cashRegisterService.invalidateCurrent() }),
    );
  }

  update(id: number, payload: Record<string, unknown>): Observable<{ data: Consultation; message?: string }> {
    return this.http.put<{ data: Consultation; message?: string }>(`${this.apiBase}/${id}`, payload).pipe(
      tap({ next: () => this.cashRegisterService.invalidateCurrent() }),
    );
  }

  cancel(id: number): Observable<{ data: Consultation; message?: string }> {
    return this.http.patch<{ data: Consultation; message?: string }>(`${this.apiBase}/${id}/cancel`, {}).pipe(
      tap({ next: () => this.cashRegisterService.invalidateCurrent() }),
    );
  }
}
