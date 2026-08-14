/** Catégories de sortie caisse qui sont des remboursements (pas des dépenses métier). */
const REFUND_CATEGORIES = new Set(['refund', 'annulation']);

export function isCashRefund(tx: { type: string; category?: string | null }): boolean {
    return tx.type === 'expense' && REFUND_CATEGORIES.has(tx.category ?? '');
}

export function isCashBusinessExpense(tx: { type: string; category?: string | null }): boolean {
    return tx.type === 'expense' && !isCashRefund(tx);
}

export function sumCashIncome(transactions: Array<{ type: string; amount: number }> | null | undefined): number {
    return transactions?.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) ?? 0;
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

/** Encaissé net session = entrées − remboursements (aligné rapports / solde théorique). */
export function sumCashNetIncome(
    transactions: Array<{ type: string; category?: string | null; amount: number }> | null | undefined
): number {
    return sumCashIncome(transactions) - sumCashRefunds(transactions);
}

/** Toutes les sorties (dépenses + remboursements) pour le solde caisse. */
export function sumCashOutflows(
    transactions: Array<{ type: string; amount: number }> | null | undefined
): number {
    return transactions?.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) ?? 0;
}
