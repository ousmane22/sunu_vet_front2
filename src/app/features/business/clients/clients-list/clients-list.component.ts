import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FormatPricePipe } from '../../../../core/pipes';
import { ClientService } from '../../services/client.service';
import { AddPaymentModalComponent, type AddPaymentPayload } from '../../../../shared/components/add-payment-modal/add-payment-modal.component';
import { ClientFormModalComponent } from './components/client-form-modal.component';
import { ClientDetailSlideComponent } from '../client-detail-slide/client-detail-slide.component';
import type { Client } from '../../models';
import { SunuDialogService } from '../../../../shared/services/sunu-dialog.service';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormatPricePipe,
    AddPaymentModalComponent,
    ClientFormModalComponent,
    ClientDetailSlideComponent,
  ],
  templateUrl: './clients-list.component.html',
})
export class ClientsListComponent implements OnInit {
  private clientService = inject(ClientService);
  private dialog = inject(SunuDialogService);

  clients = signal<Client[]>([]);
  isLoading = signal(true);
  searchControl = new FormControl('', { nonNullable: true });
  filteredCount = computed(() => this.clients().length);

  showFormModal = signal(false);
  editingClient = signal<Client | null>(null);

  clientForPayment = signal<Client | null>(null);
  isSubmittingPayment = signal(false);

  detailsClientId = signal<number | null>(null);

  hasDebt(amount: number | null | undefined): boolean {
    return Math.round(Number(amount) || 0) > 0;
  }

  ngOnInit(): void {
    this.loadClients();
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadClients());
  }

  loadClients(): void {
    this.isLoading.set(true);
    this.clientService.getAll(this.searchControl.value || undefined).subscribe({
      next: (res) => {
        this.clients.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openCreate(): void {
    this.editingClient.set(null);
    this.showFormModal.set(true);
  }

  openEdit(c: Client): void {
    this.editingClient.set(c);
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.editingClient.set(null);
  }

  onClientSaved(client: Client): void {
    this.closeFormModal();

    if (this.searchControl.value) {
      this.loadClients();
      return;
    }

    const isEdit = this.clients().some((c) => c.id === client.id);
    if (isEdit) {
      this.clients.update((list) => list.map((c) => (c.id === client.id ? { ...c, ...client } : c)));
    } else {
      this.clients.update((list) => [client, ...list]);
    }

    // Rafraîchir le slide si ouvert sur ce client
    if (this.detailsClientId() === client.id) {
      this.detailsClientId.set(null);
      queueMicrotask(() => this.detailsClientId.set(client.id));
    }
  }

  async deleteClient(c: Client): Promise<void> {
    const confirmed = await this.dialog.confirm(`Supprimer le client « ${c.name} » ?`, {
      title: 'Supprimer le client',
      destructive: true,
      confirmText: 'Supprimer',
    });
    if (!confirmed) return;

    this.clientService.delete(c.id).subscribe({
      next: () => {
        this.clients.update((list) => list.filter((x) => x.id !== c.id));
        if (this.detailsClientId() === c.id) this.closeDetails();
      },
      error: async (err) => {
        await this.dialog.alert(err.error?.message ?? 'Erreur lors de la suppression.', {
          type: 'danger',
          title: 'Erreur',
        });
      },
    });
  }

  openDetails(c: Client): void {
    this.detailsClientId.set(c.id);
  }

  closeDetails(): void {
    this.detailsClientId.set(null);
  }

  onClientUpdatedFromSlide(client: Client): void {
    this.clients.update((list) => list.map((c) => (c.id === client.id ? { ...c, ...client } : c)));
  }

  onClientDeletedFromSlide(id: number): void {
    this.clients.update((list) => list.filter((c) => c.id !== id));
    this.closeDetails();
  }

  onEditFromSlide(client: Client): void {
    this.openEdit(client);
  }

  openPaymentModal(c: Client): void {
    if (!this.hasDebt(c.balance_due)) return;
    this.clientForPayment.set(c);
  }

  closePaymentModal(): void {
    this.clientForPayment.set(null);
  }

  onPaymentSubmit(payload: AddPaymentPayload): void {
    const client = this.clientForPayment();
    if (!client || this.isSubmittingPayment()) return;
    this.isSubmittingPayment.set(true);
    this.clientService.addPayment(client.id, {
      amount: payload.amount,
      payment_method: payload.payment_method,
      note: payload.note,
    }).subscribe({
      next: (res) => {
        this.clients.update((list) => list.map((x) => (x.id === client.id ? res.data : x)));
        this.isSubmittingPayment.set(false);
        this.closePaymentModal();
      },
      error: async (err) => {
        await this.dialog.alert(err.error?.message ?? 'Erreur paiement.', {
          type: 'danger',
          title: 'Erreur',
        });
        this.isSubmittingPayment.set(false);
      },
    });
  }
}
