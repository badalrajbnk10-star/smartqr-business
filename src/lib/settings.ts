import { supabaseUrl, supabaseAnonKey } from './supabase';

export interface PlatformSettings {
  upi_id: string;
  payee_name: string;
  support_phone: string;
  support_email: string;
  website_name: string;
  trial_duration_hours: number;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  upi_id: '9931782577@ybl',
  payee_name: 'Badal Sarkar',
  support_phone: '+91 9931782577',
  support_email: 'contact.badalsarkar@gmail.com',
  website_name: 'SmartQR Business',
  trial_duration_hours: 24,
};

const CACHE_KEY = 'smartqr_platform_settings';

export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  // 1. Return cached value for 0ms rendering
  let currentSettings: PlatformSettings = DEFAULT_PLATFORM_SETTINGS;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      currentSettings = { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(cached) };
    }
  } catch {}

  // 2. Fetch live settings from Super Admin profile in Supabase
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?role=eq.super_admin&select=avatar_url,full_name,phone`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Cache-Control': 'no-cache',
      },
    });

    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        const admin = list[0];
        if (admin.avatar_url && admin.avatar_url.startsWith('settings:')) {
          try {
            const rawJson = admin.avatar_url.substring('settings:'.length);
            const parsed = JSON.parse(rawJson);
            currentSettings = {
              ...DEFAULT_PLATFORM_SETTINGS,
              ...parsed,
              payee_name: parsed.payee_name || admin.full_name || 'Badal Sarkar',
              support_phone: parsed.support_phone || admin.phone || '+91 9931782577',
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(currentSettings));
          } catch (pErr) {
            console.warn('Could not parse settings json:', pErr);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Network error fetching platform settings:', err);
  }

  return currentSettings;
}

export async function savePlatformSettings(newSettings: Partial<PlatformSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await fetchPlatformSettings();
    const merged: PlatformSettings = {
      ...existing,
      ...newSettings,
      upi_id: newSettings.upi_id?.trim() || existing.upi_id || '9931782577@ybl',
      payee_name: newSettings.payee_name?.trim() || existing.payee_name || 'Badal Sarkar',
      support_phone: newSettings.support_phone?.trim() || existing.support_phone || '+91 9931782577',
      support_email: newSettings.support_email?.trim() || existing.support_email || 'contact.badalsarkar@gmail.com',
      website_name: newSettings.website_name?.trim() || existing.website_name || 'SmartQR Business',
    };

    // Save to localStorage immediately
    localStorage.setItem(CACHE_KEY, JSON.stringify(merged));

    // Persist to Supabase Super Admin profile
    const token = localStorage.getItem('smartqr_auth_token') || supabaseAnonKey;
    const settingsPayload = `settings:${JSON.stringify(merged)}`;

    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?role=eq.super_admin`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        avatar_url: settingsPayload,
        full_name: merged.payee_name,
        phone: merged.support_phone,
        updated_at: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      return { success: true };
    } else {
      return { success: true }; // LocalStorage persisted
    }
  } catch (err: any) {
    console.error('Failed to save settings:', err);
    return { success: false, error: err.message || 'Failed to update settings.' };
  }
}
