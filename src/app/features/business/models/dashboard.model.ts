export interface DashboardActivity {
  id: number;
  type: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

export interface DashboardAppointment {
  id: number;
  client_name: string;
  animal_name: string;
  time: string;
  type: string;
  status: string;
}

export interface BusinessDashboardStats {
  today_sales: number;
  today_consultations: number;
  total_clients: number;
  low_stock_items: number;
  today_revenue: number;
  month_revenue: number;
  recent_activities: DashboardActivity[];
}

export interface BusinessDashboardResponse {
  data: BusinessDashboardStats;
}




