import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, RoleDetail, PermissionDetail } from '../../services/settings.service';
import { RolePermissionsModalComponent } from '../modals/role-permissions-modal/role-permissions-modal.component';

@Component({
  selector: 'app-settings-roles',
  standalone: true,
  imports: [CommonModule, RolePermissionsModalComponent],
  templateUrl: './settings-roles.component.html',
})
export class SettingsRolesComponent implements OnInit {
  private settingsService = inject(SettingsService);

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

  deleteRole(role: RoleDetail) {
    if (!confirm(`Supprimer le rôle "${role.name}" ?`)) return;
    this.settingsService.deleteRole(role.id).subscribe({
      next: () => this.loadAll(),
      error: (err: any) => alert(err.error?.message || 'Erreur'),
    });
  }

  deletePermission(perm: PermissionDetail) {
    if (!confirm(`Supprimer la permission "${perm.name}" ?`)) return;
    this.settingsService.deletePermission(perm.id).subscribe({
      next: () => this.loadAll(),
    });
  }
}




