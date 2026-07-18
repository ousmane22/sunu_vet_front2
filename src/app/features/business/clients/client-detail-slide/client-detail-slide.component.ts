import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailSlideOverComponent } from '../../../../shared/components/detail-slide-over/detail-slide-over.component';
import { FormatPricePipe, FormatDatePipe } from '../../../../core/pipes';
import { ClientService } from '../../services/client.service';
import type { Client, ClientDetail } from '../../models';

type TabId = 'ventes' | 'consultations' | 'montant';

@Component({
  selector: 'app-client-detail-slide',
  standalone: true,
  imports: [
    CommonModule,
    DetailSlideOverComponent,
    FormatPricePipe,
    FormatDatePipe,
  ],
  templateUrl: './client-detail-slide.component.html',
})
export class ClientDetailSlideComponent {
  private clientService = inject(ClientService);

  /** ID du client à afficher ; null = slide fermé. */
  clientId = input<number | null>(null);

  closed = output<void>();
  updated = output<Client>();
  deleted = output<number>();
  editRequested = output<Client>();
  payRequested = output<Client>();

  client = signal<ClientDetail | null>(null);
  isLoading = signal(false);
  activeTab = signal<TabId>('ventes');

  sales = computed(() => this.client()?.sales ?? []);
  consultations = computed(() => this.client()?.consultations ?? []);
  totalGenerated = computed(() => this.client()?.total_generated ?? 0);

  constructor() {
    effect(() => {
      const id = this.clientId();
      if (id == null) {
        this.client.set(null);
        this.activeTab.set('ventes');
        return;
      }
      this.loadClient(id);
    });
  }

  hasDebt(amount: number | null | undefined): boolean {
    return Math.round(Number(amount) || 0) > 0;
  }

  loadClient(id: number): void {
    this.isLoading.set(true);
    this.clientService.getOne(id).subscribe({
      next: (res) => {
        this.client.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.client.set(null);
        this.isLoading.set(false);
      },
    });
  }

  setTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  close(): void {
    this.closed.emit();
  }

  requestEdit(): void {
    const c = this.client();
    if (!c) return;
    this.close();
    this.editRequested.emit(c);
  }

  requestPay(): void {
    const c = this.client();
    if (!c || !this.hasDebt(c.balance_due)) return;
    this.close();
    this.payRequested.emit(c);
  }

  deleteClient(): void {
    const c = this.client();
    if (!c || !confirm(`Supprimer le client « ${c.name} » ?`)) return;
    this.clientService.delete(c.id).subscribe({
      next: () => {
        this.deleted.emit(c.id);
        this.close();
      },
      error: (err) => alert(err.error?.message ?? 'Erreur lors de la suppression.'),
    });
  }

  statusLabel(status: string): string {
    if (status === 'completed') return 'Réglée';
    if (status === 'partial') return 'Partiel';
    return 'Annulée';
  }

  statusClass(status: string): string {
    if (status === 'completed') return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    if (status === 'partial') return 'bg-amber-100 text-amber-900 border-amber-300';
    return 'bg-gray-100 text-black border-gray-300';
  }
}
