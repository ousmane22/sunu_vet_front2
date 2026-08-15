import { Component, inject, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { TabButtonComponent } from '../../../../shared/components/tab-button/tab-button.component';
import { PosProductGridComponent } from '../pos-product-grid/pos-product-grid.component';
import { PosCartComponent } from '../pos-cart/pos-cart.component';
import { OpenRegisterPromptComponent } from '../../../../shared/components/open-register-prompt/open-register-prompt.component';
import { OpenRegisterPromptService } from '../../services/open-register-prompt.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [CommonModule, TabButtonComponent, PosProductGridComponent, PosCartComponent, OpenRegisterPromptComponent],
  templateUrl: './pos-page.component.html',
  host: { class: 'flex-1 min-h-0 flex flex-col overflow-hidden' },
})
export class PosPageComponent implements OnInit, AfterViewInit, OnDestroy {
  cartService = inject(CartService);
  private registerPrompt = inject(OpenRegisterPromptService);
  private destroy$ = new Subject<void>();

  mobileTab = signal<'products' | 'cart'>('products');
  isFullscreen = signal(false);
  showRegisterPrompt = signal(false);

  @ViewChild('posFullscreenRef') posFullscreenRef!: ElementRef<HTMLDivElement>;
  private fullscreenChangeHandler = (): void => this.isFullscreen.set(!!document.fullscreenElement);

  ngOnInit(): void {
    this.registerPrompt.evaluatePrompt('pos', (open) => this.showRegisterPrompt.set(open));
    this.registerPrompt.watchRegisterChanges('pos', (open) => this.showRegisterPrompt.set(open))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.registerPrompt.evaluatePrompt('pos', (open) => this.showRegisterPrompt.set(open)));
  }

  ngAfterViewInit(): void {
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.registerPrompt.leavePage('pos');
    document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  onOpenRegister(): void {
    this.showRegisterPrompt.set(false);
    this.registerPrompt.openRegisterPage('/business/pos');
  }

  toggleFullscreen(): void {
    const el = this.posFullscreenRef?.nativeElement;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => this.isFullscreen.set(false)).catch(() => {});
    } else {
      el.requestFullscreen().then(() => this.isFullscreen.set(true)).catch(() => {});
    }
  }
}




