import { Component, input, output, inject, signal, computed, effect, untracked, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CartService } from '../../../services/cart.service';
import { ClientService } from '../../../services/client.service';
import { SaleService } from '../../../services/sale.service';
import { OpenRegisterSessionService } from '../../../services/open-register-session.service';
import { FormatPricePipe } from '../../../../../core/pipes';
import { calculateDiscountAmount, calculateNetAmount, formatPrice } from '../../../../../core/utils/format.util';
import { PosCartClientSelectorComponent } from './pos-cart-client-selector.component';
import type { Client, CreateSalePayload, Sale } from '../../../models';

export type PaymentMethod = 'cash' | 'card' | 'mobile_money';
export type DiscountType = 'amount' | 'percent';

@Component({
    selector: 'app-pos-checkout-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormatPricePipe,
        PosCartClientSelectorComponent
    ],
    templateUrl: './pos-checkout-modal.component.html',
    styles: [`
      /* Espèces */
      .pay-method--cash.pay-method--idle {
        background: #ecfdf5;
        color: #064e3b;
        border-color: #a7f3d0;
      }
      .pay-method--cash.pay-method--idle .pay-method__icon {
        background: #d1fae5;
        color: #047857;
      }
      .pay-method--cash.pay-method--idle .pay-method__sub { color: #065f46; }
      .pay-method--cash.pay-method--idle:hover {
        border-color: #34d399;
        background: #d1fae5;
      }
      .pay-method--cash.pay-method--active {
        background: #047857;
        color: #fff;
        border-color: #047857;
      }

      /* Carte */
      .pay-method--card.pay-method--idle {
        background: #eef2ff;
        color: #312e81;
        border-color: #c7d2fe;
      }
      .pay-method--card.pay-method--idle .pay-method__icon {
        background: #e0e7ff;
        color: #4338ca;
      }
      .pay-method--card.pay-method--idle .pay-method__sub { color: #3730a3; }
      .pay-method--card.pay-method--idle:hover {
        border-color: #818cf8;
        background: #e0e7ff;
      }
      .pay-method--card.pay-method--active {
        background: #4338ca;
        color: #fff;
        border-color: #4338ca;
      }

      /* Mobile money */
      .pay-method--mobile.pay-method--idle {
        background: #f5f3ff;
        color: #4c1d95;
        border-color: #ddd6fe;
      }
      .pay-method--mobile.pay-method--idle .pay-method__icon {
        background: #ede9fe;
        color: #7c3aed;
      }
      .pay-method--mobile.pay-method--idle .pay-method__sub { color: #5b21b6; }
      .pay-method--mobile.pay-method--idle:hover {
        border-color: #a78bfa;
        background: #ede9fe;
      }
      .pay-method--mobile.pay-method--active {
        background: #7c3aed;
        color: #fff;
        border-color: #7c3aed;
      }

      .pay-method--active .pay-method__sub { color: rgba(255,255,255,0.9); }
      .pay-method--active .pay-method__icon {
        background: rgba(255,255,255,0.2);
        color: #fff;
      }
    `],
})
export class PosCheckoutModalComponent implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private clientService = inject(ClientService);
    private saleService = inject(SaleService);
    cartService = inject(CartService);
    private registerSession = inject(OpenRegisterSessionService);
    private destroy$ = new Subject<void>();

    // Inputs
    isOpen = input.required<boolean>();
    requireOpenRegister = input<boolean>(false);
    activeRegister = input<any | null>(null);
    /** Mode modification : même formulaire que la vente, appel update. */
    editingSale = input<Sale | null>(null);

    // Outputs
    close = output<void>();
    saleFinished = output<any>();

    isEditMode = computed(() => !!this.editingSale());

    // local state
    isSubmitting = signal(false);
    errorMessage = signal<string | null>(null);
    discountPanelOpen = signal(true);

    readonly quickCashAmounts = [5_000, 10_000, 25_000, 50_000, 100_000, 200_000];

    paymentMethods = [
        { id: 'cash' as PaymentMethod, label: 'Espèces', sub: 'Liquide' },
        { id: 'card' as PaymentMethod, label: 'Carte', sub: 'Visa / CB' },
        { id: 'mobile_money' as PaymentMethod, label: 'Mobile', sub: 'Wave / OM' }
    ];

    // Client
    clientSearchResults = signal<Client[]>([]);
    selectedClient = signal<Client | null>(null);
    showClientDropdown = signal(false);
    showCreateClient = signal(false);
    isCreatingClient = signal(false);
    createClientError = signal<string | null>(null);

    createClientForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        phone: [''],
        email: ['', [Validators.email]],
    });

    showEditClientForm = signal(false);
    isSavingClientEdit = signal(false);
    editClientError = signal<string | null>(null);
    editClientForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        phone: [''],
        email: ['', [Validators.email]],
    });

    // Main Form
    form = this.fb.group({
        client_search: [''],
        payment_method: ['cash' as PaymentMethod, Validators.required],
        discount_type: ['amount' as DiscountType | null],
        discount_value: [0, [Validators.min(0)]],
        amount_paid: [0, [Validators.required, Validators.min(0)]],
    });

    // Signals from form fields
    private discountTypeSignal = toSignal(this.form.get('discount_type')!.valueChanges, { initialValue: 'amount' as DiscountType | null });
    private discountValueSignal = toSignal(this.form.get('discount_value')!.valueChanges, { initialValue: 0 });
    private amountPaidSignal = toSignal(this.form.get('amount_paid')!.valueChanges, { initialValue: 0 });
    private paymentMethodSignal = toSignal(this.form.get('payment_method')!.valueChanges, { initialValue: 'cash' as PaymentMethod });

    // Computed properties
    subtotal = computed(() => this.cartService.totalAmount());

    discountAmount = computed(() =>
        calculateDiscountAmount(this.subtotal(), this.discountTypeSignal() as DiscountType | null, +(this.discountValueSignal() ?? 0)),
    );

    netAmount = computed(() => calculateNetAmount(this.subtotal(), this.discountAmount()));

    isCashPayment = computed(() => this.paymentMethodSignal() === 'cash');

    /** Montant saisi (ou déjà encaissé en édition). */
    amountPaid = computed(() => {
        if (this.isEditMode()) {
            return Number(this.editingSale()?.amount_paid ?? 0);
        }
        return +(this.amountPaidSignal() ?? 0);
    });

    amountDue = computed(() => {
        const val = this.netAmount() - this.amountPaid();
        return val > 0 ? val : 0;
    });

    changeGiven = computed(() => {
        const val = this.amountPaid() - this.netAmount();
        return val > 0 ? val : 0;
    });

    isPartial = computed(() => this.amountDue() > 0);

    canSubmit = computed(() => {
        if (this.isSubmitting()) return false;
        if (this.isEditMode()) return this.cartService.cart().length > 0;
        const registerBlocked = this.registerSession.shouldBlock(
            this.requireOpenRegister(),
            !!this.activeRegister(),
            'pos',
        );
        return this.cartService.cart().length > 0
            && !registerBlocked
            && this.amountPaid() >= 0;
    });

    /** Bloque le CTA si crédit sans client — uniquement à la création. */
    submitBlocked = computed(() =>
        !this.canSubmit() || (!this.isEditMode() && this.isPartial() && !this.selectedClient())
    );

    submitHint = computed((): string | null => {
        if (!this.submitBlocked() || this.isSubmitting()) return null;
        if (this.cartService.cart().length === 0) return 'Ajoutez au moins un article au panier.';
        if (!this.isEditMode() && this.isPartial() && !this.selectedClient()) {
            return 'Sélectionnez ou créez un client pour enregistrer un crédit.';
        }
        if (this.registerSession.shouldBlock(this.requireOpenRegister(), !!this.activeRegister(), 'pos')) {
            return 'Ouvrez une caisse pour encaisser.';
        }
        return null;
    });

    ctaLabel = computed((): string => {
        if (this.isEditMode()) return 'Enregistrer les modifications';
        if (this.isPartial()) {
            return `Encaisser ${formatPrice(this.amountPaid())} (partiel)`;
        }
        return `Encaisser ${formatPrice(this.netAmount())}`;
    });

    get paymentMethod(): PaymentMethod {
        return (this.form.get('payment_method')?.value ?? 'cash') as PaymentMethod;
    }

    get discountType(): DiscountType | null {
        return this.form.get('discount_type')?.value as DiscountType | null;
    }

    getControl(name: string): any {
        return this.form.get(name);
    }

    constructor() {
        /** Init à l’ouverture uniquement — pas de suivi de netAmount (évite boucles / crash navigateur). */
        effect(() => {
            if (!this.isOpen()) return;
            const sale = this.editingSale();
            untracked(() => {
                if (sale) {
                    this.applyEditingSale(sale);
                } else {
                    if (!this.form.get('discount_type')!.value) {
                        this.form.get('discount_type')!.setValue('amount');
                    }
                    this.discountPanelOpen.set(true);
                    this.prefillExactAmount();
                }
            });
        });
    }

    @HostListener('document:keydown', ['$event'])
    onDocumentKeydown(event: KeyboardEvent): void {
        if (!this.isOpen() || this.isSubmitting()) return;

        const target = event.target as HTMLElement | null;
        const inField = !!target?.closest('input, textarea, select');

        if (event.key === 'Escape') {
            event.preventDefault();
            this.close.emit();
            return;
        }

        if (event.key === 'Enter' && !inField && !event.shiftKey && !this.submitBlocked()) {
            event.preventDefault();
            this.finalizeSale();
            return;
        }

        if (inField) return;

        if (event.key === 'F1') {
            event.preventDefault();
            this.setPaymentMethod('cash');
        } else if (event.key === 'F2') {
            event.preventDefault();
            this.setPaymentMethod('card');
        } else if (event.key === 'F3') {
            event.preventDefault();
            this.setPaymentMethod('mobile_money');
        }
    }

    ngOnInit() {
        this.form.get('client_search')!.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(q => {
            if (q && q.length >= 2) {
                this.searchClients(q);
            } else {
                this.clientSearchResults.set([]);
                this.showClientDropdown.set(false);
            }
        });

        this.form.get('discount_value')!.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            if (this.isOpen() && !this.isEditMode()) {
                this.prefillExactAmount();
            }
        });
    }

    private applyEditingSale(sale: Sale): void {
        this.form.patchValue({
            payment_method: (sale.payment_method as PaymentMethod) ?? 'cash',
            discount_type: (sale.discount_type as DiscountType | null) ?? 'amount',
            discount_value: sale.discount_value ?? 0,
            amount_paid: sale.amount_paid ?? sale.net_amount,
        }, { emitEvent: true });

        if (sale.client) {
            this.selectedClient.set(sale.client as Client);
            this.form.get('client_search')!.setValue(sale.client.name, { emitEvent: false });
        } else {
            this.selectedClient.set(null);
            this.form.get('client_search')!.setValue('', { emitEvent: false });
        }

        this.errorMessage.set(null);
        this.showCreateClient.set(false);
        this.showEditClientForm.set(false);
        this.discountPanelOpen.set(true);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private searchClients(query: string): void {
        this.clientService.getAll(query).subscribe({
            next: res => {
                this.clientSearchResults.set(res.data);
                this.showClientDropdown.set(res.data.length > 0);
            },
            error: () => this.clientSearchResults.set([]),
        });
    }

    selectClient(client: Client): void {
        this.selectedClient.set(client);
        this.form.get('client_search')!.setValue(client.name, { emitEvent: false });
        this.showClientDropdown.set(false);
        this.showCreateClient.set(false);
        this.showEditClientForm.set(false);
        this.editClientError.set(null);
    }

    clearClient(): void {
        this.selectedClient.set(null);
        this.form.get('client_search')!.setValue('', { emitEvent: false });
        this.clientSearchResults.set([]);
        this.showCreateClient.set(false);
        this.showEditClientForm.set(false);
        this.editClientError.set(null);
    }

    startEditClient(): void {
        const c = this.selectedClient();
        if (!c) return;
        this.editClientForm.patchValue({
            name:  c.name,
            phone: c.phone ?? '',
            email: c.email ?? '',
        });
        this.editClientError.set(null);
        this.showEditClientForm.set(true);
        this.showCreateClient.set(false);
        this.showClientDropdown.set(false);
    }

    cancelEditClient(): void {
        this.showEditClientForm.set(false);
        this.editClientError.set(null);
    }

    saveEditedClient(): void {
        const c = this.selectedClient();
        if (!c || this.editClientForm.invalid || this.isSavingClientEdit()) return;
        this.isSavingClientEdit.set(true);
        this.editClientError.set(null);
        const v = this.editClientForm.getRawValue();
        this.clientService.update(c.id, {
            name:  v.name ?? '',
            phone: v.phone || undefined,
            email: v.email || undefined,
        }).subscribe({
            next: (res) => {
                this.selectClient(res.data);
                this.isSavingClientEdit.set(false);
                this.showEditClientForm.set(false);
            },
            error: (err) => {
                this.editClientError.set(err.error?.message ?? 'Erreur lors de la mise à jour.');
                this.isSavingClientEdit.set(false);
            },
        });
    }

    openCreateClient(): void {
        const searchVal = this.form.get('client_search')!.value ?? '';
        this.createClientForm.reset();
        this.createClientForm.patchValue({ name: searchVal });
        this.createClientError.set(null);
        this.showCreateClient.set(true);
        this.showEditClientForm.set(false);
        this.showClientDropdown.set(false);
    }

    cancelCreateClient(): void {
        this.showCreateClient.set(false);
        this.createClientForm.reset();
        this.createClientError.set(null);
    }

    saveNewClient(): void {
        if (this.createClientForm.invalid || this.isCreatingClient()) return;
        this.isCreatingClient.set(true);
        this.createClientError.set(null);

        const val = this.createClientForm.value;
        this.clientService.create({
            name: val.name ?? '',
            phone: val.phone || undefined,
            email: val.email || undefined,
        }).subscribe({
            next: res => {
                this.selectClient(res.data);
                this.isCreatingClient.set(false);
                this.showCreateClient.set(false);
                this.createClientForm.reset();
            },
            error: err => {
                this.createClientError.set(err.error?.message ?? 'Erreur lors de la création.');
                this.isCreatingClient.set(false);
            },
        });
    }

    prefillExactAmount(): void {
        this.form.get('amount_paid')!.setValue(this.netAmount());
    }

    setQuickCashAmount(amount: number): void {
        this.form.get('amount_paid')!.setValue(amount);
    }

    toggleDiscountPanel(): void {
        this.discountPanelOpen.update(v => !v);
    }

    setPaymentMethod(m: PaymentMethod): void {
        this.form.get('payment_method')!.setValue(m);
        if (!this.isEditMode()) {
            this.form.get('amount_paid')!.setValue(this.netAmount());
        }
    }

    setDiscountType(t: DiscountType | null): void {
        this.form.get('discount_type')!.setValue(t);
        if (!t) this.form.get('discount_value')!.setValue(0);
        this.prefillExactAmount();
    }

    paymentMethodShortcut(id: PaymentMethod): string {
        if (id === 'cash') return 'F1';
        if (id === 'card') return 'F2';
        return 'F3';
    }

    /** Retire une ligne du panier sans fermer le modal ni revenir au POS. */
    removeCartLine(productId: number): void {
        if (this.isEditMode()) return;
        this.cartService.remove(productId);
        this.prefillExactAmount();
    }

    /** Met à jour la quantité depuis le résumé commande. */
    updateCartQuantity(productId: number, quantity: number): void {
        if (this.isEditMode()) return;
        this.cartService.setQuantity(productId, quantity);
        this.prefillExactAmount();
    }

    onSummaryQtyChange(productId: number, event: Event): void {
        if (this.isEditMode()) return;
        const el = event.target as HTMLInputElement;
        const raw = el.value.trim();
        const item = this.cartService.cart().find(i => i.product.id === productId);
        if (!item) return;

        if (raw === '') {
            el.value = String(item.quantity);
            return;
        }

        let qty = Number(raw);
        if (Number.isNaN(qty)) {
            el.value = String(item.quantity);
            return;
        }

        if (!item.product.allow_fractional_quantity) {
            qty = Math.round(qty);
        }

        this.updateCartQuantity(productId, qty);
    }

    finalizeSale(): void {
        if (this.submitBlocked()) return;
        if (!this.isEditMode() && this.amountDue() > 0 && !this.selectedClient()) {
            this.errorMessage.set('Sélectionnez ou créez un client pour enregistrer un crédit.');
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set(null);

        const editing = this.editingSale();
        if (editing) {
            const payload: Record<string, unknown> = {
                client_id: this.selectedClient()?.id ?? null,
                payment_method: this.paymentMethod,
                discount_type: this.discountType,
                discount_value: +(this.form.get('discount_value')!.value ?? 0),
            };

            this.saleService.update(editing.id, payload).subscribe({
                next: res => {
                    this.isSubmitting.set(false);
                    this.saleFinished.emit(res.data);
                    this.close.emit();
                },
                error: err => {
                    const errors = err.error?.errors
                        ? Object.values(err.error.errors).flat().join(' ')
                        : null;
                    this.errorMessage.set(err.error?.message ?? errors ?? 'Erreur lors de la modification.');
                    this.isSubmitting.set(false);
                },
            });
            return;
        }

        const payload: CreateSalePayload = {
            client_id: this.selectedClient()?.id ?? null,
            payment_method: this.paymentMethod,
            amount_paid: this.amountPaid(),
            discount_type: this.discountType,
            discount_value: +(this.form.get('discount_value')!.value ?? 0),
            items: this.cartService.cart().map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
            })),
        };

        this.saleService.create(payload).subscribe({
            next: res => {
                this.isSubmitting.set(false);
                this.saleFinished.emit(res.data);
                this.close.emit();
            },
            error: err => {
                this.errorMessage.set(err.error?.message ?? 'Erreur lors de l\'enregistrement.');
                this.isSubmitting.set(false);
            },
        });
    }
}
