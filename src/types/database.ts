// ============================================================================
// SMARTQR BUSINESS SaaS - TYPESCRIPT DATABASE DEFINITIONS
// ============================================================================

export type UserRole = 'business_owner' | 'super_admin';

export type BusinessStatus = 'trialing' | 'active' | 'suspended' | 'expired';

export type SubscriptionStatus =
  | 'trialing'
  | 'pending'
  | 'active'
  | 'past_due'
  | 'halted'
  | 'cancelled'
  | 'expired'
  | 'suspended';

export type MandateStatus = 'pending' | 'authorized' | 'active' | 'failed' | 'cancelled';

export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';

export type QRFrameStyle = 'standard' | 'table_tent' | 'bordered_poster' | 'card_compact' | 'circular_badge' | 'minimal';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  image_url?: string;
  is_available: boolean;
}

export interface BusinessService {
  id: string;
  name: string;
  price?: number;
  duration?: string;
  description?: string;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface Business {
  id: string;
  owner_id: string;
  category_id?: string;
  slug: string; // Used in permanent public url: /b/:slug
  name: string;
  short_description?: string;
  full_description?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  google_maps_url?: string;
  google_review_url?: string;
  opening_hours: OpeningHours;
  logo_url?: string;
  banner_url?: string;
  menu_items: MenuItem[];
  services: BusinessService[];
  is_active: boolean;
  status: BusinessStatus;
  suspension_reason?: string;
  created_at: string;
  updated_at: string;

  // Joined relations
  category?: BusinessCategory;
  photos?: BusinessPhoto[];
  qr_code?: QRCode;
  subscription?: Subscription;
}

export interface BusinessPhoto {
  id: string;
  business_id: string;
  photo_url: string;
  caption?: string;
  sort_order: number;
  created_at: string;
}

export interface QRTemplate {
  id: string;
  name: string;
  slug: string;
  category: 'table_stand' | 'poster' | 'business_card' | 'sticker' | 'minimal';
  foreground_color: string;
  background_color: string;
  frame_style: QRFrameStyle;
  badge_text?: string;
  preview_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface QRCode {
  id: string;
  business_id: string;
  permanent_code: string;
  permanent_url: string;
  foreground_color: string;
  background_color: string;
  logo_url?: string;
  frame_type: QRFrameStyle;
  custom_text: string;
  template_id?: string;
  total_scans: number;
  last_scanned_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price_paise: number; // e.g. 9900 = ₹99
  billing_period: string;
  max_businesses: number;
  max_photos_per_business: number;
  features: string[];
  razorpay_plan_id?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  business_owner_id: string;
  business_id?: string;
  plan_id: string;
  status: SubscriptionStatus;
  trial_started_at: string;
  trial_expires_at: string;
  current_period_start?: string;
  current_period_end?: string;
  razorpay_subscription_id?: string;
  razorpay_customer_id?: string;
  autopay_mandate_status: MandateStatus;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;

  plan?: Plan;
}

export interface Payment {
  id: string;
  subscription_id?: string;
  business_owner_id: string;
  amount_paise: number;
  currency: string;
  status: PaymentStatus;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  payment_method?: string;
  error_code?: string;
  error_description?: string;
  created_at: string;
}

export interface ScanEvent {
  id: string;
  qr_code_id: string;
  business_id: string;
  scanned_at: string;
  ip_hash: string;
  user_agent?: string;
  device_type: 'mobile' | 'tablet' | 'desktop' | 'bot';
  city?: string;
  country: string;
  is_valid_scan: boolean;
}

export interface Notification {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  type: 'trial' | 'payment' | 'subscription' | 'security' | 'system';
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat_paise';
  discount_value: number;
  max_uses: number;
  current_uses: number;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  created_at: string;
  actor?: Profile;
}

export interface SupportRequest {
  id: string;
  user_id: string;
  business_id?: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
}
