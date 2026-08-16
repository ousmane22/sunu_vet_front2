/** Libellé affiché pour un dossier sans nom enregistré. */
export function animalDisplayName(animal: {
  name?: string | null;
  species_name?: string | null;
  id?: number;
}): string {
  const trimmed = animal.name?.trim();
  if (trimmed) return trimmed;
  if (animal.species_name) return `${animal.species_name} (sans nom)`;
  if (animal.id) return `Dossier #${animal.id}`;
  return 'Sans nom';
}
