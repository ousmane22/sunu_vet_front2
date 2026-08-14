import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BusinessService } from '../../services/business.service';
import { Business, PaginatedResponse } from '../../models';
import { BusinessModalComponent } from '../business-modal/business-modal.component';
import { ModalService } from '../../../../core/services/modal.service';
import { AuthService } from '../../../auth/services/auth.service';

const MODAL_CREATE = 'business-create';
const MODAL_EDIT = 'business-edit';

@Component({
  selector: 'app-business-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BusinessModalComponent],
  templateUrl: './business-list.component.html',
  styleUrl: './business-list.component.scss',
})
export class BusinessListComponent implements OnInit {
  private businessService = inject(BusinessService);
  private authService = inject(AuthService);
  modalService = inject(ModalService);

  readonly MODAL_CREATE = MODAL_CREATE;
  readonly MODAL_EDIT = MODAL_EDIT;

  businessesPaginator = signal<PaginatedResponse<Business> | null>(null);
  isLoading = signal<boolean>(false);
  selectedBusiness = signal<Business | null>(null);
  searchQuery = signal('');
  connectingId = signal<number | null>(null);
  connectError = signal<string | null>(null);

  filteredBusinesses = computed(() => {
    const paginator = this.businessesPaginator();
    if (!paginator) return [];
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return paginator.data;
    return paginator.data.filter((b) =>
      [b.name, b.email, b.phone, b.city, b.business_type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  });

  totalCount = computed(() => this.businessesPaginator()?.total ?? 0);

  activeOnPage = computed(
    () => this.businessesPaginator()?.data.filter((b) => b.is_active).length ?? 0
  );

  pendingOnPage = computed(
    () => this.businessesPaginator()?.data.filter((b) => !b.is_active).length ?? 0
  );

  ngOnInit() {
    this.loadBusinesses(1);
  }

  loadBusinesses(page: number) {
    this.isLoading.set(true);
    this.businessService.getBusinesses(page).subscribe({
      next: (res) => {
        this.businessesPaginator.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openCreate() {
    this.selectedBusiness.set(null);
    this.modalService.open(MODAL_CREATE);
  }

  openEdit(business: Business) {
    this.selectedBusiness.set(business);
    this.modalService.open(MODAL_EDIT);
  }

  onSaved() {
    this.modalService.close(MODAL_CREATE);
    this.modalService.close(MODAL_EDIT);
    this.loadBusinesses(this.businessesPaginator()?.current_page ?? 1);
  }

  toggleStatus(business: Business) {
    const msg = `Voulez-vous vraiment ${business.is_active ? 'désactiver' : 'activer'} l'entreprise ${business.name} ?`;
    if (!confirm(msg)) return;

    this.businessService.toggleStatus(business.id).subscribe({
      next: (res) => {
        const current = this.businessesPaginator();
        if (!current) return;
        const idx = current.data.findIndex((c) => c.id === business.id);
        if (idx !== -1) {
          current.data[idx] = res.data;
          this.businessesPaginator.set({ ...current, data: [...current.data] });
        }
      },
    });
  }

  businessTypeLabel(type?: string): string {
    if (type === 'veterinary') return 'Clinique vétérinaire';
    if (type === 'retail') return 'Pharmacie';
    return type || '—';
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
  }

  connectAsBusiness(business: Business) {
    if (!business.is_active || this.connectingId()) return;

    this.connectError.set(null);
    this.connectingId.set(business.id);

    this.authService.impersonateBusiness(business.id).subscribe({
      error: (err) => {
        this.connectingId.set(null);
        const msg =
          err?.error?.errors?.business?.[0]
          ?? err?.error?.message
          ?? 'Impossible d\'accéder à cette entreprise.';
        this.connectError.set(msg);
      },
    });
  }
}
