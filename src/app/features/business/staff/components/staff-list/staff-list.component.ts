import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { StaffMember, StaffRoleOption } from '../../../models';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staff-list.component.html',
})
export class StaffListComponent {
  staff = input.required<StaffMember[]>();
  roles = input.required<StaffRoleOption[]>();
  isLoading = input.required<boolean>();
  isSaving = input.required<boolean>();
  currentUserId = input<number | undefined>();

  edit = output<StaffMember>();
  toggleStatus = output<StaffMember>();
  permissions = output<StaffMember>();

  getRoleLabel(value: string): string {
    if (!value) return '—';
    return this.roles().find((r) => r.value === value)?.label ?? value;
  }
}




