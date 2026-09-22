import React, { useRef, useState } from 'react';
import { Issue, Cover, CoverLine, CoverTemplateId } from '../types';
import { COVER_TEMPLATES } from '../data/templates';
import { MagazineCover } from './MagazineCover';
import {
  Image as ImageIcon,
  Sparkles,
  Layout,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Eye,
  Sliders,
  Upload,
  Link2,
  X,
  AlignRight,
  AlignLeft,
} from 'lucide-react';

interface Step5CoverStudioProps {
  issue: Issue;
  onUpdateCover: (cover: Cover) => void;
  onNext: () => void;
}

export const Step5CoverStudio: React.FC<Step5CoverStudioProps> = ({
  issue,
  onUpdateCover,
  onNext,
}) => {
  const { cover } = issue;
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const lineFileInputRef = useRef<HTMLInputElement>(null);
  const [activeLineUploadIdx, setActiveLineUploadIdx] = useState<number | null>(null);

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateCover({
          ...cover,
          photoUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLineImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeLineUploadIdx !== null) {
      const reader = new FileReader();
      reader.onload = () => {
        const updated = [...cover.lines];
        if (updated[activeLineUploadIdx]) {
          updated[activeLineUploadIdx].imageUrl = reader.result as string;
          onUpdateCover({ ...cover, lines: updated });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuggestCover = () => {
    // Automatically craft a balanced, distributed cover using current articles
    const leadArticle = issue.articles[0];
    if (leadArticle) {
      const heroImg = leadArticle.images.find((i) => i.role === 'hero') || leadArticle.images[0];
      const newLines: CoverLine[] = issue.articles.slice(1, 5).map((a, idx) => ({
        id: `cl-${idx}-${Date.now()}`,
        text: a.title,
        subtitle: a.subtitle || (a.body ? a.body.slice(0, 65).replace(/[\r\n]+/g, ' ') + '...' : ''),
        imageUrl: a.images[0]?.url,
        category: a.category || a.kicker || 'استكشاف',
        articleId: a.id,
        position: idx % 2 === 0 ? 'right' : 'left',
      }));

      onUpdateCover({
        ...cover,
        templateId: 'tahwas-signature',
        photoUrl: heroImg?.url || cover.photoUrl,
        headline: leadArticle.title,
        tagline: leadArticle.subtitle || cover.tagline,
        lines: newLines,
      });
    }
  };

  const handleAddCoverLine = () => {
    const unfeaturedArticle = issue.articles.find(
      (a) => !cover.lines.some((cl) => cl.articleId === a.id || cl.text === a.title)
    );

    const newLine: CoverLine = {
      id: `cl-${Date.now()}`,
      text: unfeaturedArticle ? unfeaturedArticle.title : 'عنوان بارز ومميز على الغلاف',
      subtitle: unfeaturedArticle?.subtitle || 'سطر وصفي مشوّق يلخص تفاصيل القصة لملء الغلاف',
      category: unfeaturedArticle?.category || unfeaturedArticle?.kicker || 'استكشاف',
      imageUrl: unfeaturedArticle?.images[0]?.url,
      articleId: unfeaturedArticle?.id,
      position: cover.lines.length % 2 === 0 ? 'right' : 'left',
    };

    onUpdateCover({
      ...cover,
      lines: [...cover.lines, newLine],
    });
  };

  const handleRemoveCoverLine = (id: string) => {
    onUpdateCover({
      ...cover,
      lines: cover.lines.filter((l) => l.id !== id),
    });
  };

  const handleLinkArticle = (lineIdx: number, articleId: string) => {
    const target = issue.articles.find((a) => a.id === articleId);
    if (!target) return;

    const updated = [...cover.lines];
    updated[lineIdx] = {
      ...updated[lineIdx],
      articleId: target.id,
      text: target.title,
      subtitle: target.subtitle || target.body.slice(0, 65) + '...',
      category: target.category || target.kicker || 'استكشاف',
      imageUrl: target.images[0]?.url || updated[lineIdx].imageUrl,
    };
    onUpdateCover({ ...cover, lines: updated });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Hidden file input for line thumbnails */}
      <input
        type="file"
        ref={lineFileInputRef}
        accept="image/*"
        onChange={handleLineImageUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2">
            الخطوة 5 من 7: استوديو الغلاف الأمامي والخلفي
          </span>
          <h1 className="text-2xl font-black text-stone-900 font-cairo">
            استوديو تصميم غلاف مجلة تحواس براس
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            توزيع العناوين على جانبي الغلاف مع صور مصغرة وعناوين فرعية شارحة لإبراز ثراء العدد وتفادي الفراغ.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSuggestCover}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="توليد تركيبة الغلاف تلقائياً من مقالات العدد الحالية مع صورها وعناوينها الفرعية"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>توزيع ذكي من المقالات بالصور</span>
          </button>

          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <span>المتابعة للمراجعة</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Grid: Editor Fields & Live Cover Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-6 space-y-6">
          {/* Templates Selection */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-sm font-cairo flex items-center gap-2">
              <Layout className="w-4 h-4 text-emerald-700" />
              <span>اختر قالب الغلاف (6 قوالب فنية)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {COVER_TEMPLATES.map((tpl) => {
                const isSelected = cover.templateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => onUpdateCover({ ...cover, templateId: tpl.id })}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700/20 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">{tpl.name.ar}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{tpl.description.ar}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo URL & Contrast Scrim */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm font-cairo flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>الصورة الرئيسية للغلاف</span>
              </h3>

              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع صورة غلاف من جهازك 📷</span>
              </button>
            </div>

            <input
              type="file"
              ref={coverFileInputRef}
              accept="image/*"
              onChange={handleCoverFileUpload}
              className="hidden"
            />

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">رابط صورة الغلاف (URL أو مسار)</label>
              <input
                type="text"
                value={cover.photoUrl}
                onChange={(e) => onUpdateCover({ ...cover, photoUrl: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
            </div>

            {/* Quick Presets from Issue Articles */}
            <div>
              <span className="text-[11px] text-stone-500 font-bold block mb-1.5">
                أو اختر صورة من مقالات العدد الحالية:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {issue.articles.flatMap((a) => a.images).slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onUpdateCover({ ...cover, photoUrl: img.url })}
                    className="aspect-video rounded-lg overflow-hidden border border-stone-200 hover:border-emerald-700 cursor-pointer"
                  >
                    <img src={img.url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cover.contrastScrim}
                  onChange={(e) => onUpdateCover({ ...cover, contrastScrim: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>تفعيل حزام التباين التدرجي (Scrim) لحماية مقروئية النصوص</span>
              </label>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* Headline & Secondary Cover Lines */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-sm font-cairo flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>المانشيت الرئيسي والبيانات</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  سعر النسخة <span className="text-stone-400 font-normal">(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={cover.price || ''}
                  onChange={(e) => onUpdateCover({ ...cover, price: e.target.value })}
                  placeholder="مثال: 350 دج (أو اتركه فارغاً)"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-emerald-700 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  السطر التعريفي للغلاف <span className="text-stone-400 font-normal">(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={cover.editionLabel || ''}
                  onChange={(e) => onUpdateCover({ ...cover, editionLabel: e.target.value })}
                  placeholder="مثال: عدد خاص أو ملف استقصائي"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-emerald-700 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">المانشيت الرئيسي للغلاف</label>
              <textarea
                rows={2}
                value={cover.headline}
                onChange={(e) => onUpdateCover({ ...cover, headline: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-bold font-cairo"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">شعار العدد أو السطر التفسيري</label>
              <input
                type="text"
                value={cover.tagline || ''}
                onChange={(e) => onUpdateCover({ ...cover, tagline: e.target.value })}
                placeholder="مثال: حوس بلادك ! — أول مجلة سياحية متخصصة في الجزائر"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Distributed Cover Stories Section */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm font-cairo flex items-center gap-2">
                  <Layout className="w-4 h-4 text-emerald-700" />
                  <span>عناوين الغلاف الموزعة ({cover.lines.length})</span>
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  تتوزع على يمين ويسار الغلاف مع صور مصغرة وعناوين فرعية لملء الغلاف بأناقة
                </p>
              </div>

              {cover.lines.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddCoverLine}
                  className="text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة عنوان قصة</span>
                </button>
              )}
            </div>

            {/* List of Cover Story Cards */}
            <div className="space-y-3.5">
              {cover.lines.map((line, idx) => (
                <div
                  key={line.id}
                  className="p-3.5 rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-white transition-all space-y-3 shadow-xs"
                >
                  {/* Top Bar of the Story Card: Article Link & Position & Delete */}
                  <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>

                      {/* Quick Article Linking Dropdown */}
                      <div className="flex items-center gap-1.5 flex-1">
                        <Link2 className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <select
                          value={line.articleId || ''}
                          onChange={(e) => handleLinkArticle(idx, e.target.value)}
                          className="bg-white border border-stone-200 rounded-md px-2 py-1 text-[11px] text-stone-700 flex-1 max-w-[200px]"
                        >
                          <option value="">-- ربط بمقال من المجلة --</option>
                          {issue.articles.map((art) => (
                            <option key={art.id} value={art.id}>
                              {art.title.slice(0, 30)}...
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Position Selector */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={line.position || 'auto'}
                        onChange={(e) => {
                          const updated = [...cover.lines];
                          updated[idx].position = e.target.value as any;
                          onUpdateCover({ ...cover, lines: updated });
                        }}
                        className="bg-white border border-stone-200 rounded-md px-2 py-1 text-[11px] font-bold text-stone-700"
                        title="موقع العنوان على الغلاف"
                      >
                        <option value="auto">تلقائي (توزيع متوازن)</option>
                        <option value="right">يمين الغلاف</option>
                        <option value="left">يسار الغلاف</option>
                        <option value="top">شريط علوي</option>
                        <option value="bottom">أسفل المانشيت</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveCoverLine(line.id)}
                        className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="حذف هذا العنوان"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Main Inputs: Category & Headline */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 sm:col-span-3">
                      <label className="block text-[10.5px] font-bold text-stone-600 mb-0.5">
                        التصنيف
                      </label>
                      <input
                        type="text"
                        value={line.category || ''}
                        placeholder="مثل: تراث، تقرير"
                        onChange={(e) => {
                          const updated = [...cover.lines];
                          updated[idx].category = e.target.value;
                          onUpdateCover({ ...cover, lines: updated });
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded text-xs font-bold"
                      />
                    </div>
                    <div className="col-span-8 sm:col-span-9">
                      <label className="block text-[10.5px] font-bold text-stone-600 mb-0.5">
                        العنوان البارز على الغلاف
                      </label>
                      <input
                        type="text"
                        value={line.text}
                        placeholder="عنوان المقال الجذاب..."
                        onChange={(e) => {
                          const updated = [...cover.lines];
                          updated[idx].text = e.target.value;
                          onUpdateCover({ ...cover, lines: updated });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs font-bold font-cairo"
                      />
                    </div>
                  </div>

                  {/* Subtitle Under Headline (User Explicit Request) */}
                  <div>
                    <label className="block text-[10.5px] font-bold text-stone-600 mb-0.5">
                      العنوان الفرعي أو السطر الشارح تحته (يملأ الفراغ ويوضح القصة)
                    </label>
                    <input
                      type="text"
                      value={line.subtitle || ''}
                      placeholder="سطر وصفي أو ملخص مشوق تحت العنوان..."
                      onChange={(e) => {
                        const updated = [...cover.lines];
                        updated[idx].subtitle = e.target.value;
                        onUpdateCover({ ...cover, lines: updated });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs text-stone-800"
                    />
                  </div>

                  {/* Thumbnail Image Selection (User Explicit Request) */}
                  <div className="pt-1 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {line.imageUrl ? (
                        <div className="relative group w-10 h-10 rounded-lg overflow-hidden border border-stone-300 shadow-xs flex-shrink-0">
                          <img src={line.imageUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...cover.lines];
                              updated[idx].imageUrl = undefined;
                              onUpdateCover({ ...cover, lines: updated });
                            }}
                            className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="إزالة الصورة"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-dashed border-stone-300 flex items-center justify-center text-stone-400 bg-white flex-shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}

                      <span className="text-[11px] font-bold text-stone-600">
                        {line.imageUrl ? 'صورة مصغرة للغلاف مفعّلة' : 'بدون صورة مصغرة'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Pick from article images */}
                      {issue.articles
                        .flatMap((a) => a.images)
                        .slice(0, 3)
                        .map((img, iIdx) => (
                          <button
                            key={iIdx}
                            type="button"
                            onClick={() => {
                              const updated = [...cover.lines];
                              updated[idx].imageUrl = img.url;
                              onUpdateCover({ ...cover, lines: updated });
                            }}
                            className="w-7 h-7 rounded border border-stone-200 overflow-hidden hover:border-emerald-600 transition-colors"
                            title="استخدام هذه الصورة"
                          >
                            <img src={img.url} className="w-full h-full object-cover" />
                          </button>
                        ))}

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLineUploadIdx(idx);
                          lineFileInputRef.current?.click();
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>رفع صورة</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Cover Visual Mockup */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="bg-stone-900 rounded-3xl p-4 shadow-xl border border-stone-800">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-2 px-2">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>معاينة حية لتوزيع الغلاف الحقيقي (A4)</span>
              </span>
              <span className="text-[11px] font-mono text-amber-400">{issue.number}</span>
            </div>

            {/* Simulated A4 Magazine Cover with distributed layout */}
            <MagazineCover issue={issue} variant="editor" />
          </div>
        </div>
      </div>
    </div>
  );
};

