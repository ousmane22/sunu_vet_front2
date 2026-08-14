export interface TreasuryReport {
    total_revenue: number;
    total_expenses: number;
    net_margin: number;
    expenses_by_category: {
        category: string;
        total: number;
    }[];
    period: 'month' | 'year';
}

export interface StockReport {
    total_valuation: number;
    low_stock_count: number;
    expiring_soon_count: number;
    top_sellers: {
        name: string;
        total_sold: number;
    }[];
}

export interface StockAnalyticalLine {
    product_id: number;
    product_name: string;
    sku: string | null;
    stock_debut: number;
    entrees: number;
    ventes: number;
    stock_restant: number;
    prix_achat: number;
    valeur_stock: number;
}

export interface StockAnalyticalReport {
    period: { start: string; end: string };
    period_type: string;
    lines: StockAnalyticalLine[];
}

export interface MedicalReport {
    start_date?: string;
    end_date?: string;
    total_consultations: number;
    total_consultations_net: number;
    total_consultations_collected?: number;
    partial_consultations_count?: number;
    by_species: {
        animal_species: string;
        count: number;
        total_net?: number;
    }[];
    monthly_volume: {
        month: string;
        total: number;
    }[];
}

export interface DebtsReport {
    total_outstanding: number;
    debtors_count: number;
    top_debtors: {
        id: number;
        name: string;
        phone: string;
        balance_due: number;
    }[];
}

export interface PerformanceReport {
    period: {
        start: string;
        end: string;
    };
    summary: {
        sales_count: number;
        sales_net: number;
        sales_collected: number;
        sales_partial_count: number;
        consultations_count: number;
        consultations_net: number;
        consultations_collected: number;
        consultations_partial_count: number;
        total_net: number;
        total_collected: number;
    };
    payments: {
        payment_method: string;
        total: number;
    }[];
    new_debts: number;
    top_articles: {
        name: string;
        qty: number;
        total: number;
    }[];
}




