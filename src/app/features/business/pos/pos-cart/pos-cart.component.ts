import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';
import { formatPrice } from '../../../../core/utils/format.util';
import { CartService } from '../../services/cart.service';
import { CashRegisterService } from '../../services/cash-register.service';
import { BusinessProfileService } from '../../services/business-profile.service';
import type { CashRegister } from '../../models';

type PaymentMethod = 'cash' | 'card' | 'mobile_money';
type DiscountType = 'amount' | 'percent';

import { PosCartItemComponent } from './components/pos-cart-item.component';
import { PosSaleResultComponent } from './components/pos-sale-result.component';
import { PosCheckoutModalComponent } from './components/pos-checkout-modal.component';
import { FormatPricePipe } from '../../../../core/pipes';

@Component({
    selector: 'app-pos-cart',
    standalone: true,
    imports: [
        CommonModule,
        PosCartItemComponent,
        PosSaleResultComponent,
        PosCheckoutModalComponent,
        FormatPricePipe
    ],
    host: {
        'class': 'h-full flex flex-col'
    },
    templateUrl: './pos-cart.component.html',
})
export class PosCartComponent implements OnInit, OnDestroy {
    cartService = inject(CartService);
    private cashRegService = inject(CashRegisterService);
    private profileService = inject(BusinessProfileService);
    strategyService = inject(BusinessStrategyService);
    private destroy$ = new Subject<void>();

    // ── État ─────────────────────────────────────────────────────────────────
    isSubmitting = signal(false);
    activeRegister = signal<CashRegister | null>(null);
    requireOpenRegister = signal(true);
    showPaymentModal = signal(false);
    saleResult = signal<any | null>(null);

    ngOnInit(): void {
        this.loadActiveRegister();
        this.cashRegService.onChanged()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadActiveRegister());

        this.profileService.getProfile().subscribe({
            next: (res) => this.requireOpenRegister.set(res.data.settings?.require_open_register !== false),
            error: () => this.requireOpenRegister.set(true),
        });
    }

    private loadActiveRegister(): void {
        this.cashRegService.getCurrent(true).subscribe({
            next: res => this.activeRegister.set(res.data),
            error: () => this.activeRegister.set(null),
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSaleFinished(sale: any): void {
        this.saleResult.set(sale);
    }

    startNewSale(): void {
        this.saleResult.set(null);
        this.cartService.clear();
    }


}
