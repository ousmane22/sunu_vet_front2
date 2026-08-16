export type ConsultationAiField =
  | 'reason_visit'
  | 'clinical_exam'
  | 'diagnosis'
  | 'treatment_notes';

export interface ConsultationAiContext {
  animal_species?: string;
  reason_visit?: string;
  clinical_exam?: string;
  diagnosis?: string;
  treatment_notes?: string;
  notes?: string;
}
