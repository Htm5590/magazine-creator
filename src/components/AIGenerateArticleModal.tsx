import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Compass,
  AlertCircle,
  Key,
  CheckCircle2,
  FileText,
  Quote,
  RotateCcw,
  Zap,
} from 'lucide-react';
import {
  getAIConfig,
  getActiveKey,
  generateFullArticleWithAI,
  GeneratedArticleData,
} from '../utils/aiService';

interface AIGenerateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleGenerated: (articleData: GeneratedArticleData) => void;
  onOpenSettings: () => void;
  initialCategory?: string;
  initialTopic?: string;
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

export const AIGenerateArticleModal: React.FC<AIGenerateArticleModalProps> = ({
  isOpen,
  onClose,
  onArticleGenerated,
  onOpenSettings,
  initialCategory = 'سياحة داخلية',
  initialTopic = '',
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [category, setCategory] = useState(initialCategory);
  const [destination, setDestination] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedData, setGeneratedData] = useState<GeneratedArticleData | null>(null);

  if (!isOpen) return null;

  const config = getAIConfig();
  const activeKey = getActiveKey(config);
  const hasKey = !!activeKey.trim();

  const handleGenerate = async () => {
    if (!hasKey) {
      setErrorMsg('يرجى إضافة مفتاح API الخاص بك (Gemini Free أو Groq) أولاً.');
      return;
    }
    if (!topic.trim()) {
      setErrorMsg('يرجى إدخال موضوع أو فكرة المقال المراد كتابته.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await generateFullArticleWithAI({
        topic: topic.trim(),
        category: category.trim() || 'سياحة داخلية',
        destination: destination.trim(),
        customNotes: customNotes.trim(),
      });
      setGeneratedData(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء التوليد. تأكد من صحة المفتاح والاتصال.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (generatedData) {
      onArticleGenerated(generatedData);
      setGeneratedData(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 text-right flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold font-cairo text-sm text-white">
                توليد مقال صحفي سياحي بالذكاء الاصطناعي
              </h3>
              <p className="text-[11px] text-stone-400">
                باستخدام مزودك المفضل ({config.provider === 'groq' ? 'Groq Llama 3.3' : 'Google Gemini Free'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="إعدادات المفاتيح والمزود"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{hasKey ? 'تعديل المفتاح' : 'إضافة مفتاح API'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Missing Key Warning */}
          {!hasKey && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">مفتاح API غير متوفر حالياً</span>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    لاستخدام التوليد الآلي، يمكنك إضافة مفتاح Google Gemini المجاني أو مفتاح Groq بكل بساطة.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                إضافة المفتاح الآن
              </button>
            </div>
          )}

          {!generatedData ? (
            /* Input Form */
            <div className="space-y-4">
              {/* Category Selector with Quick Chips */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  تصنيف المقال (Category)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {CATEGORY_PRESETS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="أو اكتب تصنيفاً مخصصاً (مثال: سياحة داخلية، تقارير، استكشاف...)"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Topic / Idea */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  موضوع المقال أو فكرته الرئيسية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="مثال: واحات القورارة وقصور تيميمون الحمراء، أو كهوف تيمقاد وأعمدة الرومان"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-cairo focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Destination & Region */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    الوجهة السياحية (اختياري)
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="مثال: تيميمون، جانت، القصبة، وهران..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    ملاحظات أو زاوية التناول (اختياري)
                  </label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="مثال: التركيز على كرم الضيافة وأفضل مسار بالسيارة"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          ) : (
            /* Preview of Generated Content */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم توليد المقال بنجاح! راجع التفاصيل قبل الإدراج:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setGeneratedData(null)}
                  className="text-[11px] text-stone-600 hover:text-stone-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>توليد من جديد</span>
                </button>
              </div>

              {/* Title & Metadata Box */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {generatedData.category}
                  </span>
                  <span className="text-xs text-stone-500 font-bold">• {generatedData.kicker}</span>
                </div>
                <h4 className="text-base font-bold font-cairo text-stone-900">{generatedData.title}</h4>
                {generatedData.subtitle && (
                  <p className="text-xs text-stone-600 font-medium">{generatedData.subtitle}</p>
                )}
                <span className="text-[11px] text-stone-500 block">{generatedData.byline}</span>
              </div>

              {/* Pull quote */}
              {generatedData.pullQuote && (
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 italic">
                  <Quote className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>"{generatedData.pullQuote}"</p>
                </div>
              )}

              {/* Body snippet */}
              <div className="border border-stone-200 rounded-xl p-3 bg-white">
                <span className="text-[11px] font-bold text-stone-700 block mb-1">
                  نص المقال ({generatedData.body.split(/\s+/).filter(Boolean).length} كلمة):
                </span>
                <div className="max-h-40 overflow-y-auto text-xs text-stone-700 leading-relaxed font-cairo whitespace-pre-wrap">
                  {generatedData.body}
                </div>
              </div>

              {/* Travel Facts Preview */}
              {generatedData.facts && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5 text-[11px]">
                    <Compass className="w-3.5 h-3.5 text-emerald-700" />
                    <span>صندوق حقائق السفر المولد:</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-stone-400 block text-[9.5px]">الوجهة:</span>
                      <span className="font-bold text-stone-800">{generatedData.facts.destination}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[9.5px]">أفضل وقت:</span>
                      <span className="font-bold text-stone-800">{generatedData.facts.bestTime}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[9.5px]">المدة:</span>
                      <span className="font-bold text-stone-800">{generatedData.facts.duration}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            {config.provider === 'groq' ? (
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>المزود النشط: Groq</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>المزود النشط: Google Gemini</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-bold"
            >
              إغلاق
            </button>

            {!generatedData ? (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !hasKey}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري التحرير والكتابة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>توليد المقال الآن</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAccept}
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد وإدراج المقال</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
