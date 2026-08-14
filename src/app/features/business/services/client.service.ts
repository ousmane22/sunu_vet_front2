import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CashRegisterService } from './cash-register.service';
import {
    Client,
    ClientListResponse,
    ClientSingleResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ClientService {
    private http = inject(HttpClient);
    private cashRegisterService = inject(CashRegisterService);
    private apiBase = `${environment.apiUrl}/business/clients`;

    /**
     * Cache de la liste complète (sans recherche).
     * Utilisé par les dropdowns de filtre (ex. page Paiements).
     * Les appels avec `search` sont toujours live (autocomplétion).
     */
    private allClients$: Observable<ClientListResponse> | null = null;

    /**
     * - Sans `search` → résultat mis en cache (shareReplay). Idéal pour les dropdowns.
     * - Avec `search` → appel HTTP direct, jamais mis en cache (autocomplétion live).
     */
    getAll(search?: string): Observable<ClientListResponse> {
        if (search) {
            return this.http.get<ClientListResponse>(this.apiBase, { params: { search } });
        }
        if (!this.allClients$) {
            this.allClients$ = this.http.get<ClientListResponse>(this.apiBase).pipe(
                tap({ error: () => { this.allClients$ = null; } }),
                shareReplay(1)
            );
        }
        return this.allClients$;
    }

    /** Invalide le cache après toute mutation (create, update, delete). */
    invalidateCache(): void {
        this.allClients$ = null;
    }

    getOne(id: number): Observable<ClientSingleResponse> {
        return this.http.get<ClientSingleResponse>(`${this.apiBase}/${id}`);
    }

    create(payload: Partial<Client>): Observable<ClientSingleResponse> {
        return this.http.post<ClientSingleResponse>(this.apiBase, payload).pipe(
            tap({ next: () => this.invalidateCache() })
        );
    }

    update(id: number, payload: Partial<Client>): Observable<ClientSingleResponse> {
        return this.http.put<ClientSingleResponse>(`${this.apiBase}/${id}`, payload).pipe(
            tap({ next: () => this.invalidateCache() })
        );
    }

    delete(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiBase}/${id}`).pipe(
            tap({ next: () => this.invalidateCache() })
        );
    }

    /** Enregistrer un paiement pour réduire le solde dû du client. */
    addPayment(
        clientId: number,
        payload: { amount: number; payment_method: string; note?: string }
    ): Observable<ClientSingleResponse> {
        return this.http.post<ClientSingleResponse>(`${this.apiBase}/${clientId}/payments`, payload).pipe(
            tap({ next: () => this.cashRegisterService.invalidateCurrent() }),
        );
    }
}




