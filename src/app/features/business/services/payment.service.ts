import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { Payment } from '../models';

export interface PaymentListResponse {
    data: Payment[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/business/payments`;

    getAll(filters: any = {}): Observable<PaymentListResponse> {
        let params = new HttpParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                params = params.set(key, filters[key]);
            }
        });
        return this.http.get<PaymentListResponse>(this.apiUrl, { params });
    }
}




