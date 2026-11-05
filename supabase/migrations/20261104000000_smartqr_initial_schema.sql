-- ============================================================================
-- SMARTQR BUSINESS SaaS PLATFORM - PRODUCTION DATABASE MIGRATION
-- Multi-Business, Dynamic QR Engine, Razorpay UPI AutoPay, Isolated Super Admin
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (Users: business owners & super admins)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'business_owner' CHECK (role IN ('business_owner', 'super_admin')),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. BUSINESS CATEGORIES
CREATE TABLE IF NOT EXISTS public.business_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default business categories
INSERT INTO public.business_categories (name, slug, icon, description, sort_order) VALUES
('Hotels & Lodging', 'hotels', 'Hotel', 'Hotels, resorts, guesthouses and stays', 1),
('Restaurants & Dining', 'restaurants', 'Utensils', 'Dine-in, family restaurants and eateries', 2),
('Cafes & Bakeries', 'cafes', 'Coffee', 'Coffee shops, bakeries and snack bars', 3),
('Retail & Shops', 'shops', 'ShoppingBag', 'Clothing, electronics, grocery and retail stores', 4),
('Salons & Spas', 'salons', 'Scissors', 'Hair salons, beauty parlors and wellness spas', 5),
('Hospitals & Clinics', 'hospitals', 'Cross', 'Hospitals, medical clinics and dental care', 6),
('Coaching & Education', 'coaching', 'GraduationCap', 'Coaching centers, schools and tuition institutes', 7),
('Professional & Other Services', 'other', 'Briefcase', 'Real estate, consulting, fitness gyms and other services', 8)
ON CONFLICT (slug) DO NOTHING;

-- 3. BUSINESSES (Each owner can own 1 or more profiles depending on plan)
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.business_categories(id) ON DELETE SET NULL,
    slug TEXT NOT NULL UNIQUE, -- Permanent identifier used in https://domain.com/b/:slug
    name TEXT NOT NULL,
    short_description TEXT,
    full_description TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    pincode TEXT,
    google_maps_url TEXT,
    google_review_url TEXT,
    opening_hours JSONB NOT NULL DEFAULT '{"monday":{"open":"09:00","close":"21:00","closed":false},"tuesday":{"open":"09:00","close":"21:00","closed":false},"wednesday":{"open":"09:00","close":"21:00","closed":false},"thursday":{"open":"09:00","close":"21:00","closed":false},"friday":{"open":"09:00","close":"21:00","closed":false},"saturday":{"open":"09:00","close":"21:00","closed":false},"sunday":{"open":"10:00","close":"18:00","closed":false}}'::jsonb,
    logo_url TEXT,
    banner_url TEXT,
    menu_items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {name, price, description, category, image_url}
    services JSONB NOT NULL DEFAULT '[]'::jsonb,   -- Array of {name, price, duration, description}
    is_active BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'suspended', 'expired')),
    suspension_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. BUSINESS PHOTOS
CREATE TABLE IF NOT EXISTS public.business_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. QR TEMPLATES
CREATE TABLE IF NOT EXISTS public.qr_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('table_stand', 'poster', 'business_card', 'sticker', 'minimal')),
    foreground_color TEXT NOT NULL DEFAULT '#000000',
    background_color TEXT NOT NULL DEFAULT '#FFFFFF',
    frame_style TEXT NOT NULL DEFAULT 'standard',
    badge_text TEXT,
    preview_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default QR Templates
INSERT INTO public.qr_templates (name, slug, category, foreground_color, background_color, frame_style, badge_text) VALUES
('Classic Black & White', 'classic-bw', 'minimal', '#000000', '#FFFFFF', 'standard', 'SCAN ME'),
('Premium Indigo Stand', 'indigo-table-stand', 'table_stand', '#1E1B4B', '#FFFFFF', 'table_tent', 'SCAN FOR MENU & REVIEWS'),
('Emerald Business Poster', 'emerald-poster', 'poster', '#064E3B', '#FFFFFF', 'bordered_poster', 'CONNECT WITH US'),
('Royal Gold Card', 'royal-gold-card', 'business_card', '#78350F', '#FEF3C7', 'card_compact', 'DIGITAL PROFILE'),
('Crimson Storefront Sticker', 'crimson-sticker', 'sticker', '#991B1B', '#FFFFFF', 'circular_badge', 'RATE US ON GOOGLE')
ON CONFLICT (slug) DO NOTHING;

-- 6. DYNAMIC QR CODES (Permanent URL bound to each business)
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
    permanent_code TEXT NOT NULL UNIQUE,
    permanent_url TEXT NOT NULL, -- e.g. https://domain.com/b/:slug
    foreground_color TEXT NOT NULL DEFAULT '#000000',
    background_color TEXT NOT NULL DEFAULT '#FFFFFF',
    logo_url TEXT,
    frame_type TEXT NOT NULL DEFAULT 'standard',
    custom_text TEXT NOT NULL DEFAULT 'SCAN ME FOR DETAILS & REVIEWS',
    template_id UUID REFERENCES public.qr_templates(id) ON DELETE SET NULL,
    total_scans BIGINT NOT NULL DEFAULT 0,
    last_scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. PLANS (Super Admin Configurable)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price_paise INT NOT NULL, -- 9900 = ₹99, 19900 = ₹199, 39900 = ₹399
    billing_period TEXT NOT NULL DEFAULT 'monthly',
    max_businesses INT NOT NULL DEFAULT 1,
    max_photos_per_business INT NOT NULL DEFAULT 5,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    razorpay_plan_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Initial Plans as specified in prompt
INSERT INTO public.plans (name, slug, price_paise, billing_period, max_businesses, max_photos_per_business, features, sort_order) VALUES
('Starter', 'starter', 9900, 'monthly', 1, 5, '["One business profile", "Up to 5 photos", "Basic QR design", "Call button", "Maps button", "Google Review button"]'::jsonb, 1),
('Professional', 'professional', 19900, 'monthly', 1, 20, '["One business profile", "Up to 20 photos", "Premium QR templates", "Logo support", "Scan analytics", "Profile editing & live updates"]'::jsonb, 2),
('Business Plus', 'business-plus', 39900, 'monthly', 3, 50, '["Up to 3 business profiles", "Up to 50 photos per profile", "Premium QR designs & print kit", "Advanced analytics", "Menu and service sections", "Priority support"]'::jsonb, 3)
ON CONFLICT (slug) DO NOTHING;

-- 8. SUBSCRIPTIONS (Strict state machine with 24-hr trial & Razorpay UPI AutoPay)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'pending', 'active', 'past_due', 'halted', 'cancelled', 'expired', 'suspended')),
    trial_started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    trial_expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '24 hours'),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    razorpay_subscription_id TEXT,
    razorpay_customer_id TEXT,
    autopay_mandate_status TEXT DEFAULT 'pending' CHECK (autopay_mandate_status IN ('pending', 'authorized', 'active', 'failed', 'cancelled')),
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. PAYMENTS (Audit log of all Razorpay transactions)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    business_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_paise INT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    razorpay_payment_id TEXT UNIQUE,
    razorpay_order_id TEXT,
    razorpay_signature TEXT,
    payment_method TEXT DEFAULT 'upi',
    error_code TEXT,
    error_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. WEBHOOK EVENTS (Idempotency and audit of Razorpay webhooks)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'processed' CHECK (status IN ('received', 'processed', 'failed', 'ignored')),
    error_message TEXT,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. SCAN EVENTS (Analytics for customer visits)
CREATE TABLE IF NOT EXISTS public.scan_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ip_hash TEXT NOT NULL,
    user_agent TEXT,
    device_type TEXT NOT NULL DEFAULT 'mobile' CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'bot')),
    city TEXT,
    country TEXT DEFAULT 'India',
    is_valid_scan BOOLEAN NOT NULL DEFAULT true
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('trial', 'payment', 'subscription', 'security', 'system')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat_paise')),
    discount_value INT NOT NULL,
    max_uses INT NOT NULL DEFAULT 100,
    current_uses INT NOT NULL DEFAULT 0,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. AUDIT LOGS (Super Admin Action History)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role TEXT NOT NULL DEFAULT 'super_admin',
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. SUPPORT REQUESTS
CREATE TABLE IF NOT EXISTS public.support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. PLATFORM SETTINGS (Key-Value configuration for Super Admin)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.platform_settings (key, value) VALUES
('general', '{"website_name":"SmartQR Business","support_email":"support@smartqr.in","support_phone":"+91 98765 43210","maintenance_mode":false,"trial_duration_hours":24}'::jsonb),
('razorpay', '{"test_mode":true,"currency":"INR"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_qr_codes_business ON public.qr_codes(business_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes(permanent_code);
CREATE INDEX IF NOT EXISTS idx_subscriptions_owner ON public.subscriptions(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_scan_events_qr ON public.scan_events(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_date ON public.scan_events(scanned_at);
CREATE INDEX IF NOT EXISTS idx_payments_owner ON public.payments(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view & edit their own profile; Super Admins can view/edit all
CREATE POLICY "Profiles view self" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_super_admin());
CREATE POLICY "Profiles update self" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_super_admin());

-- Businesses: Anyone can view active business profiles (for public QR landing page!); Owners & Admin can edit
CREATE POLICY "Businesses public view" ON public.businesses FOR SELECT USING (is_active = true OR owner_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "Businesses owner insert" ON public.businesses FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "Businesses owner update" ON public.businesses FOR UPDATE USING (owner_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "Businesses owner delete" ON public.businesses FOR DELETE USING (owner_id = auth.uid() OR public.is_super_admin());

-- QR Codes: Public view for scan; Owner edit
CREATE POLICY "QR Codes public view" ON public.qr_codes FOR SELECT USING (true);
CREATE POLICY "QR Codes owner modify" ON public.qr_codes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = qr_codes.business_id AND (businesses.owner_id = auth.uid() OR public.is_super_admin()))
);

-- Plans & Categories: Public read, Super Admin write
CREATE POLICY "Public read plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Admin write plans" ON public.plans FOR ALL USING (public.is_super_admin());

CREATE POLICY "Public read categories" ON public.business_categories FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON public.business_categories FOR ALL USING (public.is_super_admin());

CREATE POLICY "Public read qr templates" ON public.qr_templates FOR SELECT USING (true);
CREATE POLICY "Admin write qr templates" ON public.qr_templates FOR ALL USING (public.is_super_admin());

-- Subscriptions & Payments: Owner can view self; Admin full control
CREATE POLICY "Owner view subscriptions" ON public.subscriptions FOR SELECT USING (business_owner_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "Admin write subscriptions" ON public.subscriptions FOR ALL USING (public.is_super_admin());

CREATE POLICY "Owner view payments" ON public.payments FOR SELECT USING (business_owner_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "Admin write payments" ON public.payments FOR ALL USING (public.is_super_admin());

-- Audit logs: Super Admin only
CREATE POLICY "Admin view audit logs" ON public.audit_logs FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Admin insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (public.is_super_admin());

-- Platform Settings: Super Admin only for write, public general settings
CREATE POLICY "View settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON public.platform_settings FOR ALL USING (public.is_super_admin());
