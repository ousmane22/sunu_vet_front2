import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, RoleDetail, PermissionDetail } from '../../services/settings.service';
import { RolePermissionsModalComponent } from '../modals/role-permissions-modal/role-permissions-modal.component';
import { SunuDialogService } from '../../../../shared/services/sunu-dialog.service';

@Component({
  selector: 'app-settings-roles',
  standalone: true,
  imports: [CommonModule, RolePermissionsModalComponent],
  templateUrl: './settings-roles.component.html',
})
export class SettingsRolesComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private dialog = inject(SunuDialogService);

  roles = signal<RoleDetail[]>([]);
  permissions = signal<PermissionDetail[]>([]);
  isLoading = signal(true);
  selectedRole = signal<RoleDetail | null>(null);

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.isLoading.set(true);
    this.settingsService.getRoles().subscribe((rolesRes) => {
      this.roles.set(rolesRes.data);
      this.settingsService.getPermissions().subscribe((permsRes) => {
        this.permissions.set(permsRes.data);
        this.isLoading.set(false);
      });
    });
  }

  openPermissionsModal(role: RoleDetail) {
    this.selectedRole.set(role);
  }

  closeModal() {
    this.selectedRole.set(null);
  }

  onPermissionsSaved() {
    this.closeModal();
    this.loadAll();
  }

  async deleteRole(role: RoleDetail) {
    const confirmed = await this.dialog.confirm(`Supprimer le rôle « ${role.name} » ?`, {
      title: 'Supprimer le rôle',
      destructive: true,
      confirmText: 'Supprimer',
    });
    if (!confirmed) return;

    this.settingsService.deleteRole(role.id).subscribe({
      next: () => this.loadAll(),
      error: async (err: any) => {
        await this.dialog.alert(err.error?.message || 'Erreur', { type: 'danger', title: 'Erreur' });
      },
    });
  }

  async deletePermission(perm: PermissionDetail) {
    const confirmed = await this.dialog.confirm(`Supprimer la permission « ${perm.name} » ?`, {
      title: 'Supprimer la permission',
      destructive: true,
      confirmText: 'Supprimer',
    });
    if (!confirmed) return;

    this.settingsService.deletePermission(perm.id).subscribe({
      next: () => this.loadAll(),
    });
  }
}




