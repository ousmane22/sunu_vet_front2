import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
    CashRegisterSingleResponse,
    OpenCashRegisterPayload,
    CloseCashRegisterPayload,
} from '../models/cash-register.model';

@Injectable({
    providedIn: 'root'
})
export class CashRegisterService {
    private http = inject(HttpClient);
    private apiBase = `${environment.apiUrl}/business/cash-registers`;

    /**
     * Cache de la caisse courante.
     * Partagé entre PosProductGrid et PosCart qui en ont tous les deux besoin au démarrage.
     * Invalidé après open(), close() ou correctBalance().
     */
    private current$: Observable<CashRegisterSingleResponse> | null = null;
    private readonly changed$ = new Subject<void>();

    getCurrent(forceRefresh = false): Observable<CashRegisterSingleResponse> {
        if (forceRefresh) this.current$ = null;
        if (!this.current$) {
            this.current$ = this.http
                .get<CashRegisterSingleResponse>(`${this.apiBase}/current`)
                .pipe(
                    tap({ error: () => { this.current$ = null; } }),
                    shareReplay(1)
                );
        }
        return this.current$;
    }

    /** Émis après annulation vente, remboursement, open/close, etc. */
    onChanged(): Observable<void> {
        return this.changed$.asObservable();
    }

    /** Invalide le cache après toute mutation de caisse. */
    invalidateCurrent(): void {
        this.current$ = null;
        this.changed$.next();
    }

    getHistory(params: any = {}): Observable<any> {
        return this.http.get<any>(`${this.apiBase}/history`, { params });
    }

    open(payload: OpenCashRegisterPayload): Observable<CashRegisterSingleResponse> {
        return this.http.post<CashRegisterSingleResponse>(this.apiBase, payload).pipe(
            tap({ next: () => this.invalidateCurrent() })
        );
    }

    close(id: number, payload: CloseCashRegisterPayload): Observable<CashRegisterSingleResponse> {
        return this.http.put<CashRegisterSingleResponse>(`${this.apiBase}/${id}`, payload).pipe(
            tap({ next: () => this.invalidateCurrent() })
        );
    }

    correctBalance(id: number, closingBalance: number): Observable<CashRegisterSingleResponse> {
        return this.http.patch<CashRegisterSingleResponse>(`${this.apiBase}/${id}/correct-balance`, {
            closing_balance: closingBalance,
        }).pipe(
            tap({ next: () => this.invalidateCurrent() })
        );
    }
}




