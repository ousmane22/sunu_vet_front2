import { Product } from './product.model';

export interface SaleItem {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product?: Product;
}

export interface SalePayment {
    id: number;
    amount: number;
    payment_method: 'cash' | 'card' | 'mobile_money';
    note?: string | null;
    paid_at: string;
    user?: { id: number; name: string };
}

export interface Payment extends SalePayment {
    payable_id: number;
    payable_type: string;
    client?: SaleClient | null;
}

export interface SaleClient {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
    balance_due: number;
}

export interface SaleListItem {
    id: number;
    status: 'completed' | 'partial' | 'cancelled';
    payment_method: 'cash' | 'card' | 'mobile_money';
    created_at: string;
    total_amount: number;
    discount_amount: number;
    net_amount: number;
    amount_paid: number;
    amount_due: number;
    items_count: number;
    user?: { id: number; name: string } | null;
}

export interface Sale {
    id: number;
    status: 'completed' | 'partial' | 'cancelled';
    payment_method: 'cash' | 'card' | 'mobile_money';
    created_at: string;

    // Client
    client?: SaleClient | null;

    // Montants
    total_amount: number;
    discount_type?: 'amount' | 'percent' | null;
    discount_value: number;
    discount_amount: number;
    net_amount: number;

    // Paiements calculés
    amount_paid: number;
    amount_due: number;
    change_given: number;

    // Relations
    payments: SalePayment[];
    items: SaleItem[];
    user?: { id: number; name: string };
}

export interface Client {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
    balance_due: number;
    created_at?: string;
}

export interface ClientListResponse {
    data: Client[];
}

import type { Consultation } from './consultation.model';

/** Résumé pour détail client : ventes, paiements, montant généré, consultations */
export interface ClientDetail extends Client {
    sales?: Sale[];
    payments?: Payment[];
    total_generated?: number;
    consultations?: Consultation[];
}

export interface ClientSingleResponse {
    data: ClientDetail;
    message?: string;
}

export interface SaleListResponse {
    data: SaleListItem[];
    meta?: {
        current_page: number;
        last_page: number;
        total: number;
    };
    summary?: {
        total_amount: number;
        count: number;
    };
}

export interface SaleSingleResponse {
    data: Sale;
    message?: string;
}

export interface CreateSalePayload {
    client_id?: number | null;
    payment_method: 'cash' | 'card' | 'mobile_money';
    amount_paid: number;
    discount_type?: 'amount' | 'percent' | null;
    discount_value?: number;
    items: {
        product_id: number;
        quantity: number;
    }[];
}

export interface AddPaymentPayload {
    amount: number;
    payment_method: 'cash' | 'card' | 'mobile_money';
    note?: string;
}




