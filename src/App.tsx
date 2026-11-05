import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';

// Layouts
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { SuperAdminLayout } from './components/layout/SuperAdminLayout';

// Fast Eager Public & Auth Pages
import { Home } from './pages/public/Home';
import { Features } from './pages/public/Features';
import { Pricing } from './pages/public/Pricing';
import { Terms } from './pages/public/Terms';
import { Privacy } from './pages/public/Privacy';
import { Refund } from './pages/public/Refund';
import { Support } from './pages/public/Support';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Customer Page (Dynamic QR Target - Eager & Ultra-fast)
import { CustomerLandingPage } from './pages/customer/CustomerLandingPage';

// Lazy-Loaded Heavy Owner Dashboard Pages (Code-split so customers don't download them)
const DashboardOverview = React.lazy(() =>
  import('./pages/dashboard/DashboardOverview').then((m) => ({ default: m.DashboardOverview }))
);
const ProfileEditor = React.lazy(() =>
  import('./pages/dashboard/ProfileEditor').then((m) => ({ default: m.ProfileEditor }))
);
const MediaManager = React.lazy(() =>
  import('./pages/dashboard/MediaManager').then((m) => ({ default: m.MediaManager }))
);
const CatalogManager = React.lazy(() =>
  import('./pages/dashboard/CatalogManager').then((m) => ({ default: m.CatalogManager }))
);
const QRDesigner = React.lazy(() =>
  import('./pages/dashboard/QRDesigner').then((m) => ({ default: m.QRDesigner }))
);
const SubscriptionBilling = React.lazy(() =>
  import('./pages/dashboard/SubscriptionBilling').then((m) => ({ default: m.SubscriptionBilling }))
);
const ScanAnalytics = React.lazy(() =>
  import('./pages/dashboard/ScanAnalytics').then((m) => ({ default: m.ScanAnalytics }))
);

// Lazy-Loaded Super Admin Pages
const SuperAdminLogin = React.lazy(() =>
  import('./pages/admin/SuperAdminLogin').then((m) => ({ default: m.SuperAdminLogin }))
);
const SuperAdminDashboard = React.lazy(() =>
  import('./pages/admin/SuperAdminDashboard').then((m) => ({ default: m.SuperAdminDashboard }))
);
const AdminBusinesses = React.lazy(() =>
  import('./pages/admin/AdminBusinesses').then((m) => ({ default: m.AdminBusinesses }))
);
const AdminPlans = React.lazy(() =>
  import('./pages/admin/AdminPlans').then((m) => ({ default: m.AdminPlans }))
);
const AdminPayments = React.lazy(() =>
  import('./pages/admin/AdminPayments').then((m) => ({ default: m.AdminPayments }))
);
const AdminQRCodes = React.lazy(() =>
  import('./pages/admin/AdminQRCodes').then((m) => ({ default: m.AdminQRCodes }))
);
const AdminSupport = React.lazy(() =>
  import('./pages/admin/AdminSupport').then((m) => ({ default: m.AdminSupport }))
);
const AdminAuditLogs = React.lazy(() =>
  import('./pages/admin/AdminAuditLogs').then((m) => ({ default: m.AdminAuditLogs }))
);
const AdminSettings = React.lazy(() =>
  import('./pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettings }))
);

// Minimal Loader for Owner/Admin Lazy views
const LazyLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8">
    <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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

            {/* Customer Digital Profile (Instant Fast-loading via QR Scan) */}
            <Route path="/b/:slug" element={<CustomerLandingPage />} />

            {/* Protected Owner Dashboard (Code-split with Suspense) */}
            <Route
              path="/dashboard"
              element={
                <OwnerRoute>
                  <DashboardLayout />
                </OwnerRoute>
              }
            >
              <Route index element={<Suspense fallback={<LazyLoader />}><DashboardOverview /></Suspense>} />
              <Route path="profile" element={<Suspense fallback={<LazyLoader />}><ProfileEditor /></Suspense>} />
              <Route path="media" element={<Suspense fallback={<LazyLoader />}><MediaManager /></Suspense>} />
              <Route path="catalog" element={<Suspense fallback={<LazyLoader />}><CatalogManager /></Suspense>} />
              <Route path="qr" element={<Suspense fallback={<LazyLoader />}><QRDesigner /></Suspense>} />
              <Route path="subscription" element={<Suspense fallback={<LazyLoader />}><SubscriptionBilling /></Suspense>} />
              <Route path="analytics" element={<Suspense fallback={<LazyLoader />}><ScanAnalytics /></Suspense>} />
            </Route>

            {/* Dedicated Super Admin Login */}
            <Route path="/super-admin/login" element={<Suspense fallback={<LazyLoader />}><SuperAdminLogin /></Suspense>} />

            {/* Dedicated Isolated Super Admin Panel */}
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<Suspense fallback={<LazyLoader />}><SuperAdminDashboard /></Suspense>} />
              <Route path="businesses" element={<Suspense fallback={<LazyLoader />}><AdminBusinesses /></Suspense>} />
              <Route path="plans" element={<Suspense fallback={<LazyLoader />}><AdminPlans /></Suspense>} />
              <Route path="payments" element={<Suspense fallback={<LazyLoader />}><AdminPayments /></Suspense>} />
              <Route path="qr-codes" element={<Suspense fallback={<LazyLoader />}><AdminQRCodes /></Suspense>} />
              <Route path="support" element={<Suspense fallback={<LazyLoader />}><AdminSupport /></Suspense>} />
              <Route path="audit" element={<Suspense fallback={<LazyLoader />}><AdminAuditLogs /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<LazyLoader />}><AdminSettings /></Suspense>} />
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
