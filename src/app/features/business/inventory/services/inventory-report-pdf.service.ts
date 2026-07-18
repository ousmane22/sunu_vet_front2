import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../../../../core/utils/format.util';
import type { InventorySession } from '../../models';

@Injectable({ providedIn: 'root' })
export class InventoryReportPdfService {
  exportSessionPdf(session: InventorySession): void {
    const doc = new jsPDF();
    const startedStr = formatDate(session.started_at, true);
    const completedStr = session.completed_at ? formatDate(session.completed_at, true) : '—';
    const user = session.user?.name ?? '—';

    doc.setFontSize(16);
    doc.text('Rapport d\'inventaire', 14, 20);
    doc.setFontSize(10);
    doc.text(`Session #${String(session.id).padStart(5, '0')} • Démarré le ${startedStr} • Par ${user}`, 14, 28);
    doc.text(`Statut: ${this.statusLabel(session.status)} • Clôturé le: ${completedStr}`, 14, 34);

    const lines = session.lines ?? [];
    const body = lines.map((l) => [
      (l.product?.name ?? `Produit #${l.product_id}`).slice(0, 40),
      String(l.quantity_system),
      l.quantity_counted != null ? String(l.quantity_counted) : '—',
      l.quantity_difference != null ? (l.quantity_difference > 0 ? `+${l.quantity_difference}` : String(l.quantity_difference)) : '—',
    ]);

    autoTable(doc, {
      startY: 44,
      head: [['Produit', 'Qté système', 'Qté comptée', 'Écart']],
      body: body.length ? body : [['Aucune ligne', '—', '—', '—']],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [71, 85, 105] },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? 44;
    doc.setFontSize(9);
    doc.text(`Généré le ${formatDate(new Date().toISOString(), true)} • Sunu Vet`, 14, finalY + 12);
    doc.save(`rapport_inventaire_${String(session.id).padStart(5, '0')}_${session.started_at?.slice(0, 10) ?? 'session'}.pdf`);
  }

  private statusLabel(status: string): string {
    const map: Record<string, string> = {
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    return map[status] ?? status;
  }
}
