import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { HospitalizationListResponse, HospitalizationSingleResponse } from '../models';

export interface StoreHospitalizationPayload {
  animal_id: number;
  client_id?: number | null;
  location?: string;
  reason?: string;
  total_amount: number;
  amount_paid: number;
  payment_method: 'cash' | 'card' | 'mobile_money';
  discount_type?: 'amount' | 'percent' | null;
  discount_value?: number;
}

@Injectable({ providedIn: 'root' })
export class HospitalizationService {
  private http = inject(HttpClient);
  private apiBase = `${environment.apiUrl}/business/hospitalizations`;

  getForAnimal(animalId: number): Observable<HospitalizationListResponse> {
    return this.http.get<HospitalizationListResponse>(this.apiBase, { params: { animal_id: animalId } });
  }

  create(payload: StoreHospitalizationPayload): Observable<HospitalizationSingleResponse> {
    return this.http.post<HospitalizationSingleResponse>(this.apiBase, payload);
  }

  addNote(id: number, note: string, condition?: string): Observable<HospitalizationSingleResponse> {
    return this.http.post<HospitalizationSingleResponse>(`${this.apiBase}/${id}/notes`, { note, condition });
  }

  discharge(id: number, payload: { discharge_summary?: string; total_amount?: number } = {}): Observable<HospitalizationSingleResponse> {
    return this.http.post<HospitalizationSingleResponse>(`${this.apiBase}/${id}/discharge`, payload);
  }

  addPayment(id: number, amount: number, payment_method: 'cash' | 'card' | 'mobile_money', note?: string): Observable<HospitalizationSingleResponse> {
    return this.http.post<HospitalizationSingleResponse>(`${this.apiBase}/${id}/payments`, { amount, payment_method, note });
  }

  cancel(id: number): Observable<HospitalizationSingleResponse> {
    return this.http.patch<HospitalizationSingleResponse>(`${this.apiBase}/${id}/cancel`, {});
  }
}
