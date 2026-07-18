import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, RoleDetail, PermissionDetail } from '../../../services/settings.service';

@Component({
  selector: 'app-role-permissions-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-permissions-modal.component.html',
})
export class RolePermissionsModalComponent implements OnInit {
  private settingsService = inject(SettingsService);

  role = input.required<RoleDetail>();
  allPermissions = input.required<PermissionDetail[]>();
  closed = output<void>();
  saved = output<void>();

  selectedPermissionNames = signal<string[]>([]);
  isSaving = signal(false);

  ngOnInit() {
    // Pré-sélectionner les permissions déjà attribuées au rôle
    const currentPermissionNames = this.role().permissions.map(p => p.name);
    this.selectedPermissionNames.set(currentPermissionNames);
  }

  togglePermission(permissionName: string) {
    const current = this.selectedPermissionNames();
    if (current.includes(permissionName)) {
      this.selectedPermissionNames.set(current.filter(name => name !== permissionName));
    } else {
      this.selectedPermissionNames.set([...current, permissionName]);
    }
  }

  isSelected(permissionName: string): boolean {
    return this.selectedPermissionNames().includes(permissionName);
  }

  save() {
    this.isSaving.set(true);
    const payload = {
      name: this.role().name,
      permissions: this.selectedPermissionNames(),
    };

    this.settingsService.updateRole(this.role().id, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.isSaving.set(false);
        alert(err.error?.message || 'Erreur lors de la mise à jour');
      },
    });
  }

  close() {
    this.closed.emit();
  }
}




