import type { BusinessDashboardStats } from '../../models';
import type { StatCardTheme } from '../../../../shared/components/stat-card/stat-card.component';

/** Configuration d’une carte Quick Stat (clé dans stats, libellé, route, suffixe, thème, icône). */
export interface QuickStatItemConfig {
  key: keyof Pick<BusinessDashboardStats, 'today_sales' | 'today_consultations' | 'total_clients' | 'low_stock_items'>;
  label: string;
  route: string[];
  suffix: string;
  theme: StatCardTheme;
  /** Path SVG (attribut d) Heroicons outline 24x24 */
  iconPath: string;
}

/** Liste des cartes Quick Stats, une seule source de vérité. */
export const QUICK_STAT_CONFIG: QuickStatItemConfig[] = [
  {
    key: 'today_sales',
    label: 'Ventes du jour',
    route: ['/business/sales'],
    suffix: 'ventes',
    theme: 'blue',
    iconPath: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  },
  {
    key: 'today_consultations',
    label: 'Consultations',
    route: ['/business/consultations'],
    suffix: "aujourd'hui",
    theme: 'green',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    key: 'total_clients',
    label: 'Clients',
    route: ['/business/clients'],
    suffix: 'inscrits',
    theme: 'purple',
    iconPath: 'M17 20h5V16a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-4a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    key: 'low_stock_items',
    label: 'Alertes Stock',
    route: ['/business/products'],
    suffix: 'articles',
    theme: 'amber',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
];




