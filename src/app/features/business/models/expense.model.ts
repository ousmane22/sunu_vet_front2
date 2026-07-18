export interface Expense {
    id: number;
    business_id: number;
    user?: {
        id: number;
        name: string;
    };
    cash_register_id?: number | null;
    category: string;
    amount: number;
    payment_method: string;
    description?: string;
    reference_document?: string;
    expense_date?: string;
    status: 'completed' | 'cancelled';
    created_at?: string;
}

export interface CreateExpensePayload {
    category: string;
    amount: number;
    payment_method: string;
    description?: string;
    reference_document?: string;
    expense_date?: string;
}

export interface ExpenseListResponse {
    data: Expense[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
}




