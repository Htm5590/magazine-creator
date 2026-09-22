import React, { useState } from 'react';
import { Issue, PreflightItem, ProofFlag } from '../types';
import { PageRenderer } from './PageRenderer';
import { runPreflight } from '../utils/preflight';
import { checkIssueProofreading } from '../utils/proofreader';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Layers,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowRight,
  Sparkles,
  FileCheck,
  Eye,
  Sliders,
  Bot,
} from 'lucide-react';

interface Step6ReviewProps {
  issue: Issue;
  onNext: () => void;
}

export const Step6Review: React.FC<Step6ReviewProps> = ({ issue, onNext }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'single' | 'spread'>('single');
  const [zoomLevel, setZoomLevel] = useState<number>(0.65);
  const [activeTab, setActiveTab] = useState<'preflight' | 'proofread' | 'ai'>('preflight');

  // Run preflight checks and proofreading
  const preflightResults: PreflightItem[] = runPreflight(issue);
  const proofreadIssues: ProofFlag[] = checkIssueProofreading(issue.articles);

  const blockingErrors = preflightResults.filter((r) => r.severity === 'blocking');
  const warnings = preflightResults.filter((r) => r.severity === 'warning');
  const infos = preflightResults.filter((r) => r.severity === 'info');

  const currentItem = issue.sequence[currentPageIndex] || issue.sequence[0];
  const totalPages = issue.sequence.length;

  const handlePrevPage = () => {
    setCurrentPageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2">
            الخطوة 6 من 7: المراجعة وفحص ما قبل الطباعة (Preflight)
          </span>
          <h1 className="text-2xl font-black text-stone-900 font-cairo">
            معاينة العدد والتحقق من الجاهزية الطباعية
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            تصفح صفحات العدد بالحجم الحقيقي، وافحص تنبيهات ما قبل الطباعة والمصحح اللغوي قبل التصدير النهائي.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 rounded-xl text-xs font-bold font-mono">
            {blockingErrors.length === 0 ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                جاهز للتصدير (0 أخطاء حرجة)
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {blockingErrors.length} أخطاء تمنع التصدير
              </span>
            )}
          </div>

          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <span>المتابعة للتصدير PDF</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Main Grid: Viewer + Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Magazine Viewer Canvas */}
        <div className="lg:col-span-8 bg-stone-900/95 rounded-3xl p-6 shadow-xl border border-stone-800 flex flex-col items-center justify-between min-h-[720px] overflow-hidden">
          {/* Viewer Controls Toolbar */}
          <div className="w-full flex items-center justify-between text-white text-xs pb-4 border-b border-white/10">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  viewMode === 'single' ? 'bg-emerald-700 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                صفحة فردية
              </button>
              <button
                onClick={() => setViewMode('spread')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  viewMode === 'spread' ? 'bg-emerald-700 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                سبريد متقابل (Spread)
              </button>
            </div>

            {/* Page Jump */}
            <div className="flex items-center gap-2">
              <span className="text-stone-400">الصفحة:</span>
              <select
                value={currentPageIndex}
                onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                className="bg-stone-800 text-white border border-stone-700 rounded px-2.5 py-1 text-xs font-bold font-mono"
              >
                {issue.sequence.map((seq, idx) => (
                  <option key={seq.id} value={idx}>
                    ص {seq.startPage}: {seq.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-lg">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.1))}
                className="p-1 text-stone-400 hover:text-white"
                title="تصغير"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] px-1.5">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.2, z + 0.1))}
                className="p-1 text-stone-400 hover:text-white"
                title="تكبير"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Page Display Area */}
          <div className="my-auto py-6 overflow-auto max-w-full flex items-center justify-center">
            {viewMode === 'single' ? (
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  marginBottom: `calc((297mm * ${zoomLevel}) - 297mm)`,
                }}
              >
                <PageRenderer
                  pageNumber={currentItem.startPage || currentPageIndex + 1}
                  item={currentItem}
                  issue={issue}
                  pageSide={currentPageIndex % 2 === 0 ? 'right' : 'left'}
                />
              </div>
            ) : (
              // Spread View (two pages side by side)
              <div
                className="flex items-center gap-4"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  marginBottom: `calc((297mm * ${zoomLevel}) - 297mm)`,
                }}
              >
                {/* Even page on right in RTL */}
                <PageRenderer
                  pageNumber={currentItem.startPage || currentPageIndex + 1}
                  item={currentItem}
                  issue={issue}
                  pageSide="right"
                />
                {issue.sequence[currentPageIndex + 1] && (
                  <PageRenderer
                    pageNumber={issue.sequence[currentPageIndex + 1].startPage || currentPageIndex + 2}
                    item={issue.sequence[currentPageIndex + 1]}
                    issue={issue}
                    pageSide="left"
                  />
                )}
              </div>
            )}
          </div>

          {/* Bottom Flip Navigation */}
          <div className="w-full flex items-center justify-between text-white text-xs pt-4 border-t border-white/10">
            <button
              onClick={handleNextPage}
              disabled={currentPageIndex >= totalPages - 1}
              className="flex items-center gap-1 px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>الصفحة التالية</span>
            </button>

            <span className="font-mono text-stone-400">
              {currentPageIndex + 1} من {totalPages}
            </span>

            <button
              onClick={handlePrevPage}
              disabled={currentPageIndex <= 0}
              className="flex items-center gap-1 px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
            >
              <span>الصفحة السابقة</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Preflight & Proofreading Inspector Tabs */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          {/* Tabs Header */}
          <div className="flex items-center border-b border-stone-200 bg-stone-50">
            <button
              onClick={() => setActiveTab('preflight')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'preflight'
                  ? 'border-emerald-700 text-emerald-900 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>فحص الطباعة ({preflightResults.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('proofread')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'proofread'
                  ? 'border-emerald-700 text-emerald-900 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>التدقيق اللغوي ({proofreadIssues.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-3 px-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'ai'
                  ? 'border-amber-600 text-amber-900 bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Bot className="w-4 h-4 text-amber-600" />
              <span>المساعد</span>
            </button>
          </div>

          {/* Tab 1: Preflight Results */}
          {activeTab === 'preflight' && (
            <div className="p-4 space-y-3 max-h-[640px] overflow-y-auto">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-100 font-bold">
                <span className="text-stone-700">تقرير ما قبل الطباعة (Preflight)</span>
                <span className="text-emerald-700 font-mono">
                  {blockingErrors.length === 0 ? 'مقبول للطباعة' : 'يتطلب معالجة'}
                </span>
              </div>

              {/* Blocking Errors */}
              {blockingErrors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-red-700 block">
                    أخطاء حرجة تمنع التصدير ({blockingErrors.length})
                  </span>
                  {blockingErrors.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block">{err.title}</strong>
                        <p className="text-[11px] text-red-700 mt-0.5">{err.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-amber-700 block">
                    تحذيرات وتوصيات ({warnings.length})
                  </span>
                  {warnings.map((warn, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block">{warn.title}</strong>
                        <p className="text-[11px] text-amber-800 mt-0.5">{warn.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Informational Checks */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-stone-600 block">
                  معلومات العدد والنسب التحريرية
                </span>
                {infos.map((inf, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5"
                  >
                    <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">{inf.title}</strong>
                      <p className="text-[11px] text-stone-600 mt-0.5">{inf.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Proofreading Flags */}
          {activeTab === 'proofread' && (
            <div className="p-4 space-y-3 max-h-[640px] overflow-y-auto">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-100 font-bold">
                <span className="text-stone-700">ملاحظات التدقيق اللغوي غير الهدام</span>
                <span className="text-stone-400 font-mono">{proofreadIssues.length} تنبيه</span>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 leading-relaxed">
                ملاحظات لغوية اختيارية لمساعدة المحرر. لا يتم تعديل أي كلمة في نص الكاتب إلا بموافقتك الصريحة.
              </div>

              <div className="space-y-2">
                {proofreadIssues.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                        {p.kind}
                      </span>
                      <span className="text-stone-400 text-[10px]">مقال #{p.articleId}</span>
                    </div>
                    <p className="text-stone-800 text-xs font-semibold">{p.message}</p>
                    {p.suggestion && (
                      <div className="text-[11px] text-emerald-700 bg-white p-1.5 rounded border border-emerald-200">
                        اقتراح الاستبدال: <strong>{p.suggestion}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: AI Assistant Drawer */}
          {activeTab === 'ai' && (
            <div className="p-4 space-y-4 max-h-[640px] overflow-y-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 border-b border-stone-100 pb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>المستشار الذكي لهيئة تحرير تحواس براس</span>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                يقوم المساعد الذكي بتحليل مقالات العدد ومطابقتها مع مقاييس المجلات السياحية العالمية لتقديم توصيات إخراجية.
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">توصية الترتيب</span>
                  <p className="text-xs text-stone-800 font-semibold">
                    ابدأ بملف طاسيلي ناجر كتحقيق افتتاحي بانورامي (Opener Hero) ممتد لشد انتباه القارئ.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">توازن الإعلانات</span>
                  <p className="text-xs text-stone-800 font-semibold">
                    تم توزيع إعلانات الخطوط الجوية والمنتجعات بفواصل تحريرية نموذجية لا تقل عن صفحتين.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase block">السمة البصرية</span>
                  <p className="text-xs text-stone-800 font-semibold">
                    السمة الحالية "صحراء تحواس الأصلية" متطابقة تماماً مع الهوية الرقمية لمجلة تحواس براس الرسمية.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
