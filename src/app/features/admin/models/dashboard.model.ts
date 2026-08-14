export interface DashboardStats {
  active_businesses: number;
  pending_businesses: number;
  total_users: number;
  monthly_revenue: number;
  yearly_revenue: number;
  revenue_last_7_days: DashboardRevenueDay[];
  businesses_growth: DashboardBusinessGrowthMonth[];
  recent_businesses: RecentBusiness[];
}

export interface DashboardRevenueDay {
  date: string;
  label: string;
  amount: number;
}

export interface DashboardBusinessGrowthMonth {
  month: string;
  label: string;
  count: number;
}

export interface RecentBusiness {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface StatsResponse {
  data: DashboardStats;
}
