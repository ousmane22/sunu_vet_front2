import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  InventorySession,
  InventoryListResponse,
  InventoryLineUpdatePayload,
} from '../models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/business/inventory`;

  list(params?: { status?: string; per_page?: number; page?: number }): Observable<InventoryListResponse> {
    const query: Record<string, string | number> = {};
    if (params?.status) query['status'] = params.status;
    if (params?.per_page != null) query['per_page'] = params.per_page;
    if (params?.page != null) query['page'] = params.page;
    return this.http.get<InventoryListResponse>(this.base, { params: query });
  }

  start(notes?: string): Observable<{ message: string; data: InventorySession }> {
    return this.http.post<{ message: string; data: InventorySession }>(this.base, { notes: notes ?? null });
  }

  get(id: number): Observable<{ data: InventorySession }> {
    return this.http.get<{ data: InventorySession }>(`${this.base}/${id}`);
  }

  updateLines(id: number, lines: InventoryLineUpdatePayload[]): Observable<{ data: InventorySession }> {
    return this.http.put<{ data: InventorySession }>(`${this.base}/${id}`, { lines });
  }

  complete(id: number, options?: { treat_uncounted_as_zero?: boolean }): Observable<{ message: string; data: InventorySession }> {
    return this.http.post<{ message: string; data: InventorySession }>(`${this.base}/${id}/complete`, options ?? {});
  }

  cancel(id: number): Observable<{ message: string; data: InventorySession }> {
    return this.http.post<{ message: string; data: InventorySession }>(`${this.base}/${id}/cancel`, {});
  }
}
