import { Component, inject, input, output, signal } from '@angular/core';
import { ConsultationAiService } from '../../../services/consultation-ai.service';
import type { ConsultationAiContext, ConsultationAiField } from '../../../models/consultation-ai.types';

@Component({
  selector: 'app-ai-text-assist-btn',
  standalone: true,
  template: `
    <button
      type="button"
      class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-800 transition hover:border-primary-300 hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-45"
      [disabled]="disabled() || busy()"
      title="Proposer un texte avec l'IA (brouillon à valider)"
      (click)="generate()"
    >
      @if (busy()) {
        <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      } @else {
        <i class="fa-solid fa-wand-magic-sparkles text-[10px]" aria-hidden="true"></i>
      }
      Aider à rédiger
    </button>
  `,
})
export class AiTextAssistBtnComponent {
  private readonly ai = inject(ConsultationAiService);

  readonly field = input.required<ConsultationAiField>();
  readonly context = input<ConsultationAiContext>({});
  readonly disabled = input(false);

  readonly generated = output<string>();
  readonly failed = output<string>();

  protected readonly busy = signal(false);

  async generate(): Promise<void> {
    if (this.busy() || this.disabled()) return;

    this.busy.set(true);
    try {
      const text = await this.ai.generate(this.field(), this.context());
      if (!text) {
        this.failed.emit('Aucun texte généré. Réessaie ou saisis-le manuellement.');
        return;
      }
      this.generated.emit(text);
    } catch (err: unknown) {
      const message = this.extractError(err);
      this.failed.emit(message);
    } finally {
      this.busy.set(false);
    }
  }

  private extractError(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: { message?: string; errors?: Record<string, string[]> } }).error;
      if (body?.errors?.['field']?.[0]) return body.errors['field'][0];
      if (body?.message) return body.message;
    }
    return 'Génération impossible pour le moment.';
  }
}
