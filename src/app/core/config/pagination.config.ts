/**
 * Constantes de pagination centralisées pour tout le frontend.
 *
 * Règle : toujours importer PAGINATION depuis ce fichier.
 * Ne jamais écrire de nombre magique per_page directement dans un composant.
 */
export const PAGINATION = {
  /** Valeur par défaut pour toutes les listes tabulaires (ventes, dépenses, etc.) */
  DEFAULT: 15,

  /** Grille POS : affichage dense de médicaments, UX critique. */
  POS: 100,

  /**
   * Dropdown "tous les produits" : chargement unique + shareReplay.
   * Le service cache le résultat ; cette valeur définit le max renvoyé.
   */
  DROPDOWN: 200,

  /** Catalogue médicaments (modal d'ajout depuis référentiel) */
  CATALOGUE: 15,
} as const;
