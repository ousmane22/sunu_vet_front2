import 'chart.js/auto';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { FormsModule } from '@angular/forms';
import { ReportService } from '../services/report.service';
import { TreasuryReport, StockReport, MedicalReport, DebtsReport } from '../models/report.model';
import { FormatPricePipe } from '../../../core/pipes';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { TreasuryReportComponent } from './components/treasury-report.component';
import { StockReportComponent } from './components/stock-report.component';
import { MedicalReportComponent } from './components/medical-report.component';
import { DebtsReportComponent } from './components/debts-report.component';
import { BusinessStrategyService } from '../../../core/services/business-strategy.service';
import { BusinessProfileService } from '../services/business-profile.service';
import { formatPrice } from '../../../core/utils/format.util';
import { PerformanceReportComponent } from './components/performance-report.component';
import { PerformanceReport } from '../models/report.model';

type ReportTab = 'performance' | 'treasury' | 'stock' | 'medical' | 'debts';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TreasuryReportComponent,
        StockReportComponent,
        MedicalReportComponent,
        DebtsReportComponent,
        PerformanceReportComponent
    ],
    providers: [provideCharts(withDefaultRegisterables())],
    templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
    private reportService = inject(ReportService);
    private profileService = inject(BusinessProfileService);
    strategyService = inject(BusinessStrategyService);

    businessName = signal<string>('Votre clinique');

    readonly tabs: { id: ReportTab; label: string; icon: string }[] = [
        { id: 'performance', label: 'Performance', icon: 'fas fa-chart-line' },
        { id: 'treasury', label: 'Trésorerie', icon: 'fas fa-cash-register' },
        { id: 'stock', label: 'Stock', icon: 'fas fa-pills' },
        { id: 'medical', label: 'Soins', icon: 'fas fa-stethoscope' },
        { id: 'debts', label: 'Créances', icon: 'fas fa-user-clock' },
    ];

    activeTab = signal<ReportTab>('performance');
    isLoading = signal(false);

    // Filtres (par défaut : semaine courante)
    startDate = signal(this.getDefaultStartDate());
    endDate = signal(this.getDefaultEndDate());

    treasuryData = signal<TreasuryReport | null>(null);
    stockData = signal<StockReport | null>(null);
    medicalData = signal<MedicalReport | null>(null);
    debtsData = signal<DebtsReport | null>(null);
    performanceData = signal<PerformanceReport | null>(null);

    ngOnInit(): void {
        this.tabs[2].label = this.strategyService.isVet() ? 'Pharmacie' : 'Stock';
        this.tabs[2].icon = this.strategyService.isVet() ? 'fas fa-pills' : 'fas fa-boxes';
        this.tabs[3].label = this.strategyService.isVet() ? 'Soins' : 'Activité';
        this.tabs[3].icon = this.strategyService.isVet() ? 'fas fa-stethoscope' : 'fas fa-chart-line';
        this.loadProfile();
        this.switchTab('performance');
    }

    loadProfile(): void {
        this.profileService.getProfile().subscribe(res => {
            if (res.data) {
                this.businessName.set(res.data.name);
            }
        });
    }

    /** Début de la semaine courante (lundi). */
    private getDefaultStartDate(): string {
        const d = new Date();
        const day = d.getDay(); // 0 = dimanche, 1 = lundi, ...
        const daysToMonday = day === 0 ? 6 : day - 1;
        d.setDate(d.getDate() - daysToMonday);
        return d.toISOString().split('T')[0];
    }

    /** Fin de la semaine courante (dimanche). */
    private getDefaultEndDate(): string {
        const d = new Date();
        const day = d.getDay();
        const daysToSunday = day === 0 ? 0 : 7 - day;
        d.setDate(d.getDate() + daysToSunday);
        return d.toISOString().split('T')[0];
    }

    onDateChange(): void {
        this.loadData();
    }

    switchTab(tab: ReportTab): void {
        this.activeTab.set(tab);
        this.loadData();
    }

    loadData(): void {
        const tab = this.activeTab();
        this.isLoading.set(true);

        const params = {
            start_date: this.startDate(),
            end_date: this.endDate()
        };

        const obs: Record<ReportTab, () => void> = {
            performance: () => this.reportService.getPerformance(params).subscribe((d: any) => { this.performanceData.set(d); this.finishLoad(); }),
            treasury: () => this.reportService.getTreasury(params).subscribe((d: any) => { this.treasuryData.set(d); this.finishLoad(); }),
            stock: () => this.reportService.getStock(params).subscribe((d: any) => { this.stockData.set(d); this.finishLoad(); }),
            medical: () => this.reportService.getMedical(params).subscribe((d: any) => { this.medicalData.set(d); this.finishLoad(); }),
            debts: () => this.reportService.getDebts().subscribe((d: any) => { this.debtsData.set(d); this.finishLoad(); }),
        };

        obs[tab]();
    }

    private finishLoad(): void {
        this.isLoading.set(false);
    }

    // -- EXPORT PDF --
    exportPdf(): void {
        const doc = new jsPDF();
        const tab = this.activeTab();
        const dateRange = `Période: ${this.startDate()} au ${this.endDate()}`;
        const bName = this.businessName();

        // Header
        doc.setFillColor(30, 41, 59); // Slate 800
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(bName, 14, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Rapport: ${this.getTabLabel(tab)}`, 14, 30);
        doc.text(dateRange, 196, 30, { align: 'right' });

        doc.setTextColor(0, 0, 0);

        if (tab === 'performance' && this.performanceData()) {
            const data = this.performanceData()!;

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Performance Globale', 14, 55);

            autoTable(doc, {
                startY: 60,
                head: [['Chiffres Clés', 'Quantité', 'Montant Net']],
                body: [
                    ['Ventes de Médicaments', `${data.summary.sales_count}`, formatPrice(data.summary.sales_net)],
                    ['Consultations / Actes', `${data.summary.consultations_count}`, formatPrice(data.summary.consultations_net)],
                    ['TOTAL RÉCOLTÉ (Net)', '', formatPrice(data.summary.total_net)],
                    ['Nouveaux Crédits Client', '', formatPrice(data.new_debts)],
                ],
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }
            });

            doc.text('Répartition des Encaissements', 14, (doc as any).lastAutoTable.finalY + 15);
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Mode de paiement', 'Total Encaissé']],
                body: data.payments.map(p => [this.getPaymentMethodLabel(p.payment_method), formatPrice(p.total)]),
                theme: 'grid'
            });

            doc.addPage();
            doc.text('Top 10 Articles / Prestations', 14, 20);
            autoTable(doc, {
                startY: 25,
                head: [['Produit', 'Quantité', 'Total']],
                body: data.top_articles.map(a => [a.name, `${a.qty}`, formatPrice(a.total)]),
                theme: 'striped'
            });

        } else if (tab === 'treasury' && this.treasuryData()) {
            const data = this.treasuryData()!;

            // Summary Info
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Synthèse Financière', 14, 55);

            autoTable(doc, {
                startY: 60,
                head: [['Rubrique', 'Montant']],
                body: [
                    ['Total Recettes', formatPrice(data.total_revenue)],
                    ['Total Dépenses', formatPrice(data.total_expenses)],
                    ['Marge Net', formatPrice(data.net_margin)],
                ],
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }
            });

            // Details
            doc.text('Dépenses par Catégorie', 14, (doc as any).lastAutoTable.finalY + 15);
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Catégorie', 'Total']],
                body: data.expenses_by_category.map(c => [this.getCategoryLabel(c.category), formatPrice(c.total)]),
                theme: 'grid'
            });

        } else if (tab === 'stock' && this.stockData()) {
            const data = this.stockData()!;

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('État des Stocks', 14, 55);

            autoTable(doc, {
                startY: 60,
                head: [['Indicateur', 'Valeur']],
                body: [
                    ['Valeur Totale Stock (Prix vente)', formatPrice(data.total_valuation)],
                    ['Articles en stock bas', `${data.low_stock_count}`],
                    ['Articles bientôt périmés', `${data.expiring_soon_count}`],
                ],
                headStyles: { fillColor: [79, 70, 229] }
            });

            doc.text('Top 10 Ventes (en quantité)', 14, (doc as any).lastAutoTable.finalY + 15);
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Produit', 'Quantité vendue']],
                body: data.top_sellers.map(s => [s.name, `${s.total_sold}`]),
                theme: 'striped'
            });

        } else if (tab === 'medical' && this.medicalData()) {
            const data = this.medicalData()!;

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Activité Médicale', 14, 55);

            // Consultations by species
            autoTable(doc, {
                startY: 60,
                head: [['Espèce', 'Nombre de consultations']],
                body: data.by_species.map(s => [s.animal_species, `${s.count}`]),
                headStyles: { fillColor: [79, 70, 229] }
            });

            doc.text('Évolution Mensuelle (Consultations)', 14, (doc as any).lastAutoTable.finalY + 15);
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Mois', 'Nombre total']],
                body: data.monthly_volume.map(v => [v.month, `${v.total}`]),
                theme: 'grid'
            });

        } else if (tab === 'debts' && this.debtsData()) {
            const data = this.debtsData()!;

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Gestion des Créances', 14, 55);

            autoTable(doc, {
                startY: 60,
                head: [['Indicateur', 'Valeur']],
                body: [
                    ['Total des Créances clients', formatPrice(data.total_outstanding)],
                    ['Nombre de débiteurs actifs', `${data.debtors_count}`],
                ],
                headStyles: { fillColor: [79, 70, 229] }
            });

            doc.text('Top des Débiteurs', 14, (doc as any).lastAutoTable.finalY + 15);
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Client', 'Téléphone', 'Solde Dû']],
                body: data.top_debtors.map(d => [d.name, d.phone || '—', formatPrice(d.balance_due)]),
                headStyles: { fillColor: [220, 38, 38] } // Red for debts
            });
        }

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Généré par SunuVet le ${new Date().toLocaleString()} - Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' });
        }

        doc.save(`rapport_${tab}_${this.startDate()}_${this.endDate()}.pdf`);
    }

    private getPaymentMethodLabel(method: string): string {
        const labels: Record<string, string> = {
            'cash': 'Espèces',
            'card': 'Carte Bancaire',
            'mobile_money': 'Mobile Money (Wave/OM)',
        };
        return labels[method] || method;
    }

    private getCategoryLabel(cat: string): string {
        const labels: Record<string, string> = {
            'achats': 'Achats de stock',
            'salaires': 'Salaires et Charges',
            'factures': 'Factures (Loyer, Elec, etc)',
            'entretien': 'Entretien & Réparations',
            'remboursements': 'Remboursements client',
            'autres': 'Autres dépenses'
        };
        return labels[cat] || cat;
    }

    private getTabLabel(tab: ReportTab): string {
        switch (tab) {
            case 'performance': return 'Bilan de Performance';
            case 'treasury': return 'Trésorerie';
            case 'stock': return this.strategyService.isVet() ? 'Pharmacie' : 'Stock';
            case 'medical': return 'Activité Médicale';
            case 'debts': return 'Créances & Dettes';
            default: return tab;
        }
    }

    // -- EXPORT EXCEL --
    exportExcel(): void {
        const tab = this.activeTab();
        const wb = XLSX.utils.book_new();

        if (tab === 'performance' && this.performanceData()) {
            const data = this.performanceData()!;
            const summary = [
                { 'Chiffre d\'Affaires': 'Ventes Net', Montant: data.summary.sales_net },
                { 'Chiffre d\'Affaires': 'Consultations Net', Montant: data.summary.consultations_net },
                { 'Chiffre d\'Affaires': 'TOTAL NET', Montant: data.summary.total_net },
                { 'Chiffre d\'Affaires': 'Nouveaux Crédits', Montant: data.new_debts },
            ];
            const payments = data.payments.map(p => ({
                'Mode de Paiement': this.getPaymentMethodLabel(p.payment_method),
                Total: p.total
            }));
            const top = data.top_articles.map(a => ({
                Produit: a.name,
                Quantité: a.qty,
                Total: a.total
            }));

            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Synthèse');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(payments), 'Encaissements');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(top), 'Top Ventes');

        } else if (tab === 'treasury' && this.treasuryData()) {
            const data = this.treasuryData()!;
            const summary = [
                { Rubrique: 'Total Recettes', Montant: data.total_revenue },
                { Rubrique: 'Total Dépenses', Montant: data.total_expenses },
                { Rubrique: 'Marge Net', Montant: data.net_margin }
            ];
            const categories = data.expenses_by_category.map(c => ({
                Catégorie: this.getCategoryLabel(c.category),
                Total: c.total
            }));

            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Synthèse');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categories), 'Détail Dépenses');

        } else if (tab === 'stock' && this.stockData()) {
            const data = this.stockData()!;
            const summary = [
                { Indicateur: 'Valeur Totale Stock', Valeur: data.total_valuation },
                { Indicateur: 'Stocks Bas', Valeur: data.low_stock_count },
                { Indicateur: 'Bientôt Périmés', Valeur: data.expiring_soon_count }
            ];
            const topSellers = data.top_sellers.map(s => ({
                Produit: s.name,
                'Quantité Vendue': s.total_sold
            }));

            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Indicateurs');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topSellers), 'Top Ventes');

        } else if (tab === 'medical' && this.medicalData()) {
            const data = this.medicalData()!;
            const species = data.by_species.map(s => ({
                Espèce: s.animal_species,
                'Volume Consultations': s.count
            }));
            const volume = data.monthly_volume.map(v => ({
                Mois: v.month,
                Total: v.total
            }));

            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(species), 'Par Espèce');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(volume), 'Évolution Mensuelle');

        } else if (tab === 'debts' && this.debtsData()) {
            const data = this.debtsData()!;
            const summary = [
                { Indicateur: 'Total Créances', Valeur: data.total_outstanding },
                { Indicateur: 'Nombre Débiteurs', Valeur: data.debtors_count }
            ];
            const debtors = data.top_debtors.map(d => ({
                Nom: d.name,
                Téléphone: d.phone,
                'Solde Dû': d.balance_due
            }));

            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Synthèse');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(debtors), 'Liste Débiteurs');
        }

        XLSX.writeFile(wb, `rapport_${tab}_${this.startDate()}_${this.endDate()}.xlsx`);
    }
}
