import { Injectable, inject } from '@angular/core';
import { Sale, SaleItem, BusinessProfile, Quote, QuoteItem } from '../../features/business/models';
import type { InventorySession } from '../../features/business/models';
import { formatPrice } from '../utils/format.util';
import { BusinessProfileService } from '../../features/business/services/business-profile.service';
import { SunuDialogService } from '../../shared/services/sunu-dialog.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PrintService {
    private businessService = inject(BusinessProfileService);
    private dialog = inject(SunuDialogService);

    private async getBusinessInfo(): Promise<BusinessProfile | null> {
        try {
            const res = await firstValueFrom(this.businessService.getProfile());
            return res.data;
        } catch {
            return null;
        }
    }

    private getPaymentMethodLabel(method: string | undefined): string {
        const map: Record<string, string> = {
            'cash': 'Espèces',
            'card': 'Carte',
            'mobile_money': 'Mobile Money',
            'mobile-money': 'Mobile Money',
            'mobilemoney': 'Mobile Money',
        };
        if (!method) return '—';
        const key = String(method).toLowerCase().replace(/-/g, '_');
        return map[key] ?? map[method] ?? method;
    }

    /** Ouvre une fenêtre d'impression avec le reçu de la vente. */
    async printSaleReceipt(sale: Sale): Promise<void> {
        const business = await this.getBusinessInfo();
        const paymentLabel = this.getPaymentMethodLabel(sale.payment_method);
        
        const dateStr = sale.created_at 
            ? new Date(sale.created_at).toLocaleDateString('fr-FR', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              }) 
            : new Date().toLocaleDateString('fr-FR', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              });

        const rows = sale.items.map((item: SaleItem) =>
            `<tr>
                <td>${(item.product?.name || 'Article').replace(/</g, '&lt;')}</td>
                <td style="text-align:center">${item.quantity}</td>
                <td style="text-align:right">${formatPrice(item.unit_price).replace(/\u202f/g, ' ')}</td>
                <td style="text-align:right">${formatPrice(item.subtotal).replace(/\u202f/g, ' ')}</td>
            </tr>`
        ).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reçu Vente #${sale.id}</title>
    <style>
        body { font-family: 'Courier New', Courier, monospace; max-width: 300px; margin: 0 auto; padding: 10px; font-size: 12px; line-height: 1.2; color: #000; }
        .header { text-align: center; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .header h1 { font-size: 16px; margin: 0; text-transform: uppercase; }
        .meta { font-size: 10px; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 4px 0; border-bottom: 1px dashed #eee; }
        th { text-align: left; font-size: 10px; text-transform: uppercase; }
        .totals { margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
        .total-row { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 2px; }
        .total-row.grand-total { font-size: 14px; border-top: 1px dashed #000; margin-top: 5px; padding-top: 5px; }
        .footer { font-size: 10px; text-align: center; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; }
        @media print {
            body { width: 80mm; margin: 0; padding: 5mm; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${business?.name || 'SUNU VET'}</h1>
        <div class="meta">${business?.description || 'Clinique Vétérinaire'}</div>
        <div class="meta">${business?.address || ''} ${business?.city || ''}</div>
        <div class="meta">Tél: ${business?.phone || ''}</div>
    </div>

    <div class="meta" style="text-align: center; font-weight: bold;">
        REÇU DE VENTE #${String(sale.id).padStart(5, '0')}
    </div>
    <div class="meta" style="text-align: center;">
        Date: ${dateStr}
    </div>

    <div style="margin-top: 10px;">
        <strong>Client:</strong> ${(sale.client?.name || 'Client de passage').replace(/</g, '&lt;')}
    </div>

    <table>
        <thead>
            <tr>
                <th>Désignation</th>
                <th style="text-align:center">Qté</th>
                <th style="text-align:right">P.U.</th>
                <th style="text-align:right">Total</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>

    <div class="totals">
        <div class="total-row">
            <span>Sous-total:</span>
            <span>${formatPrice(sale.total_amount).replace(/\u202f/g, ' ')}</span>
        </div>
        ${sale.discount_amount > 0 ? `
        <div class="total-row">
            <span>Remise:</span>
            <span>- ${formatPrice(sale.discount_amount).replace(/\u202f/g, ' ')}</span>
        </div>
        ` : ''}
        <div class="total-row grand-total">
            <span>TOTAL NET:</span>
            <span>${formatPrice(sale.net_amount).replace(/\u202f/g, ' ')}</span>
        </div>
        <div class="total-row" style="margin-top: 5px; font-weight: normal; font-size: 11px;">
            <span>Payé (${paymentLabel}):</span>
            <span>${formatPrice(sale.amount_paid).replace(/\u202f/g, ' ')}</span>
        </div>
        ${sale.amount_due > 0 ? `
        <div class="total-row" style="font-weight: normal; font-size: 11px; color: red;">
            <span>Reste à payer:</span>
            <span>${formatPrice(sale.amount_due).replace(/\u202f/g, ' ')}</span>
        </div>
        ` : ''}
        ${sale.change_given > 0 ? `
        <div class="total-row" style="font-weight: normal; font-size: 11px;">
            <span>Monnaie rendue:</span>
            <span>${formatPrice(sale.change_given).replace(/\u202f/g, ' ')}</span>
        </div>
        ` : ''}
    </div>

    <div style="margin-top: 10px; font-size: 10px;">
        Vendeur: ${(sale.user?.name || '—').replace(/</g, '&lt;')}
    </div>

    <div class="footer">
        Merci de votre visite !<br>
        À bientôt.
    </div>
</body>
</html>`;

        const w = window.open('', '_blank', 'width=450,height=600');
        if (w) {
            w.document.write(html);
            w.document.close();
            w.focus();
            w.onload = () => {
                setTimeout(() => {
                    w.print();
                    w.close();
                }, 300);
            };
        } else {
            await this.dialog.alert('Veuillez autoriser les pop-ups pour imprimer le reçu.', {
                type: 'warning',
                title: 'Impression bloquée',
            });
        }
    }

    /** Ouvre une fenêtre d'impression avec la facture (A4) de la vente. */
    async printSaleInvoice(sale: Sale): Promise<void> {
        const business = await this.getBusinessInfo();
        const paymentLabel = this.getPaymentMethodLabel(sale.payment_method);
        
        const dateStr = sale.created_at 
            ? new Date(sale.created_at).toLocaleDateString('fr-FR', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              }) 
            : new Date().toLocaleDateString('fr-FR', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              });

        const rows = sale.items.map((item: SaleItem) =>
            `<tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${(item.product?.name || 'Article').replace(/</g, '&lt;')}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align:center">${item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align:right">${formatPrice(item.unit_price).replace(/\u202f/g, ' ')}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align:right">${formatPrice(item.subtotal).replace(/\u202f/g, ' ')}</td>
            </tr>`
        ).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture #${sale.id}</title>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; color: #1a202c; margin: 0; padding: 40px; line-height: 1.5; }
        .invoice-container { max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 50px; }
        .business-info h1 { margin: 0; font-size: 28px; font-weight: 900; color: #2d3748; }
        .business-info p { margin: 4px 0; color: #718096; font-size: 14px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { margin: 0; font-size: 32px; font-weight: 900; color: #cbd5e0; }
        .invoice-title p { margin: 4px 0; font-weight: bold; }
        
        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .details h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #a0aec0; margin-bottom: 10px; }
        .details p { margin: 2px 0; font-weight: 600; }

        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th { background: #f7fafc; padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #a0aec0; border-bottom: 2px solid #edf2f7; }
        
        .totals-container { display: flex; justify-content: flex-end; }
        .totals { width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #edf2f7; }
        .total-row.grand-total { border-bottom: none; font-size: 20px; font-weight: 900; color: #2d3748; padding-top: 20px; }
        
        .footer { margin-top: 80px; padding-top: 20px; border-top: 2px solid #edf2f7; text-align: center; color: #a0aec0; font-size: 12px; }
        @media print { body { padding: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="business-info">
                <h1>${business?.name || 'SUNU VET'}</h1>
                <p>${business?.address || ''}</p>
                <p>${business?.city || ''}</p>
                <p>Tél: ${business?.phone || ''}</p>
                <p>Email: ${business?.email || ''}</p>
            </div>
            <div class="invoice-title">
                <h2>FACTURE</h2>
                <p>#${String(sale.id).padStart(5, '0')}</p>
                <p style="font-weight: normal; color: #a0aec0;">Date: ${dateStr}</p>
            </div>
        </div>

        <div class="details">
            <div>
                <h3>Facturé à</h3>
                <p>${(sale.client?.name || 'Client de passage').replace(/</g, '&lt;')}</p>
                ${sale.client?.phone ? `<p>${sale.client.phone}</p>` : ''}
            </div>
            <div>
                <h3>Informations</h3>
                <p>Mode de paiement: ${paymentLabel}</p>
                <p>Vendeur: ${sale.user?.name || '—'}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Désignation</th>
                    <th style="text-align:center">Qté</th>
                    <th style="text-align:right">Prix Unitaire</th>
                    <th style="text-align:right">Montant</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>

        <div class="totals-container">
            <div class="totals">
                <div class="total-row">
                    <span>Sous-total</span>
                    <span>${formatPrice(sale.total_amount).replace(/\u202f/g, ' ')}</span>
                </div>
                ${sale.discount_amount > 0 ? `
                <div class="total-row" style="color: #38a169;">
                    <span>Remise</span>
                    <span>- ${formatPrice(sale.discount_amount).replace(/\u202f/g, ' ')}</span>
                </div>
                ` : ''}
                <div class="total-row grand-total">
                    <span>TOTAL TTC</span>
                    <span>${formatPrice(sale.net_amount).replace(/\u202f/g, ' ')}</span>
                </div>
                <div class="total-row" style="color: #718096; border: none; padding-top: 5px;">
                    <span>Montant réglé</span>
                    <span>${formatPrice(sale.amount_paid).replace(/\u202f/g, ' ')}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Merci pour votre confiance !</p>
            <p>${business?.website || ''}</p>
        </div>
    </div>
</body>
</html>`;

        const w = window.open('', '_blank');
        if (w) {
            w.document.write(html);
            w.document.close();
            w.focus();
            w.onload = () => {
                setTimeout(() => {
                    w.print();
                    w.close();
                }, 500);
            };
        } else {
            await this.dialog.alert('Veuillez autoriser les pop-ups pour imprimer la facture.', {
                type: 'warning',
                title: 'Impression bloquée',
            });
        }
    }
    /** Ouvre une fenêtre d'impression pour un devis ou une proforma. */
    async printQuote(quote: Quote): Promise<void> {
        const business = await this.getBusinessInfo();
        
        const dateStr = quote.created_at 
            ? new Date(quote.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
            : new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const validUntilStr = quote.valid_until
            ? new Date(quote.valid_until).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : '—';

        const rows = quote.items.map((item: QuoteItem) =>
            `<tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${(item.product?.name || 'Article').replace(/</g, '&lt;')}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align:center">${item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align:right">${formatPrice(item.unit_price).replace(/\u202f/g, ' ')}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align:right">${formatPrice(item.subtotal).replace(/\u202f/g, ' ')}</td>
            </tr>`
        ).join('');

        const label = quote.type === 'proforma' ? 'FACTURE PROFORMA' : 'DEVIS';

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${label} #${quote.id}</title>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; color: #1a202c; margin: 0; padding: 40px; line-height: 1.5; }
        .invoice-container { max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 50px; }
        .business-info h1 { margin: 0; font-size: 28px; font-weight: 900; color: #2d3748; }
        .business-info p { margin: 4px 0; color: #718096; font-size: 14px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { margin: 0; font-size: 32px; font-weight: 900; color: #cbd5e0; }
        .invoice-title p { margin: 4px 0; font-weight: bold; }
        
        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .details h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #a0aec0; margin-bottom: 10px; }
        .details p { margin: 2px 0; font-weight: 600; }

        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th { background: #f7fafc; padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #a0aec0; border-bottom: 2px solid #edf2f7; }
        
        .totals-container { display: flex; justify-content: flex-end; }
        .totals { width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #edf2f7; }
        .total-row.grand-total { border-bottom: none; font-size: 20px; font-weight: 900; color: #2d3748; padding-top: 20px; }
        
        .footer { margin-top: 80px; padding-top: 20px; border-top: 2px solid #edf2f7; text-align: center; color: #a0aec0; font-size: 12px; }
        .notes { margin-top: 40px; padding: 20px; background: #f7fafc; border-radius: 8px; font-size: 13px; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="business-info">
                <h1>${business?.name || 'SUNU VET'}</h1>
                <p>${business?.address || ''}</p>
                <p>Tél: ${business?.phone || ''}</p>
                <p>Email: ${business?.email || ''}</p>
            </div>
            <div class="invoice-title">
                <h2>${label}</h2>
                <p>#${String(quote.id).padStart(5, '0')}</p>
                <p style="font-weight: normal; color: #a0aec0;">Date: ${dateStr}</p>
                <p style="font-weight: normal; color: #a0aec0;">Valable jusqu'au: ${validUntilStr}</p>
            </div>
        </div>

        <div class="details">
            <div>
                <h3>Destinataire</h3>
                <p>${(quote.client?.name || 'Client de passage').replace(/</g, '&lt;')}</p>
                ${quote.client?.phone ? `<p>${quote.client.phone}</p>` : ''}
            </div>
            <div>
                <h3>Informations</h3>
                <p>Statut: ${quote.status}</p>
                <p>Préparé par: ${quote.user?.name || '—'}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Désignation</th>
                    <th style="text-align:center">Qté</th>
                    <th style="text-align:right">Prix Unitaire</th>
                    <th style="text-align:right">Montant</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>

        <div class="totals-container">
            <div class="totals">
                <div class="total-row">
                    <span>Sous-total HT</span>
                    <span>${formatPrice(quote.total_amount).replace(/\u202f/g, ' ')}</span>
                </div>
                ${quote.discount_amount > 0 ? `
                <div class="total-row" style="color: #38a169;">
                    <span>Remise</span>
                    <span>- ${formatPrice(quote.discount_amount).replace(/\u202f/g, ' ')}</span>
                </div>
                ` : ''}
                <div class="total-row grand-total">
                    <span>TOTAL TTC</span>
                    <span>${formatPrice(quote.net_amount).replace(/\u202f/g, ' ')}</span>
                </div>
            </div>
        </div>

        ${quote.notes ? `
        <div class="notes">
            <strong>Notes :</strong><br>
            ${quote.notes.replace(/\n/g, '<br>')}
        </div>
        ` : ''}

        <div class="footer">
            <p>Document généré par Sunu Vet</p>
        </div>
    </div>
</body>
</html>`;

        const w = window.open('', '_blank');
        if (w) {
            w.document.write(html);
            w.document.close();
            w.focus();
            w.onload = () => {
                setTimeout(() => {
                    w.print();
                    w.close();
                }, 500);
            };
        }
    }

    async printInventoryReport(session: InventorySession): Promise<void> {
        const business = await this.getBusinessInfo();
        const startedStr = session.started_at
            ? new Date(session.started_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '—';
        const completedStr = session.completed_at
            ? new Date(session.completed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '—';
        const statusLabel = session.status === 'in_progress' ? 'En cours' : session.status === 'completed' ? 'Terminé' : 'Annulé';

        const rows = (session.lines ?? []).map((l) => {
            const diff = l.quantity_difference != null ? (l.quantity_difference > 0 ? `+${l.quantity_difference}` : String(l.quantity_difference)) : '—';
            return `<tr>
                <td style="padding:10px;border-bottom:1px solid #eee">${(l.product?.name ?? `Produit #${l.product_id}`).replace(/</g, '&lt;')}</td>
                <td style="padding:10px;border-bottom:1px solid #eee;text-align:center">${l.quantity_system}</td>
                <td style="padding:10px;border-bottom:1px solid #eee;text-align:center">${l.quantity_counted ?? '—'}</td>
                <td style="padding:10px;border-bottom:1px solid #eee;text-align:right">${diff}</td>
            </tr>`;
        }).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport inventaire #${session.id}</title>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; color: #1a202c; margin: 0; padding: 40px; line-height: 1.5; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .business-info h1 { margin: 0; font-size: 22px; font-weight: 800; color: #2d3748; }
        .business-info p { margin: 4px 0; color: #718096; font-size: 13px; }
        .report-title h2 { margin: 0; font-size: 18px; font-weight: 800; color: #4a5568; }
        .report-title p { margin: 4px 0; font-size: 12px; color: #718096; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f7fafc; padding: 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #718096; border-bottom: 2px solid #e2e8f0; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #a0aec0; font-size: 11px; }
        @media print { body { padding: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="business-info">
                <h1>${business?.name ?? 'SUNU VET'}</h1>
                <p>${business?.address ?? ''} ${business?.city ?? ''}</p>
                <p>Tél: ${business?.phone ?? ''}</p>
            </div>
            <div class="report-title">
                <h2>Rapport d'inventaire</h2>
                <p>Session #${String(session.id).padStart(5, '0')}</p>
                <p>Démarré le ${startedStr}</p>
                <p>Par ${(session.user?.name ?? '—').replace(/</g, '&lt;')}</p>
                <p>Statut: ${statusLabel} • Clôturé: ${completedStr}</p>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Produit</th>
                    <th style="text-align:center">Qté système</th>
                    <th style="text-align:center">Qté comptée</th>
                    <th style="text-align:right">Écart</th>
                </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="4" style="padding:20px;text-align:center">Aucune ligne</td></tr>'}</tbody>
        </table>
        <div class="footer">Document généré par Sunu Vet • ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
    </div>
</body>
</html>`;

        const w = window.open('', '_blank');
        if (w) {
            w.document.write(html);
            w.document.close();
            w.focus();
            w.onload = () => {
                setTimeout(() => {
                    w.print();
                    w.close();
                }, 500);
            };
        } else {
            await this.dialog.alert('Veuillez autoriser les pop-ups pour imprimer le rapport.', {
                type: 'warning',
                title: 'Impression bloquée',
            });
        }
    }
}
