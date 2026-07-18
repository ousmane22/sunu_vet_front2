import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessStrategyService } from '../../../../../core/services/business-strategy.service';
import { FormatPricePipe } from '../../../../../core/pipes';
import type { CartItem } from '../../../services/cart.service';

@Component({
    selector: 'app-pos-cart-item',
    standalone: true,
    imports: [CommonModule, FormatPricePipe],
    host: { 'class': 'block w-full' },
    templateUrl: './pos-cart-item.component.html',
})
export class PosCartItemComponent {
    strategyService = inject(BusinessStrategyService);

    item = input.required<CartItem>();
    
    quantityChange = output<number>();
    remove = output<void>();

    onQtyInputChange(event: Event): void {
        const el = event.target as HTMLInputElement;
        const raw = el.value.trim();
        if (raw === '') {
            el.value = String(this.item().quantity);
            return;
        }

        let qty = Number(raw);
        if (Number.isNaN(qty)) {
            el.value = String(this.item().quantity);
            return;
        }

        if (!this.item().product.allow_fractional_quantity) {
            qty = Math.round(qty);
        }

        this.quantityChange.emit(qty);
    }
}
