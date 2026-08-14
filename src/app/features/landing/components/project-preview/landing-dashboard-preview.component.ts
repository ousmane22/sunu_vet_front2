import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QUICK_STAT_CONFIG } from '../../../business/dashboard/business-dashboard/quick-stat.config';

export type LandingDashboardPreviewVariant = 'hero' | 'section';

@Component({
  selector: 'app-landing-dashboard-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-dashboard-preview.component.html',
  styleUrl: './landing-dashboard-preview.component.scss',
})
export class LandingDashboardPreviewComponent {
  variant = input<LandingDashboardPreviewVariant>('section');

  readonly stats = [
    { ...QUICK_STAT_CONFIG[0], value: '12' },
    { ...QUICK_STAT_CONFIG[1], value: '5' },
    { ...QUICK_STAT_CONFIG[2], value: '248' },
    { ...QUICK_STAT_CONFIG[3], value: '3' },
  ];

  readonly chartDays = [
    { label: 'Lun', value: 42 },
    { label: 'Mar', value: 68 },
    { label: 'Mer', value: 55 },
    { label: 'Jeu', value: 82 },
    { label: 'Ven', value: 74 },
    { label: 'Sam', value: 91 },
    { label: 'Dim', value: 63 },
  ];

  readonly quickActions = ['Nouvelle vente', 'Consultation', 'Point de vente', 'Stock bas'];

  readonly recentActivity = [
    { type: 'Vente POS', detail: 'Panier #1842 · 45 000 F', time: '12 min', tone: 'primary' },
    { type: 'Consultation', detail: 'Max · Labrador · vaccin', time: '1 h', tone: 'sky' },
    { type: 'Alerte stock', detail: 'Amoxicilline · reste 4', time: '2 h', tone: 'amber' },
  ];

  readonly navGroups = [
    {
      title: 'Vente & Caisse',
      items: [
        { label: 'Point de vente', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
        { label: 'Historique Ventes', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      ],
    },
    {
      title: 'Clients & Soins',
      items: [
        { label: 'Clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { label: 'Consultations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      ],
    },
    {
      title: 'Stock',
      items: [
        { label: 'Médicaments', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
      ],
    },
  ];

  statThemeClasses(theme: string): { iconBg: string; valueClass: string; suffixClass: string } {
    switch (theme) {
      case 'danger':
        return {
          iconBg: 'bg-red-50 text-red-600',
          valueClass: 'text-red-600',
          suffixClass: 'text-red-600 font-medium',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600',
          valueClass: 'text-amber-700',
          suffixClass: 'text-amber-700 font-medium',
        };
      default:
        return {
          iconBg: 'bg-primary-50 text-primary-700',
          valueClass: 'text-gray-900',
          suffixClass: 'text-gray-500',
        };
    }
  }
}
