# SmartQR Business SaaS Platform - Razorpay UPI AutoPay Setup Guide

SmartQR Business uses official Razorpay Subscriptions with UPI AutoPay to collect recurring monthly subscription payments from Indian business owners via Google Pay, PhonePe, Paytm, BHIM, and banking apps.

---

## 1. Razorpay Account Setup
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Complete KYC and ensure **Subscriptions** and **UPI AutoPay** are activated under your Razorpay Account Settings.
3. Switch to **Test Mode** during initial testing.

---

## 2. API Keys Configuration
1. Go to **Settings** > **API Keys**.
2. Click **Generate Key**.
3. You will receive:
   - `Key ID` (e.g. `rzp_test_...` or `rzp_live_...`)
   - `Key Secret` (Keep this confidential; never expose to frontend code!)
4. Add them to your `.env` file:
```env
VITE_RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_RAZORPAY_KEY_SECRET"
RAZORPAY_WEBHOOK_SECRET="YOUR_WEBHOOK_SECRET"
```

---

## 3. Creating Subscription Plans on Razorpay
You can link your Supabase plans with Razorpay plans:
- **Starter:** ₹99.00 / month (`amount: 9900`, `period: "monthly"`, `interval: 1`)
- **Professional:** ₹199.00 / month (`amount: 19900`, `period: "monthly"`, `interval: 1`)
- **Business Plus:** ₹399.00 / month (`amount: 39900`, `period: "monthly"`, `interval: 1`)

---

## 4. Configuring Webhooks for Automated Renewal & Expiry
1. In Razorpay Dashboard, go to **Settings** > **Webhooks**.
2. Click **Add New Webhook**.
3. Webhook URL: `https://your-domain.com/api/razorpay-webhook`
4. Secret: Enter a strong random secret and copy it into `RAZORPAY_WEBHOOK_SECRET`.
5. Subscribe to the following events:
   - `subscription.authenticated`: Triggered when customer authorizes UPI AutoPay mandate.
   - `subscription.activated`: Triggered when subscription is active.
   - `subscription.charged`: Triggered on successful monthly recurring debit.
   - `subscription.halted`: Triggered when recurring debit fails after retries.
   - `subscription.cancelled`: Triggered if owner revokes mandate.
   - `payment.captured`: Triggered on successful capture.
   - `payment.failed`: Triggered on unsuccessful debit.

---

## 5. Webhook Signature Verification Security
All incoming webhooks must be verified using HMAC SHA-256 before updating database statuses:
```typescript
import crypto from 'crypto';

function verifyRazorpayWebhook(rawBody: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
}
```

---

## 6. Going from Test Mode to Live Mode
1. After testing all flows in Test Mode, verify in your Razorpay Dashboard that Subscriptions and UPI AutoPay are enabled for Live Mode.
2. In your production hosting environment (e.g. Vercel), replace `rzp_test_...` with your live `rzp_live_...` Key ID and Secret.
3. Test a live transaction of ₹99 with your UPI app to ensure the AutoPay mandate is created smoothly.
