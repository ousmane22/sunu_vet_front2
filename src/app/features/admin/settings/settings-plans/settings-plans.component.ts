import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, SubscriptionPlanDetail } from '../../services/settings.service';
import { ModalService } from '../../../../core/services/modal.service';

const M_PLAN_CREATE = 'plan-create';
const M_PLAN_EDIT = 'plan-edit';

@Component({
  selector: 'app-settings-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-plans.component.html',
})
export class SettingsPlansComponent implements OnInit {
  private settingsService = inject(SettingsService);
  modalService = inject(ModalService);

  readonly M_PLAN_CREATE = M_PLAN_CREATE;
  readonly M_PLAN_EDIT = M_PLAN_EDIT;

  plans = signal<SubscriptionPlanDetail[]>([]);
  isLoading = signal(true);
  selectedPlan = signal<SubscriptionPlanDetail | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.settingsService.getPlans().subscribe({
      next: (res) => {
        this.plans.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openCreate() {
    this.selectedPlan.set(null);
    this.modalService.open(M_PLAN_CREATE);
  }

  openEdit(plan: SubscriptionPlanDetail) {
    this.selectedPlan.set(plan);
    this.modalService.open(M_PLAN_EDIT);
  }

  toggleStatus(plan: SubscriptionPlanDetail) {
    this.settingsService.togglePlanStatus(plan.id).subscribe({
      next: () => this.load(),
    });
  }

  deletePlan(plan: SubscriptionPlanDetail) {
    if (!confirm(`Supprimer le plan "${plan.name}" définitivement ?`)) return;
    this.settingsService.deletePlan(plan.id).subscribe({
      next: () => this.load(),
      error: (err: any) => alert(err.error?.message || 'Erreur lors de la suppression.'),
    });
  }

  onSaved() {
    this.modalService.close(M_PLAN_CREATE);
    this.modalService.close(M_PLAN_EDIT);
    this.load();
  }
}




