import { supabaseUrl, supabaseAnonKey } from './supabase';

export interface BusinessAnalytics {
  total_scans: number;
  review_clicks: number;
  whatsapp_clicks: number;
  call_clicks: number;
  devices: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  weekly: Record<string, number>;
  last_activity_at?: string;
}

export function getCleanAnalytics(openingHours: any, qrTotalScans: number = 0): BusinessAnalytics {
  const raw = openingHours?._analytics || {};
  return {
    total_scans: Math.max(raw.total_scans || 0, qrTotalScans || 0),
    review_clicks: raw.review_clicks || 0,
    whatsapp_clicks: raw.whatsapp_clicks || 0,
    call_clicks: raw.call_clicks || 0,
    devices: {
      mobile: raw.devices?.mobile || 0,
      tablet: raw.devices?.tablet || 0,
      desktop: raw.devices?.desktop || 0,
    },
    weekly: raw.weekly || {},
    last_activity_at: raw.last_activity_at,
  };
}

/**
 * Record a real customer QR scan on the landing page
 */
export async function trackScanEvent(businessId: string, qrCodeId?: string): Promise<void> {
  try {
    const ua = navigator.userAgent || '';
    const isTablet = /iPad|tablet|(android(?!.*mobile))/i.test(ua);
    const isMobile = !isTablet && /iPhone|iPod|Android|Mobile/i.test(ua);
    const deviceType: 'mobile' | 'tablet' | 'desktop' = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

    const headers = {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    };

    // 1. Fetch current opening_hours of business
    const bizRes = await fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${businessId}&select=opening_hours`, { headers });
    if (!bizRes.ok) return;

    const [biz] = await bizRes.json();
    if (!biz) return;

    const currentHours = biz.opening_hours || {};
    const currentAnalytics = getCleanAnalytics(currentHours);

    const updatedAnalytics: BusinessAnalytics = {
      ...currentAnalytics,
      total_scans: currentAnalytics.total_scans + 1,
      devices: {
        ...currentAnalytics.devices,
        [deviceType]: (currentAnalytics.devices[deviceType] || 0) + 1,
      },
      weekly: {
        ...currentAnalytics.weekly,
        [dayName]: (currentAnalytics.weekly[dayName] || 0) + 1,
      },
      last_activity_at: new Date().toISOString(),
    };

    // Update business opening_hours with new analytics
    fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${businessId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        opening_hours: {
          ...currentHours,
          _analytics: updatedAnalytics,
        },
      }),
    }).catch(() => {});

    // Also update qr_codes.total_scans if qrCodeId is present
    if (qrCodeId) {
      fetch(`${supabaseUrl}/rest/v1/qr_codes?id=eq.${qrCodeId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          total_scans: updatedAnalytics.total_scans,
          last_scanned_at: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  } catch {
    // Non-blocking telemetry
  }
}

/**
 * Record user interactions (Google Review Click, WhatsApp Click, Call Click)
 */
export async function trackCustomerAction(
  businessId: string,
  action: 'review' | 'whatsapp' | 'call'
): Promise<void> {
  try {
    const headers = {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    };

    const bizRes = await fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${businessId}&select=opening_hours`, { headers });
    if (!bizRes.ok) return;

    const [biz] = await bizRes.json();
    if (!biz) return;

    const currentHours = biz.opening_hours || {};
    const currentAnalytics = getCleanAnalytics(currentHours);

    const actionKeyMap = {
      review: 'review_clicks',
      whatsapp: 'whatsapp_clicks',
      call: 'call_clicks',
    } as const;

    const fieldToIncrement = actionKeyMap[action];

    const updatedAnalytics: BusinessAnalytics = {
      ...currentAnalytics,
      [fieldToIncrement]: (currentAnalytics[fieldToIncrement] || 0) + 1,
      last_activity_at: new Date().toISOString(),
    };

    fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${businessId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        opening_hours: {
          ...currentHours,
          _analytics: updatedAnalytics,
        },
      }),
    }).catch(() => {});
  } catch {
    // Non-blocking telemetry
  }
}
