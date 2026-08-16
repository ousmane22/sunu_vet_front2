import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate as formatDateUtil, formatPrice } from '../../../../core/utils/format.util';
import type { CashRegister, CashTransaction } from '../../models';
import {
    isCashRefund,
    paymentMethodLabel,
    sumCashBusinessExpenses,
    sumCashIncome,
    sumCashRefunds,
    sumIncomeByMethod,
    sumPhysicalCashTheoreticalBalance,
} from '../utils/cash-transaction.util';

/** Remplace les espaces Unicode (ex. U+202F) par un espace standard pour un rendu PDF correct. */
function pdfSafePrice(value: number | null | undefined): string {
    return formatPrice(value).replace(/\u202f/g, ' ');
}

/**
 * Service dédié à l'export PDF du rapport de caisse d'une session.
 */
@Injectable({ providedIn: 'root' })
export class CashRegisterReportPdfService {

    private totalIncome(register: CashRegister): number {
        return sumCashIncome(register.transactions);
    }

    private totalExpense(register: CashRegister): number {
        return sumCashBusinessExpenses(register.transactions);
    }

    private totalRefund(register: CashRegister): number {
        return sumCashRefunds(register.transactions);
    }

    private theoreticalBalance(register: CashRegister): number {
        return sumPhysicalCashTheoreticalBalance(register.opening_balance, register.transactions);
    }

    exportSessionPdf(register: CashRegister): void {
        const doc = new jsPDF();
        const dateStr = formatDateUtil(register.date, true);
        const caissier = register.user?.name ?? '—';

        doc.setFontSize(16);
        doc.text('Rapport de caisse – Session', 14, 20);
        doc.setFontSize(10);
        doc.text(`Ouvert le ${dateStr} • Caissier: ${caissier}`, 14, 28);

        const opening = Number(register.opening_balance) || 0;
        const income = this.totalIncome(register);
        const cashIncome = sumIncomeByMethod(register.transactions, 'cash');
        const cardIncome = sumIncomeByMethod(register.transactions, 'card');
        const mobileIncome = sumIncomeByMethod(register.transactions, 'mobile_money');
        const expense = this.totalExpense(register);
        const refund = this.totalRefund(register);
        const theoretical = this.theoreticalBalance(register);

        autoTable(doc, {
            startY: 36,
            head: [['Rubrique', 'Montant (FCFA)']],
            body: [
                ['Fond d\'ouverture', pdfSafePrice(opening)],
                ['Encaissements (total)', `+ ${pdfSafePrice(income)}`],
                ['— Espèces', `+ ${pdfSafePrice(cashIncome)}`],
                ['— Carte', `+ ${pdfSafePrice(cardIncome)}`],
                ['— Mobile', `+ ${pdfSafePrice(mobileIncome)}`],
                ['Dépenses', `- ${pdfSafePrice(expense)}`],
                ['Remboursements', `- ${pdfSafePrice(refund)}`],
                ['Solde théorique tiroir (espèces)', pdfSafePrice(theoretical)],
            ],
            styles: { fontSize: 10 },
            headStyles: { fillColor: [71, 85, 105] },
        });

        let finalY = (doc as any).lastAutoTable?.finalY ?? 36;
        finalY += 10;

        doc.setFontSize(11);
        doc.text('Journal des opérations', 14, finalY);
        finalY += 8;

        const transactions = [...(register.transactions ?? [])].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        if (transactions.length === 0) {
            doc.setFontSize(9);
            doc.text('Aucune transaction enregistrée.', 14, finalY);
            finalY += 10;
        } else {
            const rows: string[][] = transactions.map((tx: CashTransaction) => {
                const kind = tx.type === 'income'
                    ? 'Encaissement'
                    : (isCashRefund(tx) ? 'Remboursement' : 'Dépense');
                const libelle = `${kind}: ${(tx.description || tx.category || '—')}`.slice(0, 45);
                const heure = new Date(tx.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                const montant = tx.type === 'income'
                    ? `+ ${pdfSafePrice(Number(tx.amount))}`
                    : `- ${pdfSafePrice(Number(tx.amount))}`;
                const mode = tx.type === 'income' && tx.payment_method
                    ? paymentMethodLabel(tx.payment_method)
                    : '—';
                return [heure, libelle, mode, tx.user?.name ?? '—', montant];
            });
            autoTable(doc, {
                startY: finalY,
                head: [['Heure', 'Libellé', 'Mode', 'Opérateur', 'Montant']],
                body: rows,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [71, 85, 105] },
            });
            finalY = (doc as any).lastAutoTable?.finalY + 8;
        }

        if (register.status === 'closed' && register.closing_balance != null) {
            const closing = Number(register.closing_balance) || 0;
            const ecart = closing - theoretical;
            doc.setFontSize(10);
            doc.text(`Fonds final compté: ${pdfSafePrice(closing)}`, 14, finalY);
            doc.text(`Écart: ${ecart >= 0 ? '+' : ''}${pdfSafePrice(ecart)}`, 14, finalY + 6);
        }

        const safeDate = register.date ? new Date(register.date).toISOString().slice(0, 10) : '';
        doc.save(`rapport_caisse_session_${safeDate}_${register.id}.pdf`);
    }

    exportHistoryPdf(
        history: CashRegister[],
        getTheoreticalFinal: (reg: CashRegister) => number,
        getDifference: (reg: CashRegister) => number
    ): void {
        const doc = new jsPDF();
        const rows = history.map((reg) => {
            const dateStr = formatDateUtil(reg.date, false);
            const caissier = reg.user?.name ?? '—';
            const fondsFinal = reg.status === 'closed' ? pdfSafePrice(Number(reg.closing_balance) || 0) : '— en cours —';
            const theorique = reg.status === 'closed' ? pdfSafePrice(getTheoreticalFinal(reg)) : '—';
            const diff = getDifference(reg);
            const ecart = reg.status === 'closed' ? (diff > 0 ? '+' : '') + pdfSafePrice(diff) : '—';
            const statut = reg.status === 'open' ? 'Ouverte' : 'Fermée';
            return [dateStr, caissier, fondsFinal, theorique, ecart, statut];
        });
        doc.setFontSize(16);
        doc.text('Rapport caisse – Historique des sessions', 14, 20);
        doc.setFontSize(10);
        doc.text(`Généré le ${formatDateUtil(new Date().toISOString(), true)}`, 14, 28);
        autoTable(doc, {
            startY: 34,
            head: [['Date', 'Caissier', 'Fonds final', 'Théorique', 'Écart', 'Statut']],
            body: rows,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [71, 85, 105] },
        });
        doc.save(`rapport_caisse_sessions_${new Date().getTime()}.pdf`);
    }
}
