import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessService } from '../../../services/business.service';
import { ModalService } from '../../../../../core/services/modal.service';
import { Business, User } from '../../../models';
import { AdminModalComponent } from '../../admin-modal/admin-modal.component';

const M_ADM = 'business-adm';
const M_ADM_EDIT = 'business-adm-edit';

@Component({
  selector: 'app-business-detail-admins',
  standalone: true,
  imports: [CommonModule, AdminModalComponent],
  templateUrl: './business-detail-admins.component.html',
})
export class BusinessDetailAdminsComponent {
  private businessService = inject(BusinessService);
  modalService = inject(ModalService);

  business = input.required<Business>();
  refreshed = output<void>();

  readonly M_ADM = M_ADM;
  readonly M_ADM_EDIT = M_ADM_EDIT;
  selectedAdmin = signal<User | null>(null);

  onSaved(modal: string) {
    this.modalService.close(modal);
    this.refreshed.emit();
  }

  openEditAdmin(user: User) {
    this.selectedAdmin.set(user);
    this.modalService.open(M_ADM_EDIT);
  }

  toggleAdminStatus(userId: number) {
    const business = this.business();
    this.businessService.toggleAdminStatus(business.id, userId).subscribe({
      next: () => this.refreshed.emit(),
    });
  }

  deleteAdmin(userId: number) {
    if (!confirm('Supprimer cet administrateur ?')) return;
    const business = this.business();
    this.businessService.deleteAdmin(business.id, userId).subscribe({
      next: () => this.refreshed.emit(),
    });
  }
}




