export interface VaccineType {
  id: number;
  name: string;
}

export interface Vaccination {
  id: number;
  animal_id: number;
  client_id?: number | null;
  vaccine_type_id?: number | null;
  vaccine_type_name?: string | null;
  vaccine_name?: string | null;
  administered_at: string;
  next_due_at?: string | null;
  is_overdue: boolean;
  is_due_soon: boolean;
  notes?: string | null;
  /** Billing / Financial */
  total_amount: number;
  discount_type?: string | null;
  discount_value: number;
  discount_amount: number;
  net_amount: number;
  amount_paid: number;
  amount_due: number;
  payment_method: string;
  status: string;
  payments?: Array<{ id: number; amount: number; payment_method: string; paid_at: string }>;
  user?: { id: number; name: string };
  animal?: { id: number; name: string | null; species_name?: string | null; client_name?: string | null };
  created_at?: string;
}

export interface VaccineTypeListResponse {
  data: VaccineType[];
}

export interface VaccinationListResponse {
  data: Vaccination[];
}

export interface VaccinationSingleResponse {
  data: Vaccination;
  message?: string;
}
