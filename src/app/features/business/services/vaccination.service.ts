import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { Vaccination, VaccinationListResponse, VaccinationSingleResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class VaccinationService {
  private http = inject(HttpClient);
  private apiBase = `${environment.apiUrl}/business/vaccinations`;

  getForAnimal(animalId: number): Observable<VaccinationListResponse> {
    return this.http.get<VaccinationListResponse>(this.apiBase, { params: { animal_id: animalId } });
  }

  getUpcoming(from: string, to: string): Observable<VaccinationListResponse> {
    return this.http.get<VaccinationListResponse>(`${this.apiBase}/upcoming`, { params: { from, to } });
  }

  create(payload: Partial<Vaccination> & { animal_id: number }): Observable<VaccinationSingleResponse> {
    return this.http.post<VaccinationSingleResponse>(this.apiBase, payload);
  }

  update(id: number, payload: Partial<Vaccination>): Observable<VaccinationSingleResponse> {
    return this.http.put<VaccinationSingleResponse>(`${this.apiBase}/${id}`, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBase}/${id}`);
  }
}
