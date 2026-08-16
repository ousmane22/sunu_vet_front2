import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

export type LegalPageSlug = 'faq' | 'privacy' | 'terms' | 'docs';

interface LegalSection {
  title: string;
  paragraphs: string[];
}

interface LegalPageContent {
  title: string;
  intro: string;
  sections: LegalSection[];
}

const LEGAL_CONTENT: Record<LegalPageSlug, LegalPageContent> = {
  faq: {
    title: 'Questions fréquentes',
    intro: 'Réponses aux questions les plus courantes sur SunuVet.',
    sections: [
      {
        title: 'Comment démarrer ?',
        paragraphs: [
          'Créez un compte gratuit, renseignez votre clinique et profitez de 30 jours d’essai complet sans engagement.',
          'Notre équipe peut vous accompagner par téléphone ou e-mail si besoin.',
        ],
      },
      {
        title: 'L’essai est-il vraiment gratuit ?',
        paragraphs: [
          'Oui. Pendant 30 jours, vous accédez à l’ensemble des fonctionnalités. Aucune carte bancaire n’est demandée à l’inscription.',
        ],
      },
      {
        title: 'Puis-je gérer plusieurs utilisateurs ?',
        paragraphs: [
          'Oui. SunuVet permet de créer des comptes staff avec des rôles et permissions adaptés (vente, soins, stock, rapports…).',
        ],
      },
      {
        title: 'Mes données sont-elles sécurisées ?',
        paragraphs: [
          'Chaque clinique dispose d’un espace isolé. Les accès sont authentifiés et les sauvegardes sont gérées côté infrastructure.',
        ],
      },
      {
        title: 'Comment contacter le support ?',
        paragraphs: [
          'Par e-mail : contact@sunuvet.com — Téléphone : +221 70 644 61 43.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Politique de confidentialité',
    intro: 'SunuVet s’engage à protéger les données de votre clinique et de vos clients.',
    sections: [
      {
        title: 'Données collectées',
        paragraphs: [
          'Nous traitons les informations nécessaires au fonctionnement du service : compte utilisateur, fiches clients et animaux, ventes, consultations, stock et paiements.',
        ],
      },
      {
        title: 'Utilisation',
        paragraphs: [
          'Les données servent uniquement à fournir et améliorer SunuVet. Elles ne sont pas revendues à des tiers.',
        ],
      },
      {
        title: 'Conservation & sécurité',
        paragraphs: [
          'Les accès sont limités par rôle. Nous appliquons des mesures techniques raisonnables pour limiter les accès non autorisés.',
        ],
      },
      {
        title: 'Vos droits',
        paragraphs: [
          'Pour toute demande d’accès, rectification ou suppression, contactez contact@sunuvet.com.',
        ],
      },
    ],
  },
  terms: {
    title: 'Conditions générales d’utilisation',
    intro: 'En utilisant SunuVet, vous acceptez les conditions suivantes.',
    sections: [
      {
        title: 'Objet du service',
        paragraphs: [
          'SunuVet est un logiciel de gestion pour cliniques vétérinaires (consultations, ventes, stock, caisse, rapports).',
        ],
      },
      {
        title: 'Compte & essai',
        paragraphs: [
          'L’inscription crée un espace dédié à votre établissement. L’essai gratuit dure 30 jours, puis un abonnement payant s’applique si vous continuez.',
        ],
      },
      {
        title: 'Responsabilités',
        paragraphs: [
          'Vous restez responsable des données saisies et des décisions médicales. SunuVet est un outil d’organisation, pas un dispositif médical.',
        ],
      },
      {
        title: 'Résiliation',
        paragraphs: [
          'Vous pouvez cesser d’utiliser le service à tout moment. Contactez-nous pour la clôture de compte et les modalités de fin d’abonnement.',
        ],
      },
    ],
  },
  docs: {
    title: 'Documentation',
    intro: 'Premiers pas avec SunuVet — guide rapide.',
    sections: [
      {
        title: '1. Créer votre clinique',
        paragraphs: [
          'Inscrivez-vous, complétez le profil de la clinique et invitez votre équipe depuis Paramètres → Staff.',
        ],
      },
      {
        title: '2. Configurer la caisse',
        paragraphs: [
          'Ouvrez une session de caisse avant les ventes si l’option est activée. Encaissez en espèces, carte ou mobile money.',
        ],
      },
      {
        title: '3. Consultations & ventes',
        paragraphs: [
          'Enregistrez consultations et ventes POS. Les paiements partiels et crédits client sont gérés automatiquement.',
        ],
      },
      {
        title: '4. Rapports & SunuVet Assistant',
        paragraphs: [
          'Consultez les rapports Performance, Médical et Trésorerie. Utilisez SunuVet Assistant pour interroger vos indicateurs du jour.',
        ],
      },
      {
        title: 'Besoin d’aide ?',
        paragraphs: [
          'Écrivez à contact@sunuvet.com ou appelez le +221 70 644 61 43.',
        ],
      },
    ],
  },
};

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './legal-page.component.html',
})
export class LegalPageComponent {
  private route = inject(ActivatedRoute);

  content: LegalPageContent;

  constructor() {
    const slug = (this.route.snapshot.data['legalSlug'] ?? 'faq') as LegalPageSlug;
    this.content = LEGAL_CONTENT[slug] ?? LEGAL_CONTENT.faq;
  }
}
