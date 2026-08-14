import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DashboardChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardAiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/business/ai/chat`;

  async chat(message: string, history: DashboardChatTurn[] = []): Promise<string> {
    const res = await firstValueFrom(
      this.http.post<{ reply: string }>(this.apiUrl, { message, history }),
    );

    return res.reply?.trim() ?? '';
  }
}
