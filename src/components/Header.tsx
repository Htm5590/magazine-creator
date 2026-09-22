import React from 'react';
import { TahwasLogo } from './TahwasLogo';
import {
  Sparkles,
  RotateCcw,
  RotateCw,
  Check,
  Eye,
  FileDown,
  Layers,
  FileText,
  Megaphone,
  ArrowRightLeft,
  Image,
  SlidersHorizontal,
  Key,
} from 'lucide-react';
import { Lang } from '../types';

interface HeaderProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onLoadDemo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  lastSavedAt: string;
  onTogglePreviewDrawer: () => void;
  issueNumber: string;
  logoUrl?: string;
  brandColors?: { primary: string; secondary: string };
  magazineName?: string;
  onOpenAISettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onStepChange,
  lang,
  onLangChange,
  onLoadDemo,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  lastSavedAt,
  onTogglePreviewDrawer,
  issueNumber,
  logoUrl,
  brandColors,
  magazineName,
  onOpenAISettings,
}) => {
  const steps = [
    { number: 1, label: { ar: 'إعداد العدد', fr: 'Configuration', en: 'Issue Setup' }, icon: SlidersHorizontal },
    { number: 2, label: { ar: 'المقالات', fr: 'Articles', en: 'Articles' }, icon: FileText },
    { number: 3, label: { ar: 'الإعلانات', fr: 'Publicités', en: 'Ads' }, icon: Megaphone },
    { number: 4, label: { ar: 'الترتيب', fr: 'Ordre & Spreads', en: 'Order & Shuffle' }, icon: ArrowRightLeft },
    { number: 5, label: { ar: 'استوديو الغلاف', fr: 'Studio Couverture', en: 'Cover Studio' }, icon: Image },
    { number: 6, label: { ar: 'المراجعة والفحص', fr: 'Revue & Preflight', en: 'Review' }, icon: Layers },
    { number: 7, label: { ar: 'التصدير PDF', fr: 'Exportation PDF', en: 'Export' }, icon: FileDown },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Issue Info */}
        <div className="flex items-center gap-4">
          <TahwasLogo
            size="sm"
            showTagline={false}
            customLogoUrl={logoUrl}
            customColors={brandColors}
            magazineName={magazineName}
          />
          <div className="hidden sm:flex items-center gap-2 pl-3 border-r border-stone-200 text-xs">
            <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-sm">
              {issueNumber || 'العدد 14'}
            </span>
            <span className="text-stone-400 font-mono text-[11px] flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>محفوظ تلقائياً ({lastSavedAt})</span>
            </span>
          </div>
        </div>

        {/* Center Actions: Undo/Redo & Demo Loader */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200/70">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="تراجع (Ctrl+Z)"
              className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="إعادة (Ctrl+Y)"
              className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-white transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {onOpenAISettings && (
            <button
              onClick={onOpenAISettings}
              title="إعدادات مفتاح الذكاء الاصطناعي (Gemini Free أو Groq)"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300/80 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden lg:inline">مفتاح AI</span>
            </button>
          )}

          <button
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">تحميل عدد تحواس تجريبي</span>
            <span className="md:hidden">عدد تجريبي</span>
          </button>

          <button
            onClick={onTogglePreviewDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">معاينة مباشرة</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200/70 text-xs">
            <button
              onClick={() => onLangChange('ar')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                lang === 'ar' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => onLangChange('fr')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                lang === 'fr' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => onLangChange('en')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                lang === 'en' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Stepper Wizard Bar */}
      <div className="bg-stone-50/90 border-t border-stone-200/60 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between min-w-[700px]">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStep === s.number;
            const isPassed = currentStep > s.number;

            return (
              <React.Fragment key={s.number}>
                <button
                  onClick={() => onStepChange(s.number)}
                  className={`flex items-center gap-2 py-2.5 px-3 relative group transition-colors cursor-pointer ${
                    isActive
                      ? 'text-emerald-900 font-bold'
                      : isPassed
                      ? 'text-stone-700 hover:text-stone-900'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-700/20'
                        : isPassed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {isPassed ? <Check className="w-3.5 h-3.5" /> : s.number}
                  </div>
                  <span className="text-xs whitespace-nowrap">{s.label[lang]}</span>
                  {isActive && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </button>

                {idx < steps.length - 1 && (
                  <div
                    className={`h-[1px] flex-1 min-w-[12px] mx-1 transition-colors ${
                      isPassed ? 'bg-emerald-300' : 'bg-stone-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </header>
  );
};
