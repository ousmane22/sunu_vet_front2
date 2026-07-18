import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { PAGINATION } from '../../../../core/config/pagination.config';
import type {
  MedicationReference,
  MedicationReferenceListResponse,
} from '../../models';

@Component({
  selector: 'app-add-from-catalogue-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-from-catalogue-modal.component.html',
})
export class AddFromCatalogueModalComponent {
  private service = inject(ProductService);
  private fb = inject(FormBuilder);

  isOpen = signal(false);
  references = signal<MedicationReference[]>([]);
  cataloguePage = signal(1);
  catalogueLastPage = signal(1);
  catalogueTotal = signal(0);
  catalogueLoading = signal(false);
  selectedIds = signal<Set<number>>(new Set());
  /** Références déjà en entreprise (affichées cochées et désactivées). */
  alreadyInBusinessIds = signal<Set<number>>(new Set());
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  searchControl = this.fb.control('');
  close = signal<((refresh?: boolean) => void) | null>(null);

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.cataloguePage.set(1);
        this.loadCatalogue();
      });
  }

  open(onClose: (refresh?: boolean) => void): void {
    this.close.set(onClose);
    this.isOpen.set(true);
    this.selectedIds.set(new Set());
    this.errorMessage.set(null);
    this.service.getMedicationReferenceIds().subscribe({
      next: (res) => {
        this.alreadyInBusinessIds.set(new Set(res.data ?? []));
        this.loadCatalogue();
      },
      error: () => this.loadCatalogue(),
    });
  }

  loadCatalogue(): void {
    this.catalogueLoading.set(true);
    this.service
      .getMedicationReferences({
        search: this.searchControl.value || undefined,
        page: this.cataloguePage(),
        per_page: PAGINATION.CATALOGUE,
      })
      .subscribe({
        next: (res: MedicationReferenceListResponse) => {
          const list = Array.isArray(res?.data) ? res.data : [];
          this.references.set(list);
          const m = res?.meta;
          if (m) {
            this.catalogueLastPage.set(m.last_page);
            this.catalogueTotal.set(m.total);
          } else {
            this.catalogueLastPage.set(1);
            this.catalogueTotal.set(list.length);
          }
          this.catalogueLoading.set(false);
        },
        error: () => this.catalogueLoading.set(false),
      });
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  isAlreadyInBusiness(id: number): boolean {
    return this.alreadyInBusinessIds().has(id);
  }

  isChecked(ref: MedicationReference): boolean {
    return this.alreadyInBusinessIds().has(ref.id) || this.selectedIds().has(ref.id);
  }

  toggleRef(ref: MedicationReference): void {
    if (this.alreadyInBusinessIds().has(ref.id)) return;
    const set = new Set(this.selectedIds());
    if (set.has(ref.id)) {
      set.delete(ref.id);
    } else {
      set.add(ref.id);
    }
    this.selectedIds.set(set);
  }

  selectAll(): void {
    const already = this.alreadyInBusinessIds();
    const ids = new Set(
      this.references().filter((r) => !already.has(r.id)).map((r) => r.id)
    );
    this.selectedIds.set(ids);
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  selectedCount(): number {
    return this.selectedIds().size;
  }

  cataloguePrev(): void {
    if (this.cataloguePage() > 1) {
      this.cataloguePage.update((p) => p - 1);
      this.loadCatalogue();
    }
  }

  catalogueNext(): void {
    if (this.cataloguePage() < this.catalogueLastPage()) {
      this.cataloguePage.update((p) => p + 1);
      this.loadCatalogue();
    }
  }

  saveSelected(): void {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0 || this.isSaving()) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.service.createFromCatalogueBulk(ids).subscribe({
      next: () => {
        this.isSaving.set(false);
        const cb = this.close();
        this.isOpen.set(false);
        cb?.(true);
      },
      error: (err: { error?: { message?: string; errors?: Record<string, string[]> } }) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          err.error?.message ??
            (err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : 'Erreur lors de l\'enregistrement.')
        );
      },
    });
  }

  onCancel(): void {
    const cb = this.close();
    this.isOpen.set(false);
    cb?.(false);
  }
}




