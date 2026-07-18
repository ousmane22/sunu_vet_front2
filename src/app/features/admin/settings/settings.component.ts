import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsPlansComponent } from './settings-plans/settings-plans.component';
import { SettingsRolesComponent } from './settings-roles/settings-roles.component';

export type SettingsTabId = 'plans' | 'roles' | 'general';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, SettingsPlansComponent, SettingsRolesComponent],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  activeTab = signal<SettingsTabId>('plans');

  tabs: { id: SettingsTabId; label: string; icon: string }[] = [
    { id: 'plans', label: 'Plans d\'abonnement', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'roles', label: 'Rôles & Permissions', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'general', label: 'Général', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];
}




