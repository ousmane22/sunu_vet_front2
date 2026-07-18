import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PAGINATION } from '../../../core/config/pagination.config';
import type {
  ProductListResponse,
  ProductSingleResponse,
  ProductStatsResponse,
  StockMovement,
  StockMovementListResponse,
  AdjustStockPayload,
  CreateProductPayload,
  UpdateProductPayload,
  ProductFilters,
  PosProductFilters,
  PosProductListResponse,
  MedicationReferenceListResponse,
  CreateProductFromReferencePayload,
  CreateFromCatalogueBulkResponse,
  ProductTypesListResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/business/products`;

  /**
   * Cache pour le dropdown "tous les produits" (mouvements de stock, rapport de stock…).
   * Chargement unique par session, invalidé après toute mutation de produit.
   */
  private allForDropdown$: Observable<ProductListResponse> | null = null;

  /** Référentiel types de galénique (formulaire produit, etc.). */
  private productTypes$: Observable<ProductTypesListResponse> | null = null;

  /**
   * Charge tous les produits actifs pour un dropdown/combobox.
   * Utilise shareReplay(1) : un seul appel HTTP même si plusieurs composants s'y abonnent.
   */
  getAllForDropdown(): Observable<ProductListResponse> {
    if (!this.allForDropdown$) {
      this.allForDropdown$ = this.http
        .get<ProductListResponse>(this.baseUrl, {
          params: { per_page: PAGINATION.DROPDOWN },
        })
        .pipe(
          tap({ error: () => { this.allForDropdown$ = null; } }),
          shareReplay(1)
        );
    }
    return this.allForDropdown$;
  }

  invalidateDropdownCache(): void {
    this.allForDropdown$ = null;
  }

  /** Types actifs pour listes déroulantes (shareReplay par session). */
  getProductTypes(): Observable<ProductTypesListResponse> {
    if (!this.productTypes$) {
      this.productTypes$ = this.http
        .get<ProductTypesListResponse>(`${environment.apiUrl}/business/product-types`)
        .pipe(
          tap({ error: () => { this.productTypes$ = null; } }),
          shareReplay(1)
        );
    }
    return this.productTypes$;
  }

  getStats(): Observable<ProductStatsResponse> {
    return this.http.get<ProductStatsResponse>(`${this.baseUrl}/stats`);
  }

  getAll(filters: ProductFilters = {}): Observable<ProductListResponse> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.low_stock) params = params.set('low_stock', '1');
    if (filters.expiry_filter) params = params.set('expiry_filter', filters.expiry_filter);
    if (filters.expiry_days) params = params.set('expiry_days', String(filters.expiry_days));
    if (filters.sort_by) params = params.set('sort_by', filters.sort_by);
    if (filters.sort_order) params = params.set('sort_order', filters.sort_order);
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.per_page) params = params.set('per_page', String(filters.per_page));

    return this.http.get<ProductListResponse>(this.baseUrl, { params });
  }

  /** Catalogue POS : ProductPosResource (champs minimaux, actifs uniquement). */
  getForPos(filters: PosProductFilters = {}): Observable<PosProductListResponse> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.per_page) params = params.set('per_page', String(filters.per_page));

    return this.http.get<PosProductListResponse>(`${this.baseUrl}/pos`, { params });
  }

  getById(id: number): Observable<ProductSingleResponse> {
    return this.http.get<ProductSingleResponse>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateProductPayload): Observable<ProductSingleResponse> {
    return this.http.post<ProductSingleResponse>(this.baseUrl, payload).pipe(
      tap({ next: () => this.invalidateDropdownCache() })
    );
  }

  /** Catalogue des références médicaments (pour ajout en entreprise) */
  getMedicationReferences(params: {
    search?: string;
    form?: string;
    page?: number;
    per_page?: number;
  } = {}): Observable<MedicationReferenceListResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.form) httpParams = httpParams.set('form', params.form);
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
    return this.http.get<MedicationReferenceListResponse>(
      `${environment.apiUrl}/business/medication-references`,
      { params: httpParams }
    );
  }

  /** Créer un médicament à partir d'une référence du catalogue */
  createFromReference(
    payload: CreateProductFromReferencePayload
  ): Observable<ProductSingleResponse> {
    return this.http.post<ProductSingleResponse>(
      `${environment.apiUrl}/business/products/from-reference`,
      payload
    );
  }

  /** IDs des références déjà présentes dans la entreprise (pour affichage catalogue). */
  getMedicationReferenceIds(): Observable<{ data: number[] }> {
    return this.http.get<{ data: number[] }>(`${this.baseUrl}/reference-ids`);
  }

  /** Ajouter plusieurs médicaments depuis le catalogue (prix/stock à 0, à compléter en édition) */
  createFromCatalogueBulk(referenceIds: number[]): Observable<CreateFromCatalogueBulkResponse> {
    return this.http.post<CreateFromCatalogueBulkResponse>(
      `${environment.apiUrl}/business/products/from-catalogue`,
      { reference_ids: referenceIds }
    );
  }

  update(id: number, payload: UpdateProductPayload): Observable<ProductSingleResponse> {
    return this.http.put<ProductSingleResponse>(`${this.baseUrl}/${id}`, payload).pipe(
      tap({ next: () => this.invalidateDropdownCache() })
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`).pipe(
      tap({ next: () => this.invalidateDropdownCache() })
    );
  }

  toggleStatus(id: number): Observable<ProductSingleResponse> {
    return this.http.patch<ProductSingleResponse>(`${this.baseUrl}/${id}/toggle-status`, {}).pipe(
      tap({ next: () => this.invalidateDropdownCache() })
    );
  }

  adjustStock(id: number, payload: AdjustStockPayload): Observable<ProductSingleResponse> {
    return this.http.post<ProductSingleResponse>(`${this.baseUrl}/${id}/stock`, payload).pipe(
      tap({ next: () => this.invalidateDropdownCache() })
    );
  }

  getStockHistory(id: number, page: number = 1): Observable<StockMovementListResponse> {
    return this.http.get<StockMovementListResponse>(`${this.baseUrl}/${id}/stock-movements`, {
      params: { page },
    });
  }

  /** Filtres optionnels : date_from, date_to (YYYY-MM-DD), product_id, type (IN | OUT | ADJUSTMENT), page, per_page */
  getGlobalStockHistory(params: {
    page?: number;
    per_page?: number;
    date_from?: string;
    date_to?: string;
    product_id?: number;
    type?: 'IN' | 'OUT' | 'ADJUSTMENT';
  } = {}): Observable<StockMovementListResponse> {
    let httpParams = new HttpParams();
    if (params.page != null) httpParams = httpParams.set('page', String(params.page));
    if (params.per_page != null) httpParams = httpParams.set('per_page', String(params.per_page));
    if (params.date_from) httpParams = httpParams.set('date_from', params.date_from);
    if (params.date_to) httpParams = httpParams.set('date_to', params.date_to);
    if (params.product_id != null) httpParams = httpParams.set('product_id', String(params.product_id));
    if (params.type) httpParams = httpParams.set('type', params.type);
    return this.http.get<StockMovementListResponse>(`${environment.apiUrl}/business/stock-movements`, {
      params: httpParams,
    });
  }
}




