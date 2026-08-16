import type { ConsultationClient, ConsultationPayment } from './consultation.model';

export interface HospitalizationNote {
  id: number;
  note: string;
  condition?: string | null;
  user?: { id: number; name: string };
  created_at: string;
}

export interface Hospitalization {
  id: number;
  animal_id: number;
  status: 'active' | 'discharged' | 'cancelled';
  location?: string | null;
  reason?: string | null;
  admitted_at: string;
  discharged_at?: string | null;
  discharge_summary?: string | null;
  total_amount: number;
  net_amount: number;
  amount_paid: number;
  amount_due: number;
  payment_method: string;
  client?: ConsultationClient | null;
  user?: { id: number; name: string };
  notes?: HospitalizationNote[];
  payments?: ConsultationPayment[];
}

export interface HospitalizationListResponse {
  data: Hospitalization[];
}

export interface HospitalizationSingleResponse {
  data: Hospitalization;
  message?: string;
}
