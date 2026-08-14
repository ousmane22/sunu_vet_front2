import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormatPricePipe, FormatDatePipe } from '../../../core/pipes';
import { QuoteService } from '../services/quote.service';
import { DetailSlideOverComponent } from '../../../shared/components/detail-slide-over/detail-slide-over.component';
import { PrintService } from '../../../core/services/print.service';
import type { Quote } from '../models';
import { SunuDialogService } from '../../../shared/services/sunu-dialog.service';

@Component({
    selector: 'app-quote-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, FormatPricePipe, FormatDatePipe, DetailSlideOverComponent],
    templateUrl: './quote-list.component.html',
})
export class QuoteListComponent implements OnInit {
    private quoteService = inject(QuoteService);
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private printService = inject(PrintService);
    private dialog = inject(SunuDialogService);

    quotes = signal<Quote[]>([]);
    isLoading = signal(true);

    filterForm = this.fb.group({
        status: [''],
        type: ['']
    });

    selectedQuoteForDetails = signal<Quote | null>(null);

    // Pagination
    currentPage = signal(1);
    lastPage = signal(1);
    perPage = signal(50);

    ngOnInit(): void {
        this.loadQuotes(1);
        this.filterForm.valueChanges.subscribe(() => this.loadQuotes(1));
    }

    loadQuotes(page: number = this.currentPage()): void {
        this.isLoading.set(true);
        const filters: any = { page, per_page: this.perPage() };
        const val = this.filterForm.value;
        if (val.status) filters.status = val.status;
        if (val.type) filters.type = val.type;

        this.quoteService.getAll(filters).subscribe({
            next: (res: any) => {
                this.quotes.set(res.data);
                this.currentPage.set(res.current_page);
                this.lastPage.set(res.last_page);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.quotes.set([]);
            }
        });
    }

    changePage(p: number): void {
        if (p < 1 || p > this.lastPage()) return;
        this.loadQuotes(p);
    }

    openDetails(q: Quote): void {
        this.selectedQuoteForDetails.set(q);
    }

    closeDetails(): void {
        this.selectedQuoteForDetails.set(null);
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-900 border-amber-300';
            case 'accepted': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
            case 'converted': return 'bg-indigo-100 text-indigo-900 border-indigo-300';
            case 'rejected': return 'bg-red-100 text-red-900 border-red-300';
            case 'cancelled': return 'bg-gray-100 text-black border-gray-300';
            default: return 'bg-gray-100 text-black border-gray-300';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'pending': return 'En attente';
            case 'accepted': return 'Accepté';
            case 'converted': return 'Facturé';
            case 'rejected': return 'Refusé';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    }

    editQuote(q: Quote): void {
        this.closeDetails();
        this.router.navigate(['/business/quotes', q.id, 'edit']);
    }

    async deleteQuote(q: Quote): Promise<void> {
        const confirmed = await this.dialog.confirm('Voulez-vous vraiment supprimer ce devis ?', {
            title: 'Supprimer le devis',
            destructive: true,
            confirmText: 'Supprimer',
        });
        if (!confirmed) return;
        this.quoteService.delete(q.id).subscribe(() => {
            this.loadQuotes();
            this.closeDetails();
        });
    }

    convertToSale(q: Quote): void {
        this.closeDetails();
        this.router.navigate(['/business/quotes', q.id, 'convert']);
    }

    printQuote(q: Quote): void {
        this.printService.printQuote(q);
        this.closeDetails();
    }
}
