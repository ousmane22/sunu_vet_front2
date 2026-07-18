export interface CashTransaction {
    id: number;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description?: string;
    date: string;
    user?: {
        id: number;
        name: string;
    };
    created_at: string;
}

export interface CashRegister {
    id: number;
    date: string;
    opening_balance: number;
    closing_balance?: number | null;
    status: 'open' | 'closed';
    user?: {
        id: number;
        name: string;
    };
    transactions?: CashTransaction[];
    created_at: string;
}

export interface CashRegisterSingleResponse {
    message?: string;
    data: CashRegister | null;
}

export interface CashRegisterListResponse {
    data: CashRegister[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
}

export interface OpenCashRegisterPayload {
    opening_balance: number;
}

export interface CloseCashRegisterPayload {
    closing_balance: number;
}




