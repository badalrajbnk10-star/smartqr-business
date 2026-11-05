import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profile, Business, Plan, Subscription, QRCode, QRTemplate } from '../types/database';

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  'https://kglodawxcydeqegvisrf.supabase.co';
const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnbG9kYXd4Y3lkZXFlZ3Zpc3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4NzI3MzcsImV4cCI6MjEwOTQ0ODczN30.8UJZmCpMe-vvC4-b-PJokc9sfW99nngWQlN2Lso4VUo';

export const isDemoMode = false;

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: true,
      },
      // Avoid realtime websocket errors in Node/Vitest headless testing
      realtime: typeof window !== 'undefined' ? {} : undefined,
    });
  }
  return supabaseInstance;
};

export const supabase = {
  get auth() {
    return getSupabase().auth;
  },
  from(table: string) {
    return getSupabase().from(table);
  },
};

// Seed default mock plans for instant local testing and offline capability
export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    slug: 'starter',
    price_paise: 9900,
    billing_period: 'monthly',
    max_businesses: 1,
    max_photos_per_business: 5,
    features: [
      'One business profile',
      'Up to 5 photos',
      'Basic QR design',
      'Call button',
      'Google Maps directions',
      'Google Review button'
    ],
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-professional',
    name: 'Professional',
    slug: 'professional',
    price_paise: 19900,
    billing_period: 'monthly',
    max_businesses: 1,
    max_photos_per_business: 20,
    features: [
      'One business profile',
      'Up to 20 photos',
      'Premium QR templates',
      'Custom business logo on QR',
      'Real-time scan analytics',
      'Unlimited profile editing & live updates'
    ],
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plan-business-plus',
    name: 'Business Plus',
    slug: 'business-plus',
    price_paise: 39900,
    billing_period: 'monthly',
    max_businesses: 3,
    max_photos_per_business: 50,
    features: [
      'Up to 3 business profiles',
      'Up to 50 photos per profile',
      'All premium QR designs & printable kits',
      'Advanced visitor & device analytics',
      'Interactive digital menu & service catalog',
      'Priority customer support'
    ],
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const DEFAULT_QR_TEMPLATES: QRTemplate[] = [
  {
    id: 'tmpl-classic-bw',
    name: 'Classic Black & White',
    slug: 'classic-bw',
    category: 'minimal',
    foreground_color: '#000000',
    background_color: '#FFFFFF',
    frame_style: 'standard',
    badge_text: 'SCAN ME',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tmpl-indigo-stand',
    name: 'Premium Indigo Stand',
    slug: 'indigo-table-stand',
    category: 'table_stand',
    foreground_color: '#1E1B4B',
    background_color: '#FFFFFF',
    frame_style: 'table_tent',
    badge_text: 'SCAN FOR MENU & REVIEWS',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tmpl-emerald-poster',
    name: 'Emerald Business Poster',
    slug: 'emerald-poster',
    category: 'poster',
    foreground_color: '#064E3B',
    background_color: '#FFFFFF',
    frame_style: 'bordered_poster',
    badge_text: 'CONNECT WITH US',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tmpl-royal-gold',
    name: 'Royal Gold Card',
    slug: 'royal-gold-card',
    category: 'business_card',
    foreground_color: '#78350F',
    background_color: '#FEF3C7',
    frame_style: 'card_compact',
    badge_text: 'DIGITAL PROFILE',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tmpl-crimson-sticker',
    name: 'Crimson Storefront Sticker',
    slug: 'crimson-sticker',
    category: 'sticker',
    foreground_color: '#991B1B',
    background_color: '#FFFFFF',
    frame_style: 'circular_badge',
    badge_text: 'RATE US ON GOOGLE',
    is_active: true,
    created_at: new Date().toISOString(),
  }
];
