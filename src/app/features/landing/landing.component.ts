import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from './components/hero/hero.component';
import { FeaturesComponent } from './components/features/features.component';
import { ProjectPreviewComponent } from './components/project-preview/project-preview.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { CtaComponent } from './components/cta/cta.component';
import { DemoModalComponent } from './components/demo-modal/demo-modal.component';
import { ContactModalComponent } from './components/contact-modal/contact-modal.component';
import { LandingService } from './services/landing.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    FeaturesComponent,
    ProjectPreviewComponent,
    PricingComponent,
    TestimonialsComponent,
    CtaComponent,
    DemoModalComponent,
    ContactModalComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  private landingService = inject(LandingService);

  ngOnInit(): void {
    this.landingService.trackVisit().subscribe({
      error: (err) => console.error('Error tracking visit', err)
    });
  }
}



