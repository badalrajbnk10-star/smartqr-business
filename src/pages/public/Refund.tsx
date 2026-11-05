import React from 'react';

export const Refund: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Payments & Cancellations</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Refund and Cancellation Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: November 2026</p>
      </div>

      <div className="prose prose-slate max-w-none text-sm space-y-6 text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. 24-Hour Risk-Free Free Trial</h2>
          <p>
            Every new business owner receives a complimentary 24-hour trial period with zero charges deducted. You may test the QR generation, profile management, and print exports without making any financial commitment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Cancellation Policy</h2>
          <p>
            You may cancel your monthly subscription at any time directly through your Business Dashboard or by revoking the UPI AutoPay mandate in your UPI application (Google Pay, PhonePe, Paytm, BHIM, etc.). Upon cancellation, your service remains fully active until the end of your current paid billing period.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Refund Requests</h2>
          <p>
            If you experience technical issues or duplicate charges due to payment gateway delays, please contact our support team at <code>support@smartqr.in</code> within 7 days of the transaction. Verified erroneous charges are refunded to the original payment source within 5–7 business days.
          </p>
        </section>
      </div>
    </div>
  );
};
