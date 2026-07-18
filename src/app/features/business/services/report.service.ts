import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TreasuryReport, StockReport, MedicalReport, DebtsReport, PerformanceReport, StockAnalyticalReport } from '../models/report.model';

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private http = inject(HttpClient);
    private apiBase = `${environment.apiUrl}/business/reports`;

    getTreasury(params: any = {}): Observable<TreasuryReport> {
        return this.http.get<{ data: TreasuryReport }>(`${this.apiBase}/treasury`, { params })
            .pipe(map(res => res.data));
    }

    getStock(params: any = {}): Observable<StockReport> {
        return this.http.get<{ data: StockReport }>(`${this.apiBase}/stock`, { params })
            .pipe(map(res => res.data));
    }

    getStockAnalytical(params: { period?: string; start_date?: string; end_date?: string; product_id?: number } = {}): Observable<StockAnalyticalReport> {
        const p: Record<string, string | number> = {};
        if (params.period != null) p['period'] = params.period;
        if (params.start_date) p['start_date'] = params.start_date;
        if (params.end_date) p['end_date'] = params.end_date;
        if (params.product_id != null && params.product_id > 0) p['product_id'] = params.product_id;
        return this.http.get<{ data: StockAnalyticalReport }>(`${this.apiBase}/stock-analytical`, { params: p })
            .pipe(map(res => res.data));
    }

    getMedical(params: any = {}): Observable<MedicalReport> {
        return this.http.get<{ data: MedicalReport }>(`${this.apiBase}/medical`, { params })
            .pipe(map(res => res.data));
    }

    getDebts(): Observable<DebtsReport> {
        return this.http.get<{ data: DebtsReport }>(`${this.apiBase}/debts`)
            .pipe(map(res => res.data));
    }

    getPerformance(params: any = {}): Observable<PerformanceReport> {
        return this.http.get<{ data: PerformanceReport }>(`${this.apiBase}/performance`, { params })
            .pipe(map(res => res.data));
    }
}




