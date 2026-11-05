# SmartQR Business SaaS Platform - Environment Variables Reference

This document outlines all required and optional environment variables for the frontend, backend serverless functions, and local development.

---

## 1. Client-Side Variables (Vite / React)
These variables are prefixed with `VITE_` and are exposed to the browser. **Never put secrets here.**

| Variable | Description | Example / Default |
|---|---|---|
| `VITE_APP_NAME` | Name of the platform | `SmartQR Business` |
| `VITE_APP_URL` | Base URL of the deployed application | `https://smartqr.in` or `http://localhost:5173` |
| `VITE_SUPABASE_URL` | Supabase Project URL | `https://your-project-id.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public Supabase Anonymous Key (safe for browser) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Public Key ID (Test or Live) | `rzp_test_YourTestKeyId` |
| `VITE_TRIAL_DURATION_HOURS`| Default free trial duration for new businesses | `24` |
| `VITE_CURRENCY` | Currency for subscription billing | `INR` |

---

## 2. Server-Side Variables (Edge Functions / Webhook Handlers)
These variables must **NEVER** be committed to Git or exposed to the frontend.

| Variable | Description | Security Level |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin-level database operations & webhook processing | **CRITICAL SECRET** |
| `RAZORPAY_KEY_SECRET` | Razorpay API Secret for validating payments & subscriptions | **CRITICAL SECRET** |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signing secret used to verify Razorpay HMAC SHA256 signatures | **CRITICAL SECRET** |
| `SUPER_ADMIN_SEED_EMAIL` | Initial email authorized to login as Super Admin | `admin@smartqr.in` |
| `SUPER_ADMIN_SEED_PASSWORD`| Initial secure password for Super Admin | Strong password |

---

## 3. Sample `.env.example`
A template file `.env.example` has been created in the root directory. Copy it to `.env`:
```bash
cp .env.example .env
```
