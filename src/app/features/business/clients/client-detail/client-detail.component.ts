import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormatPricePipe, FormatDatePipe } from '../../../../core/pipes';
import { ClientService } from '../../services/client.service';
import { AddPaymentModalComponent, type AddPaymentPayload } from '../../../../shared/components/add-payment-modal/add-payment-modal.component';
import type { ClientDetail } from '../../models';
import { SunuDialogService } from '../../../../shared/services/sunu-dialog.service';

type TabId = 'ventes' | 'consultations' | 'montant';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FormatPricePipe,
    FormatDatePipe,
    AddPaymentModalComponent,
  ],
  templateUrl: './client-detail.component.html',
})
export class ClientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private dialog = inject(SunuDialogService);

  client = signal<ClientDetail | null>(null);
  isLoading = signal(true);
  activeTab = signal<TabId>('ventes');

  /** Modal édition */
  showEditModal = signal(false);
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    email: ['', [Validators.email]],
    address: [''],
    notes: [''],
  });
  isSubmitting = signal(false);
  formError = signal<string | null>(null);

  /** Modal paiement partiel */
  showPaymentModal = signal(false);
  isSubmittingPayment = signal(false);

  sales = computed(() => this.client()?.sales ?? []);
  payments = computed(() => this.client()?.payments ?? []);
  consultations = computed(() => this.client()?.consultations ?? []);
  totalGenerated = computed(() => this.client()?.total_generated ?? 0);

  /** True si le client a une dette (montant arrondi > 0). */
  hasDebt(amount: number | null | undefined): boolean {
    return Math.round(Number(amount) || 0) > 0;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loadClient(+id);
  }

  loadClient(id: number): void {
    this.isLoading.set(true);
    this.clientService.getOne(id).subscribe({
      next: (res) => {
        this.client.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  openEdit(): void {
    const c = this.client();
    if (!c) return;
    this.form.patchValue({
      name: c.name,
      phone: c.phone ?? '',
      email: c.email ?? '',
      address: c.address ?? '',
      notes: c.notes ?? '',
    });
    this.formError.set(null);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.formError.set(null);
  }

  submitEdit(): void {
    this.formError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const c = this.client();
    if (!c) return;
    this.isSubmitting.set(true);
    this.clientService.update(c.id, this.form.getRawValue()).subscribe({
      next: (res) => {
        this.client.update((prev) => (prev ? { ...prev, ...res.data } : null));
        this.isSubmitting.set(false);
        this.closeEditModal();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.formError.set(err.error?.message ?? 'Erreur lors de la mise à jour.');
      },
    });
  }

  async deleteClient(): Promise<void> {
    const c = this.client();
    if (!c) return;

    const confirmed = await this.dialog.confirm(`Supprimer le client « ${c.name} » ?`, {
      title: 'Supprimer le client',
      destructive: true,
      confirmText: 'Supprimer',
    });
    if (!confirmed) return;

    this.clientService.delete(c.id).subscribe({
      next: () => this.router.navigate(['/business/clients']),
      error: async (err) => {
        await this.dialog.alert(err.error?.message ?? 'Erreur lors de la suppression.', {
          type: 'danger',
          title: 'Erreur',
        });
      },
    });
  }

  openPaymentModal(): void {
    const c = this.client();
    if (c && this.hasDebt(c.balance_due)) this.showPaymentModal.set(true);
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
  }

  onPaymentSubmit(payload: AddPaymentPayload): void {
    const c = this.client();
    if (!c || this.isSubmittingPayment()) return;
    this.isSubmittingPayment.set(true);
    this.clientService.addPayment(c.id, {
      amount: payload.amount,
      payment_method: payload.payment_method,
      note: payload.note,
    }).subscribe({
      next: () => {
        this.isSubmittingPayment.set(false);
        this.closePaymentModal();
        this.loadClient(c.id);
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
