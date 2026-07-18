import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuoteService } from '../services/quote.service';
import { FormatPricePipe } from '../../../core/pipes';
import type { Quote } from '../models';

@Component({
    selector: 'app-quote-conversion',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, FormatPricePipe],
    templateUrl: './quote-conversion.component.html',
})
export class QuoteConversionComponent implements OnInit {
    private quoteService = inject(QuoteService);
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    quote = signal<Quote | null>(null);
    isLoading = signal(true);
    isSubmitting = signal(false);

    form = this.fb.group({
        amount_paid: [0, [Validators.required, Validators.min(0)]],
        payment_method: ['cash', Validators.required]
    });

    ngOnInit(): void {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.loadQuote(Number(id));
        }
    }

    loadQuote(id: number): void {
        this.isLoading.set(true);
        this.quoteService.getById(id).subscribe({
            next: (q) => {
                this.quote.set(q);
                const net = Number(q.net_amount);
                this.form.patchValue({ amount_paid: Number.isFinite(net) ? Math.round(net) : 0 });
                this.isLoading.set(false);
            },
            error: () => this.router.navigate(['/business/quotes'])
        });
    }

    setAmountToTotal(): void {
        const net = Number(this.quote()?.net_amount ?? 0);
        this.form.patchValue({ amount_paid: Number.isFinite(net) ? Math.round(net) : 0 });
    }

    submit(): void {
        if (this.form.invalid || !this.quote()) return;
        this.isSubmitting.set(true);

        const val = this.form.value;
        const amount = Number(val.amount_paid);
        this.quoteService.convert(this.quote()!.id, {
            amount_paid: Number.isFinite(amount) ? Math.round(amount) : 0,
            payment_method: val.payment_method ?? 'cash'
        }).subscribe({
            next: () => this.router.navigate(['/business/sales']),
            error: () => this.isSubmitting.set(false)
        });
    }
}
