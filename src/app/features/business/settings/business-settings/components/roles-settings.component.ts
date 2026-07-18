import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessRolesService } from '../../../services/business-roles.service';
import { BusinessStrategyService } from '../../../../../core/services/business-strategy.service';
import type { BusinessRole, PermissionGroup } from '../../../models';

@Component({
    selector: 'app-business-roles-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    @if (errorMessage()) {
    <div class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm">
        {{ errorMessage() }}
    </div>
    }
    @if (successMessage()) {
    <div class="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-800 text-sm">
        {{ successMessage() }}
    </div>
    }
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <h2 class="text-base font-bold text-gray-900">Rôles personnalisés</h2>
            <button type="button" (click)="openCreateRole()"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700">
                Créer un rôle
            </button>
        </div>
        @if (rolesLoading()) {
        <div class="flex justify-center py-12">
            <svg class="animate-spin h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
        </div>
        } @else {
        <div class="overflow-x-auto">
            @if (roles().length === 0) {
            <p class="p-6 text-gray-500 text-sm">Aucun rôle personnalisé. Créez-en un pour attribuer des permissions à
                votre personnel.</p>
            } @else {
            <table class="w-full text-left">
                <thead class="bg-gray-50 text-gray-600 text-xs font-medium uppercase tracking-wider">
                    <tr>
                        <th class="px-6 py-3">Nom</th>
                        <th class="px-6 py-3">Permissions</th>
                        <th class="px-6 py-3 w-28">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @for (r of roles(); track r.id) {
                    <tr class="hover:bg-gray-50/50">
                        <td class="px-6 py-4 font-medium text-gray-900">{{ r.name }}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">
                            @if (r.permissions && r.permissions.length > 0) {
                            <span class="inline-flex flex-wrap gap-1">
                                @for (p of r.permissions; track p.id) {
                                <span class="px-2 py-0.5 bg-gray-100 rounded text-xs">{{ p.label || p.name }}</span>
                                }
                            </span>
                            } @else {
                            <span class="text-gray-400">—</span>
                            }
                        </td>
                        <td class="px-6 py-4 flex gap-2">
                            <button type="button" (click)="openEditRole(r)"
                                class="text-primary-600 hover:text-primary-700 text-sm font-medium">Modifier</button>
                            <button type="button" (click)="deleteRole(r)"
                                class="text-red-600 hover:text-red-700 text-sm font-medium">Supprimer</button>
                        </td>
                    </tr>
                    }
                </tbody>
            </table>
            }
        </div>
        }
    </div>

    <!-- Modal formulaire rôle -->
    @if (roleFormOpen()) {
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-100">
                <h3 class="text-lg font-bold text-gray-900">{{ editingRoleId() ? 'Modifier le rôle' : 'Nouveau rôle' }}
                </h3>
            </div>
            <form [formGroup]="roleForm" (ngSubmit)="saveRole()" class="p-6 space-y-4">
                <div>
                    <label for="role-name" class="block text-sm font-medium text-gray-700 mb-1">Nom du rôle</label>
                    <input id="role-name" type="text" formControlName="name"
                        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        placeholder="Ex. Réceptionniste" />
                    @if (roleForm.get('name')?.invalid && roleForm.get('name')?.touched) {
                    <p class="mt-1 text-xs text-red-600">Requis.</p>
                    }
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                    <p class="text-xs text-gray-500 mb-3">Cochez les permissions à attribuer à ce rôle.</p>
                    <div class="space-y-4 max-h-64 overflow-y-auto pr-2">
                        @for (group of availablePermissionsGrouped(); track group.group_key) {
                        <div class="border border-gray-100 rounded-xl overflow-hidden">
                            <div class="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                {{ group.group_label }}
                            </div>
                            <div class="p-3 flex flex-wrap gap-x-4 gap-y-2">
                                @for (perm of group.permissions; track perm.id) {
                                <label class="inline-flex items-center gap-2 cursor-pointer min-w-[180px]">
                                    <input type="checkbox" [checked]="hasPermission(perm.id)"
                                        (change)="togglePermission(perm.id)"
                                        class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    <span class="text-sm text-gray-700">{{ perm.label || perm.name }}</span>
                                </label>
                                }
                            </div>
                        </div>
                        }
                    </div>
                </div>
                <div class="flex justify-end gap-3 pt-2">
                    <button type="button" (click)="closeRoleForm()"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">
                        Annuler
                    </button>
                    <button type="submit" [disabled]="roleForm.invalid || rolesSaving()"
                        class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50">
                        {{ editingRoleId() ? 'Enregistrer' : 'Créer' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
    }
  `
})
export class RolesSettingsComponent implements OnInit {
    private fb = inject(FormBuilder);
    private rolesService = inject(BusinessRolesService);
    private strategyService = inject(BusinessStrategyService);

    roles = signal<BusinessRole[]>([]);
    availablePermissionsGrouped = signal<PermissionGroup[]>([]);
    rolesLoading = signal(false);
    rolesSaving = signal(false);
    roleFormOpen = signal(false);
    editingRoleId = signal<number | null>(null);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    roleForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(255)]],
        permission_ids: [[] as number[]],
    });

    ngOnInit(): void {
        this.loadRoles();
        this.loadPermissions();
    }

    loadRoles(): void {
        this.rolesLoading.set(true);
        this.rolesService.getRoles().subscribe({
            next: (res) => {
                this.roles.set(res.data);
                this.rolesLoading.set(false);
            },
            error: () => {
                this.rolesLoading.set(false);
            },
        });
    }

    loadPermissions(): void {
        this.rolesService.getAvailablePermissions().subscribe({
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
                }
                this.availablePermissionsGrouped.set(permissions);
            },
            error: () => { },
        });
    }

    openCreateRole(): void {
        this.editingRoleId.set(null);
        this.roleForm.reset({ name: '', permission_ids: [] });
        this.roleFormOpen.set(true);
    }

    openEditRole(role: BusinessRole): void {
        this.editingRoleId.set(role.id);
        this.roleForm.patchValue({
            name: role.name,
            permission_ids: role.permission_ids ?? role.permissions?.map((p) => p.id) ?? [],
        });
        this.roleFormOpen.set(true);
    }

    closeRoleForm(): void {
        this.roleFormOpen.set(false);
        this.editingRoleId.set(null);
    }

    saveRole(): void {
        if (this.roleForm.invalid || this.rolesSaving()) return;
        const val = this.roleForm.getRawValue();
        const id = this.editingRoleId();
        this.rolesSaving.set(true);
        const payload = { name: val.name!, permission_ids: val.permission_ids ?? [] };
        const req = id
            ? this.rolesService.updateRole(id, payload)
            : this.rolesService.createRole(payload);
        req.subscribe({
            next: (res) => {
                if (id) {
                    this.roles.update((list) =>
                        list.map((r) => (r.id === id ? res.data : r))
                    );
                } else {
                    this.roles.update((list) => [...list, res.data]);
                }
                this.rolesSaving.set(false);
                this.closeRoleForm();
                this.successMessage.set(res.message ?? 'Rôle enregistré.');
            },
            error: (err) => {
                this.errorMessage.set(
                    err.error?.message ?? err.error?.errors
                        ? Object.values(err.error.errors).flat().join(' ')
                        : 'Erreur.'
                );
                this.rolesSaving.set(false);
            },
        });
    }

    deleteRole(role: BusinessRole): void {
        if (!confirm(`Supprimer le rôle « ${role.name} » ?`)) return;
        this.rolesService.deleteRole(role.id).subscribe({
            next: () => {
                this.roles.update((list) => list.filter((r) => r.id !== role.id));
                this.successMessage.set('Rôle supprimé.');
            },
            error: (err) => {
                this.errorMessage.set(err.error?.message ?? 'Impossible de supprimer.');
            },
        });
    }

    togglePermission(permId: number): void {
        const control = this.roleForm.get('permission_ids');
        const current: number[] = control?.value ?? [];
        const next = current.includes(permId)
            ? current.filter((id) => id !== permId)
            : [...current, permId];
        control?.setValue(next);
    }

    hasPermission(permId: number): boolean {
        const ids: number[] = this.roleForm.get('permission_ids')?.value ?? [];
        return ids.includes(permId);
    }
}




