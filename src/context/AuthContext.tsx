import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '../types/database';
import { supabase, isDemoMode, supabaseUrl, supabaseAnonKey } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string, requiredRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  isSuperAdmin: boolean;
  isOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage key for persistent session in demo mode
const LOCAL_SESSION_KEY = 'smartqr_demo_session_user';
const ACTIVE_PROFILE_KEY = 'smartqr_active_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    try {
      const cached = localStorage.getItem(ACTIVE_PROFILE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(ACTIVE_PROFILE_KEY);
    } catch {
      return true;
    }
  });

  // Helper to safely load or auto-provision user profile from Supabase
  const resolveUserProfile = async (authUser: any): Promise<Profile> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile && !error) {
        return profile;
      }
    } catch (err) {
      console.warn('Could not query profile table:', err);
    }

    // Auto-heal: If profile record is missing in profiles table, provision it now
    const fallbackProfile: Profile = {
      id: authUser.id,
      email: authUser.email || '',
      full_name:
        authUser.user_metadata?.full_name ||
        authUser.email?.split('@')[0]?.toUpperCase() ||
        'Business Owner',
      phone: authUser.user_metadata?.phone || '',
      role: (authUser.user_metadata?.role as UserRole) || 'business_owner',
      is_active: true,
      created_at: authUser.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('profiles').upsert(fallbackProfile);
    } catch (err) {
      console.warn('Could not upsert fallback profile:', err);
    }

    return fallbackProfile;
  };

  useEffect(() => {
    async function initSession() {
      try {
        if (isDemoMode) {
          const cached = localStorage.getItem(LOCAL_SESSION_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.email === 'owner@hotelgrand.in') {
              localStorage.removeItem(LOCAL_SESSION_KEY);
              localStorage.removeItem(ACTIVE_PROFILE_KEY);
              setUser(null);
            } else {
              setUser(parsed);
              localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(parsed));
            }
          } else {
            setUser(null);
          }
        } else {
          // Check cached active profile first for 0ms restoration
          const cachedProfile = localStorage.getItem(ACTIVE_PROFILE_KEY);
          if (cachedProfile) {
            try {
              const parsed = JSON.parse(cachedProfile);
              if (parsed?.id) {
                setUser(parsed);
                setLoading(false);
              }
            } catch {}
          }

          const { data: { session }, error } = await supabase.auth.getSession();
          if (session?.user && !error) {
            const userProfile = await resolveUserProfile(session.user);
            setUser(userProfile);
            localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(userProfile));
          } else if (!cachedProfile) {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    if (!isDemoMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const userProfile = await resolveUserProfile(session.user);
          setUser(userProfile);
          localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(userProfile));
        } else {
          localStorage.removeItem(ACTIVE_PROFILE_KEY);
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (
    email: string,
    password: string,
    requiredRole?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      if (isDemoMode) {
        // Super Admin verification check
        if (requiredRole === 'super_admin') {
          const cleanInput = cleanEmail.replace(/[\s-]/g, '');

          const isBadal =
            cleanInput === 'contact.badalsarkar@gmail.com' ||
            cleanInput === '9931782577' ||
            cleanInput === '+919931782577' ||
            cleanInput === '919931782577';

          const isDefaultAdmin =
            cleanInput === 'admin@smartqr.in' ||
            cleanInput === 'admin';

          const isBadalAuthorized = isBadal && (cleanPass.length >= 4 || cleanPass === '9931782577');
          const isDefaultAuthorized = isDefaultAdmin && (cleanPass === 'AdminSecurePassword2026!' || cleanPass === 'admin' || cleanPass.length >= 6);

          if (isBadalAuthorized || isDefaultAuthorized) {
            const adminUser: Profile = {
              id: 'super-admin-root-id',
              email: 'contact.badalsarkar@gmail.com',
              full_name: 'Badal Sarkar',
              phone: '+91 9931782577',
              role: 'super_admin',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setUser(adminUser);
            localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminUser));
            return { success: true };
          } else {
            return {
              success: false,
              error: 'Invalid Super Admin credentials. Please use Email: contact.badalsarkar@gmail.com or Mobile: 9931782577',
            };
          }
        }

        // Standard Business Owner login
        if (cleanPass.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters.' };
        }

        const ownerUser: Profile = {
          id: `owner-${Math.random().toString(36).substring(2, 9)}`,
          email: cleanEmail,
          full_name: cleanEmail.split('@')[0].toUpperCase(),
          role: 'business_owner',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(ownerUser);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(ownerUser));
        return { success: true };
      }

      // Real Supabase Auth (Supports both Email and Mobile Number login)
      let candidateEmails: string[] = [];
      const isPhone = !cleanEmail.includes('@') && /^[+0-9\s-]+$/.test(cleanEmail);

      if (isPhone) {
        const digits = cleanEmail.replace(/[^0-9]/g, '').slice(-10);
        if (digits.length < 10) {
          return { success: false, error: 'Please enter a valid 10-digit mobile number or email address.' };
        }

        // Search profiles and businesses by phone number
        const [{ data: profs }, { data: bizs }] = await Promise.all([
          supabase.from('profiles').select('email').ilike('phone', `%${digits}%`),
          supabase.from('businesses').select('email').ilike('phone', `%${digits}%`),
        ]);

        candidateEmails = Array.from(new Set([
          ...(profs || []).map((p: any) => p.email?.trim().toLowerCase()),
          ...(bizs || []).map((b: any) => b.email?.trim().toLowerCase()),
        ])).filter(Boolean) as string[];

        if (candidateEmails.length === 0) {
          return {
            success: false,
            error: `No account found with mobile number ${digits}. Please sign in using your email address.`,
          };
        }
      } else {
        candidateEmails = [cleanEmail];
      }

      let lastError = 'Invalid email/phone or password. Please try again.';
      let authUser: any = null;

      for (const emailToTry of candidateEmails) {
        try {
          const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'apikey': supabaseAnonKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: emailToTry,
              password: cleanPass,
            }),
          });

          const data = await authRes.json();

          if (authRes.ok && data?.access_token && data?.user) {
            authUser = data.user;
            // Sync with supabase client session without blocking
            supabase.auth.setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token,
            }).catch((e) => console.warn('Supabase setSession non-fatal warning:', e));
            break;
          } else if (data?.error_description || data?.msg || data?.message) {
            lastError = data.error_description || data.msg || data.message;
          }
        } catch (attemptErr: any) {
          lastError = attemptErr?.message || lastError;
        }
      }

      if (!authUser) {
        return { success: false, error: lastError };
      }

      const userProfile = await resolveUserProfile(authUser);

      // Allow super_admin to access all views
      if (requiredRole && requiredRole === 'super_admin' && userProfile.role !== 'super_admin') {
        await supabase.auth.signOut();
        return { success: false, error: 'Access Denied: Requires Super Admin privileges.' };
      }

      setUser(userProfile);
      setLoading(false);
      localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(userProfile));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred.' };
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();
      const cleanFullName = fullName.trim();
      const cleanPhone = phone?.trim() || '';

      if (isDemoMode) {
        const newUser: Profile = {
          id: `owner-${Date.now()}`,
          email: cleanEmail,
          full_name: cleanFullName,
          phone: cleanPhone,
          role: 'business_owner',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(newUser);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newUser));
        return { success: true };
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: cleanFullName,
            phone: cleanPhone,
            role: 'business_owner',
          },
        },
      });

      if (error) return { success: false, error: error.message };

      if (data.user) {
        const newProfile: Profile = {
          id: data.user.id,
          email: cleanEmail,
          full_name: cleanFullName,
          phone: cleanPhone,
          role: 'business_owner',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await supabase.from('profiles').insert(newProfile);
        setUser(newProfile);
        return { success: true };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
    setUser(null);
    if (!isDemoMode) {
      await supabase.auth.signOut();
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode) {
      return { success: true };
    }
    const cleanEmail = email.trim().toLowerCase();
    const productionOrigin = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? window.location.origin
      : 'https://smartqr-business.vercel.app';
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${productionOrigin}/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        login,
        register,
        logout,
        resetPassword,
        isSuperAdmin: user?.role === 'super_admin',
        isOwner: user?.role === 'business_owner',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
