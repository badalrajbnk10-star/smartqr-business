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
  upi_id: '9931782577@fam',
  payee_name: 'Badal Sarkar',
  support_phone: '+91 9931782577',
  support_email: 'badalrajbnk10@gmail.com',
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
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?role=eq.super_admin&select=id,avatar_url,full_name,phone`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
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

export async function savePlatformSettings(newSettings: Partial<PlatformSettings>): Promise<{ success: boolean; settings?: PlatformSettings; error?: string }> {
  try {
    const existing = await fetchPlatformSettings();
    const cleanUpi = newSettings.upi_id !== undefined ? newSettings.upi_id.trim() : existing.upi_id;
    const cleanPayee = newSettings.payee_name !== undefined ? newSettings.payee_name.trim() : existing.payee_name;
    const cleanPhone = newSettings.support_phone !== undefined ? newSettings.support_phone.trim() : existing.support_phone;
    const cleanEmail = newSettings.support_email !== undefined ? newSettings.support_email.trim() : existing.support_email;
    const cleanWebsite = newSettings.website_name !== undefined ? newSettings.website_name.trim() : existing.website_name;

    const merged: PlatformSettings = {
      ...existing,
      ...newSettings,
      upi_id: cleanUpi || '9931782577@fam',
      payee_name: cleanPayee || 'Badal Sarkar',
      support_phone: cleanPhone || '+91 9931782577',
      support_email: cleanEmail || 'badalrajbnk10@gmail.com',
      website_name: cleanWebsite || 'SmartQR Business',
    };

    // Save to localStorage immediately for instant local reflection
    localStorage.setItem(CACHE_KEY, JSON.stringify(merged));

    const settingsPayload = `settings:${JSON.stringify(merged)}`;
    const updateBody = {
      avatar_url: settingsPayload,
      full_name: merged.payee_name,
      phone: merged.support_phone,
      updated_at: new Date().toISOString(),
    };

    // Persist to Supabase Super Admin profile using reliable public anon key
    let persistedInSupabase = false;
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?role=eq.super_admin`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updateBody),
      });

      if (res.ok) {
        const rows = await res.json().catch(() => []);
        if (Array.isArray(rows) && rows.length > 0) {
          persistedInSupabase = true;
        }
      }
    } catch (restErr) {
      console.warn('Direct REST patch error:', restErr);
    }

    // Fallback: Patch by Super Admin ID if role query returned 0 rows
    if (!persistedInSupabase) {
      try {
        const idRes = await fetch(`${supabaseUrl}/rest/v1/profiles?role=eq.super_admin&select=id`, {
          headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` },
        });
        if (idRes.ok) {
          const admins = await idRes.json();
          if (Array.isArray(admins) && admins.length > 0) {
            const patchByIdRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${admins[0].id}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
              },
              body: JSON.stringify(updateBody),
            });
            if (patchByIdRes.ok) {
              persistedInSupabase = true;
            }
          }
        }
      } catch (idErr) {
        console.warn('Fallback patch error:', idErr);
      }
    }

    // Broadcast update across all open tabs and components in real time
    try {
      window.dispatchEvent(new CustomEvent('smartqr_settings_updated', { detail: merged }));
    } catch {}

    return { success: true, settings: merged };
  } catch (err: any) {
    console.error('Failed to save settings:', err);
    return { success: false, error: err.message || 'Failed to update settings.' };
  }
}
