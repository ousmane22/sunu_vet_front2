import { Component, computed, inject, input, signal, ElementRef, viewChild, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardAiService } from '../../../services/dashboard-ai.service';
import type { DashboardChatTurn } from '../../../services/dashboard-ai.service';
import type { BusinessDashboardStats } from '../../../models';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

@Component({
  selector: 'app-dashboard-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard-assistant.component.html',
})
export class DashboardAssistantComponent {
  private static readonly INTRO_STORAGE_PREFIX = 'sunuvet_chat_intro_seen_v1';

  private readonly ai = inject(DashboardAiService);
  private readonly scrollEl = viewChild<ElementRef<HTMLElement>>('scrollArea');

  stats = input<BusinessDashboardStats | null>(null);
  userName = input('');
  userId = input<number | null>(null);
  isVet = input(true);
  showSubscriptionAlert = input(false);
  daysRemaining = input(-1);
  subscriptionEndLabel = input('abonnement');

  isOpen = signal(false);
  isSending = signal(false);
  draft = signal('');
  error = signal<string | null>(null);
  messages = signal<ChatMessage[]>([]);

  hasAlerts = computed(() => {
    const s = this.stats();
    if (!s) return false;
    return s.low_stock_items > 0 || (this.showSubscriptionAlert() && this.daysRemaining() >= 0);
  });

  suggestedQuestions = computed(() => {
    const base = [
      'Combien ai-je encaissé aujourd\'hui ?',
      'Quels médicaments sont en stock bas ?',
    ];
    if (this.isVet()) {
      base.unshift('Résumé de mes consultations aujourd\'hui');
    }
    base.push('Pourquoi encaissé ≠ facturé ?');
    return base.slice(0, 4);
  });

  constructor() {
    afterNextRender(() => {
      this.scrollToBottom();
      this.maybeAutoOpenIntro();
    });
  }

  toggle(): void {
    if (this.isOpen()) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat(): void {
    if (this.isOpen()) return;

    this.isOpen.set(true);
    if (this.messages().length === 0) {
      this.messages.set([this.buildWelcomeMessage()]);
    }
    this.scrollToBottom();
    this.playOpenSound();
  }

  closeChat(): void {
    this.isOpen.set(false);
    this.markIntroSeen();
  }

  /** Ouvre le chat une seule fois par utilisateur (nouvelle fonctionnalité). */
  private maybeAutoOpenIntro(): void {
    if (this.hasSeenIntro() || this.isOpen()) return;
    setTimeout(() => {
      if (!this.hasSeenIntro() && !this.isOpen()) {
        this.openChat();
      }
    }, 700);
  }

  private introStorageKey(): string | null {
    const id = this.userId();
    return id ? `${DashboardAssistantComponent.INTRO_STORAGE_PREFIX}_${id}` : null;
  }

  private hasSeenIntro(): boolean {
    const key = this.introStorageKey();
    if (!key) return true;

    return localStorage.getItem(key) === '1';
  }

  private markIntroSeen(): void {
    const key = this.introStorageKey();
    if (key) localStorage.setItem(key, '1');
  }

  async sendMessage(text?: string): Promise<void> {
    const content = (text ?? this.draft()).trim();
    if (!content || this.isSending()) return;

    this.error.set(null);
    this.draft.set('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: content,
    };
    this.messages.update(list => [...list, userMsg]);
    this.scrollToBottom();

    this.isSending.set(true);
    try {
      const history: DashboardChatTurn[] = this.messages()
        .filter(m => m.id !== userMsg.id)
        .slice(-8)
        .map(m => ({ role: m.role, content: m.text }));

      const reply = await this.ai.chat(content, history);
      if (!reply) {
        this.error.set('Réponse vide. Réessaie.');
        return;
      }

      this.messages.update(list => [
        ...list,
        { id: `a-${Date.now()}`, role: 'assistant', text: reply },
      ]);
      this.scrollToBottom();
      this.playResponseSound();
    } catch (err: unknown) {
      this.error.set(this.extractError(err));
    } finally {
      this.isSending.set(false);
    }
  }

  askSuggestion(question: string): void {
    void this.sendMessage(question);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.sendMessage();
    }
  }

  quickActions = computed(() => {
    const actions = [
      { label: 'Point de vente', route: ['/business/pos'] },
      { label: 'Caisse', route: ['/business/cash-registers'] },
    ];
    if (this.isVet()) {
      actions.push({ label: 'Consultation', route: ['/business/consultations'] });
    }
    actions.push({ label: 'Ventes', route: ['/business/sales'] });
    return actions;
  });

  private buildWelcomeMessage(): ChatMessage {
    const name = this.userName()?.split(' ')[0] || 'l\'équipe';
    const s = this.stats();

    const isDiscovery = !this.hasSeenIntro();
    let intro = `Bonjour ${name} ! SunuVet Assistant vous répond${isDiscovery ? ' — nouvelle fonctionnalité' : ''}.\n\n`;
    intro += 'Posez une question sur vos ventes';
    if (this.isVet()) intro += ', consultations';
    intro += ' ou stock. Les réponses sont basées sur vos chiffres du jour, pas sur des estimations.';

    if (s && (s.today_sales > 0 || s.today_consultations > 0 || s.low_stock_items > 0)) {
      const parts: string[] = [];
      if (s.today_sales > 0) parts.push(`${s.today_sales} vente${s.today_sales > 1 ? 's' : ''}`);
      if (this.isVet() && s.today_consultations > 0) {
        parts.push(`${s.today_consultations} consultation${s.today_consultations > 1 ? 's' : ''}`);
      }
      if (parts.length) {
        intro += `\n\nAujourd'hui : ${parts.join(', ')}.`;
      }
      if (s.low_stock_items > 0) {
        intro += ` ${s.low_stock_items} médicament${s.low_stock_items > 1 ? 's' : ''} en stock bas.`;
      }
    }

    return { id: 'welcome', role: 'assistant', text: intro };
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollEl()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  /** Petit carillon discret à l'ouverture du chat. */
  private playOpenSound(): void {
    this.playChime([
      { frequency: 523.25, delay: 0, duration: 0.12, volume: 0.05 },
      { frequency: 659.25, delay: 0.07, duration: 0.18, volume: 0.045 },
    ]);
  }

  /** Son doux quand SunuVet Assistant répond. */
  private playResponseSound(): void {
    this.playChime([
      { frequency: 587.33, delay: 0, duration: 0.1, volume: 0.04 },
      { frequency: 783.99, delay: 0.05, duration: 0.16, volume: 0.038 },
    ]);
  }

  private playChime(tones: { frequency: number; delay: number; duration: number; volume: number }[]): void {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
      type AudioContextCtor = typeof AudioContext;
      const Ctx = window.AudioContext
        ?? (window as Window & { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
      if (!Ctx) return;

      const ctx = new Ctx();
      const start = ctx.currentTime;

      for (const tone of tones) {
        const at = start + tone.delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = tone.frequency;
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(tone.volume, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + tone.duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(at);
        osc.stop(at + tone.duration + 0.02);
      }

      const totalMs = Math.max(...tones.map(t => (t.delay + t.duration) * 1000)) + 120;
      window.setTimeout(() => void ctx.close(), totalMs);
    } catch {
      // Autoplay bloqué ou API audio indisponible
    }
  }

  private extractError(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: { message?: string; errors?: Record<string, string[]> } }).error;
      if (body?.errors?.['message']?.[0]) return body.errors['message'][0];
      if (body?.message) return body.message;
    }
    return 'Impossible de répondre pour le moment.';
  }
}
