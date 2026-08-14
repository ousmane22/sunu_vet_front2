import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingActionsService } from '../../services/landing-actions.service';

@Component({
  selector: 'app-landing-ai',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-ai.component.html',
})
export class LandingAiComponent {
  actions = inject(LandingActionsService);

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
}
