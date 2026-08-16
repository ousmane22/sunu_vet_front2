import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessStaffService } from '../../services/business-staff.service';
import { AuthService } from '../../../auth/services/auth.service';
import { BusinessStrategyService } from '../../../../core/services/business-strategy.service';
import type { StaffMember, StaffRoleOption } from '../../models';

import { StaffListComponent } from '../components/staff-list/staff-list.component';
import { StaffFormModalComponent } from '../components/staff-form-modal/staff-form-modal.component';
import { StaffPermissionsModalComponent } from '../components/staff-permissions-modal/staff-permissions-modal.component';

@Component({
  selector: 'app-business-staff',
  standalone: true,
  imports: [CommonModule, StaffListComponent, StaffFormModalComponent, StaffPermissionsModalComponent],
  templateUrl: './business-staff.component.html',
})
export class BusinessStaffComponent implements OnInit {
  private staffService = inject(BusinessStaffService);
  private authService = inject(AuthService);
  private strategyService = inject(BusinessStrategyService);

  currentUser = this.authService.currentUser;

  staff = signal<StaffMember[]>([]);
  roles = signal<StaffRoleOption[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  showAddModal = signal(false);
  showEditModal = signal(false);
  showPermissionsModal = signal(false);
  editingMember = signal<StaffMember | null>(null);

  availablePermissions = signal<any[]>([]);

  ngOnInit(): void {
    this.loadRoles();
    this.loadStaff();
  }

  loadAvailablePermissions(): void {
    this.staffService.getAvailablePermissions().subscribe({
      next: (res) => {
        let permissions = res.data;
        if (!this.strategyService.isVet()) {
          // Filter out veterinary specific groups
          permissions = permissions.filter((g: any) => g.group_key !== 'consultations');
          
          // Map labels and filter permissions within groups
          permissions = permissions.map((g: any) => {
            let group_label = g.group_label;
            let group_permissions = g.permissions;

            if (g.group_key === 'pharmacy_stock') {
              group_label = 'Produits & Stock';
            }
            
            if (g.group_key === 'clients_animals') {
              group_label = 'Clients';
              group_permissions = group_permissions.filter((p: any) => !p.name.startsWith('animals.'));
            }
            
            if (g.group_key === 'dashboard') {
              group_permissions = group_permissions.filter((p: any) => p.name !== 'reports.consultations');
            }

            // Global term replacement in labels
            group_permissions = group_permissions.map((p: any) => {
              let label = p.label || p.name;
              label = label.replace(/médicament/gi, (match: string) => match[0] === 'M' ? 'Produit' : 'produit');
              return { ...p, label };
            });

            return {
              ...g,
              group_label,
              permissions: group_permissions
            };
          });
        } else {
          permissions = permissions.map((g: any) => {
            let group_label = g.group_label;
            let group_permissions = g.permissions;

            if (g.group_key === 'clients_animals') {
              group_label = 'Clients & Clinique';
            }

            group_permissions = group_permissions.map((p: any) => {
              let label = p.label || p.name;
              label = label
                .replace(/Clients & Animaux/g, 'Clients & Clinique')
                .replace(/animaux/gi, (match: string) => match[0] === 'A' ? 'Dossiers' : 'dossiers')
                .replace(/animal/gi, (match: string) => match[0] === match[0].toUpperCase() ? 'Dossier' : 'dossier');
              return { ...p, label };
            });

            return { ...g, group_label, permissions: group_permissions };
          });
        }
        this.availablePermissions.set(permissions);
      },
      error: () => this.availablePermissions.set([]),
    });
  }

  loadRoles(): void {
    this.staffService.getRoles().subscribe({
      next: (res) => this.roles.set(res.data),
      error: () => this.roles.set([]),
    });
  }

  loadStaff(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.staffService.getStaff().subscribe({
      next: (res) => {
        this.staff.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Erreur lors du chargement.');
        this.isLoading.set(false);
      },
    });
  }

  clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  openAddModal(): void {
    this.clearMessages();
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  onSubmitAdd(val: any): void {
    if (this.isSaving()) return;
    if (val.password !== val.password_confirmation) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }
    this.isSaving.set(true);
    this.clearMessages();
    this.staffService
      .createStaff({
        name: val.name!,
        email: val.email!,
        password: val.password!,
        password_confirmation: val.password_confirmation!,
        role: val.role!,
      })
      .subscribe({
        next: (res) => {
          this.staff.update((list) => [...list, res.data]);
          this.staffService.invalidateStaffCache();
          this.successMessage.set(res.message ?? 'Personnel ajouté.');
          this.isSaving.set(false);
          this.closeAddModal();
        },
        error: (err) => {
          let msg = 'Erreur.';
          if (err.error?.errors) {
            msg = Object.values(err.error.errors).flat().join(' ');
          } else if (err.error?.message) {
            msg = err.error.message;
          }
          this.errorMessage.set(msg);
          this.isSaving.set(false);
        },
      });
  }

  openEditModal(member: StaffMember): void {
    this.editingMember.set(member);
    this.clearMessages();
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingMember.set(null);
  }

  onSubmitEdit(val: any): void {
    const member = this.editingMember();
    if (!member || this.isSaving()) return;
    if (val.password && val.password !== val.password_confirmation) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }
    const payload: { name: string; email: string; role: string; password?: string; password_confirmation?: string } = {
      name: val.name!,
      email: val.email!,
      role: val.role!,
    };
    if (val.password) {
      payload.password = val.password;
      payload.password_confirmation = val.password_confirmation!;
    }
    this.isSaving.set(true);
    this.clearMessages();
    this.staffService
      .updateStaff(member.id, payload)
      .subscribe({
        next: (res) => {
          this.staff.update((list) => list.map((s) => (s.id === member.id ? res.data : s)));
          
          // Si c'est l'utilisateur actuel qui a été modifié, on met à jour son profil local
          if (member.id === this.currentUser()?.id) {
            this.authService.updateCurrentUser(res.data);
          }

          this.staffService.invalidateStaffCache();
          this.successMessage.set(res.message ?? 'Personnel mis à jour.');
          this.isSaving.set(false);
          this.closeEditModal();
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message ?? err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : 'Erreur.'
          );
          this.isSaving.set(false);
        },
      });
  }

  toggleStatus(member: StaffMember): void {
    if (this.isSaving()) return;
    this.isSaving.set(true);
    this.staffService.toggleStatus(member.id).subscribe({
      next: (res) => {
        this.staff.update((list) => list.map((s) => (s.id === member.id ? res.data : s)));
        this.staffService.invalidateStaffCache();
        this.successMessage.set(res.message ?? (res.data.is_active ? 'Personnel activé.' : 'Personnel désactivé.'));
        this.isSaving.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Erreur.');
        this.isSaving.set(false);
      },
    });
  }

  openPermissionsModal(member: StaffMember): void {
    this.editingMember.set(member);
    this.clearMessages();
    if (this.availablePermissions().length === 0) {
      this.loadAvailablePermissions();
    }
    this.showPermissionsModal.set(true);
  }

  closePermissionsModal(): void {
    this.showPermissionsModal.set(false);
    this.editingMember.set(null);
  }

  onSubmitPermissions(selectedPermissions: string[]): void {
    const member = this.editingMember();
    if (!member || this.isSaving()) return;

    this.isSaving.set(true);
    this.clearMessages();

    this.staffService.updatePermissions(member.id, selectedPermissions).subscribe({
      next: (res) => {
        this.staff.update((list) => list.map((s) => (s.id === member.id ? res.data : s)));
        
        // Si c'est l'utilisateur actuel qui a été modifié, on met à jour son profil local
        if (member.id === this.currentUser()?.id) {
          this.authService.updateCurrentUser(res.data as any);
        }

        this.staffService.invalidateStaffCache();
        this.successMessage.set(res.message ?? 'Permissions mises à jour.');
        this.isSaving.set(false);
        this.closePermissionsModal();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Erreur lors de la mise à jour des permissions.');
        this.isSaving.set(false);
      },
    });
  }
}




