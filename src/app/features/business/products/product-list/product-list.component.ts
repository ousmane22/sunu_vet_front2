import { Component, inject, signal, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../../auth/services/auth.service';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';
import { FormatPricePipe } from '../../../../core/pipes';
import type { Product, ProductStats } from '../../models';
import { ProductFormComponent, type ProductFormResult } from '../product-form/product-form.component';
import { StockAdjustmentModalComponent } from '../stock-adjustment-modal/stock-adjustment-modal.component';
import { AddFromCatalogueModalComponent } from '../add-from-catalogue-modal/add-from-catalogue-modal.component';
import { SunuDialogService } from '../../../../shared/services/sunu-dialog.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormatPricePipe, ProductFormComponent, StockAdjustmentModalComponent, AddFromCatalogueModalComponent],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  private service = inject(ProductService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  strategyService = inject(BusinessStrategyService);
  private dialog = inject(SunuDialogService);

  can(perm: string): boolean {
    return this.authService.hasPermission(perm);
  }

  getCategoryName(product: Product): string {
    if (!product.category) return '—';
    if (typeof product.category === 'object') {
      return (product.category as any).name || '—';
    }
    return product.category;
  }

  products = signal<Product[]>([]);
  stats = signal<ProductStats | null>(null);
  isLoading = signal(true);
  currentPage = signal(1);
  lastPage = signal(1);
  total = signal(0);
  
  // États pour les modals
  showModal = signal(false);
  showAdjustmentModal = signal(false);
  showHistoryModal = signal(false);
  selectedProduct = signal<Product | undefined>(undefined);

  catalogueModal = viewChild(AddFromCatalogueModalComponent);
  searchControl = this.fb.control('');
  lowStockFilter = signal(false);
  /** expired | expiring_soon | '' = aucun filtre */
  expiryFilter = signal<'expired' | 'expiring_soon' | ''>('');

  ngOnInit(): void {
    this.loadStats();
    this.loadProducts();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadProducts();
      });
  }

  loadStats(): void {
    this.service.getStats().subscribe({
      next: (res) => this.stats.set(res.data),
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    const expiry = this.expiryFilter();
    this.service
      .getAll({
        page: this.currentPage(),
        search: this.searchControl.value ?? '',
        low_stock: this.lowStockFilter(),
        expiry_filter: expiry || undefined,
        expiry_days: 30,
        sort_by: 'created_at',
        sort_order: 'desc',
      })
      .subscribe({
        next: (res) => {
          const list = Array.isArray(res?.data) ? res.data : [];
          this.products.set(list);
          const m = res?.meta;
          if (m) {
            this.lastPage.set(m.last_page);
            this.total.set(m.total);
          } else {
            this.lastPage.set(1);
            this.total.set(list.length);
          }
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  toggleLowStock(): void {
    this.lowStockFilter.update((v) => !v);
    this.currentPage.set(1);
    this.loadProducts();
  }

  setExpiryFilter(value: 'expired' | 'expiring_soon' | ''): void {
    this.expiryFilter.set(value);
    this.currentPage.set(1);
    this.loadProducts();
  }

  /** Statut expiration pour affichage alerte : expired | expiring_soon | null */
  getExpiryStatus(expiryDate?: string): 'expired' | 'expiring_soon' | null {
    if (!expiryDate) return null;
    const d = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() <= today.getTime()) return 'expired';
    const in30 = new Date(today);
    in30.setDate(in30.getDate() + 30);
    if (d.getTime() <= in30.getTime()) return 'expiring_soon';
    return null;
  }

  formatExpiryDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.lastPage()) {
      this.currentPage.set(page);
      this.loadProducts();
    }
  }

  openCreateModal(): void {
    this.selectedProduct.set(undefined);
    this.showModal.set(true);
  }

  openCatalogueModal(): void {
    const modal = this.catalogueModal();
    if (modal) {
      modal.open((refresh) => {
        if (refresh) {
          this.loadProducts();
          this.loadStats();
        }
      });
    }
  }

  openEditModal(product: Product): void {
    this.selectedProduct.set(product);
    this.showModal.set(true);
  }

  closeModal(result: ProductFormResult): void {
    this.showModal.set(false);

    if (!result) {
      // Annulation — rien à faire
      this.selectedProduct.set(undefined);
      return;
    }

    const isEdit = !!this.selectedProduct();
    this.selectedProduct.set(undefined);

    if (isEdit) {
      // Mise à jour en place, zéro appel réseau
      this.products.update((list) =>
        list.map((p) => (p.id === result.id ? result : p))
      );
    } else {
      if (this.currentPage() === 1) {
        this.products.update((list) => [result, ...list]);
        this.total.update((t) => t + 1);
      } else {
        this.currentPage.set(1);
        this.loadProducts();
      }
    }

    // Stats (valeur en stock, etc.) doivent être recalculées côté serveur
    this.loadStats();
  }

  openAdjustmentModal(product: Product): void {
    this.selectedProduct.set(product);
    this.showAdjustmentModal.set(true);
  }

  closeAdjustmentModal(): void {
    this.showAdjustmentModal.set(false);
    this.selectedProduct.set(undefined);
  }

  onAdjustmentSaved(): void {
    this.loadProducts();
    this.loadStats();
  }

  openHistoryModal(product: Product): void {
    this.selectedProduct.set(product);
    this.showHistoryModal.set(true);
  }

  closeHistoryModal(): void {
    this.showHistoryModal.set(false);
    this.selectedProduct.set(undefined);
  }

  async deleteProduct(product: Product): Promise<void> {
    const confirmed = await this.dialog.confirm(`Supprimer « ${product.name} » ?`, {
      title: 'Supprimer le produit',
      destructive: true,
      confirmText: 'Supprimer',
    });
    if (!confirmed) return;

    this.service.delete(product.id).subscribe({
      next: () => {
        this.loadProducts();
        this.loadStats();
      },
      error: async () => {
        await this.dialog.alert('Erreur lors de la suppression.', { type: 'danger', title: 'Erreur' });
      },
    });
  }

  toggleStatus(product: Product): void {
    this.service.toggleStatus(product.id).subscribe({
      next: (res) => {
        this.products.update((list) =>
          list.map((m) => (m.id === product.id ? res.data : m))
        );
      },
    });
  }
}




