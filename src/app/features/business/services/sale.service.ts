import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CashRegisterService } from './cash-register.service';
import {
    SaleListResponse,
    SaleSingleResponse,
    CreateSalePayload,
    AddPaymentPayload,
} from '../models';

@Injectable({ providedIn: 'root' })
export class SaleService {
    private http = inject(HttpClient);
    private cashRegisterService = inject(CashRegisterService);
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
        return this.http.post<SaleSingleResponse>(this.apiBase, payload).pipe(
            tap({ next: () => this.cashRegisterService.invalidateCurrent() }),
        );
    }

    addPayment(saleId: number, payload: AddPaymentPayload): Observable<SaleSingleResponse> {
        return this.http.post<SaleSingleResponse>(`${this.apiBase}/${saleId}/payments`, payload).pipe(
            tap({ next: () => this.cashRegisterService.invalidateCurrent() }),
        );
    }

    update(id: number, payload: Record<string, unknown>): Observable<SaleSingleResponse> {
        return this.http.put<SaleSingleResponse>(`${this.apiBase}/${id}`, payload).pipe(
            tap({ next: () => this.cashRegisterService.invalidateCurrent() }),
        );
    }

    cancel(id: number): Observable<SaleSingleResponse> {
        return this.http.patch<SaleSingleResponse>(`${this.apiBase}/${id}/cancel`, {}).pipe(
            tap({ next: () => this.cashRegisterService.invalidateCurrent() }),
        );
    }
}




