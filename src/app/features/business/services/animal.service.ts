import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  Animal,
  AnimalListResponse,
  AnimalSingleResponse,
} from '../models/animal.model';

export interface AnimalFilters {
  search?: string;
  client_id?: number;
  animal_species_id?: number;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private http = inject(HttpClient);
  private apiBase = `${environment.apiUrl}/business/animals`;

  getAll(filters: AnimalFilters = {}): Observable<AnimalListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<AnimalListResponse>(this.apiBase, { params });
  }

  getForClient(clientId: number): Observable<AnimalListResponse> {
    return this.http.get<AnimalListResponse>(
      `${environment.apiUrl}/business/clients/${clientId}/animals`
    );
  }

  getOne(id: number): Observable<AnimalSingleResponse> {
    return this.http.get<AnimalSingleResponse>(`${this.apiBase}/${id}`);
  }

  create(payload: Partial<Animal>): Observable<AnimalSingleResponse> {
    return this.http.post<AnimalSingleResponse>(this.apiBase, payload);
  }

  update(id: number, payload: Partial<Animal>): Observable<AnimalSingleResponse> {
    return this.http.put<AnimalSingleResponse>(`${this.apiBase}/${id}`, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBase}/${id}`);
  }

  uploadPhoto(id: number, file: File): Observable<AnimalSingleResponse> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<AnimalSingleResponse>(`${this.apiBase}/${id}/photo`, formData);
  }
}
