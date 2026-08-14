import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ConsultationAiContext, ConsultationAiField } from '../models/consultation-ai.types';

@Injectable({ providedIn: 'root' })
export class ConsultationAiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/business/ai/consultation/generate-text`;

  async generate(field: ConsultationAiField, context: ConsultationAiContext = {}): Promise<string> {
    const res = await firstValueFrom(
      this.http.post<{ text: string }>(this.apiUrl, { field, context }),
    );

    return res.text?.trim() ?? '';
  }
}
