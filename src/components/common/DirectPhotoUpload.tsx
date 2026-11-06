import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Camera, X, CheckCircle2, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { compressImageFile } from '../../lib/imageCompressor';

interface DirectPhotoUploadProps {
  label: string;
  value: string;
  onChange: (dataUrlOrLink: string) => void;
  aspectHint?: string;
  maxDimension?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
  placeholderText?: string;
}

export const DirectPhotoUpload: React.FC<DirectPhotoUploadProps> = ({
  label,
  value,
  onChange,
  aspectHint = 'JPG, PNG or WebP from Phone / PC',
  maxDimension = 1200,
  quality = 0.82,
  format = 'image/jpeg',
  placeholderText = 'Select Photo from Device / Camera',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setError(null);
    setIsProcessing(true);
    try {
      const res = await compressImageFile(file, {
        maxWidth: maxDimension,
        maxHeight: maxDimension,
        quality,
        format,
      });
      onChange(res.dataUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to process photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so the same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className="text-[11px] font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showLinkInput ? 'Switch to Direct Upload' : 'Paste link instead'}</span>
        </button>
      </div>

      {showLinkInput ? (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">
            You can paste an external URL or switch back to direct photo upload above.
          </p>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {value ? (
            <div className="relative group rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                <img
                  src={value}
                  alt="Selected Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Photo Ready</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  Direct photo loaded & optimized
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
                dragOver
                  ? 'border-brand-500 bg-brand-50/70 scale-[1.01]'
                  : 'border-slate-300 hover:border-brand-400 bg-slate-50/60 hover:bg-white'
              }`}
            >
              {isProcessing ? (
                <div className="py-4 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
                  <span className="text-xs font-bold text-slate-700">Compressing & optimizing photo...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-sm">
                    <Camera className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {placeholderText}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {aspectHint}
                    </p>
                  </div>
                  <span className="mt-1 px-3 py-1 rounded-full bg-brand-600 text-white text-[11px] font-bold shadow-sm">
                    📁 Choose Photo from Device
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[11px] font-medium text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
