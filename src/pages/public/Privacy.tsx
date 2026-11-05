import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Privacy & Protection</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: November 2026</p>
      </div>

      <div className="prose prose-slate max-w-none text-sm space-y-6 text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            We collect information provided directly by business owners, including name, email address, phone number, business address, and operational details. We also collect aggregated, non-personally identifiable scan telemetry (device type, rough city, scan timestamp) to provide analytics to business owners.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Customer Privacy on QR Scans</h2>
          <p>
            We respect end-customer privacy. When a customer scans a business QR code, we do NOT harvest individual personal phone numbers, identities, or location tracking coordinates. Only anonymized cryptographic hashes are used for unique visitor estimation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Payment Information Security</h2>
          <p>
            SmartQR Business does NOT store your banking passwords, credit card numbers, or UPI PINs. All recurring billing is processed securely through Razorpay in accordance with RBI guidelines and PCI-DSS compliance.
          </p>
        </section>
      </div>
    </div>
  );
};
