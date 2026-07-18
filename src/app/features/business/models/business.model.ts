export interface SubscriptionPlanProfile {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price?: number;
  formatted_price?: string;
  currency?: string;
  duration_days?: number;
  duration_in_months?: number;
}

export interface ActiveSubscriptionProfile {
  id: number;
  business_id: number;
  subscription_plan_id: number;
  plan?: SubscriptionPlanProfile;
  starts_at: string;
  ends_at: string;
  status: string;
  amount?: number;
  currency?: string;
  auto_renew?: boolean;
  days_remaining?: number;
  is_active?: boolean;
  is_expired?: boolean;
}

export interface BusinessProfile {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  logo: string | null;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  status: string;
  settings?: { require_open_register?: boolean;[key: string]: any; };
  is_active: boolean;
  is_on_trial?: boolean;
  trial_ends_at: string | null;
  trial_days_remaining?: number;
  has_active_subscription?: boolean;
  active_subscription?: ActiveSubscriptionProfile | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfileResponse {
  data: BusinessProfile;
}

export type BusinessProfileUpdatePayload = Partial<
  Pick<
    BusinessProfile,
    | 'name'
    | 'email'
    | 'phone'
    | 'address'
    | 'city'
    | 'postal_code'
    | 'country'
    | 'description'
    | 'website'
    | 'settings'
  >
>;




