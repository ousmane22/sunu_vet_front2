import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initRevealOnScroll } from '../../core/utils/reveal-on-scroll';
import { HeroComponent } from './components/hero/hero.component';
import { LandingNavComponent } from './components/landing-nav/landing-nav.component';
import { FeaturesComponent } from './components/features/features.component';
import { ProjectPreviewComponent } from './components/project-preview/project-preview.component';
import { LandingAiComponent } from './components/landing-ai/landing-ai.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { CtaComponent } from './components/cta/cta.component';
import { ContactModalComponent } from './components/contact-modal/contact-modal.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    LandingNavComponent,
    HeroComponent,
    FeaturesComponent,
    ProjectPreviewComponent,
    LandingAiComponent,
    PricingComponent,
    TestimonialsComponent,
    CtaComponent,
    ContactModalComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private teardownReveal?: () => void;

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.teardownReveal = initRevealOnScroll(this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.teardownReveal?.();
  }
}
