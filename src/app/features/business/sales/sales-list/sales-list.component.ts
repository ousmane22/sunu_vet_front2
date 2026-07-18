import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormatPricePipe } from '../../../../core/pipes';
import { AddPaymentModalComponent, type AddPaymentPayload } from '../../../../shared/components/add-payment-modal/add-payment-modal.component';

import { SaleService } from '../../services/sale.service';
import { AuthService } from '../../../auth/services/auth.service';
import { PrintService } from '../../../../core/services/print.service';
import { SaleDetailComponent } from './components/sale-detail/sale-detail.component';
import { SalesStatsComponent, type SalesPeriod } from './components/sales-stats/sales-stats.component';
import type { Sale, SaleListItem } from '../../models';

@Component({
    selector: 'app-sales-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormatPricePipe,
        AddPaymentModalComponent,
        SalesStatsComponent,
        SaleDetailComponent,
    ],
    templateUrl: './sales-list.component.html',
})
export class SalesListComponent implements OnInit {
    private saleService = inject(SaleService);
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private printService = inject(PrintService);

    can(perm: string): boolean {
        return this.authService.hasPermission(perm);
    }

    sales = signal<SaleListItem[]>([]);
    isLoading = signal(true);

    /** Période active — défaut : aujourd'hui */
    selectedPeriod = signal<SalesPeriod>('today');

    filterForm = this.fb.group({
        date_from: [''],
        date_to: [''],
    });

    selectedSaleForDetails = signal<Sale | null>(null);
    isLoadingDetails = signal(false);

    selectedSaleForPayment = signal<Sale | null>(null);
    isSubmittingPayment = signal(false);

    currentPage = signal(1);
    lastPage = signal(1);
    perPage = signal(50);

    statsToday = signal({ amount: 0, count: 0 });
    statsWeek = signal({ amount: 0 });
    statsMonth = signal({ amount: 0 });

    filteredTotalAmount = signal(0);
    filteredSalesCount = signal(0);

    periodLabel = computed(() => {
        switch (this.selectedPeriod()) {
            case 'today': return "Aujourd'hui";
            case 'week': return 'Cette semaine';
            case 'month': return 'Ce mois';
            case 'custom': return 'Période sélectionnée';
        }
    });

    ngOnInit(): void {
        this.loadStats();
        this.loadSales(1);
        this.filterForm.valueChanges.subscribe(() => this.loadSales(1));
    }

    loadStats(): void {
        this.saleService.getStats().subscribe({
            next: (res) => {
                this.statsToday.set(res.today || { amount: 0, count: 0 });
                this.statsWeek.set(res.week || { amount: 0 });
                this.statsMonth.set(res.month || { amount: 0 });
            },
            error: () => {
                console.error('Erreur lors du chargement des statistiques');
            }
        });
    }

    onPeriodChange(period: SalesPeriod): void {
        this.selectedPeriod.set(period);
        if (period !== 'custom') {
            this.filterForm.patchValue({ date_from: '', date_to: '' }, { emitEvent: false });
        }
        this.loadSales(1);
    }

    enableCustomPeriod(): void {
        const today = new Date().toISOString().slice(0, 10);
        this.selectedPeriod.set('custom');
        this.filterForm.patchValue(
            {
                date_from: this.filterForm.value.date_from || today,
                date_to: this.filterForm.value.date_to || today,
            },
            { emitEvent: false }
        );
        this.loadSales(1);
    }

    resetFilters(): void {
        this.selectedPeriod.set('today');
        this.filterForm.reset({ date_from: '', date_to: '' }, { emitEvent: false });
        this.loadSales(1);
    }

    loadSales(page: number = this.currentPage()): void {
        this.isLoading.set(true);
        const filters: Record<string, string | number> = {
            page,
            per_page: this.perPage(),
            period: this.selectedPeriod(),
        };
        const val = this.filterForm.value;

        if (this.selectedPeriod() === 'custom') {
            if (val.date_from) filters['date_from'] = val.date_from;
            if (val.date_to) filters['date_to'] = val.date_to;
        }

        this.saleService.getAll(filters as any).subscribe({
            next: (res) => {
                const list: SaleListItem[] = Array.isArray(res?.data) ? res.data : [];
                this.sales.set(list);
                const m = res?.meta;
                if (m) {
                    this.currentPage.set(m.current_page);
                    this.lastPage.set(m.last_page);
                } else {
                    this.currentPage.set(page);
                    this.lastPage.set(1);
                }

                this.filteredTotalAmount.set(res?.summary?.total_amount ?? 0);
                this.filteredSalesCount.set(res?.summary?.count ?? 0);
                this.isLoading.set(false);
            },
            error: () => {
                this.sales.set([]);
                this.filteredTotalAmount.set(0);
                this.filteredSalesCount.set(0);
                this.isLoading.set(false);
            }
        });
    }

    changePage(newPage: number): void {
        if (newPage >= 1 && newPage <= this.lastPage()) {
            this.loadSales(newPage);
        }
    }

    private toListItem(sale: Sale): SaleListItem {
        return {
            id: sale.id,
            status: sale.status,
            payment_method: sale.payment_method,
            created_at: sale.created_at,
            total_amount: sale.total_amount,
            discount_amount: sale.discount_amount,
            net_amount: sale.net_amount,
            amount_paid: sale.amount_paid,
            amount_due: sale.amount_due,
            items_count: sale.items?.length ?? 0,
            user: sale.user ?? null,
        };
    }

    private patchListRow(sale: Sale): void {
        this.sales.update((list) =>
            list.map((s) => (s.id === sale.id ? this.toListItem(sale) : s))
        );
    }

    openDetails(row: SaleListItem): void {
        this.isLoadingDetails.set(true);
        this.selectedSaleForDetails.set(null);
        this.saleService.getById(row.id).subscribe({
            next: (res) => {
                this.selectedSaleForDetails.set(res.data);
                this.isLoadingDetails.set(false);
            },
            error: (err) => {
                this.isLoadingDetails.set(false);
                alert(err.error?.message || 'Impossible de charger le détail de la vente');
            },
        });
    }

    closeDetails(): void {
        this.selectedSaleForDetails.set(null);
        this.isLoadingDetails.set(false);
    }

    openPaymentModal(sale: Sale): void {
        this.closeDetails();
        this.selectedSaleForPayment.set(sale);
    }

    closePaymentModal(): void {
        this.selectedSaleForPayment.set(null);
    }

    onPaymentSubmit(payload: AddPaymentPayload): void {
        const sale = this.selectedSaleForPayment();
        if (!sale || this.isSubmittingPayment()) return;
        this.isSubmittingPayment.set(true);
        this.saleService.addPayment(sale.id, {
            amount: payload.amount,
            payment_method: payload.payment_method,
            note: payload.note,
        }).subscribe({
            next: (res) => {
                this.patchListRow(res.data);
                this.loadStats();
                this.isSubmittingPayment.set(false);
                this.closePaymentModal();
                this.closeDetails();
            },
            error: (err) => {
                alert(err.error?.message || 'Erreur lors du paiement');
                this.isSubmittingPayment.set(false);
            },
        });
    }

    cancelSale(sale: Sale): void {
        if (sale.status === 'cancelled') return;
        if (!confirm('Êtes-vous sûr de vouloir annuler cette vente ? Les stocks seront restaurés.')) return;

        this.saleService.cancel(sale.id).subscribe({
            next: (res) => {
                this.patchListRow(res.data);
                this.loadStats();
                this.closeDetails();
            },
            error: (err) => {
                alert(err.error?.message || 'Erreur lors de l\'annulation');
            }
        });
    }

    printInvoice(sale: Sale): void {
        this.printService.printSaleInvoice(sale);
        this.closeDetails();
    }

    printReceipt(sale: Sale): void {
        this.printService.printSaleReceipt(sale);
        this.closeDetails();
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-900 border border-green-300';
            case 'partial': return 'bg-amber-100 text-amber-900 border border-amber-300';
            case 'cancelled': return 'bg-red-100 text-red-900 border border-red-300';
            default: return 'bg-gray-100 text-black border border-gray-300';
        }
    }
}
