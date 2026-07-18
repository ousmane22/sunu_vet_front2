import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { FormatPricePipe } from '../../../../../core/pipes';

@Component({
    selector: 'app-pos-cart-summary',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormatPricePipe],
    host: { 'class': 'block w-full' },
    templateUrl: './pos-cart-summary.component.html',
})
export class PosCartSummaryComponent {
    subtotal = input.required<number>();
    discountAmount = input.required<number>();
    netAmount = input.required<number>();
    changeGiven = input.required<number>();
    amountDue = input.required<number>();
    isSubmitting = input.required<boolean>();
    canSubmit = input.required<boolean>();
    isPartial = input.required<boolean>();
    selectedClient = input<any | null>(null);

    discountTypeControl = input.required<FormControl>();
    discountValueControl = input.required<FormControl>();
    amountPaidControl = input.required<FormControl>();
    paymentMethodControl = input.required<FormControl>();

    finalize = output<void>();
    prefillExact = output<void>();
    setDiscountType = output<any>();
    setPaymentMethod = output<any>();
}
