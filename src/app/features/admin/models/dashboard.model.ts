export interface DashboardStats {
    active_businesses: number;
    pending_businesses: number;
    total_users: number;
    total_visits: number;
    unique_visitors: number;
    monthly_revenue: number;
    recent_visits: SiteVisit[];
}

export interface SiteVisit {
    id: number;
    ip_address: string;
    user_agent: string;
    path: string;
    referer: string;
    created_at: string;
}

export interface StatsResponse {
    data: DashboardStats;
}




