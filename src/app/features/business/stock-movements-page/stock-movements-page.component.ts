import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { PAGINATION } from '../../../core/config/pagination.config';
import type { StockMovement, Product } from '../models';

const TYPE_OPTIONS: { value: '' | 'IN' | 'OUT' | 'ADJUSTMENT'; label: string }[] = [
  { value: '', label: 'Tous les types' },
  { value: 'IN', label: 'Entrée' },
  { value: 'OUT', label: 'Sortie' },
  { value: 'ADJUSTMENT', label: 'Ajustement' },
];

function getWeekRange(): { from: string; to: string } {
  const d = new Date();
  const day = d.getDay();
  const toMonday = day === 0 ? 6 : day - 1;
  const from = new Date(d);
  from.setDate(d.getDate() - toMonday);
  const to = new Date(from);
  to.setDate(from.getDate() + 6);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

import { BusinessStrategyService } from '../../../core/services/business-strategy.service';

@Component({
  selector: 'app-stock-movements-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-movements-page.component.html',
})
export class StockMovementsPageComponent implements OnInit {
  private productService = inject(ProductService);
  strategyService = inject(BusinessStrategyService);

  movements = signal<StockMovement[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  products = signal<Product[]>([]);
  productSearchQuery = signal('');
  productDropdownOpen = signal(false);

  private _week = getWeekRange();
  dateFrom = signal(this._week.from);
  dateTo = signal(this._week.to);
  productId = signal<number | null>(null);
  typeFilter = signal<'' | 'IN' | 'OUT' | 'ADJUSTMENT'>('');

  filteredProducts = computed(() => {
    const list = this.products();
    const q = (this.productSearchQuery() || '').trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q)
    );
  });

  selectedProductLabel = computed(() => {
    const id = this.productId();
    if (id == null) return '';
    const p = this.products().find((x) => x.id === id);
    return p ? (p.sku ? `${p.name} (${p.sku})` : p.name) : '';
  });

  readonly typeOptions = TYPE_OPTIONS;

  ngOnInit() {
    this.loadProducts();
    this.loadHistory();
  }

  loadProducts() {
    this.productService.getAllForDropdown().subscribe({
      next: (res) => this.products.set(res.data),
    });
  }

  loadHistory(page: number = 1) {
    this.isLoading.set(true);
    const params = {
      page,
      per_page: PAGINATION.DEFAULT,
      date_from: this.dateFrom() || undefined,
      date_to: this.dateTo() || undefined,
      product_id: this.productId() ?? undefined,
      type: this.typeFilter() || undefined,
    };
    this.productService.getGlobalStockHistory(params).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        this.movements.set(list);
        const m = res?.meta;
        if (m) {
          this.currentPage.set(m.current_page);
          this.totalPages.set(m.last_page);
          this.totalItems.set(m.total);
        } else {
          this.currentPage.set(page);
          this.totalPages.set(1);
          this.totalItems.set(list.length);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadHistory(1);
  }

  /** Réinitialise tous les filtres (semaine courante, tous médicaments, tous types) et recharge. */
  resetFilters() {
    const week = getWeekRange();
    this.dateFrom.set(week.from);
    this.dateTo.set(week.to);
    this.productId.set(null);
    this.productSearchQuery.set('');
    this.productDropdownOpen.set(false);
    this.typeFilter.set('');
    this.currentPage.set(1);
    this.loadHistory(1);
  }

  openProductDropdown(): void {
    this.productSearchQuery.set('');
    this.productDropdownOpen.set(true);
  }

  closeProductDropdown(): void {
    this.productDropdownOpen.set(false);
  }

  selectProduct(p: Product | null): void {
    this.productId.set(p?.id ?? null);
    this.productSearchQuery.set('');
    this.productDropdownOpen.set(false);
    this.currentPage.set(1);
    this.loadHistory(1);
  }

  onProductComboboxBlur(): void {
    setTimeout(() => this.closeProductDropdown(), 150);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.loadHistory(this.currentPage() + 1);
  }

  prevPage() {
    if (this.currentPage() > 1) this.loadHistory(this.currentPage() - 1);
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'IN': return 'Entrée';
      case 'OUT': return 'Sortie';
      case 'ADJUSTMENT': return 'Ajustement';
      default: return type;
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'IN': return 'bg-green-100 text-green-800';
      case 'OUT': return 'bg-red-100 text-red-800';
      case 'ADJUSTMENT': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}




