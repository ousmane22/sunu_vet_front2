import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../../auth/services/auth.service';
import type { InventorySession } from '../../models';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inventory-list.component.html',
})
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  authService = inject(AuthService);

  readonly statusOptions = [
    { value: '', label: 'Tous' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Terminés' },
    { value: 'cancelled', label: 'Annulés' },
  ] as const;

  sessions = signal<InventorySession[]>([]);
  isLoading = signal(true);
  isStarting = signal(false);
  error = signal<string | null>(null);
  statusFilter = signal('');
  currentPage = signal(1);
  lastPage = signal(1);
  total = signal(0);
  hasInProgress = signal(false);
  inProgressSessionId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(page: number = 1): void {
    this.isLoading.set(true);
    this.error.set(null);
    const status = this.statusFilter() || undefined;
    this.inventoryService.list({ status, per_page: 15, page }).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        this.sessions.set(list);
        const m = res?.meta;
        if (m) {
          this.currentPage.set(m.current_page);
          this.lastPage.set(m.last_page);
          this.total.set(m.total);
          this.hasInProgress.set(m.has_in_progress ?? list.some((s) => s.status === 'in_progress'));
          this.inProgressSessionId.set(m.in_progress_session_id ?? null);
        } else {
          this.currentPage.set(page);
          this.lastPage.set(1);
          this.total.set(list.length);
          this.hasInProgress.set(list.some((s) => s.status === 'in_progress'));
          this.inProgressSessionId.set(null);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(this.extractErrorMessage(err));
        this.isLoading.set(false);
      },
    });
  }

  start(): void {
    if (this.hasInProgress()) return;
    this.isStarting.set(true);
    this.error.set(null);
    this.inventoryService.start().subscribe({
      next: (res) => {
        this.isStarting.set(false);
        if (res.data?.id) {
          this.router.navigate(['/business/inventory', res.data.id]);
          return;
        }
        this.load(1);
      },
      error: (err) => {
        this.error.set(this.extractErrorMessage(err) ?? 'Impossible de démarrer l\'inventaire.');
        this.isStarting.set(false);
        if (err.error?.message?.includes('déjà en cours')) {
          this.statusFilter.set('');
          this.load(1);
        }
      },
    });
  }

  setStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.load(1);
  }

  formatSessionId(id: number): string {
    return `#${id.toString().padStart(5, '0')}`;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      in_progress: 'bg-amber-100 text-amber-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-slate-100 text-slate-600',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }

  can(perm: string): boolean {
    return this.authService.hasPermission(perm);
  }

  private extractErrorMessage(err: { error?: { message?: string; errors?: Record<string, string[]> } }): string {
    const errors = err.error?.errors;
    if (errors?.['status']?.[0]) return errors['status'][0];
    return err.error?.message ?? 'Erreur lors du chargement.';
  }
}
