/**
 * Formatage centralisé (DRY) — utilisé par les pipes et le code TS.
 */

const PRICE_FORMATTER = new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});


/** Montant en CFA (affichage liste/détail). */
export function formatPrice(value: number | null | undefined): string {
    return PRICE_FORMATTER.format(Number(value) || 0) + ' CFA';
}

/** Remise en FCFA (entier) — même règle que PaymentProcessor::calculateDiscountAndStatus. */
export function calculateDiscountAmount(
    subtotal: number,
    discountType: 'amount' | 'percent' | null | undefined,
    discountValue: number,
): number {
    const total = Math.round(Number(subtotal) || 0);
    const value = Number(discountValue) || 0;
    if (!discountType || value <= 0) return 0;
    if (discountType === 'percent') return Math.round(total * (value / 100));
    return Math.min(Math.round(value), total);
}

/** Net à payer après remise (FCFA entier). */
export function calculateNetAmount(subtotal: number, discountAmount: number): number {
    return Math.round(Math.max(0, Math.round(subtotal) - discountAmount));
}

/** Date/heure en français. */
export function formatDate(value: string | null | undefined, showTime: boolean = true): string {
    if (value == null || value === '') return '—';

    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };

    if (showTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return new Date(value).toLocaleDateString('fr-FR', options);
}



