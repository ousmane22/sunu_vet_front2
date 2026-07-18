export interface StaffMember {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  business_id?: number | null;
  business_name?: string;
  business_type?: string;
  roles: string[];
  role: string;
  permissions?: string[];
  role_permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface StaffRoleOption {
  value: string;
  label: string;
}

export interface StaffListResponse {
  data: StaffMember[];
}

export interface StaffMemberResponse {
  data: StaffMember;
  message?: string;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  password_confirmation?: string;
}




