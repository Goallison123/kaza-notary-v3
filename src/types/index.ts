export type ClientStatus =
  | 'Pending'
  | 'Filing Details'
  | 'Ready'
  | 'Archived'
  | 'Signed & Recorded'
  | 'Rejected'
  | 'Pending Verification';

export type FieldType =
  | 'text' | 'long_text' | 'date' | 'number' | 'phone' | 'email'
  | 'dropdown' | 'radio' | 'checkbox' | 'national_id' | 'file_upload' | 'signature';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type PlanTier = 'Free-Trial' | 'Basic' | 'Professional' | 'Enterprise';

export interface Office {
  id: string;
  name: string;
  momo_code: string | null;
  subscription_expires_at: string;
  account_status: 'Active' | 'Suspended' | 'Trial';
  user_id: string | null;
  created_at: string;
  plan_tier: PlanTier;
  branch_count: number;
  monthly_request_counter: number;
  monthly_counter_reset_at: string | null;
}

export interface TeamMember {
  id: string;
  office_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff';
  user_id: string | null;
  status: 'invited' | 'active' | 'removed';
  created_at: string;
}

export interface ClientLog {
  id: string;
  client_number: number;
  office_id: string;
  token: string;
  full_name: string;
  phone_number: string;
  national_id: string | null;
  service_type: string | null;
  category_id: string | null;
  residential_address: string | null;
  signature_base64: string | null;
  form_data: Record<string, unknown> | null;
  status: ClientStatus;
  submitted_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface ServiceCategory {
  id: string;
  office_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface FieldOption {
  id: string;
  field_id: string;
  label: string;
  value: string;
  option_order: number;
}

export interface CategoryField {
  id: string;
  category_id: string;
  label: string;
  type: FieldType;
  placeholder: string | null;
  help_text: string | null;
  required: boolean;
  field_order: number;
  max_files: number;
  accepted_types: string[] | null;
  options?: FieldOption[];
  created_at: string;
}

export interface Notification {
  id: string;
  office_id: string;
  title: string;
  body: string | null;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export interface ScanFormData {
  token: string;
  client_name: string;
  status: ClientStatus;
  expires_at: string | null;
  category_name: string;
  category_description: string | null;
  office_name: string;
  fields: ScanField[];
}

export interface ScanField {
  id: string;
  label: string;
  type: FieldType;
  placeholder: string | null;
  help_text: string | null;
  required: boolean;
  field_order: number;
  max_files: number;
  accepted_types: string[] | null;
  options: Array<{ id: string; label: string; value: string }>;
}

export type AppView = 'dashboard' | 'records' | 'settings';
export type ViewName = 'landing' | AppView;
