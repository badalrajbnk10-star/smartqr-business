import React, { createContext, useContext, useEffect, useState } from 'react';
import { Business, QRCode, Subscription, Plan, MenuItem, BusinessService } from '../types/database';
import { useAuth } from './AuthContext';
import { supabase, isDemoMode, DEFAULT_PLANS } from '../lib/supabase';

interface BusinessContextType {
  businesses: Business[];
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business) => void;
  loading: boolean;
  createBusiness: (businessData: Partial<Business>) => Promise<{ success: boolean; business?: Business; error?: string }>;
  updateBusiness: (id: string, updates: Partial<Business>) => Promise<{ success: boolean; error?: string }>;
  updateQRCode: (qrCodeId: string, updates: Partial<QRCode>) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  trialRemainingTime: { hours: number; minutes: number; isExpired: boolean };
  activePlan: Plan | null;
  subscription: Subscription | null;
  upgradeSubscription: (planId: string, paymentResponse: any) => Promise<boolean>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const LOCAL_BUSINESSES_KEY = 'smartqr_demo_businesses';

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Compute 24-hr trial countdown
  const [trialRemainingTime, setTrialRemainingTime] = useState({
    hours: 24,
    minutes: 0,
    isExpired: false,
  });

  // Calculate remaining trial time accurately
  useEffect(() => {
    if (!subscription) return;

    const interval = setInterval(() => {
      if (subscription.status === 'active') {
        setTrialRemainingTime({ hours: 720, minutes: 0, isExpired: false });
        return;
      }

      const expiry = new Date(subscription.trial_expires_at).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setTrialRemainingTime({ hours: 0, minutes: 0, isExpired: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTrialRemainingTime({ hours, minutes, isExpired: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [subscription]);

  const loadData = async () => {
    if (!user) {
      setBusinesses([]);
      setCurrentBusiness(null);
      setLoading(false);
      return;
    }

    try {
      if (isDemoMode) {
        const cached = localStorage.getItem(`${LOCAL_BUSINESSES_KEY}_${user.id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setBusinesses(parsed);
          setCurrentBusiness(parsed[0] || null);
          if (parsed[0]?.subscription) {
            setSubscription(parsed[0].subscription);
          }
        } else {
          // Create initial starter demo business for new owner
          const trialExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          const demoSub: Subscription = {
            id: 'sub-demo-1',
            business_owner_id: user.id,
            plan_id: 'plan-starter',
            status: 'trialing',
            trial_started_at: new Date().toISOString(),
            trial_expires_at: trialExpires,
            autopay_mandate_status: 'pending',
            cancel_at_period_end: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            plan: DEFAULT_PLANS[0],
          };

          const initialBiz: Business = {
            id: 'biz-hotel-grand-1',
            owner_id: user.id,
            name: 'The Grand Heritage Hotel & Dine',
            slug: 'grand-heritage',
            short_description: 'Luxury Stays, Fine Dining & Authentic Indian Cuisine',
            full_description: 'Welcome to The Grand Heritage Hotel & Dine. We offer world-class hospitality, ambient dining, free high-speed Wi-Fi, and banquet spaces for weddings and corporate gatherings.',
            phone: '+91 9931782577',
            whatsapp: '+91 9931782577',
            email: 'contact.badalsarkar@gmail.com',
            address: '42, Station Road, Near Central Plaza, Sector 14',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
            google_maps_url: 'https://maps.google.com/?q=New+Delhi',
            google_review_url: 'https://g.page/r/review/grand-heritage',
            is_active: true,
            status: 'trialing',
            logo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80',
            banner_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80',
            opening_hours: {
              monday: { open: '08:00', close: '23:00', closed: false },
              tuesday: { open: '08:00', close: '23:00', closed: false },
              wednesday: { open: '08:00', close: '23:00', closed: false },
              thursday: { open: '08:00', close: '23:00', closed: false },
              friday: { open: '08:00', close: '23:00', closed: false },
              saturday: { open: '08:00', close: '23:00', closed: false },
              sunday: { open: '08:00', close: '23:00', closed: false },
            },
            menu_items: [
              {
                id: 'm1',
                name: 'Paneer Butter Masala',
                price: 320,
                description: 'Rich cottage cheese cubes simmered in creamy tomato cashew gravy',
                category: 'Main Course',
                is_available: true,
              },
              {
                id: 'm2',
                name: 'Tandoori Garlic Naan',
                price: 65,
                description: 'Fresh clay-oven bread with roasted garlic and butter glaze',
                category: 'Breads',
                is_available: true,
              },
              {
                id: 'm3',
                name: 'Gulab Jamun with Ice Cream',
                price: 150,
                description: 'Warm syrup-soaked dumplings paired with Madagascar vanilla',
                category: 'Desserts',
                is_available: true,
              }
            ],
            services: [
              {
                id: 's1',
                name: 'Executive Deluxe Suite',
                price: 3500,
                duration: 'Per Night',
                description: 'King bed, balcony view, buffet breakfast and luxury toiletries included.',
              },
              {
                id: 's2',
                name: 'Banquet Hall Reservation',
                price: 25000,
                duration: '4 Hours',
                description: 'Capacity for up to 150 guests with sound system and decor.',
              }
            ],
            photos: [
              {
                id: 'p1',
                business_id: 'biz-hotel-grand-1',
                photo_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
                caption: 'Luxury Suite Living Area',
                sort_order: 1,
                created_at: new Date().toISOString(),
              },
              {
                id: 'p2',
                business_id: 'biz-hotel-grand-1',
                photo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
                caption: 'Courtyard Fine Dining',
                sort_order: 2,
                created_at: new Date().toISOString(),
              }
            ],
            qr_code: {
              id: 'qr-1',
              business_id: 'biz-hotel-grand-1',
              permanent_code: 'grand-heritage',
              permanent_url: `${window.location.origin}/b/grand-heritage`,
              foreground_color: '#1E1B4B',
              background_color: '#FFFFFF',
              frame_type: 'table_tent',
              custom_text: 'SCAN FOR DIGITAL MENU & GOOGLE REVIEWS',
              total_scans: 148,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            subscription: demoSub,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setBusinesses([initialBiz]);
          setCurrentBusiness(initialBiz);
          setSubscription(demoSub);
          localStorage.setItem(`${LOCAL_BUSINESSES_KEY}_${user.id}`, JSON.stringify([initialBiz]));
        }
      } else {
        // Fetch from Supabase
        const { data: bizList, error } = await supabase
          .from('businesses')
          .select(`
            *,
            category:business_categories(*),
            photos:business_photos(*),
            qr_code:qr_codes(*),
            subscription:subscriptions(*, plan:plans(*))
          `)
          .eq('owner_id', user.id);

        if (error) throw error;

        if (bizList && bizList.length > 0) {
          setBusinesses(bizList);
          setCurrentBusiness(bizList[0]);
          if (bizList[0].subscription) {
            setSubscription(bizList[0].subscription);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const createBusiness = async (businessData: Partial<Business>) => {
    if (!user) return { success: false, error: 'User not logged in' };

    try {
      const slug = businessData.slug || businessData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `biz-${Date.now()}`;
      const newBiz: Business = {
        id: `biz-${Date.now()}`,
        owner_id: user.id,
        name: businessData.name || 'My New Business',
        slug,
        phone: businessData.phone || '',
        address: businessData.address || '',
        short_description: businessData.short_description || '',
        full_description: businessData.full_description || '',
        whatsapp: businessData.whatsapp || businessData.phone || '',
        email: businessData.email || user.email,
        google_maps_url: businessData.google_maps_url || '',
        google_review_url: businessData.google_review_url || '',
        is_active: true,
        status: 'trialing',
        opening_hours: businessData.opening_hours || {
          monday: { open: '09:00', close: '21:00', closed: false },
          tuesday: { open: '09:00', close: '21:00', closed: false },
          wednesday: { open: '09:00', close: '21:00', closed: false },
          thursday: { open: '09:00', close: '21:00', closed: false },
          friday: { open: '09:00', close: '21:00', closed: false },
          saturday: { open: '09:00', close: '21:00', closed: false },
          sunday: { open: '10:00', close: '18:00', closed: false },
        },
        menu_items: [],
        services: [],
        photos: [],
        qr_code: {
          id: `qr-${Date.now()}`,
          business_id: `biz-${Date.now()}`,
          permanent_code: slug,
          permanent_url: `${window.location.origin}/b/${slug}`,
          foreground_color: '#000000',
          background_color: '#FFFFFF',
          frame_type: 'standard',
          custom_text: 'SCAN ME FOR DETAILS & REVIEWS',
          total_scans: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        const updated = [...businesses, newBiz];
        setBusinesses(updated);
        setCurrentBusiness(newBiz);
        localStorage.setItem(`${LOCAL_BUSINESSES_KEY}_${user.id}`, JSON.stringify(updated));
        return { success: true, business: newBiz };
      } else {
        const { data, error } = await supabase.from('businesses').insert(newBiz).select().single();
        if (error) return { success: false, error: error.message };
        await loadData();
        return { success: true, business: data };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateBusiness = async (id: string, updates: Partial<Business>) => {
    try {
      if (isDemoMode && user) {
        const updatedList = businesses.map((b) => (b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b));
        setBusinesses(updatedList);
        const current = updatedList.find((b) => b.id === id) || null;
        setCurrentBusiness(current);
        localStorage.setItem(`${LOCAL_BUSINESSES_KEY}_${user.id}`, JSON.stringify(updatedList));
        return { success: true };
      } else {
        const { error } = await supabase.from('businesses').update(updates).eq('id', id);
        if (error) return { success: false, error: error.message };
        await loadData();
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateQRCode = async (qrCodeId: string, updates: Partial<QRCode>) => {
    if (!currentBusiness) return { success: false, error: 'No business selected' };

    try {
      if (isDemoMode && user) {
        const updatedQR = { ...currentBusiness.qr_code, ...updates, updated_at: new Date().toISOString() } as QRCode;
        const updatedBiz = { ...currentBusiness, qr_code: updatedQR };
        const updatedList = businesses.map((b) => (b.id === currentBusiness.id ? updatedBiz : b));
        setBusinesses(updatedList);
        setCurrentBusiness(updatedBiz);
        localStorage.setItem(`${LOCAL_BUSINESSES_KEY}_${user.id}`, JSON.stringify(updatedList));
        return { success: true };
      } else {
        const { error } = await supabase.from('qr_codes').update(updates).eq('id', qrCodeId);
        if (error) return { success: false, error: error.message };
        await loadData();
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const upgradeSubscription = async (planId: string, paymentResponse: any): Promise<boolean> => {
    try {
      const selectedPlan = DEFAULT_PLANS.find((p) => p.id === planId) || DEFAULT_PLANS[1];
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const updatedSub: Subscription = {
        id: `sub-${Date.now()}`,
        business_owner_id: user?.id || 'owner-1',
        business_id: currentBusiness?.id,
        plan_id: planId,
        status: 'active',
        trial_started_at: subscription?.trial_started_at || now.toISOString(),
        trial_expires_at: subscription?.trial_expires_at || now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        razorpay_subscription_id: paymentResponse.razorpay_subscription_id,
        autopay_mandate_status: 'authorized',
        cancel_at_period_end: false,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        plan: selectedPlan,
      };

      setSubscription(updatedSub);

      if (currentBusiness) {
        await updateBusiness(currentBusiness.id, { status: 'active' });
      }

      return true;
    } catch (err) {
      console.error('Failed to activate subscription:', err);
      return false;
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        currentBusiness,
        setCurrentBusiness,
        loading,
        createBusiness,
        updateBusiness,
        updateQRCode,
        refreshData: loadData,
        trialRemainingTime,
        activePlan: subscription?.plan || DEFAULT_PLANS[0],
        subscription,
        upgradeSubscription,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
