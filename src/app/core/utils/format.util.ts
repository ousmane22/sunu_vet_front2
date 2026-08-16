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

function parseDateOnly(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
}

/** Âge lisible à partir d'une date de naissance (YYYY-MM-DD). */
export function formatAgeFromBirthDate(
    dateOfBirth: string | null | undefined,
    referenceDate: Date = new Date(),
): string | null {
    if (!dateOfBirth) return null;

    const birth = parseDateOnly(dateOfBirth);
    if (!birth) return null;

    const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
    if (birth > today) return null;

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
        months--;
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    const totalMonths = years * 12 + months;

    if (totalMonths < 1) {
        const diffDays = Math.floor((today.getTime() - birth.getTime()) / 86_400_000);
        if (diffDays <= 0) return null;
        if (diffDays === 1) return '1 jour';
        if (diffDays < 14) return `${diffDays} jours`;
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? '1 semaine' : `${weeks} semaines`;
    }

    if (years < 1) {
        return totalMonths === 1 ? '1 mois' : `${totalMonths} mois`;
    }

    if (months === 0) {
        return years === 1 ? '1 an' : `${years} ans`;
    }

    const yearPart = years === 1 ? '1 an' : `${years} ans`;
    const monthPart = months === 1 ? '1 mois' : `${months} mois`;
    return `${yearPart} ${monthPart}`;
}

