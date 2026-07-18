export interface Business {
    id: number;
    name?: string;
    business_type: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    country: string;
    status: string;
    is_active: boolean;
    created_at: string;
    /** Fin d’essai côté fiche entreprise (peut différer de subscriptions.ends_at si données désalignées). */
    trial_ends_at?: string | null;
    trial_days_remaining?: number;
    is_on_trial?: boolean;
    subscriptions?: Subscription[];
    users?: User[];
}

/** Statuts alignés sur la colonne SQL `subscriptions.status`. */
export type SubscriptionStatusDb = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';

export interface Subscription {
    id: number;
    business_id: number;
    subscription_plan_id: number;
    status: SubscriptionStatusDb | string;
    amount: number;
    currency: string;
    starts_at: string;
    ends_at: string;
    next_billing_at?: string;
    auto_renew: boolean;
    cancelled_at?: string | null;
    created_at?: string;
    plan?: SubscriptionPlan;
    payments?: SubscriptionPayment[];
}

export interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    currency: string;
    duration_days: number;
}

export interface SubscriptionPayment {
    id: number;
    subscription_id: number;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    payment_method: string | null;
    transaction_id: string | null;
    paid_at: string | null;
    created_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    business_id: number | null;
    roles: string[];
    created_at: string;
}

export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    total: number;
    last_page: number;
    per_page: number;
}




