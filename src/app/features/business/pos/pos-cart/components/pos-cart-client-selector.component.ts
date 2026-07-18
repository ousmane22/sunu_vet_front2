import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { FormatPricePipe } from '../../../../../core/pipes';
import type { Client } from '../../../models';

@Component({
    selector: 'app-pos-cart-client-selector',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormatPricePipe],
    host: { 'class': 'block w-full' },
    templateUrl: './pos-cart-client-selector.component.html',
})
export class PosCartClientSelectorComponent {
    selectedClient = input<Client | null>(null);
    searchResults = input<Client[]>([]);
    showDropdown = input<boolean>(false);
    showCreateForm = input<boolean>(false);
    isCreating = input<boolean>(false);
    createError = input<string | null>(null);

    showEditForm = input<boolean>(false);
    editForm = input<FormGroup | null>(null);
    isSavingEdit = input<boolean>(false);
    editError = input<string | null>(null);
    
    searchControl = input.required<FormControl>();
    createForm = input.required<FormGroup>();

    select = output<Client>();
    clear = output<void>();
    /** Ouvrir le formulaire de modification du client sélectionné. */
    edit = output<void>();
    saveEdit = output<void>();
    cancelEdit = output<void>();
    openCreate = output<void>();
    cancelCreate = output<void>();
    saveNew = output<void>();
    dropdownVisible = output<boolean>();

    onSearchFocus(): void {
        this.dropdownVisible.emit(this.searchResults().length > 0);
    }

    onSearchBlur(event: FocusEvent): void {
        if (!event.relatedTarget) {
            this.dropdownVisible.emit(false);
        }
    }
}
