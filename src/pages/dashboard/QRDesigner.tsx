import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Printer,
  Sparkles,
  Palette,
  CheckCircle2,
  FileDown,
  Layers,
  Star,
  PhoneCall,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { downloadQRPNG, exportElementToPDF } from '../../lib/qr';
import { QRFrameStyle } from '../../types/database';

export const QRDesigner: React.FC = () => {
  const { currentBusiness, updateQRCode } = useBusiness();

  const qrConfig = currentBusiness?.qr_code || {
    id: 'qr-default',
    business_id: currentBusiness?.id || 'biz-default',
    permanent_code: currentBusiness?.slug || 'my-business',
    permanent_url: `${window.location.origin}/b/${currentBusiness?.slug || 'my-business'}`,
    foreground_color: '#1E1B4B',
    background_color: '#FFFFFF',
    frame_type: 'table_tent' as QRFrameStyle,
    custom_text: 'SCAN FOR DIGITAL MENU & GOOGLE REVIEWS',
    total_scans: 148,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const [fgColor, setFgColor] = useState(qrConfig.foreground_color || '#1E1B4B');
  const [bgColor, setBgColor] = useState(qrConfig.background_color || '#FFFFFF');
  const [frameStyle, setFrameStyle] = useState<QRFrameStyle>(qrConfig.frame_type || 'table_tent');
  const [customText, setCustomText] = useState(qrConfig.custom_text || 'SCAN FOR DIGITAL MENU & GOOGLE REVIEWS');
  const [includeLogo, setIncludeLogo] = useState(true);

  const [downloading, setDownloading] = useState(false);
  const [saved, setSaved] = useState(false);

  const permanentUrl = currentBusiness
    ? `${window.location.origin}/b/${currentBusiness.slug}`
    : `${window.location.origin}/b/grand-heritage`;

  const handleSaveDesign = async () => {
    if (!currentBusiness?.qr_code) return;
    await updateQRCode(currentBusiness.qr_code.id, {
      foreground_color: fgColor,
      background_color: bgColor,
      frame_type: frameStyle,
      custom_text: customText,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownloadPNG = async () => {
    setDownloading(true);
    try {
      await downloadQRPNG(
        permanentUrl,
        currentBusiness?.slug || 'smartqr',
        fgColor,
        bgColor
      );
    } catch (err) {
      console.error('PNG download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await exportElementToPDF(
        'printable-qr-card',
        `${currentBusiness?.slug || 'business'}-stand-a4`,
        'p',
        'a4'
      );
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const colorPresets = [
    { label: 'Deep Indigo', fg: '#1E1B4B', bg: '#FFFFFF' },
    { label: 'Classic Onyx', fg: '#000000', bg: '#FFFFFF' },
    { label: 'Emerald Forest', fg: '#064E3B', bg: '#FFFFFF' },
    { label: 'Crimson Red', fg: '#991B1B', bg: '#FFFFFF' },
    { label: 'Royal Amber', fg: '#78350F', bg: '#FEF3C7' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dynamic QR Designer & Printable Assets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Customize colors, frames, and download high-DPI table stands, stickers, and cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>High-Res PNG</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/25"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Printable PDF</span>
          </button>

          <button
            onClick={handleBrowserPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Direct Print</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>QR Design settings updated!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Frame Style Selector */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              1. Choose Frame & Format
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'table_tent', label: 'Table Stand (Tent)', desc: 'For restaurant tables & counters' },
                { id: 'bordered_poster', label: 'Storefront Poster', desc: 'A4 wall poster with border' },
                { id: 'circular_badge', label: 'Counter Sticker', desc: 'Google review sticker' },
                { id: 'card_compact', label: 'Business Card', desc: 'Compact pocket card' },
                { id: 'standard', label: 'Minimal QR', desc: 'Clean borderless QR' },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setFrameStyle(tmpl.id as QRFrameStyle)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    frameStyle === tmpl.id
                      ? 'border-brand-600 bg-brand-50/50 text-slate-900 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <p className="font-bold text-xs">{tmpl.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{tmpl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand-600" />
              2. Brand Colors
            </h3>

            <div className="flex flex-wrap gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setFgColor(preset.fg);
                    setBgColor(preset.bg);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-400 text-xs font-medium"
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: preset.fg }}></span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">QR Foreground Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Text & Logo Options */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              3. Text & Logo Customization
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Call to Action Text</label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="SCAN FOR MENU & REVIEWS"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="logoCheck"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="logoCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Embed business logo icon inside center of QR Code
              </label>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveDesign}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
              >
                Save Design as Default
              </button>
            </div>
          </div>
        </div>

        {/* Right Live Preview / Print Area */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="bg-slate-200/60 p-4 rounded-3xl border border-slate-300/80 flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Print Preview (What Customers See)
            </span>

            {/* Print Target DOM Element */}
            <div
              id="printable-qr-card"
              className="w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center space-y-4 transition-all"
              style={{
                backgroundColor: frameStyle === 'table_tent' ? fgColor : bgColor,
                color: frameStyle === 'table_tent' ? '#FFFFFF' : fgColor,
                border: frameStyle === 'bordered_poster' ? `8px solid ${fgColor}` : 'none',
              }}
            >
              {/* Header on Tent */}
              <div>
                <p className="text-[11px] uppercase tracking-widest font-extrabold opacity-90">
                  {customText}
                </p>
                <h3 className="text-lg font-black tracking-tight mt-1 truncate">
                  {currentBusiness?.name || 'Grand Heritage Hotel'}
                </h3>
              </div>

              {/* QR Box */}
              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG
                  value={permanentUrl}
                  size={190}
                  level="H"
                  fgColor={fgColor}
                  bgColor="#FFFFFF"
                  imageSettings={
                    includeLogo
                      ? {
                          src:
                            currentBusiness?.logo_url ||
                            'https://cdn-icons-png.flaticon.com/512/3500/3500833.png',
                          x: undefined,
                          y: undefined,
                          height: 38,
                          width: 38,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              </div>

              {/* Badges */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Rate Us 5 Stars on Google Maps</span>
                </div>
                <p className="text-[10px] opacity-75">
                  Point your smartphone camera to view digital menu, photos & reviews.
                </p>
              </div>

              <div className="pt-2 border-t border-white/20 text-[9px] opacity-60 flex items-center justify-between">
                <span>{currentBusiness?.phone || '+91 98765 43210'}</span>
                <span>Powered by SmartQR</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-4 text-center max-w-xs">
              When printed, this QR code directs customers to <strong>{permanentUrl}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
