export interface BusinessStrategy {
  type: string;
  labels: {
    products: string;
    productType: string;
    productCategory: string;
    consultations?: string;
  };
  visibleMenus: string[];
  visibleFormFields: string[];
}

export const VETERINARY_STRATEGY: BusinessStrategy = {
  type: 'veterinary',
  labels: {
    products: 'Médicaments',
    productType: 'Type de galénique',
    productCategory: 'Catégorie',
    consultations: 'Consultations'
  },
  visibleMenus: ['Point de vente', 'Historique Ventes', 'Paiements', 'Gestion Caisses', 'Devis & Proformas', 'Clients', 'Consultations', 'Médicaments', 'Catégories', 'Mouvements Stock', 'Inventaire physique', 'Rapport de stock', 'Dépenses', 'Personnel', 'Rapports', 'Paramètres'],
  visibleFormFields: ['name', 'sku', 'type', 'description', 'purchase_price', 'selling_price', 'stock_quantity', 'low_stock_threshold', 'expiry_date']
};

export const RETAIL_STRATEGY: BusinessStrategy = {
  type: 'retail',
  labels: {
    products: 'Produits',
    productType: 'Type',
    productCategory: 'Catégorie'
  },
  visibleMenus: ['Point de vente', 'Historique Ventes', 'Paiements', 'Gestion Caisses', 'Devis & Proformas', 'Clients', 'Médicaments', 'Catégories', 'Mouvements Stock', 'Inventaire physique', 'Rapport de stock', 'Dépenses', 'Personnel', 'Rapports', 'Paramètres'],
  visibleFormFields: ['name', 'sku', 'category', 'unit', 'allow_fractional_quantity', 'description', 'purchase_price', 'selling_price', 'stock_quantity', 'low_stock_threshold', 'expiry_date']
};

export const RESTAURANT_STRATEGY: BusinessStrategy = {
  type: 'restaurant',
  labels: {
    products: 'Produits',
    productType: 'Type',
    productCategory: 'Catégorie'
  },
  visibleMenus: ['Point de vente', 'Historique Ventes', 'Paiements', 'Gestion Caisses', 'Devis & Proformas', 'Clients', 'Médicaments', 'Catégories', 'Mouvements Stock', 'Inventaire physique', 'Rapport de stock', 'Dépenses', 'Personnel', 'Rapports', 'Paramètres'],
  visibleFormFields: ['name', 'sku', 'category', 'description', 'purchase_price', 'selling_price', 'stock_quantity', 'low_stock_threshold', 'expiry_date']
};
