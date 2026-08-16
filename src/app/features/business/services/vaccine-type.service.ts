import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { VaccineTypeListResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class VaccineTypeService {
  private http = inject(HttpClient);
  private apiBase = `${environment.apiUrl}/business/vaccine-types`;

  getAll(): Observable<VaccineTypeListResponse> {
    return this.http.get<VaccineTypeListResponse>(this.apiBase);
  }
}
