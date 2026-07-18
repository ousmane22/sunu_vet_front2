import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { StaffMember } from '../../../models';

@Component({
  selector: 'app-staff-permissions-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staff-permissions-modal.component.html',
})
export class StaffPermissionsModalComponent {
  member = input.required<StaffMember>();
  availablePermissions = input.required<any[]>();
  isSaving = input.required<boolean>();

  save = output<string[]>();
  close = output<void>();

  rolePermissions = signal<string[]>([]);
  selectedPermissions = signal<string[]>([]);

  constructor() {
    effect(() => {
      const m = this.member();
      if (m) {
        this.rolePermissions.set(m.role_permissions || []);
        this.selectedPermissions.set(m.permissions || []);
      }
    });
  }

  togglePermission(perm: string): void {
    if (this.isRolePermission(perm)) return;

    const current = this.selectedPermissions();
    if (current.includes(perm)) {
      this.selectedPermissions.set(current.filter((p) => p !== perm));
    } else {
      this.selectedPermissions.set([...current, perm]);
    }
  }

  hasPermission(perm: string): boolean {
    return this.rolePermissions().includes(perm) || this.selectedPermissions().includes(perm);
  }
  
  isRolePermission(perm: string): boolean {
    return this.rolePermissions().includes(perm);
  }

  onSubmit(): void {
    if (this.isSaving()) return;
    this.save.emit(this.selectedPermissions());
  }
}




