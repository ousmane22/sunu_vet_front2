import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, filter, finalize, map, skip, takeUntil } from 'rxjs/operators';
import { ConsultationService } from '../../services/consultation.service';
import { AuthService } from '../../../auth/services/auth.service';
import { AddPaymentModalComponent, type AddPaymentPayload } from '../../../../shared/components/add-payment-modal/add-payment-modal.component';
import { ConsultationsTableComponent } from './components/consultations-table.component';
import { ConsultationCreateModalComponent } from './components/consultation-create-modal.component';
import { ConsultationDetailComponent } from './components/consultation-detail.component';
import { FormatPricePipe } from '../../../../core/pipes';
import type { Consultation } from '../../models';
import { SunuDialogService } from '../../../../shared/services/sunu-dialog.service';
import { OpenRegisterPromptComponent } from '../../../../shared/components/open-register-prompt/open-register-prompt.component';
import { OpenRegisterPromptService } from '../../services/open-register-prompt.service';

type ConsultPeriod = 'today' | 'all' | 'custom';

@Component({
  selector: 'app-consultations-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AddPaymentModalComponent,
    ConsultationsTableComponent,
    ConsultationCreateModalComponent,
    ConsultationDetailComponent,
    FormatPricePipe,
    OpenRegisterPromptComponent,
  ],
  templateUrl: './consultations-list.component.html',
})
export class ConsultationsListComponent implements OnInit, OnDestroy {
  private consultationService = inject(ConsultationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(SunuDialogService);
  private registerPrompt = inject(OpenRegisterPromptService);
  private destroy$ = new Subject<void>();

  private static readonly listPath = '/business/consultations';

  readonly today = new Date().toISOString().slice(0, 10);

  can(perm: string): boolean {
    return this.authService.hasPermission(perm);
  }

  consultations = signal<Consultation[]>([]);
  isLoading = signal(true);

  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  totalCollected = signal(0);
  totalBilled = signal(0);

  selectedPeriod = signal<ConsultPeriod>('today');

  filterForm = this.fb.group({
    date: [this.today],
  });

  periodLabel = computed(() => {
    switch (this.selectedPeriod()) {
      case 'today': return "Aujourd'hui";
      case 'all': return 'Toutes';
      case 'custom': return this.filterForm.value.date || 'Par date';
    }
  });

  partialCount = computed(() =>
    this.consultations().filter((c) => c.status === 'partial').length
  );

  totalDue = computed(() =>
    this.consultations().reduce((sum, c) => sum + (c.amount_due ?? 0), 0)
  );

  completedCount = computed(() =>
    this.consultations().filter((c) => c.status === 'completed').length
  );

  showModal = signal(false);
  consultationToEdit = signal<Consultation | null>(null);

  selectedConsultation = signal<Consultation | null>(null);
  isLoadingDetail = signal(false);

  selectedForPayment = signal<Consultation | null>(null);
  isSubmittingPayment = signal(false);
  showRegisterPrompt = signal(false);

  ngOnInit(): void {
    this.registerPrompt.evaluatePrompt('consultations', (open) => this.showRegisterPrompt.set(open));
    this.registerPrompt.watchRegisterChanges('consultations', (open) => this.showRegisterPrompt.set(open))
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.loadConsultations();

    this.filterForm.valueChanges
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.selectedPeriod() === 'custom') this.loadConsultations(1);
      });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((e) => e.urlAfterRedirects.split('?')[0]),
        filter((url) => url === ConsultationsListComponent.listPath),
        skip(1),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.loadConsultations(this.currentPage()));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.registerPrompt.leavePage('consultations');
  }

  onOpenRegister(): void {
    this.showRegisterPrompt.set(false);
    this.registerPrompt.openRegisterPage('/business/consultations');
  }

  onPeriodChange(period: ConsultPeriod): void {
    this.selectedPeriod.set(period);
    if (period === 'today') {
      this.filterForm.patchValue({ date: this.today }, { emitEvent: false });
    } else if (period === 'all') {
      this.filterForm.patchValue({ date: '' }, { emitEvent: false });
    }
    this.loadConsultations(1);
  }

  enableCustomPeriod(): void {
    this.selectedPeriod.set('custom');
    if (!this.filterForm.value.date) {
      this.filterForm.patchValue({ date: this.today }, { emitEvent: false });
    }
    this.loadConsultations(1);
  }

  loadConsultations(page = 1): void {
    this.isLoading.set(true);
    const date =
      this.selectedPeriod() === 'all'
        ? undefined
        : this.filterForm.value.date || this.today;

    this.consultationService
      .getAll({ page, date })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          const list = Array.isArray(res?.data) ? res.data : [];
          this.consultations.set(list);
          const m = res?.meta;
          if (m) {
            this.currentPage.set(m.current_page);
            this.totalPages.set(m.last_page);
            this.totalItems.set(m.total);
          } else {
            this.currentPage.set(page);
            this.totalPages.set(1);
            this.totalItems.set(list.length);
          }
          this.totalCollected.set(res?.summary?.total_collected ?? 0);
          this.totalBilled.set(res?.summary?.total_amount ?? 0);
        },
        error: () => {
          this.consultations.set([]);
          this.totalCollected.set(0);
          this.totalBilled.set(0);
        },
      });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.loadConsultations(this.currentPage() + 1);
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.loadConsultations(this.currentPage() - 1);
  }

  openModal(): void {
    this.consultationToEdit.set(null);
    this.showModal.set(true);
  }

  openEditModal(c: Consultation): void {
    this.closeDetails();
    this.consultationToEdit.set(c);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.consultationToEdit.set(null);
  }

  onSaved(consultation: Consultation): void {
    this.closeModal();
    this.loadConsultations(this.currentPage());
  }

  openDetails(c: Consultation): void {
    this.selectedConsultation.set(null);
    this.isLoadingDetail.set(true);
    this.consultationService.getOne(c.id).subscribe({
      next: (res) => {
        this.selectedConsultation.set(res.data);
        this.isLoadingDetail.set(false);
      },
      error: () => this.isLoadingDetail.set(false),
    });
  }

  closeDetails(): void {
    this.selectedConsultation.set(null);
    this.isLoadingDetail.set(false);
  }

  async cancelConsultation(c: Consultation): Promise<void> {
    if (c.status === 'cancelled') return;
    const confirmed = await this.dialog.confirm('Annuler cette consultation ?', {
      title: 'Annuler la consultation',
      destructive: true,
    });
    if (!confirmed) return;
    this.consultationService.cancel(c.id).subscribe({
      next: () => {
        this.consultations.update((list) =>
          list.map((x) => (x.id === c.id ? { ...x, status: 'cancelled' as const } : x))
        );
        this.closeDetails();
      },
      error: async (err) => {
        await this.dialog.alert(err.error?.message ?? "Erreur lors de l'annulation", {
          type: 'danger',
          title: 'Erreur',
        });
      },
    });
  }

  openPaymentModal(consultation: Consultation): void {
    this.closeDetails();
    this.selectedForPayment.set(consultation);
  }

  closePaymentModal(): void {
    this.selectedForPayment.set(null);
  }

  onPaymentSubmit(payload: AddPaymentPayload): void {
    const consultation = this.selectedForPayment();
    if (!consultation || this.isSubmittingPayment()) return;
    this.isSubmittingPayment.set(true);
    this.consultationService.addPayment(consultation.id, {
      amount: payload.amount,
      payment_method: payload.payment_method,
    }).subscribe({
      next: (res) => {
        this.consultations.update((list) =>
          list.map((x) => (x.id === consultation.id ? res.data : x))
        );
        this.loadConsultations(this.currentPage());
        this.isSubmittingPayment.set(false);
        this.closePaymentModal();
      },
      error: async (err) => {
        await this.dialog.alert(err.error?.message ?? 'Erreur paiement', {
          type: 'danger',
          title: 'Erreur',
        });
        this.isSubmittingPayment.set(false);
      },
    });
  }
}
