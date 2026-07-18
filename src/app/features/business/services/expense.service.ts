import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ExpenseListResponse, CreateExpensePayload, Expense } from '../models';

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/business/expenses`;

    getAll(filters?: { date?: string; status?: string; category?: string; per_page?: number }): Observable<ExpenseListResponse> {
        let params = new HttpParams();

        if (filters) {
            if (filters.date) params = params.set('date', filters.date);
            if (filters.status) params = params.set('status', filters.status);
            if (filters.category) params = params.set('category', filters.category);
            if (filters.per_page) params = params.set('per_page', filters.per_page.toString());
        }

        return this.http.get<ExpenseListResponse>(this.apiUrl, { params });
    }

    create(payload: CreateExpensePayload): Observable<{ data: Expense }> {
        return this.http.post<{ data: Expense }>(this.apiUrl, payload);
    }

    update(id: number, payload: Record<string, unknown>): Observable<{ message: string; data: Expense }> {
        return this.http.put<{ message: string; data: Expense }>(`${this.apiUrl}/${id}`, payload);
    }

    cancel(id: number): Observable<{ message: string; data: Expense }> {
        return this.http.patch<{ message: string; data: Expense }>(`${this.apiUrl}/${id}/cancel`, {});
    }
}




