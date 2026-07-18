import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { Business, PaginatedResponse } from '../../models';
import { BusinessModalComponent } from '../business-modal/business-modal.component';
import { ModalService } from '../../../../core/services/modal.service';

const MODAL_CREATE = 'business-create';
const MODAL_EDIT = 'business-edit';

@Component({
  selector: 'app-business-list',
  standalone: true,
  imports: [CommonModule, RouterLink, BusinessModalComponent],
  templateUrl: './business-list.component.html',
  styleUrl: './business-list.component.scss'
})
export class BusinessListComponent implements OnInit {
  private businessService = inject(BusinessService);
  modalService = inject(ModalService);

  readonly MODAL_CREATE = MODAL_CREATE;
  readonly MODAL_EDIT = MODAL_EDIT;

  businessesPaginator = signal<PaginatedResponse<Business> | null>(null);
  isLoading = signal<boolean>(false);
  selectedBusiness = signal<Business | null>(null);

  ngOnInit() { this.loadBusinesses(1); }

  loadBusinesses(page: number) {
    this.isLoading.set(true);
    this.businessService.getBusinesses(page).subscribe({
      next: (res) => { this.businessesPaginator.set(res); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
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
    this.loadBusinesses(1);
  }

  toggleStatus(business: Business) {
    const msg = `Voulez-vous vraiment ${business.is_active ? 'désactiver' : 'activer'} la entreprise ${business.name} ?`;
    if (confirm(msg)) {
      this.businessService.toggleStatus(business.id).subscribe({
        next: (res) => {
          const current = this.businessesPaginator();
          if (current) {
            const idx = current.data.findIndex(c => c.id === business.id);
            if (idx !== -1) {
              current.data[idx] = res.data;
              this.businessesPaginator.set({ ...current });
            }
          }
        }
      });
    }
  }
}




