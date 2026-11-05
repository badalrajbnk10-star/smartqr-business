# SmartQR Business SaaS Platform - Database Setup & Architecture

This guide details the complete database configuration, Supabase migration execution, Row Level Security (RLS) policies, and data models.

---

## 1. Relational Schema Overview
The database is built on PostgreSQL via Supabase and contains 16 core tables:

1. `public.profiles`: Stores registered business owners and root super administrators (`id`, `email`, `full_name`, `phone`, `role`, `is_active`, `created_at`).
2. `public.business_categories`: Business industries (Hotels, Restaurants, Cafes, Retail, Salons, Hospitals, Coaching, Services).
3. `public.businesses`: The core business profiles. Each row represents a physical outlet and holds the permanent unique `slug` (e.g. `/b/grand-heritage`), contact details, Google Review URL, Google Maps link, opening hours JSONB, and status (`trialing`, `active`, `suspended`, `expired`).
4. `public.business_photos`: Multi-photo gallery linked to businesses with order indexes.
5. `public.qr_templates`: Templates for printable assets (Table Stand Tent, Storefront Poster, Counter Sticker, Compact Business Card).
6. `public.qr_codes`: Dynamic QR entity storing permanent destination URLs, color codes, logo embedding options, and cumulative scan counters.
7. `public.plans`: Configurable subscription tiers (Starter ₹99/mo, Professional ₹199/mo, Business Plus ₹399/mo) storing prices safely in integer paise (e.g. 9900 paise = ₹99.00).
8. `public.subscriptions`: Subscription state machine managing trial started timestamp, 24-hr trial expiration, current period timestamps, and Razorpay UPI AutoPay mandate statuses.
9. `public.payments`: Audit trail of all transactions, Razorpay Payment IDs, and verification signatures.
10. `public.webhook_events`: Idempotency storage preventing duplicate processing of Razorpay webhook events.
11. `public.scan_events`: Privacy-first customer scan telemetry (device category, timestamp, anonymized IP hash).
12. `public.notifications`: System, trial expiry, and billing notifications.
13. `public.coupons`: Promotional discount codes.
14. `public.audit_logs`: Immutable security log tracking all Super Admin operations.
15. `public.support_requests`: Customer inquiries submitted to the support desk.
16. `public.platform_settings`: Key-value configuration for global platform controls (e.g. `trial_duration_hours`).

---

## 2. How to Run the Migration on Supabase

### Option A: Via Supabase Web Dashboard (Recommended & Easiest)
1. Go to your Supabase Dashboard ([supabase.com](https://supabase.com)) and select your project.
2. In the left navigation, click **SQL Editor**.
3. Open the file `supabase/migrations/20261104000000_smartqr_initial_schema.sql` located in this project.
4. Copy the entire contents and paste into the Supabase SQL Editor.
5. Click **Run** (or press Ctrl + Enter).
6. All 16 tables, performance indexes, and Row Level Security policies will be created instantly.

### Option B: Via Supabase CLI
```bash
supabase db push
```

---

## 3. Row Level Security (RLS) Policies
Row Level Security is enabled on all tables:
- **Businesses & QR Codes:** Public can SELECT active business records (required for customer QR scans at `/b/:slug`), but only the authenticated business owner or Super Admin can INSERT, UPDATE, or DELETE.
- **Subscriptions & Payments:** Only accessible by the account owner or Super Admin.
- **Audit Logs:** Strictly restricted to authenticated `super_admin` role via the `is_super_admin()` database function.
- **Platform Plans:** Public can read plans, but only Super Admin can alter plan prices or quotas.
