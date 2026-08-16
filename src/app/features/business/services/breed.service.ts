import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { BreedListResponse } from '../models/breed.model';

@Injectable({ providedIn: 'root' })
export class BreedService {
  private http = inject(HttpClient);

  getBySpecies(speciesId: number): Observable<BreedListResponse> {
    return this.http.get<BreedListResponse>(`${environment.apiUrl}/business/breeds`, {
      params: { species_id: speciesId },
    });
  }
}
