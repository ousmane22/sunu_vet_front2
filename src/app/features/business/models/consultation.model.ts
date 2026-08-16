export interface ConsultationClient {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  balance_due: number;
}

export interface ConsultationAnimal {
  id: number;
  name: string | null;
  species_name?: string | null;
  breed_name?: string | null;
}

export interface ConsultationPayment {
  id: number;
  amount: number;
  payment_method: string;
  paid_at: string;
  user?: { id: number; name: string };
}

export interface Consultation {
  id: number;
  status: 'completed' | 'partial' | 'pending' | 'cancelled';
  payment_method: string;
  created_at: string;
  client?: ConsultationClient | null;
  animal_id?: number | null;
  animal?: ConsultationAnimal | null;
  total_amount: number;
  discount_amount?: number;
  net_amount: number;
  amount_paid: number;
  amount_due: number;
  user?: { id: number; name: string };
  animal_species?: string | null;
  animal_name?: string | null;
  animal_weight_kg?: number | null;
  temperature_c?: number | null;
  general_condition?: string | null;
  reason_visit?: string | null;
  clinical_exam?: string | null;
  diagnosis?: string | null;
  treatment_notes?: string | null;
  next_visit_at?: string | null;
  /** Présent en détail (getOne) */
  payments?: ConsultationPayment[];
}

export interface ConsultationListResponse {
  data: Consultation[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  summary?: {
    total_amount: number;
    total_collected?: number;
    count: number;
  };
}
