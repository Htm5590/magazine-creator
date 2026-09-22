import React, { useState } from 'react';
import { Issue, BrandCustomColors } from '../types';
import { extractColorsFromImage, TOURISM_LOGO_PRESETS } from '../utils/colorExtractor';
import { TahwasLogo } from './TahwasLogo';
import { Upload, Sparkles, Image, RefreshCw, Palette, Check, Trash2, Sliders } from 'lucide-react';

interface LogoAndBrandManagerProps {
  issue: Issue;
  onChange: (updated: Partial<Issue>) => void;
}

export const LogoAndBrandManager: React.FC<LogoAndBrandManagerProps> = ({ issue, onChange }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');

  const currentColors: BrandCustomColors = issue.brandColors || {
    primary: '#0D5C46',
    secondary: '#D97706',
    paper: '#FAF8F5',
    accentLight: '#FEF3C7',
    ink: '#1A211D',
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setIsExtracting(true);
      try {
        const extracted = await extractColorsFromImage(dataUrl);
        onChange({
          logoUrl: dataUrl,
          brandColors: extracted,
        });
        setExtractSuccess(true);
        setTimeout(() => setExtractSuccess(false), 5000);
      } catch (err) {
        onChange({ logoUrl: dataUrl });
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof TOURISM_LOGO_PRESETS[0]) => {
    onChange({
      brandColors: {
        primary: preset.primary,
        secondary: preset.secondary,
        paper: preset.paper,
        accentLight: preset.accentLight,
        ink: preset.ink,
      },
    });
    setExtractSuccess(true);
    setTimeout(() => setExtractSuccess(false), 4000);
  };

  const handleInspireFromCurrentLogo = async () => {
    if (!issue.logoUrl) return;
    setIsExtracting(true);
    try {
      const extracted = await extractColorsFromImage(issue.logoUrl);
      onChange({ brandColors: extracted });
      setExtractSuccess(true);
      setTimeout(() => setExtractSuccess(false), 4000);
    } finally {
      setIsExtracting(false);
    }
  };

  const updateColor = (key: keyof BrandCustomColors, value: string) => {
    onChange({
      brandColors: {
        ...currentColors,
        [key]: value,
      },
    });
  };

  const handleRemoveLogo = () => {
    onChange({ logoUrl: undefined });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-bold">
            <Palette className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-black font-cairo">شعار المجلة وهوية الألوان (Logo & Brand Colors)</h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            أضف لوغو مجلتك السياحية، ودع الاستوديو يستوحي ألوان المجلة والصفحات والغلاف منه تلقائياً.
          </p>
        </div>

        {/* Live Logo Preview Badge */}
        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center gap-3">
          <span className="text-[11px] font-bold text-stone-400">معاينة فورية:</span>
          <TahwasLogo
            size="sm"
            customLogoUrl={issue.logoUrl}
            customColors={{ primary: currentColors.primary, secondary: currentColors.secondary }}
            magazineName={issue.magazineName}
          />
        </div>
      </div>

      {/* Tabs: Upload Logo vs Tourism Presets */}
      <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>رفع لوغو مخصص (Upload Logo)</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>شعارات وهوية سياحية جاهزة (Algerian Presets)</span>
        </button>
      </div>

      {/* Tab 1: Upload Custom Logo */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Upload Dropzone */}
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl bg-stone-50/70 hover:bg-emerald-50/20 transition-all cursor-pointer text-center group">
              <Upload className="w-8 h-8 text-stone-400 group-hover:text-emerald-700 group-hover:scale-110 transition-all mb-2" />
              <strong className="text-sm font-bold text-stone-800 font-cairo">
                اضغط هنا لرفع ملف الشعار أو اسحبه
              </strong>
              <span className="text-xs text-stone-500 mt-1">
                يدعم صيغ PNG الشفافة، SVG، JPG، WebP (حتى 5 ميغابايت)
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {issue.logoUrl && (
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <div className="flex items-center gap-2">
                  <img src={issue.logoUrl} className="w-8 h-8 object-contain rounded bg-white p-0.5 border" alt="Logo" />
                  <span className="font-bold text-stone-700">تم تحميل الشعار بنجاح</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInspireFromCurrentLogo}
                    disabled={isExtracting}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isExtracting ? 'جارٍ الاستلهام...' : 'استوحِ الألوان منه مجدداً'}</span>
                  </button>
                  <button
                    onClick={handleRemoveLogo}
                    className="text-rose-600 hover:text-rose-800 p-1"
                    title="حذف الشعار والعودة للشعار الافتراضي"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Color Extraction Notification & Live Palette */}
          <div className="space-y-4 bg-stone-50/80 p-5 rounded-2xl border border-stone-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 font-cairo flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>الألوان المستوحاة الحالية للمجلة</span>
              </span>
              {extractSuccess && (
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  تم استلهام الألوان وتطبيقها على كامل المجلة!
                </span>
              )}
            </div>

            {/* Color Swatch Editors */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 block">اللون الأساسي (Primary)</label>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-stone-200">
                  <input
                    type="color"
                    value={currentColors.primary}
                    onChange={(e) => updateColor('primary', e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer p-0"
                  />
                  <span className="font-mono text-stone-700">{currentColors.primary}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 block">اللون الذهبي/الثانوي (Secondary)</label>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-stone-200">
                  <input
                    type="color"
                    value={currentColors.secondary}
                    onChange={(e) => updateColor('secondary', e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer p-0"
                  />
                  <span className="font-mono text-stone-700">{currentColors.secondary}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 block">لون خلفية الورق (Paper Tint)</label>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-stone-200">
                  <input
                    type="color"
                    value={currentColors.paper || '#FAF8F5'}
                    onChange={(e) => updateColor('paper', e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer p-0"
                  />
                  <span className="font-mono text-stone-700">{currentColors.paper || '#FAF8F5'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 block">لون الحبر والقراءة (Ink)</label>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-stone-200">
                  <input
                    type="color"
                    value={currentColors.ink || '#1A211D'}
                    onChange={(e) => updateColor('ink', e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer p-0"
                  />
                  <span className="font-mono text-stone-700">{currentColors.ink || '#1A211D'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tourism Presets */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TOURISM_LOGO_PRESETS.map((preset) => {
            const isSelected =
              currentColors.primary.toLowerCase() === preset.primary.toLowerCase() &&
              currentColors.secondary.toLowerCase() === preset.secondary.toLowerCase();

            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                  </div>

                  <strong className="text-xs font-bold text-stone-900 block font-cairo">
                    {preset.name}
                  </strong>
                  <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                  <span>{preset.primary}</span>
                  <span>{preset.secondary}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
