import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    SaleListResponse,
    SaleSingleResponse,
    CreateSalePayload,
    AddPaymentPayload,
} from '../models';

@Injectable({ providedIn: 'root' })
export class SaleService {
    private http = inject(HttpClient);
    private apiBase = `${environment.apiUrl}/business/sales`;

    getAll(filters: {
        period?: 'today' | 'week' | 'month' | 'custom';
        date?: string;
        date_from?: string;
        date_to?: string;
        user_id?: number;
        status?: string;
        client_id?: number;
        page?: number;
        per_page?: number;
    } = {}): Observable<SaleListResponse> {
        return this.http.get<SaleListResponse>(this.apiBase, { params: filters as any });
    }

    getById(id: number): Observable<SaleSingleResponse> {
        return this.http.get<SaleSingleResponse>(`${this.apiBase}/${id}`);
    }

    getStats(): Observable<any> {
        return this.http.get<any>(`${this.apiBase}/stats`);
    }

    create(payload: CreateSalePayload): Observable<SaleSingleResponse> {
        return this.http.post<SaleSingleResponse>(this.apiBase, payload);
    }

    addPayment(saleId: number, payload: AddPaymentPayload): Observable<SaleSingleResponse> {
        return this.http.post<SaleSingleResponse>(`${this.apiBase}/${saleId}/payments`, payload);
    }

    update(id: number, payload: Record<string, unknown>): Observable<SaleSingleResponse> {
        return this.http.put<SaleSingleResponse>(`${this.apiBase}/${id}`, payload);
    }

    cancel(id: number): Observable<SaleSingleResponse> {
        return this.http.patch<SaleSingleResponse>(`${this.apiBase}/${id}/cancel`, {});
    }
}




