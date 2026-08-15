/** Catégories de sortie caisse qui sont des remboursements (pas des dépenses métier). */
const REFUND_CATEGORIES = new Set(['refund', 'annulation']);

export type RegisterPaymentMethod = 'cash' | 'card' | 'mobile_money';

export interface CashTransactionLike {
    type: string;
    category?: string | null;
    amount: number;
    payment_method?: RegisterPaymentMethod | null;
}

export function isCashRefund(tx: { type: string; category?: string | null }): boolean {
    return tx.type === 'expense' && REFUND_CATEGORIES.has(tx.category ?? '');
}

export function isCashBusinessExpense(tx: { type: string; category?: string | null }): boolean {
    return tx.type === 'expense' && !isCashRefund(tx);
}

export function getTransactionPaymentMethod(tx: CashTransactionLike): RegisterPaymentMethod | null {
    if (tx.type !== 'income') return null;
    return tx.payment_method ?? 'cash';
}

export function isPhysicalCashIncome(tx: CashTransactionLike): boolean {
    return tx.type === 'income' && getTransactionPaymentMethod(tx) === 'cash';
}

export function paymentMethodLabel(method: RegisterPaymentMethod | null | undefined): string {
    switch (method) {
        case 'card':
            return 'Carte';
        case 'mobile_money':
            return 'Mobile';
        default:
            return 'Espèces';
    }
}

/** Tous les encaissements session (espèces + carte + mobile). */
export function sumCashIncome(transactions: CashTransactionLike[] | null | undefined): number {
    return transactions?.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) ?? 0;
}

/** Encaissements espèces uniquement (solde physique du tiroir). */
export function sumPhysicalCashIncome(transactions: CashTransactionLike[] | null | undefined): number {
    return transactions?.filter(isPhysicalCashIncome).reduce((s, t) => s + Number(t.amount), 0) ?? 0;
}

export function sumIncomeByMethod(
    transactions: CashTransactionLike[] | null | undefined,
    method: RegisterPaymentMethod
): number {
    return transactions?.filter((t) => t.type === 'income' && getTransactionPaymentMethod(t) === method)
        .reduce((s, t) => s + Number(t.amount), 0) ?? 0;
}

export function sumCashBusinessExpenses(
    transactions: Array<{ type: string; category?: string | null; amount: number }> | null | undefined
): number {
    return transactions?.filter(isCashBusinessExpense).reduce((s, t) => s + Number(t.amount), 0) ?? 0;
}

export function sumCashRefunds(
    transactions: Array<{ type: string; category?: string | null; amount: number }> | null | undefined
): number {
    return transactions?.filter(isCashRefund).reduce((s, t) => s + Number(t.amount), 0) ?? 0;
}

/** Encaissé net session = entrées − remboursements (tous modes). */
export function sumCashNetIncome(transactions: CashTransactionLike[] | null | undefined): number {
    return sumCashIncome(transactions) - sumCashRefunds(transactions);
}

/** Toutes les sorties (dépenses + remboursements) pour le solde caisse. */
export function sumCashOutflows(
    transactions: Array<{ type: string; amount: number }> | null | undefined
): number {
    return transactions?.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) ?? 0;
}

/** Solde théorique du tiroir = fond + espèces encaissées − sorties. */
export function sumPhysicalCashTheoreticalBalance(
    openingBalance: number,
    transactions: CashTransactionLike[] | null | undefined
): number {
    const opening = Number(openingBalance) || 0;
    return opening + sumPhysicalCashIncome(transactions) - sumCashOutflows(transactions);
}
