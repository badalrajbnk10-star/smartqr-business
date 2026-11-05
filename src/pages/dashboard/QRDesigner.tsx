import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Printer,
  Sparkles,
  Palette,
  CheckCircle2,
  FileDown,
  Layers,
  PhoneCall,
  MapPin,
  MessageCircle,
  Smartphone,
  Image as ImageIcon
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { downloadQRPNG, exportElementToPDF, exportElementToPNG } from '../../lib/qr';
import { QRFrameStyle } from '../../types/database';

export const QRDesigner: React.FC = () => {
  const { currentBusiness, updateQRCode } = useBusiness();

  // Automatic Data Connection: Use logged-in owner's real database fields
  const businessName = currentBusiness?.name || 'Grand Heritage Hotel';
  const businessCategory = currentBusiness?.category?.name || 'Verified Business';
  const businessPhone = currentBusiness?.phone || '+91 9931782577';
  const businessWhatsapp = currentBusiness?.whatsapp || currentBusiness?.phone || '+91 9931782577';
  const businessAddress = currentBusiness
    ? `${currentBusiness.address || ''}${currentBusiness.city ? ', ' + currentBusiness.city : ''}${currentBusiness.pincode ? ' - ' + currentBusiness.pincode : ''}`.trim() || '123 Heritage Road, New Delhi - 110001'
    : '123 Heritage Road, New Delhi - 110001';

  const qrConfig = currentBusiness?.qr_code || {
    id: 'qr-default',
    business_id: currentBusiness?.id || 'biz-default',
    permanent_code: currentBusiness?.slug || 'my-business',
    permanent_url: `${window.location.origin}/b/${currentBusiness?.slug || 'my-business'}`,
    foreground_color: '#0A1931',
    background_color: '#FFFFFF',
    frame_type: 'table_tent' as QRFrameStyle,
    custom_text: 'Scan & Pay',
    total_scans: 148,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const [fgColor, setFgColor] = useState(qrConfig.foreground_color || '#0A1931');
  const [bgColor, setBgColor] = useState(qrConfig.background_color || '#FFFFFF');
  const [frameStyle, setFrameStyle] = useState<QRFrameStyle>(qrConfig.frame_type || 'table_tent');
  const [tagline, setTagline] = useState('Stay • Dine • Enjoy');
  const [ctaText, setCtaText] = useState(qrConfig.custom_text || 'Scan & Pay');
  const [includeLogo, setIncludeLogo] = useState(true);

  const [downloading, setDownloading] = useState(false);
  const [saved, setSaved] = useState(false);

  const permanentUrl = currentBusiness
    ? `${window.location.origin}/b/${currentBusiness.slug}`
    : `${window.location.origin}/b/grand-heritage`;

  // Split business name into main words + yellow highlighted last word
  const words = businessName.trim().split(' ');
  const mainTitle = words.length > 1 ? words.slice(0, -1).join(' ') : words[0];
  const highlightWord = words.length > 1 ? words[words.length - 1] : '';

  // Get initials for fallback logo badge
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleSaveDesign = async () => {
    if (!currentBusiness?.qr_code) return;
    await updateQRCode(currentBusiness.qr_code.id, {
      foreground_color: fgColor,
      background_color: bgColor,
      frame_type: frameStyle,
      custom_text: ctaText,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownloadCardPNG = async () => {
    setDownloading(true);
    try {
      await exportElementToPNG(
        'printable-qr-card',
        `${currentBusiness?.slug || 'smartqr'}-table-stand`
      );
    } catch (err) {
      console.error('Card PNG export error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadRawQRPNG = async () => {
    setDownloading(true);
    try {
      await downloadQRPNG(
        permanentUrl,
        currentBusiness?.slug || 'smartqr',
        fgColor,
        bgColor
      );
    } catch (err) {
      console.error('Raw QR PNG download error:', err);
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
    { label: 'Royal Blue (Official)', fg: '#0047D4', bg: '#FFFFFF' },
    { label: 'Deep Indigo', fg: '#1E1B4B', bg: '#FFFFFF' },
    { label: 'Classic Onyx', fg: '#000000', bg: '#FFFFFF' },
    { label: 'Emerald Forest', fg: '#064E3B', bg: '#FFFFFF' },
    { label: 'Crimson Wine', fg: '#991B1B', bg: '#FFFFFF' },
  ];

  const ctaOptions = ['Scan & Pay', 'Scan for Menu', 'Scan to Connect', 'Scan to Visit'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Automatic Dynamic QR & Acrylic Stand Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dynamic QR Designer & Printable Assets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Auto-generated from your business database. Download high-DPI acrylic table stands, stickers, and posters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadCardPNG}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
            title="Download full acrylic stand as high-res PNG image"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Card PNG</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Export print-ready A4 PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Printable PDF</span>
          </button>

          <button
            onClick={handleDownloadRawQRPNG}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            title="Download plain QR code only"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Raw QR</span>
          </button>

          <button
            onClick={handleBrowserPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>QR Design settings successfully saved to your profile!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Frame Style Selector */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              1. Choose Frame & Format
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'table_tent',
                  label: 'Royal Blue Stand (Featured)',
                  desc: 'Premium acrylic table tent stand with Thank You calligraphy',
                  badge: 'POPULAR'
                },
                {
                  id: 'bordered_poster',
                  label: 'Storefront Poster',
                  desc: 'A4 wall poster with brand border'
                },
                {
                  id: 'circular_badge',
                  label: 'Counter Sticker',
                  desc: 'Compact decal for cash registers'
                },
                {
                  id: 'card_compact',
                  label: 'Business Card',
                  desc: 'Pocket-sized visit card format'
                },
                {
                  id: 'standard',
                  label: 'Minimal QR',
                  desc: 'Clean borderless QR code'
                },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setFrameStyle(tmpl.id as QRFrameStyle)}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    frameStyle === tmpl.id
                      ? 'border-blue-600 bg-blue-50/60 text-slate-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {tmpl.badge && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-blue-600 text-[9px] font-black text-white">
                      {tmpl.badge}
                    </span>
                  )}
                  <p className="font-bold text-xs">{tmpl.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{tmpl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Text & Content Customization */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              2. Custom Tagline & Pill Text
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Header Tagline (Under Business Name)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Stay • Dine • Enjoy"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                QR Button Pill Text
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Scan & Pay"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {ctaOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCtaText(opt)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      ctaText === opt
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="logoCheck"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="logoCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Embed business icon inside center of QR Code
              </label>
            </div>
          </div>

          {/* 3. Color Palettes */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" />
              3. Theme & Colors
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {colorPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setFgColor(preset.fg);
                    setBgColor(preset.bg);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 hover:border-slate-400 text-[11px] font-medium"
                >
                  <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: preset.fg }}></span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveDesign}
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              Save Design Preferences
            </button>
          </div>
        </div>

        {/* Right Live Preview / Stand Rendering Area */}
        <div className="lg:col-span-7 sticky top-24">
          <div className="bg-slate-200/70 p-4 sm:p-6 rounded-3xl border border-slate-300/80 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Print Preview (High-DPI 300+)
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Format: {frameStyle.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Print Target DOM Element */}
            {frameStyle === 'table_tent' ? (
              /* ============================================================ */
              /* ROYAL BLUE ACRYLIC STAND TEMPLATE (Matches Reference Image)  */
              /* ============================================================ */
              <div
                id="printable-qr-card"
                className="w-full max-w-[430px] bg-white rounded-[32px] shadow-[0_25px_60px_-15px_rgba(2,35,120,0.35)] ring-1 ring-slate-900/10 overflow-hidden flex flex-col transition-all relative select-none"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {/* 1. Header Bar: Royal Blue Gradient + Waves */}
                <div className="relative bg-gradient-to-r from-[#031d68] via-[#0047D4] to-[#031d68] pt-6 pb-6 px-6 text-white overflow-hidden">
                  {/* Glossy top edge highlight */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-b from-white/40 to-transparent"></div>
                  {/* Lens flare orb */}
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-400/25 rounded-full blur-xl pointer-events-none"></div>

                  <div className="relative z-10 flex items-center gap-3.5">
                    {/* Logo / Badge */}
                    <div className="w-14 h-14 rounded-full bg-white flex flex-col items-center justify-center shadow-lg border-2 border-white/90 shrink-0 overflow-hidden">
                      {currentBusiness?.logo_url ? (
                        <img
                          src={currentBusiness.logo_url}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#031d68]">
                          <svg
                            className="w-6 h-6 text-[#0047D4]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                            <path d="M10 6h4" />
                            <path d="M10 10h4" />
                            <path d="M10 14h4" />
                          </svg>
                          <span className="text-[10px] font-black tracking-tight leading-none mt-0.5">
                            {getInitials(businessName)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Thin vertical divider line */}
                    <div className="h-10 w-[1.5px] bg-white/40 shrink-0"></div>

                    {/* Business Name & Tagline */}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex flex-wrap items-baseline gap-1.5 leading-tight">
                        <span className="drop-shadow-sm">{mainTitle}</span>
                        {highlightWord && (
                          <span className="text-[#FACC15] drop-shadow-sm font-black">
                            {highlightWord}
                          </span>
                        )}
                      </h2>

                      {/* Tagline with horizontal lines */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-[1px] w-6 sm:w-8 bg-white/50"></div>
                        <span className="text-white/95 text-[11px] font-semibold tracking-wider">
                          {businessCategory !== 'Verified Business' ? `${businessCategory} • ` : ''}{tagline}
                        </span>
                        <div className="h-[1px] w-6 sm:w-8 bg-white/50"></div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom wave curve transitioning to white body */}
                  <div className="absolute -bottom-1 inset-x-0 w-full overflow-hidden leading-none pointer-events-none">
                    <svg
                      viewBox="0 0 500 35"
                      preserveAspectRatio="none"
                      className="w-full h-4 sm:h-5 block"
                    >
                      <path
                        d="M0,0 C150,35 350,0 500,25 L500,35 L0,35 Z"
                        fill="#00B4D8"
                        opacity="0.45"
                      />
                      <path
                        d="M0,5 C180,35 320,5 500,30 L500,35 L0,35 Z"
                        fill="#FFFFFF"
                      />
                    </svg>
                  </div>
                </div>

                {/* 2. Body: Left Column (QR + Pill) & Right Column (Thank You Calligraphy) */}
                <div className="px-5 pt-5 pb-3 bg-white flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-3 items-center">
                    {/* Left: Dynamic QR Code Container with Glowing Neon Brackets */}
                    <div className="flex flex-col items-center">
                      <div className="relative p-2.5 bg-white rounded-2xl shadow-sm">
                        {/* Cyan Glowing Corner Brackets */}
                        <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-[3.5px] border-l-[3.5px] border-[#00B4D8] rounded-tl-xl drop-shadow-[0_0_8px_rgba(0,180,216,0.8)]"></div>
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-[3.5px] border-r-[3.5px] border-[#00B4D8] rounded-tr-xl drop-shadow-[0_0_8px_rgba(0,180,216,0.8)]"></div>
                        <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-[3.5px] border-l-[3.5px] border-[#00B4D8] rounded-bl-xl drop-shadow-[0_0_8px_rgba(0,180,216,0.8)]"></div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-[3.5px] border-r-[3.5px] border-[#00B4D8] rounded-br-xl drop-shadow-[0_0_8px_rgba(0,180,216,0.8)]"></div>

                        {/* High-Resolution SVG QR Code */}
                        <QRCodeSVG
                          value={permanentUrl}
                          size={155}
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
                                  height: 32,
                                  width: 32,
                                  excavate: true,
                                }
                              : undefined
                          }
                        />
                      </div>

                      {/* Scan & Pay Pill Badge */}
                      <div className="mt-3 w-full max-w-[170px] py-1.5 px-3 rounded-full bg-gradient-to-r from-[#031d68] via-[#0047D4] to-[#031d68] text-white shadow-md flex items-center justify-center gap-2 ring-1 ring-cyan-400/40">
                        {/* Viewfinder bracket icon around phone */}
                        <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                          <span className="absolute -top-0.5 -left-0.5 w-1 h-1 border-t-[1.5px] border-l-[1.5px] border-white"></span>
                          <span className="absolute -top-0.5 -right-0.5 w-1 h-1 border-t-[1.5px] border-r-[1.5px] border-white"></span>
                          <span className="absolute -bottom-0.5 -left-0.5 w-1 h-1 border-b-[1.5px] border-l-[1.5px] border-white"></span>
                          <span className="absolute -bottom-0.5 -right-0.5 w-1 h-1 border-b-[1.5px] border-r-[1.5px] border-white"></span>
                          <Smartphone className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-black tracking-wide uppercase drop-shadow-sm">
                          {ctaText}
                        </span>
                      </div>
                    </div>

                    {/* Right: Thank You Cursive Calligraphy & Swoosh */}
                    <div className="flex flex-col items-center justify-center text-center pl-1">
                      <p
                        className="text-4xl sm:text-[44px] font-bold text-[#0A2569] leading-none select-none tracking-tight"
                        style={{ fontFamily: "'Dancing Script', cursive" }}
                      >
                        Thank You!
                      </p>

                      {/* Golden curved underline swoosh */}
                      <svg
                        className="w-28 sm:w-32 h-3.5 text-[#F59E0B] mt-1"
                        viewBox="0 0 140 16"
                        fill="none"
                      >
                        <path
                          d="M5 4 Q70 18 135 4"
                          stroke="#F59E0B"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                        />
                      </svg>

                      <p className="text-[#0A2569] font-black text-xs sm:text-sm mt-3 flex items-center justify-center gap-1">
                        <span>For Your Business</span>
                        <span className="text-red-500 text-sm">❤️</span>
                      </p>
                    </div>
                  </div>

                  {/* 3. Action Badges Bar: WhatsApp, Google Maps Directions & Review on Google (NO STAR RATINGS!) */}
                  <div className="mt-4 pt-3 pb-1 border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-200 text-center items-center">
                    {/* Badge 1: WhatsApp Connect */}
                    <div className="flex items-center justify-center gap-1.5 px-1">
                      <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-sm">
                        <MessageCircle className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                      <div className="text-left text-[10px] leading-tight font-black text-slate-800">
                        WhatsApp<br />
                        <span className="font-semibold text-slate-500 text-[9px]">Connect</span>
                      </div>
                    </div>

                    {/* Badge 2: Google Maps Directions */}
                    <div className="flex items-center justify-center gap-1.5 px-1">
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        {/* Branded Google Maps Pin */}
                        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z" />
                          <path fill="#34A853" d="M12 2v20c.61-.51 1.25-1.09 1.89-1.74C18.23 15.93 20 12.84 20 10c0-4.42-3.58-8-8-8z" />
                          <path fill="#FBBC04" d="M12 2c-4.42 0-8 3.58-8 8 0 2.84 1.77 5.93 6.11 10.26.64.65 1.28 1.23 1.89 1.74V2z" />
                          <path fill="#EA4335" d="M12 2C9.79 2 7.79 2.9 6.34 4.34L12 10V2z" />
                          <circle fill="#FFFFFF" cx="12" cy="10" r="3.2" />
                          <circle fill="#4285F4" cx="12" cy="10" r="1.8" />
                        </svg>
                      </div>
                      <div className="text-left text-[10px] leading-tight font-black text-slate-800">
                        Google Maps<br />
                        <span className="font-semibold text-slate-500 text-[9px]">Directions</span>
                      </div>
                    </div>

                    {/* Badge 3: Review on Google (Strictly NO stars, NO rating numbers!) */}
                    <div className="flex items-center justify-center gap-1.5 px-1">
                      <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm p-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                      <div className="text-left text-[10px] leading-tight font-black text-slate-800">
                        Review on<br />
                        <span className="font-semibold text-slate-500 text-[9px]">Google</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Footer Bar: Royal Blue Curve with Phone & Address */}
                <div className="relative bg-gradient-to-r from-[#031d68] via-[#0047D4] to-[#031d68] text-white pt-2.5 pb-2.5 px-5">
                  {/* Top curved wave SVG for footer */}
                  <div className="absolute -top-3 inset-x-0 w-full overflow-hidden leading-none pointer-events-none">
                    <svg
                      viewBox="0 0 500 20"
                      preserveAspectRatio="none"
                      className="w-full h-3 block"
                    >
                      <path
                        d="M0,20 Q250,0 500,20 L500,20 L0,20 Z"
                        fill="#00B4D8"
                        opacity="0.45"
                      />
                      <path
                        d="M0,20 Q250,5 500,20 L500,20 L0,20 Z"
                        fill="#031d68"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10 flex items-center justify-between gap-3 text-xs border-b border-white/20 pb-1.5">
                    {/* Phone */}
                    <div className="flex items-center gap-1.5 font-bold">
                      <PhoneCall className="w-3.5 h-3.5 text-white shrink-0" />
                      <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide">
                        {businessPhone}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="h-3.5 w-[1px] bg-white/30 shrink-0"></div>

                    {/* Address */}
                    <div className="flex items-center gap-1 text-left min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
                      <span className="text-[10px] text-white/95 truncate max-w-[190px]">
                        {businessAddress}
                      </span>
                    </div>
                  </div>

                  {/* Powered by line */}
                  <div className="relative z-10 text-center pt-1">
                    <div className="flex items-center justify-center gap-2 text-[10px] tracking-wider font-semibold opacity-95">
                      <span className="h-[1px] w-6 bg-white/40"></span>
                      <span>
                        Powered by <strong className="text-[#FACC15] font-black">SmartQR</strong>
                      </span>
                      <span className="h-[1px] w-6 bg-white/40"></span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback Card for other frame styles (Poster, Card, Sticker, Minimal) */
              <div
                id="printable-qr-card"
                className="w-full max-w-sm rounded-3xl shadow-xl p-6 text-center space-y-4 transition-all"
                style={{
                  backgroundColor: bgColor,
                  color: fgColor,
                  border: frameStyle === 'bordered_poster' ? `8px solid ${fgColor}` : 'none',
                }}
              >
                <div>
                  <p className="text-[11px] uppercase tracking-widest font-extrabold opacity-90">
                    {ctaText}
                  </p>
                  <h3 className="text-xl font-black tracking-tight mt-1 truncate">
                    {businessName}
                  </h3>
                  <p className="text-xs opacity-75 mt-0.5">{businessCategory}</p>
                </div>

                <div className="inline-block p-4 bg-white rounded-2xl shadow-xl ring-1 ring-slate-100">
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

                <div className="space-y-1 pt-1">
                  <p className="text-xs font-bold">
                    Scan for Digital Profile, Menu & Directions
                  </p>
                  <p className="text-[10px] opacity-75">
                    Point your smartphone camera to connect with us instantly.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[10px] opacity-70 flex items-center justify-between">
                  <span>{businessPhone}</span>
                  <span>Powered by SmartQR</span>
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 mt-4 text-center max-w-sm">
              Point your camera to test scan: directs customers to{' '}
              <a
                href={permanentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 font-bold hover:underline"
              >
                {permanentUrl}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
