export interface Breed {
  id: number;
  animal_species_id: number;
  name: string;
  is_active: boolean;
}

export interface BreedListResponse {
  data: Breed[];
}
