import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Legal Agreement</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Terms and Conditions</h1>
        <p className="text-xs text-slate-500">Last Updated: November 2026</p>
      </div>

      <div className="prose prose-slate max-w-none text-sm space-y-6 text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the SmartQR Business platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Description of Service</h2>
          <p>
            SmartQR Business provides a Software-as-a-Service (SaaS) platform enabling physical business owners to generate dynamic QR codes, publish digital landing profiles, collect customer feedback and Google reviews, and manage subscriptions via Razorpay UPI AutoPay.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. 24-Hour Free Trial</h2>
          <p>
            New registered business owners receive a 24-hour free trial starting upon account creation. During this trial period, the public QR landing page is fully active. If no paid subscription is authorized upon the conclusion of the trial, the public QR landing page may be temporarily suspended until active billing is established. Business profile data is preserved and not deleted.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Subscriptions and UPI AutoPay Mandate</h2>
          <p>
            Subscription plans are billed recurringly on a monthly basis using Razorpay UPI AutoPay. By authorizing a UPI mandate, you authorize automatic recurring debits on your specified billing date. You retain full control to cancel or pause your mandate at any time through your dashboard or UPI application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. User Conduct and Content</h2>
          <p>
            Business owners are solely responsible for all images, menu items, prices, and descriptions published on their public digital profiles. Publishing fraudulent, misleading, or infringing content is strictly prohibited and grounds for immediate account suspension.
          </p>
        </section>
      </div>
    </div>
  );
};
