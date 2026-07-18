import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormatPricePipe } from '../../../../core/pipes';
import { PaymentService } from '../../services/payment.service';
import { ClientService } from '../../services/client.service';
import type { Payment, Client } from '../../models';

@Component({
    selector: 'app-payments-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormatPricePipe],
    templateUrl: './payments-list.component.html',
})
export class PaymentsListComponent implements OnInit {
    private paymentService = inject(PaymentService);
    private clientService = inject(ClientService);
    private fb = inject(FormBuilder);

    payments = signal<Payment[]>([]);
    clients = signal<Client[]>([]);
    isLoading = signal(true);
    totalCount = signal(0);

    readonly today = new Date().toISOString().slice(0, 10);

    filterForm = this.fb.group({
        date: [this.today],
        payment_method: [''],
        client_id: [''],
    });

    /** Total des paiements affichés (filtre courant). */
    filteredTotal = computed(() =>
        this.payments().reduce((acc, p) => acc + Number(p.amount), 0)
    );

    ngOnInit(): void {
        this.loadInitialData();
        this.loadPayments();
        this.filterForm.valueChanges.subscribe(() => this.loadPayments());
    }

    loadInitialData(): void {
        this.clientService.getAll().subscribe((res) => this.clients.set(res.data));
    }

    loadPayments(): void {
        this.isLoading.set(true);
        const val = this.filterForm.value;

        this.paymentService.getAll(val).subscribe({
            next: (res) => {
                const list = Array.isArray(res?.data) ? res.data : [];
                this.payments.set(list);
                this.totalCount.set(res?.meta?.total ?? list.length);
                this.isLoading.set(false);
            },
            error: () => {
                this.payments.set([]);
                this.totalCount.set(0);
                this.isLoading.set(false);
            },
        });
    }

    resetFilters(): void {
        this.filterForm.reset(
            { date: this.today, payment_method: '', client_id: '' },
            { emitEvent: false }
        );
        this.loadPayments();
    }

    getPaymentMethodLabel(method: string): string {
        switch (method) {
            case 'cash': return 'Espèces';
            case 'card': return 'Carte';
            case 'mobile_money': return 'Mobile Money';
            default: return method;
        }
    }

    getPaymentMethodClass(method: string): string {
        switch (method) {
            case 'cash': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
            case 'card': return 'bg-blue-100 text-blue-900 border-blue-300';
            case 'mobile_money': return 'bg-amber-100 text-amber-900 border-amber-300';
            default: return 'bg-gray-100 text-black border-gray-300';
        }
    }

    getPayableTypeLabel(payableType: string | null | undefined): string {
        if (!payableType) return '—';
        const short = payableType.split('\\').pop() ?? payableType;
        switch (short) {
            case 'Sale': return 'Vente';
            case 'Consultation': return 'Consultation';
            default: return short;
        }
    }

    getPayableTypeClass(payableType: string | null | undefined): string {
        const label = this.getPayableTypeLabel(payableType);
        if (label === 'Vente') return 'bg-primary-100 text-primary-900 border-primary-300';
        if (label === 'Consultation') return 'bg-teal-100 text-teal-900 border-teal-300';
        return 'bg-gray-100 text-black border-gray-300';
    }
}
