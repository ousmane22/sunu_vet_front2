import { Component, inject, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { TabButtonComponent } from '../../../../shared/components/tab-button/tab-button.component';
import { PosProductGridComponent } from '../pos-product-grid/pos-product-grid.component';
import { PosCartComponent } from '../pos-cart/pos-cart.component';

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [CommonModule, TabButtonComponent, PosProductGridComponent, PosCartComponent],
  templateUrl: './pos-page.component.html',
  host: { class: 'flex-1 min-h-0 flex flex-col overflow-hidden' },
})
export class PosPageComponent implements AfterViewInit, OnDestroy {
  cartService = inject(CartService);
  mobileTab = signal<'products' | 'cart'>('products');
  isFullscreen = signal(false);

  @ViewChild('posFullscreenRef') posFullscreenRef!: ElementRef<HTMLDivElement>;
  private fullscreenChangeHandler = (): void => this.isFullscreen.set(!!document.fullscreenElement);

  ngAfterViewInit(): void {
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
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




