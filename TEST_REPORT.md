# SmartQR Business SaaS Platform - Automated Test Report

**Execution Date:** November 4, 2026  
**Test Framework:** Vitest v2.1.9  
**TypeScript Version:** 5.6.3  
**Vite Version:** 5.4.21  
**Target Environment:** Node.js v20.18.0 (Windows x64)

---

## 1. Summary of Test Execution

| Category | Total Tests | Passed | Failed | Status |
|---|---|---|---|---|
| **Plans & Pricing Integrity** | 1 | 1 | 0 | ✅ PASSED |
| **Dynamic QR Code Engine** | 1 | 1 | 0 | ✅ PASSED |
| **24-Hour Free Trial Logic** | 1 | 1 | 0 | ✅ PASSED |
| **Subscription State Machine** | 1 | 1 | 0 | ✅ PASSED |
| **Role & Security Isolation** | 1 | 1 | 0 | ✅ PASSED |
| **Webhook Idempotency** | 1 | 1 | 0 | ✅ PASSED |
| **TypeScript Type Checks (`tsc`)** | Suite | Suite | 0 | ✅ PASSED |
| **Vite Production Bundler** | Suite | Suite | 0 | ✅ PASSED |

---

## 2. Test Case Breakdown

### Test 1: Plans and Pricing Verification
- **Verification:** Ensures initial starter, professional, and business-plus tiers exist.
- **Result:** Price in integer paise matches exactly:
  - Starter: 9900 paise (₹99.00), 1 outlet, 5 photos max.
  - Professional: 19900 paise (₹199.00), 1 outlet, 20 photos max.
  - Business Plus: 39900 paise (₹399.00), 3 outlets, 50 photos max.
- **Status:** PASS (0ms)

### Test 2: Dynamic QR Code Permanent URL Generation
- **Verification:** Generates a high-resolution base64 PNG data URL pointing to `https://smartqr.in/b/grand-heritage`.
- **Result:** Data URL returned with High error correction level (`level: 'H'`).
- **Status:** PASS (736ms)

### Test 3: 24-Hour Free Trial Expiration Window
- **Verification:** Confirms trial duration is calculated from server timestamps and expires after 24.0 hours.
- **Result:** Exact 24-hour difference verified. Expired timestamps correctly flag `isExpired = true`.
- **Status:** PASS (0ms)

### Test 4: Subscription State Machine Transitions
- **Verification:** Validates state progression (`trialing` -> `suspended` -> `active`).
- **Critical Requirement:** Permanent QR URL (`/b/hotel-grand`) remains completely unchanged across all status transitions.
- **Status:** PASS (0ms)

### Test 5: Role Isolation and Access Control
- **Verification:** Verifies that a user with role `business_owner` is blocked from accessing the Super Admin panel, while `super_admin` is allowed.
- **Status:** PASS (0ms)

### Test 6: Razorpay Webhook Idempotency Check
- **Verification:** Simulates processing a webhook event ID twice.
- **Result:** First occurrence returns `{ status: 'processed' }`; second duplicate occurrence returns `{ status: 'ignored', reason: 'duplicate_event' }`.
- **Status:** PASS (0ms)

---

## 3. Production Bundler Output Verification

```
dist/index.html                        1.17 kB │ gzip:   0.62 kB
dist/assets/index-6JrmPpkH.css        47.81 kB │ gzip:   8.17 kB
dist/assets/purify.es-BwoZCkIS.js     22.03 kB │ gzip:   8.77 kB
dist/assets/index.es-DgyVEJJZ.js     150.83 kB │ gzip:  51.60 kB
dist/assets/index-CCHNrT84.js      1,232.08 kB │ gzip: 343.55 kB
✓ Built successfully in 33.63s
```
Zero build errors, all modules transformed and optimized.
