import {
  Component,
  inject,
  signal,
  HostListener,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LandingActionsService } from '../../services/landing-actions.service';

@Component({
  selector: 'app-landing-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-nav.component.html',
})
export class LandingNavComponent implements AfterViewInit, OnDestroy {
  actions = inject(LandingActionsService);
  private host = inject(ElementRef<HTMLElement>);

  menuOpen = signal(false);
  scrolled = signal(false);

  private scrollRoot: HTMLElement | null = null;
  private readonly onScrollRoot = (): void => this.syncScrollState();

  ngAfterViewInit(): void {
    this.scrollRoot = this.host.nativeElement.closest('app-landing');
    this.scrollRoot?.addEventListener('scroll', this.onScrollRoot, { passive: true });
    this.syncScrollState();
  }

  ngOnDestroy(): void {
    this.scrollRoot?.removeEventListener('scroll', this.onScrollRoot);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.syncScrollState();
  }

  private syncScrollState(): void {
    const y = this.scrollRoot?.scrollTop ?? window.scrollY;
    this.scrolled.set(y > 24);
  }

  scrollToSection(sectionId: string, event: Event): void {
    this.actions.scrollToSection(sectionId, event);
    this.closeMenu();
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }
}
