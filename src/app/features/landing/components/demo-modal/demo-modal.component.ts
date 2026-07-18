import { Component, inject, signal, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoModalService } from '../../services/demo-modal.service';

@Component({
  selector: 'app-demo-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demo-modal.component.html',
})
export class DemoModalComponent implements OnDestroy {
  demoModal = inject(DemoModalService);
  carouselIndex = signal(0);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly demoImages = ['assets/images/demo1.png', 'assets/images/demo2.png', 'assets/images/demo3.png'];

  constructor() {
    effect(() => {
      if (this.demoModal.isOpen()) {
        this.carouselIndex.set(0);
        this.startCarousel();
      } else {
        this.stopCarousel();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  nextSlide(): void {
    this.carouselIndex.update((i) => (i + 1) % this.demoImages.length);
  }

  prevSlide(): void {
    this.carouselIndex.update((i) => (i - 1 + this.demoImages.length) % this.demoImages.length);
  }

  goToSlide(index: number): void {
    this.carouselIndex.set(index);
  }

  close(): void {
    this.demoModal.close();
  }

  private startCarousel(): void {
    this.stopCarousel();
    this.intervalId = setInterval(() => this.nextSlide(), 4500);
  }

  private stopCarousel(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
