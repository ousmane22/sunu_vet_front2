import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LandingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/track-visit`;

  trackVisit() {
    return this.http.post(this.apiUrl, {}, {
        headers: {
            'X-Frontend-Path': 'landing'
        }
    });
  }
}
