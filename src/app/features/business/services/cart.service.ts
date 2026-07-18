import { Injectable, signal, computed } from '@angular/core';
import type { PosProduct } from '../models';

export interface CartItem {
    product: PosProduct;
    quantity: number;
    lineTotal: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
    cart = signal<CartItem[]>([]);

    totalItems = computed(() => this.cart().reduce((sum, i) => sum + i.quantity, 0));
    totalAmount = computed(() => this.cart().reduce((sum, i) => sum + i.lineTotal, 0));

    add(med: PosProduct, qty: number = 1): void {
        const current = this.cart();
        const existing = current.find(i => i.product.id === med.id);
        let next: CartItem[];
        if (existing) {
            const available = med.stock_quantity;
            const newQty = Math.min(existing.quantity + qty, available);

            if (newQty <= 0) {
                next = current.filter(i => i.product.id !== med.id);
            } else {
                next = current.map(i => i.product.id === med.id
                    ? { product: med, quantity: newQty, lineTotal: med.selling_price * newQty }
                    : i);
            }
        } else {
            const quantity = Math.min(qty, med.stock_quantity);
            next = quantity > 0
                ? [...current, { product: med, quantity, lineTotal: med.selling_price * quantity }]
                : current;
        }
        this.cart.set(next);
    }

    setQuantity(medId: number, quantity: number): void {
        const current = this.cart().find(i => i.product.id === medId);
        if (!current) return;

        let finalQty = Math.min(quantity, current.product.stock_quantity);

        if (!current.product.allow_fractional_quantity) {
            finalQty = Math.round(finalQty);
        }

        if (finalQty <= 0) {
            this.remove(medId);
            return;
        }

        this.cart.update(items => items.map(i => {
            if (i.product.id !== medId) return i;
            const q = finalQty;
            return { ...i, quantity: q, lineTotal: i.product.selling_price * q };
        }));
    }

    remove(medId: number): void {
        this.cart.update(items => items.filter(i => i.product.id !== medId));
    }

    clear(): void {
        this.cart.set([]);
    }

    /** Remplace tout le panier (ex. rechargement d'une vente à modifier). */
    replaceAll(items: CartItem[]): void {
        this.cart.set(items);
    }
}
