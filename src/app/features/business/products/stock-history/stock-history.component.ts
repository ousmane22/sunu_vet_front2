import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { StockMovement } from '../../models';

@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-history.component.html',
})
export class StockHistoryComponent implements OnChanges {
  @Input({ required: true }) productId!: number;

  private productService = inject(ProductService);
  
  movements = signal<StockMovement[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId) {
      this.loadHistory();
    }
  }

  loadHistory(page: number = 1) {
    this.isLoading.set(true);
    this.productService.getStockHistory(this.productId, page).subscribe({
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
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.loadHistory(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.loadHistory(this.currentPage() - 1);
    }
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




