import React from 'react';
import { Issue, ThemeId, PagePreset } from '../types';
import { THEMES } from '../data/themes';
import { LogoAndBrandManager } from './LogoAndBrandManager';
import { FrontMatterEditor } from './FrontMatterEditor';
import { Palette, BookOpen, Sliders, Globe, CheckCircle2, ArrowRight } from 'lucide-react';

interface Step1IssueSetupProps {
  issue: Issue;
  onChange: (updated: Partial<Issue>) => void;
  onNext: () => void;
}

export const Step1IssueSetup: React.FC<Step1IssueSetupProps> = ({ issue, onChange, onNext }) => {
  const pagePresets: { id: PagePreset; name: string; dims: string; desc: string }[] = [
    { id: 'a4', name: 'A4 عمودي قياسي (الموصى به)', dims: '210 × 297 مم', desc: 'المعيار العالمي للمجلات المطبوعة والرقمية' },
    { id: 'tablet45', name: 'شاشات الأجهزة اللوحية (4:5)', dims: '210 × 262.5 مم', desc: 'مناسب جداً للآيباد وقراءة الهواتف الذكية' },
    { id: 'letter', name: 'US Letter قياسي أمريكي', dims: '215.9 × 279.4 مم', desc: 'المعيار الشائع في أمريكا الشمالية' },
    { id: 'square', name: 'مربع فني حديث (Square)', dims: '240 × 240 مم', desc: 'طابع فني حديث مخصص للكتالوجات السياحية' },
  ];

  const handlePresetChange = (preset: PagePreset) => {
    let width = 210;
    let height = 297;
    if (preset === 'tablet45') {
      width = 210;
      height = 262.5;
    } else if (preset === 'letter') {
      width = 215.9;
      height = 279.4;
    } else if (preset === 'square') {
      width = 240;
      height = 240;
    }

    onChange({
      page: {
        ...issue.page,
        preset,
        widthMm: width,
        heightMm: height,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Introduction Card */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>الخطوة 1 من 7: إعداد هوية العدد</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 font-cairo">
            إعداد وتخصيص عدد مجلة تحواس براس
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            حدد بيانات العدد، مقاس الصفحات، والسمة البصرية (الألوان والخطوط). سيتم تطبيق هذا النسق تلقائياً على كافة المقالات والصفحات.
          </p>
        </div>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer flex-shrink-0"
        >
          <span>المتابعة للمقالات</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>

      {/* Magazine Logo and Color Inspiration Studio */}
      <LogoAndBrandManager issue={issue} onChange={onChange} />

      {/* Grid: Issue Details & Page Preset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issue Metadata */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold border-b border-stone-100 pb-3">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <span className="text-base font-cairo">بيانات العدد الرئيسية</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">اسم المجلة</label>
            <input
              type="text"
              value={issue.magazineName}
              onChange={(e) => onChange({ magazineName: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-semibold focus:outline-emerald-700 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">رقم العدد</label>
              <input
                type="text"
                value={issue.number}
                onChange={(e) => onChange({ number: e.target.value })}
                placeholder="العدد 14"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-emerald-700 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">تاريخ / موسم الإصدار</label>
              <input
                type="text"
                value={issue.date}
                onChange={(e) => onChange({ date: e.target.value })}
                placeholder="أكتوبر 2026"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-emerald-700 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">العنوان الرئيسي للعدد</label>
            <input
              type="text"
              value={issue.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="سحر الصحراء والساحل: من رمال طاسيلي إلى قصبة الجزائر"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-emerald-700 focus:bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">شعار المجلة (Tagline)</label>
            <input
              type="text"
              value={issue.cover.tagline}
              onChange={(e) =>
                onChange({
                  cover: { ...issue.cover, tagline: e.target.value },
                })
              }
              placeholder="حوس بلادك ! — أول مجلة سياحية متخصصة في الجزائر"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-emerald-700 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                سعر المجلة <span className="text-stone-400 font-normal">(اختياري - لا يظهر إن تُرك فارغاً)</span>
              </label>
              <input
                type="text"
                value={issue.price || ''}
                onChange={(e) => onChange({ price: e.target.value })}
                placeholder="مثال: 350 دج (أو اتركه فارغاً)"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-emerald-700 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                الموقع الإلكتروني <span className="text-stone-400 font-normal">(اختياري)</span>
              </label>
              <input
                type="text"
                value={issue.website || ''}
                onChange={(e) => onChange({ website: e.target.value })}
                placeholder="www.yourmagazine.com"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-emerald-700 focus:bg-white font-mono text-xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-stone-400" />
              <span>اللغة الافتراضية: العربية (RTL) مع دعم الفرنسية والإنجليزية</span>
            </span>
          </div>
        </div>

        {/* Page Size & Layout Preset */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold border-b border-stone-100 pb-3">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span className="text-base font-cairo">مقاس الصفحات والهوامش</span>
          </div>

          <div className="space-y-2">
            {pagePresets.map((p) => {
              const isSelected = issue.page.preset === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handlePresetChange(p.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/50 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900">{p.name}</span>
                      <span className="text-xs font-mono text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                        {p.dims}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{p.desc}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Margins */}
          <div className="pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
              <span>هوامش الصفحات (متطابقة ومعكوسة للسبريد)</span>
              <span className="text-stone-500 font-mono font-normal">
                داخلي: {issue.page.marginInnerMm}مم • خارجي: {issue.page.marginOuterMm}مم
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-stone-50 p-2 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px]">الأعلى</span>
                <span className="font-bold text-stone-800">{issue.page.marginTopMm} مم</span>
              </div>
              <div className="bg-stone-50 p-2 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px]">الأسفل</span>
                <span className="font-bold text-stone-800">{issue.page.marginBottomMm} مم</span>
              </div>
              <div className="bg-stone-50 p-2 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px]">الداخلي</span>
                <span className="font-bold text-stone-800">{issue.page.marginInnerMm} مم</span>
              </div>
              <div className="bg-stone-50 p-2 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px]">الخارجي</span>
                <span className="font-bold text-stone-800">{issue.page.marginOuterMm} مم</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor-in-Chief & Front Matter Studio */}
      <FrontMatterEditor issue={issue} onChange={onChange} />

      {/* Themes Catalog */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold">
            <Palette className="w-4 h-4 text-emerald-700" />
            <span className="text-base font-cairo">اختر سمة وهوية العدد البصرية (6 سمات مصممة للمجلة)</span>
          </div>
          <span className="text-xs text-stone-500">
            السمة المحددة: <strong className="text-emerald-800">{THEMES[issue.themeId]?.name.ar}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
            const theme = THEMES[themeKey];
            const isSelected = issue.themeId === themeKey;

            return (
              <div
                key={themeKey}
                onClick={() => onChange({ themeId: themeKey })}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-700 ring-2 ring-emerald-700/20 shadow-md bg-stone-50'
                    : 'border-stone-200 hover:border-stone-300 hover:shadow-xs bg-white'
                }`}
              >
                <div>
                  {/* Color Swatches */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div
                      className="w-6 h-6 rounded-md shadow-xs border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: theme.accent }}
                      title="لون التمييز الأساسي"
                    />
                    <div
                      className="w-6 h-6 rounded-md shadow-xs border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: theme.ink }}
                      title="لون النص والحبر"
                    />
                    <div
                      className="w-6 h-6 rounded-md shadow-xs border border-stone-300 flex-shrink-0"
                      style={{ backgroundColor: theme.paper }}
                      title="لون الورق والخلفية"
                    />
                    <div
                      className="w-6 h-6 rounded-md shadow-xs border border-stone-200 flex-shrink-0"
                      style={{ backgroundColor: theme.accentLight }}
                      title="خلفية البطاقات والإبرازات"
                    />
                  </div>

                  <h3 className="font-bold text-stone-900 text-sm font-cairo">{theme.name.ar}</h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{theme.description.ar}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="font-mono">{theme.fonts.arabicDisplay.split(',')[0]}</span>
                  {isSelected ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      مُفعل
                    </span>
                  ) : (
                    <span className="text-stone-400">انقر للتفعيل</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
