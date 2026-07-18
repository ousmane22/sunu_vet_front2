import { Product } from './product.model';
import { SaleClient } from './sale.model';

export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'converted' | 'cancelled';
export type QuoteType = 'quote' | 'proforma';

export interface QuoteItem {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product?: Product;
}

export interface Quote {
    id: number;
    type: QuoteType;
    status: QuoteStatus;
    created_at: string;
    valid_until?: string;
    notes?: string;

    // Client
    client?: SaleClient | null;

    // Montants
    total_amount: number;
    discount_type?: 'amount' | 'percent' | null;
    discount_value: number;
    discount_amount: number;
    net_amount: number;

    // Items
    items: QuoteItem[];
    user?: { id: number; name: string };
}

export interface QuoteListResponse {
    data: Quote[];
    current_page: number;
    last_page: number;
    total: number;
}

export interface CreateQuotePayload {
    client_id?: number | null;
    type: QuoteType;
    items: {
        product_id: number;
        quantity: number;
    }[];
    discount_type?: 'amount' | 'percent' | null;
    discount_value?: number;
    valid_until?: string;
    notes?: string;
}
