import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  AIProvider,
  AIConfig,
  getAIConfig,
  saveAIConfig,
  testConnection,
} from '../utils/aiService';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: AIConfig) => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<AIConfig>(getAIConfig());
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testErrorMsg, setTestErrorMsg] = useState<string>('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getAIConfig());
      setTestStatus('idle');
      setTestErrorMsg('');
      setSavedFeedback(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentKey = config.provider === 'groq' ? config.groqKey : config.geminiKey;

  const handleKeyChange = (val: string) => {
    setTestStatus('idle');
    setTestErrorMsg('');
    if (config.provider === 'groq') {
      setConfig({ ...config, groqKey: val.trim() });
    } else {
      setConfig({ ...config, geminiKey: val.trim() });
    }
  };

  const handleTestConnection = async () => {
    if (!currentKey) {
      setTestStatus('error');
      setTestErrorMsg('يرجى إدخال المفتاح أولاً قبل إجراء الاختبار.');
      return;
    }

    setTestStatus('testing');
    setTestErrorMsg('');
    try {
      const ok = await testConnection(config.provider, currentKey);
      if (ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setTestErrorMsg('لم يتمكن من إتمام الاختبار. تأكد من صحة المفتاح.');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestErrorMsg(err.message || 'فشل الاتصال بالمزود. يرجى مراجعة صلاحية المفتاح والاتصال بالإنترنت.');
    }
  };

  const handleSave = () => {
    saveAIConfig(config);
    setSavedFeedback(true);
    if (onConfigSaved) {
      onConfigSaved(config);
    }
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 800);
  };

  const handleClearKey = () => {
    if (confirm('هل أنت متأكد من مسح مفتاح API الحالي؟')) {
      const updated = {
        ...config,
        geminiKey: config.provider === 'gemini' ? '' : config.geminiKey,
        groqKey: config.provider === 'groq' ? '' : config.groqKey,
      };
      setConfig(updated);
      saveAIConfig(updated);
      setTestStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 text-right animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold font-cairo text-sm text-white">
                إعدادات الذكاء الاصطناعي (API Key)
              </h3>
              <p className="text-[11px] text-stone-400">
                أدخل مفتاحك الخاص لاستخدام الذكاء الاصطناعي مجاناً وبكل سهولة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-2">
              اختر مزود الذكاء الاصطناعي المدعوم حالياً:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Google Gemini Card */}
              <button
                type="button"
                onClick={() => {
                  setConfig({ ...config, provider: 'gemini' });
                  setTestStatus('idle');
                  setTestErrorMsg('');
                }}
                className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  config.provider === 'gemini'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-xs font-cairo text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Google Gemini
                  </span>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    مجاني 100%
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  نموذج Gemini 2.5 Flash الذكي باللغة العربية
                </p>
                {config.geminiKey && (
                  <span className="mt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> المفتاح محفوظ
                  </span>
                )}
              </button>

              {/* Groq Cloud Card */}
              <button
                type="button"
                onClick={() => {
                  setConfig({ ...config, provider: 'groq' });
                  setTestStatus('idle');
                  setTestErrorMsg('');
                }}
                className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  config.provider === 'groq'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-xs font-cairo text-stone-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    Groq Cloud
                  </span>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    فائق السرعة
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  نموذج Llama 3.3 70B السريع جداً مجاناً
                </p>
                {config.groqKey && (
                  <span className="mt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> المفتاح محفوظ
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* API Key Input Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800">
                مفتاح API الخاص بـ {config.provider === 'groq' ? 'Groq' : 'Google Gemini'}
              </label>
              {config.provider === 'gemini' ? (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>احصل على مفتاح Gemini مجاناً</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>احصل على مفتاح Groq مجاناً</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={currentKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder={
                  config.provider === 'groq'
                    ? 'مثال: gsk_xxxxxxxxxxxxxxxxxxxxxx'
                    : 'مثال: AIzaSyxxxxxxxxxxxxxxxxxxxxxx'
                }
                dir="ltr"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden pl-16 pr-3"
              />
              <div className="absolute left-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded transition-colors"
                  title={showKey ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                {currentKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors"
                    title="مسح المفتاح"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-[10.5px] text-stone-500 leading-normal">
              🔒 <strong>الخصوصية والأمان:</strong> مفتاحك يُحفظ محلياً داخل متصفحك فقط ولا يُنقل لأي طرف خارجي. يمكنك حذفه أو تغييره في أي لحظة.
            </p>
          </div>

          {/* Test Status feedback */}
          {testStatus === 'testing' && (
            <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-700 flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>جاري التحقق من صلاحية المفتاح والاتصال بمزود الخدمة...</span>
            </div>
          )}

          {testStatus === 'success' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>تم التحقق بنجاح! المفتاح صالح وجاهز لتوليد وتحرير المقالات السياحية.</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">تعذر الاتصال بالمزود:</span>
                <span className="text-[11px] mt-0.5 block">{testErrorMsg}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={!currentKey || testStatus === 'testing'}
            className="px-3.5 py-2 border border-stone-300 hover:border-stone-400 bg-white text-stone-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>فحص الاتصال (Test)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {savedFeedback ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم الحفظ!</span>
                </>
              ) : (
                <span>حفظ المفتاح والمتابعة</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
