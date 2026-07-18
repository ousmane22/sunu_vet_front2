import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuoteService } from '../services/quote.service';
import { ProductService } from '../services/product.service';
import { ClientService } from '../services/client.service';
import { FormatPricePipe } from '../../../core/pipes';
import type { Quote, Product, Client, CreateQuotePayload } from '../models';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-quote-editor',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, FormatPricePipe],
    templateUrl: './quote-editor.component.html',
})
export class QuoteEditorComponent implements OnInit {
    private quoteService = inject(QuoteService);
    private productService = inject(ProductService);
    private clientService = inject(ClientService);
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    isEdit = signal(false);
    quoteId = signal<number | null>(null);
    isLoading = signal(false);
    isSubmitting = signal(false);

    // Products
    searchProductControl = new FormControl('');
    searchResults = signal<Product[]>([]);
    selectedItems = signal<any[]>([]);

    // Clients
    searchClientControl = new FormControl('');
    clientSearchResults = signal<Client[]>([]);
    selectedClient = signal<Client | null>(null);
    showClientDropdown = signal(false);

    // Summary
    discountType = signal<'amount' | 'percent' | null>(null);
    discountValue = signal(0);

    form = this.fb.group({
        type: ['quote', Validators.required],
        valid_until: [''],
        notes: [''],
        discount_value: [0]
    });

    ngOnInit(): void {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEdit.set(true);
            this.quoteId.set(Number(id));
            this.loadQuote(Number(id));
        } else {
            // Default valid date (30 days)
            const d = new Date();
            d.setDate(d.getDate() + 30);
            this.form.patchValue({ valid_until: d.toISOString().split('T')[0] });
        }

        // Product search
        this.searchProductControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(val => {
                if (!val || val.length < 2) return of({ data: [] });
                return this.productService.getAll({ search: val });
            })
        ).subscribe(res => this.searchResults.set(res.data));

        // Client search
        this.searchClientControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(val => {
                if (!val || val.length < 2) return of({ data: [] });
                return this.clientService.getAll(val);
            })
        ).subscribe(res => {
            this.clientSearchResults.set(res.data);
            this.showClientDropdown.set(res.data.length > 0);
        });
    }

    loadQuote(id: number): void {
        this.isLoading.set(true);
        this.quoteService.getById(id).subscribe({
            next: (q) => {
                this.form.patchValue({
                    type: q.type,
                    valid_until: q.valid_until ? new Date(q.valid_until).toISOString().split('T')[0] : '',
                    notes: q.notes,
                    discount_value: q.discount_value
                });
                this.discountType.set(q.discount_type || null);
                this.discountValue.set(q.discount_value);
                this.selectedClient.set(q.client as any);
                
                const items = q.items.map(it => ({
                    product: it.product,
                    quantity: Number(it.quantity),
                    unit_price: Number(it.unit_price),
                    subtotal: Number(it.subtotal)
                }));
                this.selectedItems.set(items);
                this.isLoading.set(false);
            },
            error: () => this.router.navigate(['/business/quotes'])
        });
    }

    selectClient(c: Client): void {
        this.selectedClient.set(c);
        this.searchClientControl.setValue('', { emitEvent: false });
        this.showClientDropdown.set(false);
    }

    addItem(p: Product): void {
        const current = this.selectedItems();
        const existing = current.find(i => i.product.id === p.id);
        if (existing) {
            existing.quantity++;
            existing.subtotal = existing.quantity * p.selling_price;
            this.selectedItems.set([...current]);
        } else {
            this.selectedItems.set([...current, {
                product: p,
                quantity: 1,
                unit_price: p.selling_price,
                subtotal: p.selling_price
            }]);
        }
        this.searchProductControl.setValue('');
        this.searchResults.set([]);
    }

    removeItem(index: number): void {
        const current = this.selectedItems();
        current.splice(index, 1);
        this.selectedItems.set([...current]);
    }

    updateQty(index: number, qty: number): void {
        const current = this.selectedItems();
        if (qty <= 0) {
            this.removeItem(index);
            return;
        }
        current[index].quantity = qty;
        current[index].subtotal = qty * current[index].unit_price;
        this.selectedItems.set([...current]);
    }

    get totalBrut(): number {
        return this.selectedItems().reduce((sum, i) => sum + i.subtotal, 0);
    }

    get totalNet(): number {
        const brut = this.totalBrut;
        let discount = 0;
        const type = this.discountType();
        const val = this.form.get('discount_value')?.value || 0;

        if (type === 'percent') discount = brut * (val / 100);
        else if (type === 'amount') discount = val;

        return Math.max(0, brut - discount);
    }

    save(): void {
        if (this.selectedItems().length === 0) return;
        this.isSubmitting.set(true);

        const payload: CreateQuotePayload = {
            client_id: this.selectedClient()?.id,
            type: this.form.get('type')?.value as any,
            valid_until: this.form.get('valid_until')?.value || undefined,
            notes: this.form.get('notes')?.value || undefined,
            discount_type: this.discountType(),
            discount_value: this.form.get('discount_value')?.value || 0,
            items: this.selectedItems().map(i => ({
                product_id: i.product.id,
                quantity: i.quantity
            }))
        };

        const req = this.isEdit() 
            ? this.quoteService.update(this.quoteId()!, payload)
            : this.quoteService.create(payload);

        req.subscribe({
            next: () => this.router.navigate(['/business/quotes']),
            error: () => this.isSubmitting.set(false)
        });
    }

    getCategoryName(p: Product): string {
        if (!p.category) return 'Sans catégorie';
        if (typeof p.category === 'string') return p.category;
        return (p.category as any).name || 'Sans catégorie';
    }
}
