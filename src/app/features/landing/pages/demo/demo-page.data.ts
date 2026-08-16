import { QUICK_STAT_CONFIG } from '../../../business/dashboard/business-dashboard/quick-stat.config';

export type DemoView = 'dashboard' | 'pos' | 'consultations' | 'clients';

export interface DemoNavItem {
  id: DemoView;
  label: string;
  icon: string;
}

export interface DemoNavGroup {
  title: string;
  items: DemoNavItem[];
}

export const DEMO_DASHBOARD_NAV: DemoNavItem = {
  id: 'dashboard',
  label: 'Tableau de bord',
  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
};

export const DEMO_NAV_GROUPS: DemoNavGroup[] = [
  {
    title: 'Vente & Caisse',
    items: [
      {
        id: 'pos',
        label: 'Point de vente',
        icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
      },
    ],
  },
  {
    title: 'Clients & Soins',
    items: [
      {
        id: 'clients',
        label: 'Clients',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      },
      {
        id: 'consultations',
        label: 'Consultations',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      },
    ],
  },
];

export const DEMO_STATS = [
  { ...QUICK_STAT_CONFIG[0], value: 12 },
  { ...QUICK_STAT_CONFIG[1], value: 5 },
  { ...QUICK_STAT_CONFIG[2], value: 248 },
  { ...QUICK_STAT_CONFIG[3], value: 3 },
];

export const DEMO_CHART_DAYS = [
  { label: 'Lun', value: 42 },
  { label: 'Mar', value: 68 },
  { label: 'Mer', value: 55 },
  { label: 'Jeu', value: 82 },
  { label: 'Ven', value: 74 },
  { label: 'Sam', value: 91 },
  { label: 'Dim', value: 63 },
];

export const DEMO_RECENT_ACTIVITY = [
  { type: 'Vente POS', detail: 'Panier #1842 · 45 000 F', time: '12 min', tone: 'primary' as const },
  { type: 'Consultation', detail: 'Max · Labrador · vaccin', time: '1 h', tone: 'sky' as const },
  { type: 'Alerte stock', detail: 'Amoxicilline · reste 4', time: '2 h', tone: 'amber' as const },
];

export const DEMO_PRODUCTS = [
  { name: 'Antiparasitaire externe', price: '8 500 F', stock: 24, category: 'Antiparasitaires' },
  { name: 'Croquettes premium 15 kg', price: '32 000 F', stock: 8, category: 'Alimentation' },
  { name: 'Amoxicilline 500 mg', price: '4 500 F', stock: 4, category: 'Antibiotiques' },
  { name: 'Collier médicalisé M', price: '6 000 F', stock: 15, category: 'Accessoires' },
  { name: 'Vaccin rage', price: '12 000 F', stock: 18, category: 'Vaccins' },
  { name: 'Shampooing dermatologique', price: '7 500 F', stock: 11, category: 'Hygiène' },
];

export const DEMO_CART = [
  { name: 'Vaccin rage', qty: 1, price: 12000 },
  { name: 'Antiparasitaire externe', qty: 2, price: 8500 },
];

export const DEMO_CONSULTATIONS = [
  { client: 'Fatou Ndiaye', animal: 'Milo · Berger', motif: 'Vaccination annuelle', amount: '18 000 F', status: 'Payée', date: 'Aujourd’hui · 09:40' },
  { client: 'Ibrahima Sow', animal: 'Luna · Chat', motif: 'Consultation générale', amount: '15 000 F', status: 'Partiel', date: 'Aujourd’hui · 11:15' },
  { client: 'Awa Diallo', animal: 'Rex · Doberman', motif: 'Contrôle post-op', amount: '22 000 F', status: 'Payée', date: 'Hier · 16:30' },
];

export const DEMO_CLIENTS = [
  { name: 'Fatou Ndiaye', phone: '+221 77 123 45 67', animals: 2, lastVisit: 'Aujourd’hui', balance: '0 F' },
  { name: 'Ibrahima Sow', phone: '+221 76 987 65 43', animals: 1, lastVisit: 'Aujourd’hui', balance: '7 500 F' },
  { name: 'Awa Diallo', phone: '+221 70 555 12 34', animals: 3, lastVisit: 'Hier', balance: '0 F' },
  { name: 'Moussa Ba', phone: '+221 78 222 88 99', animals: 1, lastVisit: '12 mars', balance: '0 F' },
];
