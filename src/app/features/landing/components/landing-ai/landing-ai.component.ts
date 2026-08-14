import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initRevealOnScroll } from '../../../../core/utils/reveal-on-scroll';
import { LandingActionsService } from '../../services/landing-actions.service';

type ChatPhase = 0 | 1 | 2;

@Component({
  selector: 'app-landing-ai',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-ai.component.html',
  styleUrl: './landing-ai.component.scss',
})
export class LandingAiComponent implements AfterViewInit, OnDestroy {
  actions = inject(LandingActionsService);
  private host = inject(ElementRef<HTMLElement>);

  /** Section visible dans le conteneur de scroll landing. */
  sectionVisible = signal(false);
  /** 0 = question, 1 = frappe, 2 = réponse assistant. */
  chatPhase = signal<ChatPhase>(0);

  private teardownReveal?: () => void;
  private sectionObserver?: IntersectionObserver;
  private chatInterval?: ReturnType<typeof setInterval>;
  private chatTimeouts: ReturnType<typeof setTimeout>[] = [];

  highlights = [
    {
      title: 'SunuVet Assistant',
      text: 'Posez vos questions sur ventes, consultations et stock — réponses basées sur vos chiffres du jour.',
    },
    {
      title: 'Aide à la rédaction',
      text: 'Motif de visite, examen, diagnostic et traitement : l’IA vous propose un brouillon à valider.',
    },
    {
      title: 'Encaissé vs facturé',
      text: 'SunuVet Assistant distingue ce qui est payé de ce qui reste dû, comme dans vos rapports.',
    },
  ];

  delayClass(index: number): string {
    if (index === 0) return 'reveal-delay-1';
    if (index === 1) return 'reveal-delay-2';
    return 'reveal-delay-3';
  }

  ngAfterViewInit(): void {
    this.teardownReveal = initRevealOnScroll(this.host.nativeElement);

    const section = this.host.nativeElement.querySelector('#assistant-ia') as HTMLElement | null;
    const scrollRoot = document.querySelector('app-landing');

    if (section && scrollRoot && typeof IntersectionObserver !== 'undefined') {
      this.sectionObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          this.sectionVisible.set(true);
          this.startChatDemo();
        },
        { root: scrollRoot, threshold: 0.2 },
      );
      this.sectionObserver.observe(section);
    } else {
      this.sectionVisible.set(true);
      this.startChatDemo();
    }
  }

  ngOnDestroy(): void {
    this.teardownReveal?.();
    this.sectionObserver?.disconnect();
    if (this.chatInterval) clearInterval(this.chatInterval);
    this.clearChatTimeouts();
  }

  private startChatDemo(): void {
    if (this.chatInterval) return;

    const runCycle = (): void => {
      this.clearChatTimeouts();
      this.chatPhase.set(0);
      this.chatTimeouts.push(setTimeout(() => this.chatPhase.set(1), 1400));
      this.chatTimeouts.push(setTimeout(() => this.chatPhase.set(2), 2800));
    };

    runCycle();
    this.chatInterval = setInterval(runCycle, 6500);
  }

  private clearChatTimeouts(): void {
    this.chatTimeouts.forEach(clearTimeout);
    this.chatTimeouts = [];
  }
}
