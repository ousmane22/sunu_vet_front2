import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPricePipe } from '../../../core/pipes';
import { ReportService } from '../services/report.service';
import { ProductService } from '../services/product.service';
import { PAGINATION } from '../../../core/config/pagination.config';
import type { StockAnalyticalReport, StockAnalyticalLine } from '../models/report.model';
import type { Product } from '../models';
import { formatPrice } from '../../../core/utils/format.util';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type PeriodKey = 'day' | 'week' | 'month' | 'year';

function startOfDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function periodRange(period: PeriodKey): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  switch (period) {
    case 'day':
      return { start: startOfDay(start), end: startOfDay(end) };
    case 'week':
      const day = start.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + diff);
      end.setDate(start.getDate() + 6);
      break;
    case 'month':
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      break;
    case 'year':
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      break;
  }
  return { start: startOfDay(start), end: startOfDay(end) };
}

@Component({
  selector: 'app-stock-report-page',
  standalone: true,
  imports: [CommonModule, FormatPricePipe],
  templateUrl: './stock-report-page.component.html',
})
export class StockReportPageComponent implements OnInit {
  private reportService = inject(ReportService);
  private productService = inject(ProductService);

  period = signal<PeriodKey | null>(null);
  startDate = signal('');
  endDate = signal('');
  productId = signal<number | null>(null);

  products = signal<Product[]>([]);
  productSearchQuery = signal('');
  productDropdownOpen = signal(false);
  report = signal<StockAnalyticalReport | null>(null);
  currentPage = signal(1);
  lastPage = signal(1);
  total = signal(0);
  isLoading = signal(false);
  error = signal<string | null>(null);

  selectedProductLabel = computed(() => {
    const id = this.productId();
    if (id == null) return '';
    const p = this.products().find((x) => x.id === id);
    return p ? (p.sku ? `${p.name} (${p.sku})` : p.name) : '';
  });

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

  periodLabel = computed(() => {
    const p = this.period();
    if (!p) return '';
    const labels: Record<PeriodKey, string> = {
      day: 'Jour',
      week: 'Semaine',
      month: 'Mois',
      year: 'Année',
    };
    return labels[p];
  });

  totalQuantityStock = computed(() => this.report()?.totals?.quantity_stock ?? 0);

  totalValeurStock = computed(() => this.report()?.totals?.valeur_stock ?? 0);

  ngOnInit(): void {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    this.startDate.set(startOfDay(start));
    this.endDate.set(startOfDay(now));
    this.period.set(null);
    this.loadProducts();
    this.load();
  }

  loadProducts(): void {
    this.productService.getAllForDropdown().subscribe({
      next: (res) => this.products.set(res.data.filter((p) => p.is_active)),
      error: () => this.products.set([]),
    });
  }

  setPeriod(p: PeriodKey): void {
    this.period.set(p);
    const { start, end } = periodRange(p);
    this.startDate.set(start);
    this.endDate.set(end);
    this.load(1);
  }

  applyCustomDates(): void {
    const start = this.startDate();
    const end = this.endDate();
    this.period.set(null);
    if (start && end) this.load(1);
  }

  onProductChange(): void {
    this.load(1);
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
    this.load(1);
  }

  onProductComboboxBlur(): void {
    setTimeout(() => this.closeProductDropdown(), 150);
  }

  load(page: number = this.currentPage()): void {
    const start = this.startDate();
    const end = this.endDate();
    if (!start || !end) {
      this.error.set('Choisissez une date de début et une date de fin.');
      return;
    }
    if (new Date(start) > new Date(end)) {
      this.error.set('La date de début doit être avant la date de fin.');
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    const params: {
      start_date: string;
      end_date: string;
      product_id?: number;
      page: number;
      per_page: number;
    } = {
      start_date: start,
      end_date: end,
      page,
      per_page: PAGINATION.DEFAULT,
    };
    const pid = this.productId();
    if (pid != null && pid > 0) params.product_id = pid;
    this.reportService.getStockAnalytical(params).subscribe({
      next: (res) => {
        this.report.set(res.data);
        this.currentPage.set(res.meta.current_page);
        this.lastPage.set(res.meta.last_page);
        this.total.set(res.meta.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors du chargement.');
        this.isLoading.set(false);
      },
    });
  }

  private buildReportParams(options?: { page?: number; perPage?: number; all?: boolean }) {
    const params: {
      start_date: string;
      end_date: string;
      product_id?: number;
      page?: number;
      per_page?: number;
      all?: boolean;
    } = {
      start_date: this.startDate(),
      end_date: this.endDate(),
    };
    const pid = this.productId();
    if (pid != null && pid > 0) params.product_id = pid;
    if (options?.all) {
      params.all = true;
      return params;
    }
    params.page = options?.page ?? 1;
    params.per_page = options?.perPage ?? PAGINATION.DEFAULT;
    return params;
  }

  trackByProductId(_: number, line: StockAnalyticalLine): number {
    return line.product_id;
  }

  exportPdf(): void {
    this.reportService.getStockAnalytical({ ...this.buildReportParams({ all: true }) }).subscribe((res) => {
      const r = res.data;
      if (!r?.lines?.length) return;
      this.generatePdf(r, r.totals?.quantity_stock ?? 0, r.totals?.valeur_stock ?? 0);
    });
  }

  exportExcel(): void {
    this.reportService.getStockAnalytical({ ...this.buildReportParams({ all: true }) }).subscribe((res) => {
      const r = res.data;
      if (!r?.lines?.length) return;
      this.generateExcel(r, r.totals?.quantity_stock ?? 0, r.totals?.valeur_stock ?? 0);
    });
  }

  private generatePdf(
    r: StockAnalyticalReport,
    totalQty: number,
    totalVal: number
  ): void {
    const pdfPrice = (v: number) => formatPrice(v).replace(/\u202f/g, ' ');
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Inventaire analytique', 14, 16);
    doc.setFontSize(10);
    doc.text(`Période : ${r.period.start.slice(0, 10)} → ${r.period.end.slice(0, 10)}`, 14, 24);
    const head = [['Produit', 'On avait', 'Acheté', 'Vendu', 'Il reste', 'Prix achat', 'Valeur stock']];
    const body = r.lines.map((l) => [
      (l.product_name || '').slice(0, 30),
      String(l.stock_debut),
      String(l.entrees),
      String(l.ventes),
      String(l.stock_restant),
      pdfPrice(l.prix_achat),
      pdfPrice(l.valeur_stock),
    ]);
    autoTable(doc, {
      startY: 30,
      head,
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] },
    });
    let y = (doc as any).lastAutoTable?.finalY ?? 30;
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Totaux', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Quantité totale en stock : ${totalQty}`, 14, y);
    y += 6;
    doc.text(`Valeur totale du stock : ${pdfPrice(totalVal)}`, 14, y);
    doc.save(`inventaire_analytique_${r.period.start.slice(0, 10)}_${r.period.end.slice(0, 10)}.pdf`);
  }

  private generateExcel(
    r: StockAnalyticalReport,
    totalQty: number,
    totalVal: number
  ): void {
    const rows: (string | number)[][] = [
      ['Produit', 'On avait', 'Acheté', 'Vendu', 'Il reste', 'Prix achat', 'Valeur stock'],
      ...r.lines.map((l) => [
        l.product_name ?? '',
        l.stock_debut,
        l.entrees,
        l.ventes,
        l.stock_restant,
        l.prix_achat,
        l.valeur_stock,
      ]),
      [],
      ['Indicateur', 'Valeur'],
      ['Quantité totale en stock', totalQty],
      ['Valeur totale du stock (FCFA)', totalVal],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaire analytique');
    XLSX.writeFile(wb, `inventaire_analytique_${r.period.start.slice(0, 10)}_${r.period.end.slice(0, 10)}.xlsx`);
  }
}
