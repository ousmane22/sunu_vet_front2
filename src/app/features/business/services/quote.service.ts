import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    Quote,
    QuoteListResponse,
    CreateQuotePayload
} from '../models/quote.model';

@Injectable({ providedIn: 'root' })
export class QuoteService {
    private http = inject(HttpClient);
    private apiBase = `${environment.apiUrl}/business/quotes`;

    getAll(filters: { status?: string; client_id?: number; type?: string; page?: number; per_page?: number } = {}): Observable<QuoteListResponse> {
        return this.http.get<QuoteListResponse>(this.apiBase, { params: filters as any });
    }

    getById(id: number): Observable<Quote> {
        return this.http.get<Quote>(`${this.apiBase}/${id}`);
    }

    create(payload: CreateQuotePayload): Observable<Quote> {
        return this.http.post<Quote>(this.apiBase, payload);
    }

    update(id: number, payload: CreateQuotePayload): Observable<Quote> {
        return this.http.put<Quote>(`${this.apiBase}/${id}`, payload);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiBase}/${id}`);
    }

    convert(id: number, paymentData: { amount_paid: number; payment_method: string }): Observable<any> {
        return this.http.post(`${this.apiBase}/${id}/convert`, paymentData);
    }
}
