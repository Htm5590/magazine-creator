import React, { useState } from 'react';
import {
  Article,
  ArticleImage,
  ArticleTemplateId,
  ArticleLayoutId,
  ARTICLE_LAYOUT_OPTIONS,
  normalizeArticleLayout,
  TravelFacts,
} from '../types';
import { ARTICLE_TEMPLATES } from '../data/templates';
import {
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Upload,
  Compass,
  FileText,
  Quote,
  Check,
  X,
  Sparkles,
  Key,
  Wand2,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  LayoutTemplate,
  Columns,
  AlignJustify,
  Layout,
} from 'lucide-react';
import { AISettingsModal } from './AISettingsModal';
import { AIGenerateArticleModal } from './AIGenerateArticleModal';
import {
  getAIConfig,
  getActiveKey,
  polishArticleWithAI,
  GeneratedArticleData,
  AIConfig,
} from '../utils/aiService';

interface Step2ArticlesProps {
  articles: Article[];
  onUpdateArticles: (articles: Article[]) => void;
  onNext: () => void;
}

const CATEGORY_PRESETS = [
  'سياحة داخلية',
  'تقارير',
  'استكشاف',
  'تراث وثقافة',
  'واحات وصحراء',
  'وجهات ساحلية',
  'فن الطهي والضيافة',
];

export const Step2Articles: React.FC<Step2ArticlesProps> = ({
  articles,
  onUpdateArticles,
  onNext,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(articles[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  // Category filter state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // AI modals and states
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(getAIConfig());
  const [isAIPolishing, setIsAIPolishing] = useState(false);
  const [aiNotification, setAiNotification] = useState<string | null>(null);

  const selectedArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];

  // List of unique categories present in current articles
  const presentCategories = Array.from(
    new Set(articles.map((a) => a.category || 'سياحة داخلية'))
  );

  // Filtered articles list
  const filteredArticles =
    selectedCategoryFilter === 'all'
      ? articles
      : articles.filter((a) => (a.category || 'سياحة داخلية') === selectedCategoryFilter);

  const handleUploadArticleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingArticle) {
      const reader = new FileReader();
      reader.onload = () => {
        const newImg: ArticleImage = {
          id: `img-${Date.now()}`,
          url: reader.result as string,
          role: editingArticle.images.length === 0 ? 'hero' : 'inline',
          caption: 'صورة توثيقية من الميدان',
          credit: 'تصوير: عدسة تحواس',
          order: editingArticle.images.length + 1,
          focalPoint: { x: 0.5, y: 0.5 },
        };
        setEditingArticle({
          ...editingArticle,
          images: [...editingArticle.images, newImg],
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateNewArticle = () => {
    const newArt: Article = {
      id: `art-${Date.now()}`,
      category: 'سياحة داخلية',
      kicker: 'وجهات سياحية جديدة',
      title: 'عنوان المقال الاستطلاعي الجديد',
      subtitle: 'وصف مختصر أو عنوان فرعي تمهيدي للمقال الاستطلاعي',
      byline: 'بقلم: صحفي تحواس براس',
      lang: 'ar',
      dir: 'rtl',
      body: 'اكتب نص المقال الصحفي هنا... تتميز السياحة الجزائرية بتنوع بيئي وثقافي استثنائي يجمع بين الشواطئ المتوسطية الخلابة ورمال الصحراء الكبرى الذهبية.',
      pullQuotes: ['الجزائر قارة سياحية بكر تنتظر من يكتشف سحرها وعراقة تراثها الأصيل.'],
      facts: {
        destination: 'الوجهة السياحية',
        region: 'المنطقة أو الولاية',
        bestTime: 'الربيع والخريف',
        duration: '3 إلى 5 أيام',
        budget: 'medium',
        howToReach: 'رحلات جوية وسيارات دفع رباعي',
        climateTip: 'احرص على جلب ملابس مريحة ومعدات استكشاف',
        currency: 'الدينار الجزائري (DZD)',
        languages: 'العربية، الأمازيغية، الفرنسية',
      },
      images: [
        {
          id: `img-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
          role: 'hero',
          caption: 'صورة افتتاحية للوجهة السياحية',
          credit: 'تصوير: عدسة تحواس',
          order: 1,
          focalPoint: { x: 0.5, y: 0.5 },
        },
      ],
      templateId: 'image-text',
      estimatedPages: 2,
      wordCount: 150,
    };

    onUpdateArticles([...articles, newArt]);
    setSelectedArticleId(newArt.id);
    setEditingArticle(newArt);
    setIsEditing(true);
  };

  const handleQuickChangeLayout = (articleId: string, newLayout: ArticleLayoutId) => {
    const updated = articles.map((a) =>
      a.id === articleId ? { ...a, templateId: newLayout } : a
    );
    onUpdateArticles(updated);
  };

  const handleDeleteArticle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (articles.length <= 1) {
      alert('يجب الإبقاء على مقال واحد على الأقل في المجلة.');
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذا المقال من العدد؟')) {
      const remaining = articles.filter((a) => a.id !== id);
      onUpdateArticles(remaining);
      if (selectedArticleId === id) {
        setSelectedArticleId(remaining[0].id);
      }
    }
  };

  const handleStartEdit = (art: Article) => {
    setEditingArticle(JSON.parse(JSON.stringify(art)));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editingArticle) return;
    const words = editingArticle.body.trim().split(/\s+/).filter(Boolean).length;
    // Estimate pages based on words and template
    const pages = Math.max(1, Math.ceil(words / 320) + (editingArticle.images.length > 2 ? 1 : 0));

    const updated = {
      ...editingArticle,
      category: editingArticle.category?.trim() || 'سياحة داخلية',
      wordCount: words,
      estimatedPages: pages,
    };

    const newArticles = articles.map((a) => (a.id === updated.id ? updated : a));
    onUpdateArticles(newArticles);
    setIsEditing(false);
    setEditingArticle(null);
  };

  // Handle article generated from AI Modal
  const handleArticleGeneratedFromAI = (genData: GeneratedArticleData) => {
    const words = genData.body.trim().split(/\s+/).filter(Boolean).length;
    const pages = Math.max(1, Math.ceil(words / 320) + 1);

    if (isEditing && editingArticle) {
      // If user was currently editing an article, update it with generated data
      setEditingArticle({
        ...editingArticle,
        category: genData.category || 'سياحة داخلية',
        kicker: genData.kicker,
        title: genData.title,
        subtitle: genData.subtitle,
        byline: genData.byline,
        body: genData.body,
        pullQuotes: genData.pullQuote ? [genData.pullQuote] : editingArticle.pullQuotes,
        facts: {
          ...editingArticle.facts,
          ...genData.facts,
        },
        wordCount: words,
        estimatedPages: pages,
      });
      setAiNotification('تم تحديث بيانات المقال بالمحتوى المولد من الذكاء الاصطناعي بنجاح!');
      setTimeout(() => setAiNotification(null), 4000);
    } else {
      // Create a brand new article
      const newArt: Article = {
        id: `art-ai-${Date.now()}`,
        category: genData.category || 'سياحة داخلية',
        kicker: genData.kicker,
        title: genData.title,
        subtitle: genData.subtitle,
        byline: genData.byline,
        lang: 'ar',
        dir: 'rtl',
        body: genData.body,
        pullQuotes: genData.pullQuote ? [genData.pullQuote] : ['سياحة الجزائر قارة بكر تأسر الألباب.'],
        facts: genData.facts,
        images: [
          {
            id: `img-${Date.now()}`,
            url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
            role: 'hero',
            caption: `مشهد سياحي من ${genData.facts.destination}`,
            credit: 'تصوير: عدسة تحواس براس',
            order: 1,
            focalPoint: { x: 0.5, y: 0.5 },
          },
        ],
        templateId: 'opener-hero',
        estimatedPages: pages,
        wordCount: words,
      };

      onUpdateArticles([...articles, newArt]);
      setSelectedArticleId(newArt.id);
      setEditingArticle(newArt);
      setIsEditing(true);
      setAiNotification('تم إنشاء المقال الجديد بالذكاء الاصطناعي بنجاح وإدراجه في العدد!');
      setTimeout(() => setAiNotification(null), 4000);
    }
  };

  // Polish current article text with AI
  const handlePolishCurrentArticle = async () => {
    if (!editingArticle) return;
    const activeKey = getActiveKey(aiConfig);
    if (!activeKey) {
      setIsAISettingsOpen(true);
      return;
    }

    setIsAIPolishing(true);
    try {
      const result = await polishArticleWithAI({
        title: editingArticle.title,
        body: editingArticle.body,
        category: editingArticle.category,
      });

      setEditingArticle({
        ...editingArticle,
        title: result.title || editingArticle.title,
        body: result.body || editingArticle.body,
        pullQuotes: result.pullQuote
          ? [result.pullQuote, ...editingArticle.pullQuotes.slice(0, 1)]
          : editingArticle.pullQuotes,
      });
      setAiNotification('تم تدقيق وتحسين نص المقال بالذكاء الاصطناعي بنجاح!');
      setTimeout(() => setAiNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تدقيق المقال بالذكاء الاصطناعي.');
    } finally {
      setIsAIPolishing(false);
    }
  };

  const hasAIKey = !!getActiveKey(aiConfig).trim();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Step Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2">
            الخطوة 2 من 7: إدارة وتصنيف المقالات
          </span>
          <h1 className="text-2xl font-black text-stone-900 font-cairo">
            مقالات وتحقيقات العدد ({articles.length} مقالات)
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            صنّف المقالات (سياحة داخلية، تقارير، استكشاف، تراث)، حرر النصوص والصور، أو استعن بالذكاء الاصطناعي.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* AI Settings / Key button */}
          <button
            type="button"
            onClick={() => setIsAISettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-300/80 rounded-xl text-xs font-bold text-stone-800 transition-colors cursor-pointer shadow-2xs"
            title="إعدادات مفتاح الذكاء الاصطناعي (Gemini Free أو Groq)"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>مفتاح AI</span>
            {hasAIKey ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold">
                {aiConfig.provider === 'groq' ? 'Groq ✓' : 'Gemini ✓'}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                إضافة
              </span>
            )}
          </button>

          {/* AI Article Generator Button */}
          <button
            type="button"
            onClick={() => {
              if (!hasAIKey) {
                setIsAISettingsOpen(true);
              } else {
                setIsAIGeneratorOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>توليد مقال بالذكاء الاصطناعي</span>
          </button>

          {/* Manual New Article Button */}
          <button
            onClick={handleCreateNewArticle}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مقال يدوي</span>
          </button>

          {/* Next Step Button */}
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <span>المتابعة للإعلانات</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {aiNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{aiNotification}</span>
        </div>
      )}

      {/* Main Layout: List & Preview/Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Articles List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Header & Page summary */}
          <div className="flex items-center justify-between px-1 text-xs font-bold text-stone-600">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-stone-500" />
              <span>قائمة مقالات العدد</span>
            </span>
            <span className="font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
              {articles.reduce((s, a) => s + a.estimatedPages, 0)} صفحات
            </span>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategoryFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              الكل ({articles.length})
            </button>
            {presentCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                {cat} ({articles.filter((a) => (a.category || 'سياحة داخلية') === cat).length})
              </button>
            ))}
          </div>

          {/* Articles list */}
          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredArticles.map((art) => {
              const isSelected = art.id === selectedArticleId;

              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-700/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {/* Category & Kicker badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
                        {art.category || 'سياحة داخلية'}
                      </span>
                      {art.kicker && art.kicker !== art.category && (
                        <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                          {art.kicker}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(art);
                        }}
                        title="تعديل المقال"
                        className="p-1 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteArticle(art.id, e)}
                        title="حذف المقال"
                        className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-stone-900 text-sm font-cairo line-clamp-2 leading-snug">
                    {art.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-stone-200/60 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1 font-mono">
                      <FileText className="w-3 h-3 text-stone-400" />
                      {art.wordCount} كلمة
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <ImageIcon className="w-3 h-3 text-stone-400" />
                      {art.images.length} صور
                    </span>
                    {(() => {
                      const norm = normalizeArticleLayout(art.templateId);
                      const info =
                        ARTICLE_LAYOUT_OPTIONS.find((o) => o.id === norm) || ARTICLE_LAYOUT_OPTIONS[2];
                      const badgeStyles: Record<string, string> = {
                        'full-text': 'text-stone-700 bg-stone-100 border-stone-200',
                        'image-text': 'text-amber-800 bg-amber-50 border-amber-200',
                        'two-columns': 'text-sky-800 bg-sky-50 border-sky-200',
                      };
                      return (
                        <span
                          className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${badgeStyles[norm] || 'text-stone-600 bg-stone-50'}`}
                          title={`قالب التنسيق: ${info.name}`}
                        >
                          {info.name}
                        </span>
                      );
                    })()}
                    <span className="font-medium text-emerald-800 bg-emerald-100/60 px-1.5 py-0.2 rounded text-[10px] mr-auto">
                      {art.estimatedPages} {art.estimatedPages === 1 ? 'صفحة' : 'صفحات'}
                    </span>
                  </div>
                </div>
              );
            })}

            {articles.length === 0 ? (
              <div className="p-8 bg-white border-2 border-dashed border-stone-300 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-stone-900 text-sm font-cairo">لا توجد مقالات مضافة بعد</h4>
                <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                  المجلة جاهزة لاستقبال مقالاتك وتقاريرك الصحفية. أضف مقالك الأول بالضغط على الزر أدناه.
                </p>
                <button
                  onClick={handleCreateNewArticle}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مقالك الأول الآن</span>
                </button>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="p-8 bg-white border border-stone-200 rounded-xl text-center text-xs text-stone-400">
                لا توجد مقالات ضمن تصنيف "{selectedCategoryFilter}".
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Selected Article Details / Fast Edit */}
        <div className="lg:col-span-8">
          {selectedArticle ? (
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-6">
              <div className="flex items-start justify-between border-b border-stone-100 pb-4 gap-4">
                <div className="space-y-1">
                  {/* Category and kicker badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                      التصنيف: {selectedArticle.category || 'سياحة داخلية'}
                    </span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      {selectedArticle.kicker}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 font-cairo mt-1">
                    {selectedArticle.title}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">{selectedArticle.byline}</p>
                </div>

                <button
                  onClick={() => handleStartEdit(selectedArticle)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل المقال والتصنيف</span>
                </button>
              </div>

              {/* Layout Templates Feature (قوالب التنسيق) */}
              <div className="bg-gradient-to-br from-stone-50 to-stone-100/60 rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                      <LayoutTemplate className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 font-cairo">قالب التنسيق الصحفي</h4>
                      <p className="text-[10.5px] text-stone-500">اختر من بين 3 تخطيطات مخصصة لتنسيق هذا المقال</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg shadow-2xs">
                    {selectedArticle.estimatedPages} صفحات مقدرة
                  </span>
                </div>

                {/* 3 Layout Choice Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {ARTICLE_LAYOUT_OPTIONS.map((layout) => {
                    const currentNormalized = normalizeArticleLayout(selectedArticle.templateId);
                    const isCurrent = currentNormalized === layout.id;

                    const IconComponent =
                      layout.id === 'full-text'
                        ? AlignJustify
                        : layout.id === 'image-text'
                        ? Layout
                        : Columns;

                    return (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => handleQuickChangeLayout(selectedArticle.id, layout.id)}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isCurrent
                            ? 'bg-white border-emerald-700 shadow-xs ring-2 ring-emerald-700/25'
                            : 'bg-white/80 hover:bg-white border-stone-200/90 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-6 h-6 rounded-md flex items-center justify-center ${
                                isCurrent ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-stone-900 font-cairo">{layout.name}</span>
                          </div>
                          {isCurrent && (
                            <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[9.5px] font-medium px-1.5 py-0.5 rounded w-fit ${
                            isCurrent
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {layout.tag}
                        </span>

                        <p className="text-[10px] text-stone-500 leading-snug line-clamp-2">
                          {layout.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subtitle & Sample Body */}
              {selectedArticle.subtitle && (
                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 text-xs text-stone-700 font-medium">
                  {selectedArticle.subtitle}
                </div>
              )}

              {/* Travel Facts Box Preview */}
              {selectedArticle.facts && (
                <div className="bg-emerald-50/30 rounded-xl p-4 border border-emerald-200/70 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 border-b border-emerald-200/50 pb-2">
                    <Compass className="w-4 h-4 text-emerald-700" />
                    <span>صندوق حقائق السفر السياحي (Travel Facts)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px]">الوجهة والمنطقة</span>
                      <span className="font-bold text-stone-800">{selectedArticle.facts.destination}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">أفضل وقت للزيارة</span>
                      <span className="font-bold text-stone-800">{selectedArticle.facts.bestTime}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">المدة المثالية</span>
                      <span className="font-bold text-stone-800">{selectedArticle.facts.duration}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pull Quotes */}
              {selectedArticle.pullQuotes?.length > 0 && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <Quote className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs italic text-stone-700">"{selectedArticle.pullQuotes[0]}"</p>
                </div>
              )}

              {/* Article Images Thumbnails */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 mb-2 flex items-center justify-between">
                  <span>صور المقال ({selectedArticle.images.length})</span>
                  <span className="text-stone-400 text-[11px]">مضبوطة بنقاط التركيز وحقوق النشر</span>
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {selectedArticle.images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative rounded-lg overflow-hidden border border-stone-200 aspect-video bg-stone-100"
                    >
                      <img
                        src={img.url}
                        alt={img.caption || 'Article image'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-[10px] text-white">
                        <span className="block truncate font-bold">{img.caption || 'صورة'}</span>
                        <span className="text-stone-300 block truncate">{img.credit || 'بدون مصدر'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Text Preview */}
              <div className="pt-4 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-700 mb-2 block">
                  نص المقال الكامل (محفوظ بحرفيته)
                </span>
                <div className="p-4 bg-stone-50 rounded-xl text-xs text-stone-700 leading-relaxed font-cairo max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {selectedArticle.body}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-stone-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200/60">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-900 text-base font-cairo">ابدأ بإضافة مقالات وتحقيقات العدد</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                أدخل عنوان المقال، السرد التحريري، الصور المرافقة، وصندوق حقائق السفر السياحي.
                يتم حساب التوزيع والصفحات تلقائياً بدقة طباعية عالية.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleCreateNewArticle}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مقال جديد يدوياً</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Article Full Edit Modal */}
      {isEditing && editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span className="font-bold font-cairo text-sm">محرر المقال الصحفي وتصنيفه</span>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Form */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
              {/* AI Assistant Bar inside Edit Modal */}
              <div className="p-3.5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">مساعد التحرير بالذكاء الاصطناعي</span>
                    <span className="text-[10.5px] text-stone-400">
                      المزود: {aiConfig.provider === 'groq' ? 'Groq Llama 3.3' : 'Google Gemini Free'}
                      {hasAIKey ? ' (متصل ✓)' : ' (لم يتم إدخال مفتاح API بعد)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handlePolishCurrentArticle}
                    disabled={isAIPolishing}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isAIPolishing ? (
                      <>
                        <span className="w-3 h-3 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                        <span>جاري التدقيق والتحسين...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>تدقيق وتحسين النص ✨</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!hasAIKey) {
                        setIsAISettingsOpen(true);
                      } else {
                        setIsAIGeneratorOpen(true);
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>توليد بالذكاء الاصطناعي 🪄</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAISettingsOpen(true)}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="إعدادات مفتاح API"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>

              {/* Dedicated Category Section with Presets & Input */}
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>حقل التصنيف (Category) للمقال</span>
                    <span className="text-[10px] text-stone-500 font-normal">
                      (حدد تصنيف المقال لتنظيمه في الفهرس وصفحات المجلة)
                    </span>
                  </label>
                  <span className="text-[10.5px] font-bold text-emerald-800 font-mono">
                    الحالي: {editingArticle.category || 'سياحة داخلية'}
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_PRESETS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditingArticle({ ...editingArticle, category: cat })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        editingArticle.category === cat
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Input for custom category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      اسم التصنيف (يمكنك كتابة تصنيف مخصص)
                    </label>
                    <input
                      type="text"
                      value={editingArticle.category || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                      placeholder="مثال: سياحة داخلية، تقارير، استكشاف، تراث..."
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-emerald-900 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      الترويسة الصحفية للمقال (Kicker)
                    </label>
                    <input
                      type="text"
                      value={editingArticle.kicker}
                      onChange={(e) => setEditingArticle({ ...editingArticle, kicker: e.target.value })}
                      placeholder="مثال: سياحة المغامرات والصحراء"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-800 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Title, Subtitle, Byline */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">العنوان الرئيسي للمقال</label>
                  <input
                    type="text"
                    value={editingArticle.title}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">العنوان الفرعي (Subtitle)</label>
                    <input
                      type="text"
                      value={editingArticle.subtitle || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, subtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">اسم الكاتب أو الصحفي (Byline)</label>
                    <input
                      type="text"
                      value={editingArticle.byline || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, byline: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Layout Templates Selector (3 Distinct Layout Options) */}
              <div className="p-4 bg-stone-50/90 rounded-2xl border border-stone-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-emerald-800" />
                    <div>
                      <label className="block text-xs font-bold text-stone-900 font-cairo">
                        قوالب التنسيق الصحفي للمقال (اختر أحد التخطيطات الثلاثة)
                      </label>
                      <p className="text-[10.5px] text-stone-500">
                        حدد التخطيط الإخراجي المناسب لنوع المقال ومحتواه السردي والبصري
                      </p>
                    </div>
                  </div>

                  <span className="text-[10.5px] text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    3 تخطيطات متاحة
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ARTICLE_LAYOUT_OPTIONS.map((layout) => {
                    const currentNormalized = normalizeArticleLayout(editingArticle.templateId);
                    const isSelected = currentNormalized === layout.id;

                    const IconComponent =
                      layout.id === 'full-text'
                        ? AlignJustify
                        : layout.id === 'image-text'
                        ? Layout
                        : Columns;

                    return (
                      <div
                        key={layout.id}
                        onClick={() =>
                          setEditingArticle({
                            ...editingArticle,
                            templateId: layout.id,
                          })
                        }
                        className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-right bg-white ${
                          isSelected
                            ? 'border-emerald-700 bg-emerald-50/30 shadow-xs ring-2 ring-emerald-700/20'
                            : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                        }`}
                      >
                        {/* Header of Layout Card */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-stone-900 font-cairo block">
                                {layout.name}
                              </span>
                              <span className="text-[9.5px] text-stone-400 font-mono">
                                {layout.nameEn}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                              isSelected
                                ? 'bg-emerald-700 border-emerald-700 text-white'
                                : 'border-stone-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </div>

                        {/* Schematic Mini Wireframe preview of layout */}
                        <div
                          className={`p-2.5 rounded-lg border flex flex-col gap-1.5 transition-colors ${
                            isSelected ? 'bg-emerald-50/70 border-emerald-200' : 'bg-stone-100/60 border-stone-200'
                          }`}
                        >
                          {layout.id === 'full-text' && (
                            <div className="space-y-1">
                              <div className="w-16 h-1.5 bg-stone-400 rounded-sm mx-auto" />
                              <div className="w-full h-1 bg-stone-300 rounded-xs" />
                              <div className="flex gap-1.5 items-start">
                                <div className="w-4 h-4 bg-stone-500 rounded-xs flex-shrink-0" />
                                <div className="space-y-0.5 flex-1">
                                  <div className="w-full h-1 bg-stone-300 rounded-xs" />
                                  <div className="w-4/5 h-1 bg-stone-300 rounded-xs" />
                                </div>
                              </div>
                              <div className="w-full h-2 bg-amber-200/80 rounded-xs" />
                              <div className="w-full h-1 bg-stone-300 rounded-xs" />
                            </div>
                          )}

                          {layout.id === 'image-text' && (
                            <div className="space-y-1">
                              <div className="w-full h-6 bg-amber-400/40 border border-amber-300/50 rounded-xs flex items-center justify-center text-[8px] font-bold text-amber-800">
                                <span>صورة بانورامية</span>
                              </div>
                              <div className="w-16 h-1.5 bg-stone-400 rounded-sm" />
                              <div className="grid grid-cols-2 gap-1">
                                <div className="space-y-0.5">
                                  <div className="w-full h-1 bg-stone-300 rounded-xs" />
                                  <div className="w-3/4 h-1 bg-stone-300 rounded-xs" />
                                </div>
                                <div className="w-full h-3 bg-emerald-200/80 rounded-xs" />
                              </div>
                            </div>
                          )}

                          {layout.id === 'two-columns' && (
                            <div className="space-y-1">
                              <div className="w-20 h-1.5 bg-stone-400 rounded-sm" />
                              <div className="w-full h-0.5 bg-stone-200 rounded-xs" />
                              <div className="grid grid-cols-2 gap-1.5">
                                <div className="space-y-0.5">
                                  <div className="w-full h-3 bg-amber-200/60 rounded-xs" />
                                  <div className="w-full h-1 bg-stone-300 rounded-xs" />
                                  <div className="w-4/5 h-1 bg-stone-300 rounded-xs" />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="w-full h-1 bg-stone-300 rounded-xs" />
                                  <div className="w-full h-3 bg-emerald-200/70 rounded-xs" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Description & Badge */}
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {layout.tag}
                          </span>
                          <p className="text-[10px] text-stone-600 leading-relaxed">
                            {layout.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Body Text */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700">
                    نص المقال الكامل (محرر نصي نقي يضمن عدم المساس بنص الكاتب)
                  </label>
                  <span className="text-[11px] text-stone-500 font-mono">
                    {editingArticle.body.split(/\s+/).filter(Boolean).length} كلمة
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={editingArticle.body}
                  onChange={(e) => setEditingArticle({ ...editingArticle, body: e.target.value })}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm font-cairo leading-relaxed focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  placeholder="أدخل نص المقال هنا..."
                />
              </div>

              {/* Pull Quote */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">اقتباس بارز (Pull Quote)</label>
                <input
                  type="text"
                  value={editingArticle.pullQuotes[0] || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, pullQuotes: [e.target.value] })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm italic focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  placeholder="عبارة ملهمة تبرز في منتصف الصفحة..."
                />
              </div>

              {/* Travel Facts Box Editor */}
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Compass className="w-4 h-4 text-emerald-700" />
                  <span>بيانات صندوق السفر السياحي (Travel Facts)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">الوجهة السياحية</label>
                    <input
                      type="text"
                      value={editingArticle.facts?.destination || ''}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          facts: { ...(editingArticle.facts as TravelFacts), destination: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">أفضل وقت للزيارة</label>
                    <input
                      type="text"
                      value={editingArticle.facts?.bestTime || ''}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          facts: { ...(editingArticle.facts as TravelFacts), bestTime: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">المدة المقترحة</label>
                    <input
                      type="text"
                      value={editingArticle.facts?.duration || ''}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          facts: { ...(editingArticle.facts as TravelFacts), duration: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">إرشادات الوصول والتنقل</label>
                  <input
                    type="text"
                    value={editingArticle.facts?.howToReach || ''}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        facts: { ...(editingArticle.facts as TravelFacts), howToReach: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                  />
                </div>
              </div>

              {/* Images Manager with Direct File Upload */}
              <div className="space-y-3 p-4 bg-stone-50/80 rounded-2xl border border-stone-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-700" />
                      <span>صور المقال والتوثيق الميداني ({editingArticle.images.length})</span>
                    </label>
                    <p className="text-[10px] text-stone-500">
                      ارفع صوراً حقيقية من جهازك أو ضع روابط لصور عالية الدقة
                    </p>
                  </div>

                  {/* Hidden Global File Input for Article */}
                  <input
                    type="file"
                    ref={uploadInputRef}
                    accept="image/*"
                    onChange={handleUploadArticleImage}
                    className="hidden"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => uploadInputRef.current?.click()}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة من جهازك 📷</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newImg: ArticleImage = {
                          id: `img-${Date.now()}`,
                          url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80',
                          role: editingArticle.images.length === 0 ? 'hero' : 'inline',
                          caption: 'شرح الصورة التوثيقية',
                          credit: 'تصوير: عدسة تحواس',
                          order: editingArticle.images.length + 1,
                          focalPoint: { x: 0.5, y: 0.5 },
                        };
                        setEditingArticle({
                          ...editingArticle,
                          images: [...editingArticle.images, newImg],
                        });
                      }}
                      className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>رابط URL</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {editingArticle.images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs shadow-2xs"
                    >
                      <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                        <img src={img.url} className="w-full h-full object-cover" alt={img.caption} />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-mono py-0.5">
                          {img.role === 'hero' ? 'رئيسية' : img.role === 'gallery' ? 'معرض' : 'مدمجة'}
                        </span>
                      </div>

                      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] text-stone-500 font-bold mb-0.5">الدور</label>
                          <select
                            value={img.role}
                            onChange={(e) => {
                              const updatedImgs = [...editingArticle.images];
                              updatedImgs[idx].role = e.target.value as any;
                              setEditingArticle({ ...editingArticle, images: updatedImgs });
                            }}
                            className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded text-[11px] font-bold"
                          >
                            <option value="hero">صورة رئيسية (Hero)</option>
                            <option value="inline">صورة مدمجة (Inline)</option>
                            <option value="gallery">معرض صور (Gallery)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-stone-500 font-bold mb-0.5">الرابط أو المعرف</label>
                          <input
                            type="text"
                            value={img.url}
                            placeholder="رابط الصورة (URL)"
                            onChange={(e) => {
                              const updatedImgs = [...editingArticle.images];
                              updatedImgs[idx].url = e.target.value;
                              setEditingArticle({ ...editingArticle, images: updatedImgs });
                            }}
                            className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded text-[11px] font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-stone-500 font-bold mb-0.5">الشرح / التعليق</label>
                          <input
                            type="text"
                            value={img.caption || ''}
                            placeholder="التعليق / الشرح"
                            onChange={(e) => {
                              const updatedImgs = [...editingArticle.images];
                              updatedImgs[idx].caption = e.target.value;
                              setEditingArticle({ ...editingArticle, images: updatedImgs });
                            }}
                            className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-stone-500 font-bold mb-0.5">حقوق المصور</label>
                          <input
                            type="text"
                            value={img.credit || ''}
                            placeholder="حقوق المصور (Credit)"
                            onChange={(e) => {
                              const updatedImgs = [...editingArticle.images];
                              updatedImgs[idx].credit = e.target.value;
                              setEditingArticle({ ...editingArticle, images: updatedImgs });
                            }}
                            className="w-full px-2 py-1 bg-stone-50 border border-stone-200 rounded text-[11px]"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updatedImgs = editingArticle.images.filter((_, i) => i !== idx);
                          setEditingArticle({ ...editingArticle, images: updatedImgs });
                        }}
                        className="text-stone-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer self-end sm:self-center"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-stone-500">سيتم حفظ المقال وتحديث صفحات العدد فوراً</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
        onConfigSaved={(saved) => setAiConfig(saved)}
      />

      {/* AI Generate Article Modal */}
      <AIGenerateArticleModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onOpenSettings={() => {
          setIsAIGeneratorOpen(false);
          setIsAISettingsOpen(true);
        }}
        onArticleGenerated={handleArticleGeneratedFromAI}
        initialCategory={editingArticle?.category || 'سياحة داخلية'}
        initialTopic={editingArticle?.title || ''}
      />
    </div>
  );
};
