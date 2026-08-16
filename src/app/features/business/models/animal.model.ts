import type { Consultation } from './consultation.model';
import type { Vaccination } from './vaccination.model';
import type { Hospitalization } from './hospitalization.model';

export type AnimalGender =
  | 'male'
  | 'female'
  | 'unknown'
  | 'neutered_male'
  | 'spayed_female';

export type AnimalStatus = 'active' | 'deceased' | 'transferred';

export interface Animal {
  id: number;
  client_id?: number | null;
  animal_species_id: number;
  breed_id?: number | null;
  name: string | null;
  gender: AnimalGender;
  date_of_birth?: string | null;
  age_notes?: string | null;
  weight_kg?: number | null;
  microchip?: string | null;
  tattoo?: string | null;
  photo_url?: string | null;
  status: AnimalStatus;
  species_name?: string | null;
  breed_name?: string | null;
  client_name?: string | null;
  created_at?: string;
}

export interface AnimalDetail extends Animal {
  medical_history?: string | null;
  allergies?: string | null;
  deceased_at?: string | null;
  notes?: string | null;
  client?: { id: number; name: string; phone?: string | null } | null;
  animal_species?: { id: number; name: string } | null;
  breed?: { id: number; name: string } | null;
  consultations?: Consultation[];
  vaccinations?: Vaccination[];
  hospitalizations?: Hospitalization[];
}

export interface AnimalListResponse {
  data: Animal[];
}

export interface AnimalSingleResponse {
  data: AnimalDetail;
  message?: string;
}
