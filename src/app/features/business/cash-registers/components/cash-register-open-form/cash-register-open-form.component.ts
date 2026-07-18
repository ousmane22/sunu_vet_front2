import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-cash-register-open-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './cash-register-open-form.component.html',
})
export class CashRegisterOpenFormComponent {
    openForm = input.required<FormGroup>();
    isSubmitting = input<boolean>(false);
    submit = output<void>();
}




