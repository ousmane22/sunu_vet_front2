import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SETTINGS_TABS, SettingsTab } from './business-settings.constants';
import { GeneralSettingsComponent } from './components/general-settings.component';
import { RolesSettingsComponent } from './components/roles-settings.component';
import { BillingSettingsComponent } from './components/billing-settings.component';
import { SubscriptionSettingsComponent } from './components/subscription-settings.component';

@Component({
  selector: 'app-business-settings',
  standalone: true,
  imports: [CommonModule, GeneralSettingsComponent, RolesSettingsComponent, BillingSettingsComponent, SubscriptionSettingsComponent],
  templateUrl: './business-settings.component.html',
})
export class BusinessSettingsComponent implements OnInit {
  TABS = SETTINGS_TABS;
  activeTab = signal<SettingsTab>(SETTINGS_TABS.GENERAL);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['tab'] === 'subscription') {
        this.activeTab.set(SETTINGS_TABS.SUBSCRIPTION);
      }
    });
  }

  setTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }
}




