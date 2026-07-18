export interface StockMovement {
  id: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  stock_before: number;
  stock_after: number;
  user?: string;
  product?: string;
  created_at: string;
}

/** Type de galénique (référentiel API /business/product-types). */
export interface ProductType {
  id: number;
  slug: string;
  label: string;
  sort_order: number;
}

export interface ProductTypesListResponse {
  data: ProductType[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  products_count?: number;
}

export interface CategoryListResponse {
  data: Category[];
}

export interface CategorySingleResponse {
  data: Category;
}

export interface StockMovementListResponse {
  data: StockMovement[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface AdjustStockPayload {
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reason?: string;
}

export interface Product {
  id: number;
  name: string;
  dci?: string;
  sku?: string;
  barcode?: string;
  type: string;
  type_label?: string;
  product_type_id?: number | null;
  category_id?: number;
  category?: string | Category;
  target_species?: string[];
  description?: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  unit?: string;
  allow_fractional_quantity?: boolean;
  low_stock_threshold: number;
  is_low_stock?: boolean;
  expiry_date?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Payload minimal de GET /business/products/pos
 * (grille + panier — aligné sur ProductPosResource).
 */
export interface PosProduct {
  id: number;
  name: string;
  type: string;
  category?: string | null;
  selling_price: number;
  stock_quantity: number;
  unit: string;
  allow_fractional_quantity: boolean;
}

export interface PosProductListResponse {
  data: PosProduct[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface PosProductFilters {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface ProductStats {
  total_references: number;
  low_stock_count: number;
  expired_count: number;
  total_stock_value: number;
}

export interface ProductStatsResponse {
  data: ProductStats;
}

export interface ProductListResponse {
  data: Product[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface ProductSingleResponse {
  data: Product;
  message?: string;
}

export interface CreateProductPayload {
  name: string;
  sku?: string;
  type: string;
  category_id?: number | null;
  category?: string;
  description?: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  unit?: string;
  allow_fractional_quantity?: boolean;
  low_stock_threshold?: number;
  expiry_date?: string;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface ProductFilters {
  search?: string;
  low_stock?: boolean;
  /** expired = déjà périmés, expiring_soon = expire sous N jours */
  expiry_filter?: 'expired' | 'expiring_soon';
  expiry_days?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

/** Référence médicament du catalogue (super-admin) */
export interface MedicationReference {
  id: number;
  name: string;
  generic_name?: string;
  manufacturer?: string;
  form: string;
  form_label: string;
  strength?: string;
  description?: string;
  dosage_guidelines?: string;
  is_active: boolean;
}

export interface MedicationReferenceListResponse {
  data: MedicationReference[];
  meta: { current_page: number; last_page: number; total: number };
}

export interface CreateProductFromReferencePayload {
  medication_reference_id: number;
  sku?: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold?: number;
  expiry_date?: string;
}

export interface CreateFromCatalogueBulkResponse {
  message: string;
  data: Product[];
  count: number;
}




