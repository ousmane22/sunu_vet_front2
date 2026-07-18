import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { AnimalSpeciesListResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AnimalSpeciesService {
  private http = inject(HttpClient);
  private apiBase = `${environment.apiUrl}/business/animal-species`;

  getAll(): Observable<AnimalSpeciesListResponse> {
    return this.http.get<AnimalSpeciesListResponse>(this.apiBase);
  }
}




