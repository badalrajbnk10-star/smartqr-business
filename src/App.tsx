import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';

// Layouts
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { SuperAdminLayout } from './components/layout/SuperAdminLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { Features } from './pages/public/Features';
import { Pricing } from './pages/public/Pricing';
import { Terms } from './pages/public/Terms';
import { Privacy } from './pages/public/Privacy';
import { Refund } from './pages/public/Refund';
import { Support } from './pages/public/Support';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Customer Page (Dynamic QR Target)
import { CustomerLandingPage } from './pages/customer/CustomerLandingPage';

// Owner Dashboard Pages
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { ProfileEditor } from './pages/dashboard/ProfileEditor';
import { MediaManager } from './pages/dashboard/MediaManager';
import { CatalogManager } from './pages/dashboard/CatalogManager';
import { QRDesigner } from './pages/dashboard/QRDesigner';
import { SubscriptionBilling } from './pages/dashboard/SubscriptionBilling';
import { ScanAnalytics } from './pages/dashboard/ScanAnalytics';

// Super Admin Pages
import { SuperAdminLogin } from './pages/admin/SuperAdminLogin';
import { SuperAdminDashboard } from './pages/admin/SuperAdminDashboard';
import { AdminBusinesses } from './pages/admin/AdminBusinesses';
import { AdminPlans } from './pages/admin/AdminPlans';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminQRCodes } from './pages/admin/AdminQRCodes';
import { AdminSupport } from './pages/admin/AdminSupport';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

// Public Layout Wrapper
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Protected Owner Route
const OwnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BusinessProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Marketing Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/features" element={<PublicLayout><Features /></PublicLayout>} />
            <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
            <Route path="/refund" element={<PublicLayout><Refund /></PublicLayout>} />
            <Route path="/support" element={<PublicLayout><Support /></PublicLayout>} />

            {/* Authentication */}
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
            <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />

            {/* Customer Digital Profile (Scanned from Dynamic QR) */}
            <Route path="/b/:slug" element={<CustomerLandingPage />} />

            {/* Protected Owner Dashboard */}
            <Route
              path="/dashboard"
              element={
                <OwnerRoute>
                  <DashboardLayout />
                </OwnerRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="profile" element={<ProfileEditor />} />
              <Route path="media" element={<MediaManager />} />
              <Route path="catalog" element={<CatalogManager />} />
              <Route path="qr" element={<QRDesigner />} />
              <Route path="subscription" element={<SubscriptionBilling />} />
              <Route path="analytics" element={<ScanAnalytics />} />
            </Route>

            {/* Dedicated Super Admin Login */}
            <Route path="/super-admin/login" element={<SuperAdminLogin />} />

            {/* Dedicated Isolated Super Admin Panel */}
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="businesses" element={<AdminBusinesses />} />
              <Route path="plans" element={<AdminPlans />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="qr-codes" element={<AdminQRCodes />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="audit" element={<AdminAuditLogs />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </BusinessProvider>
    </AuthProvider>
  );
};

export default App;
