export type ConsultationAiField =
  | 'reason_visit'
  | 'businessal_exam'
  | 'diagnosis'
  | 'treatment_notes';

export interface ConsultationAiContext {
  animal_species?: string;
  reason_visit?: string;
  businessal_exam?: string;
  diagnosis?: string;
  treatment_notes?: string;
  notes?: string;
}
