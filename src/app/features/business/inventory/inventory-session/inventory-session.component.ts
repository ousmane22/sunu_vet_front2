import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { InventoryReportPdfService } from '../services/inventory-report-pdf.service';
import { PrintService } from '../../../../core/services/print.service';
import { AuthService } from '../../../auth/services/auth.service';
import type { InventorySession, InventoryLine } from '../../models';
import { SunuDialogService } from '../../../../shared/services/sunu-dialog.service';

@Component({
  selector: 'app-inventory-session',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './inventory-session.component.html',
})
export class InventorySessionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  private printService = inject(PrintService);
  private inventoryPdfService = inject(InventoryReportPdfService);
  private dialog = inject(SunuDialogService);
  authService = inject(AuthService);

  session = signal<InventorySession | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  isCompleting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  editedCounts = signal<Record<number, number | null>>({});

  sessionId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? parseInt(id, 10) : 0;
  });

  sessionDisplayId = computed(() => (this.session()?.id ?? 0).toString().padStart(5, '0'));

  linesWithEdit = computed(() => {
    const s = this.session();
    const counts = this.editedCounts();
    if (!s?.lines) return [];
    return s.lines.map((line) => ({
      ...line,
      editValue: counts[line.id] !== undefined ? counts[line.id] : line.quantity_counted,
    }));
  });

  hasChanges = computed(() => {
    const counts = this.editedCounts();
    return Object.keys(counts).length > 0;
  });

  uncountedLinesCount = computed(() => {
    const s = this.session();
    if (!s?.lines || s.status !== 'in_progress') return 0;
    const counts = this.editedCounts();
    return s.lines.filter((line) => {
      const edited = counts[line.id];
      const value = edited !== undefined ? edited : line.quantity_counted;
      return value === null || value === undefined;
    }).length;
  });

  canComplete = computed(() => {
    const s = this.session();
    return s?.status === 'in_progress' && this.authService.hasPermission('stock.inventory.validate');
  });

  totalLines = computed(() => this.session()?.lines?.length ?? 0);

  countedLinesCount = computed(() => {
    const s = this.session();
    if (!s?.lines) return 0;
    const counts = this.editedCounts();
    return s.lines.filter((line) => {
      const edited = counts[line.id];
      const value = edited !== undefined ? edited : line.quantity_counted;
      return value !== null && value !== undefined;
    }).length;
  });

  progressPercent = computed(() => {
    const total = this.totalLines();
    if (total === 0) return 0;
    return Math.round((this.countedLinesCount() / total) * 100);
  });

  linesWithDifference = computed(() => {
    const s = this.session();
    if (!s?.lines) return 0;
    return s.lines.filter((l) => l.quantity_difference != null && l.quantity_difference !== 0).length;
  });

  showDifferenceColumn(s: InventorySession): boolean {
    if (s.status === 'completed') return true;
    const lines = s.lines ?? [];
    return lines.some((line) => line.quantity_difference != null);
  }

  ngOnInit(): void {
    const id = this.sessionId();
    if (!id) {
      this.router.navigate(['/business/inventory']);
      return;
    }
    this.load(id);
  }

  load(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.inventoryService.get(id).subscribe({
      next: (res) => {
        this.session.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Session non trouvée.');
        this.isLoading.set(false);
      },
    });
  }

  parseCount(value: string): number | null {
    if (value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  printReport(): void {
    const s = this.session();
    if (s) this.printService.printInventoryReport(s);
  }

  downloadPdf(): void {
    const s = this.session();
    if (s) this.inventoryPdfService.exportSessionPdf(s);
  }

  setCount(lineId: number, value: number | null): void {
    this.editedCounts.update((prev) => ({ ...prev, [lineId]: value }));
  }

  saveLines(): void {
    const s = this.session();
    if (!s || s.status !== 'in_progress') return;
    const counts = this.editedCounts();
    if (Object.keys(counts).length === 0) return;

    const lines = s.lines ?? [];
    const payload = lines
      .filter((l) => counts[l.id] !== undefined)
      .map((l) => ({ product_id: l.product_id, quantity_counted: counts[l.id] }));

    this.isSaving.set(true);
    this.error.set(null);
    this.inventoryService.updateLines(s.id, payload).subscribe({
      next: (res) => {
        this.session.set(res.data);
        this.editedCounts.set({});
        this.success.set('Quantités enregistrées.');
        this.isSaving.set(false);
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors de l\'enregistrement.');
        this.isSaving.set(false);
      },
    });
  }

  async complete(): Promise<void> {
    const s = this.session();
    if (!s || s.status !== 'in_progress' || !this.canComplete()) return;
    if (this.hasChanges()) {
      this.error.set('Enregistrez d\'abord les quantités modifiées.');
      return;
    }

    const uncounted = this.uncountedLinesCount();
    let treatUncountedAsZero = false;
    if (uncounted > 0) {
      const confirmed = await this.dialog.confirm(
        `${uncounted} produit(s) non compté(s) seront enregistrés à 0. Confirmer la validation ?`,
        { title: 'Produits non comptés', type: 'warning' },
      );
      if (!confirmed) return;
      treatUncountedAsZero = true;
    } else {
      const confirmed = await this.dialog.confirm(
        'Valider l\'inventaire et appliquer les écarts au stock ?',
        { title: 'Valider l\'inventaire' },
      );
      if (!confirmed) return;
    }

    this.isCompleting.set(true);
    this.error.set(null);
    this.inventoryService.complete(s.id, { treat_uncounted_as_zero: treatUncountedAsZero }).subscribe({
      next: () => {
        this.isCompleting.set(false);
        this.load(s.id);
        this.success.set('Inventaire validé. Stock mis à jour.');
        setTimeout(() => this.success.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors de la validation.');
        this.isCompleting.set(false);
      },
    });
  }

  async cancel(): Promise<void> {
    const s = this.session();
    if (!s || s.status !== 'in_progress') return;
    const confirmed = await this.dialog.confirm(
      'Annuler cet inventaire ? Aucun mouvement de stock ne sera créé.',
      { title: 'Annuler l\'inventaire', destructive: true },
    );
    if (!confirmed) return;

    this.error.set(null);
    this.inventoryService.cancel(s.id).subscribe({
      next: () => this.router.navigate(['/business/inventory']),
      error: (err) => this.error.set(err.error?.message ?? 'Erreur lors de l\'annulation.'),
    });
  }

  diffClass(line: InventoryLine): string {
    const d = line.quantity_difference;
    if (d == null) return 'text-slate-700';
    if (d > 0) return 'text-emerald-700 font-black';
    if (d < 0) return 'text-red-700 font-black';
    return 'text-slate-800 font-bold';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    return map[status] ?? status;
  }

  can(perm: string): boolean {
    return this.authService.hasPermission(perm);
  }
}
