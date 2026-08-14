export type InventorySessionStatus = 'in_progress' | 'completed' | 'cancelled';

export interface InventoryLineProduct {
  id: number;
  name: string;
  sku: string | null;
  stock_quantity: number;
  unit?: string;
}

export interface InventoryLine {
  id: number;
  inventory_session_id: number;
  product_id: number;
  product?: InventoryLineProduct;
  quantity_system: number;
  quantity_counted: number | null;
  quantity_difference: number | null;
}

export interface InventorySessionUser {
  id: number;
  name: string;
}

export interface InventorySession {
  id: number;
  business_id: number;
  user_id: number;
  user?: InventorySessionUser;
  validated_by?: number | null;
  validator?: InventorySessionUser;
  status: InventorySessionStatus;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  lines_count?: number;
  lines?: InventoryLine[];
  created_at: string;
  updated_at: string;
}

export interface InventoryListResponse {
  data: InventorySession[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_in_progress?: boolean;
    in_progress_session_id?: number | null;
  };
}

export interface InventoryLineUpdatePayload {
  product_id: number;
  quantity_counted: number | null;
}
