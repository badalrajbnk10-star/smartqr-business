import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '../types/database';
import { supabase, isDemoMode } from '../lib/supabase';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initSession() {
      try {
        if (isDemoMode) {
          const cached = localStorage.getItem(LOCAL_SESSION_KEY);
          if (cached) {
            setUser(JSON.parse(cached));
          } else {
            // Default demo business owner
            const defaultOwner: Profile = {
              id: 'owner-uuid-1',
              email: 'owner@hotelgrand.in',
              full_name: 'Rajesh Sharma',
              phone: '+91 9931782577',
              role: 'business_owner',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setUser(defaultOwner);
            localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(defaultOwner));
          }
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile);
            }
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
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser(profile || null);
        } else {
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
      if (isDemoMode) {
        // Super Admin verification check
        if (requiredRole === 'super_admin') {
          const cleanInput = email.trim().toLowerCase().replace(/[\s-]/g, '');
          const cleanPass = password.trim();

          const isBadal =
            cleanInput === 'contact.badalsarkar@gmail.com' ||
            cleanInput === '9931782577' ||
            cleanInput === '+919931782577' ||
            cleanInput === '919931782577';

          const isDefaultAdmin =
            cleanInput === 'admin@smartqr.in' ||
            cleanInput === 'admin';

          // Badal Sarkar credentials:
          // Accepts mobile number '9931782577', 'AdminSecurePassword2026!', or any password >= 4 chars
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
        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters.' };
        }

        const ownerUser: Profile = {
          id: `owner-${Math.random().toString(36).substring(2, 9)}`,
          email: email.toLowerCase(),
          full_name: email.split('@')[0].toUpperCase(),
          role: 'business_owner',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(ownerUser);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(ownerUser));
        return { success: true };
      }

      // Real Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { success: false, error: error.message };

      if (data.user) {
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profile) {
          return { success: false, error: 'Profile not found. Please contact support.' };
        }

        if (requiredRole && profile.role !== requiredRole) {
          await supabase.auth.signOut();
          return { success: false, error: `Unauthorized. Requires ${requiredRole} access.` };
        }

        setUser(profile);
        return { success: true };
      }

      return { success: false, error: 'Login failed. Please try again.' };
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
      if (isDemoMode) {
        const newUser: Profile = {
          id: `owner-${Date.now()}`,
          email: email.toLowerCase(),
          full_name: fullName,
          phone: phone || '',
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
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role: 'business_owner',
          },
        },
      });

      if (error) return { success: false, error: error.message };

      if (data.user) {
        const newProfile: Profile = {
          id: data.user.id,
          email,
          full_name: fullName,
          phone,
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
    if (isDemoMode) {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      setUser(null);
    } else {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode) {
      return { success: true };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
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
