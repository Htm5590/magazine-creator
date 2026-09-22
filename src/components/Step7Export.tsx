import React, { useState } from 'react';
import { Issue } from '../types';
import { downloadArabicMagazinePdf, triggerPrintToPdf } from '../utils/pdfExport';
import {
  FileDown,
  Printer,
  FileCheck,
  CheckCircle2,
  HardDrive,
  Upload,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface Step7ExportProps {
  issue: Issue;
  onImportIssue: (imported: Issue) => void;
  onSaveSnapshot: (label: string) => void;
  snapshots: { id: string; timestamp: string; label: string; issue: Issue }[];
  onRestoreSnapshot: (issue: Issue) => void;
}

export const Step7Export: React.FC<Step7ExportProps> = ({
  issue,
  onImportIssue,
  onSaveSnapshot,
  snapshots,
  onRestoreSnapshot,
}) => {
  const [resolution, setResolution] = useState<'web' | 'high'>('high');
  const [includeBleed, setIncludeBleed] = useState(false);
  const [includeCropMarks, setIncludeCropMarks] = useState(false);
  const [includeColorBars, setIncludeColorBars] = useState(false);
  const [includeHyperlinks, setIncludeHyperlinks] = useState(true);
  const [includeBookmarks, setIncludeBookmarks] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [snapshotLabel, setSnapshotLabel] = useState('');

  const handleDownloadArabicPdf = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);
    setExportError(null);
    setProgressPercent(5);
    setProgressStatus('بدء تحضير المجلة السياحية باللغة العربية...');

    try {
      await downloadArabicMagazinePdf(issue, (percent, statusText) => {
        setProgressPercent(percent);
        setProgressStatus(statusText);
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 9000);
    } catch (err) {
      console.error('Error generating Arabic PDF:', err);
      const errMsg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء تصدير المجلة.';
      setExportError(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(issue, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Tahwas_Presse_Issue_${issue.number.replace(/\s+/g, '_')}_Backup.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.magazineName && parsed.articles) {
          onImportIssue(parsed);
          alert('تم استيراد حزمة العدد بنجاح!');
        } else {
          alert('الملف المحدد ليس حزمة صالحة لمجلة تحواس براس.');
        }
      } catch (err) {
        alert('فشل قراءة ملف JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Step Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2">
            الخطوة 7 من 7: مركز التصدير الطباعي والرقمي
          </span>
          <h1 className="text-2xl font-black text-stone-900 font-cairo">
            تصدير عدد مجلة تحواس براس باللغة العربية الكاملة
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            جميع الصفحات والمقالات تصدّر باللغة العربية الأصيلة والخطوط التيبوغرافية الفاخرة، مع الشعار وألوان الهوية المستوحاة.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={triggerPrintToPdf}
            title="فتح نافذة الطباعة لاختيار حفظ كـ PDF بجميع الخطوط العربية والصور الفاخرة"
            className="flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ كـ PDF للمطابع (Vector فاخر)</span>
          </button>

          <button
            onClick={handleDownloadArabicPdf}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>{isGenerating ? 'جارٍ توليد PDF العربي...' : 'تحميل مجلة PDF باللغة العربية'}</span>
          </button>
        </div>
      </div>

      {/* Professional Export Quality Guide */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-stone-200/90 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1.5 p-3.5 bg-white/80 rounded-xl border border-amber-200/70 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <Printer className="w-4 h-4 text-amber-600" />
            <span>الخيار الأول: حفظ كـ PDF فائق الدقة (المطابع والنشر الاحترافي)</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            يستخدم محرك الطباعة الشعاعي (Vector Print). نصوص عربية حادة 100% قابلة للتحديد والنسخ، ألوان مطبعية معتمدة، وتوافق تام مع مقاس A4 وجميع دور النشر والمطابع.
          </p>
        </div>

        <div className="space-y-1.5 p-3.5 bg-white/80 rounded-xl border border-emerald-200/70 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-900 font-bold">
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>الخيار الثاني: تحميل مباشر لملف PDF الرقمي</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            يتم توليد ملف PDF متعدد الصفحات مع تضمين الصور والخطوط المعتمدة وتنزيله مباشرة إلى جهازك لتسهيل المشاركة عبر البريد والواتساب ومواقع التواصل.
          </p>
        </div>
      </div>

      {/* Generation Progress Bar */}
      {isGenerating && (
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>{progressStatus || 'جارٍ معالجة صفحات المجلة...'}</span>
            </span>
            <span className="font-mono text-emerald-700">{progressPercent}%</span>
          </div>

          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-950 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="text-sm font-bold block text-emerald-900">
              تم توليد وتحميل ملف PDF باللغة العربية بنجاح!
            </strong>
            <p className="text-emerald-800 leading-relaxed">
              تم تنزيل عدد مجلة تحواس براس كاملاً باللغة العربية إلى مجلد التنزيلات بجهازك. جميع المقالات، بطاقات السفر، الفهارس، والغلاف مطابقة للشكل الأصلي 100%.
            </p>
          </div>
        </div>
      )}

      {/* Error Notification Alert */}
      {exportError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-950 shadow-xs">
          <div className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">!</div>
          <div className="text-xs space-y-1">
            <strong className="text-sm font-bold block text-rose-900">
              تعذر تصدير المجلة
            </strong>
            <p className="text-rose-800 leading-relaxed font-mono">
              {exportError}
            </p>
          </div>
        </div>
      )}

      {/* Export Options & Quality Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preset Resolution Selector */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-sm font-cairo flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-700" />
            <span>دقة التصدير وحجم الملف</span>
          </h3>

          <div className="space-y-3">
            <div
              onClick={() => setResolution('high')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                resolution === 'high'
                  ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700/20'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-stone-900">نسخة عالية الدقة للمجلات السياحية (~200+ DPI)</span>
                {resolution === 'high' && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                دقة فائقة الوضوح تبرز أدق تفاصيل صور الصحراء والمناظر الطبيعية والخطوط التيبوغرافية العربية.
              </p>
            </div>

            <div
              onClick={() => setResolution('web')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                resolution === 'web'
                  ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700/20'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-stone-900">نسخة خفيفة للهواتف والويب (~150 DPI)</span>
                {resolution === 'web' && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                حجم ملف خفيف وسريع الفتح عبر تطبيق واتساب ومواقع التواصل والموقع الإلكتروني للمجلة.
              </p>
            </div>
          </div>
        </div>

        {/* Print Marks & Interactive Metadata */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-sm font-cairo flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>خيارات المطابع والخصائص التفاعلية</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200 cursor-pointer">
              <span className="font-bold text-stone-800">تضمين هوامش التسييل الطباعي (3mm Bleed)</span>
              <input
                type="checkbox"
                checked={includeBleed}
                onChange={(e) => setIncludeBleed(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200 cursor-pointer">
              <span className="font-bold text-stone-800">إضافة علامات القص (Crop Marks)</span>
              <input
                type="checkbox"
                checked={includeCropMarks}
                onChange={(e) => setIncludeCropMarks(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200 cursor-pointer">
              <span className="font-bold text-stone-800">أشرطة معايرة الألوان ومعلومات السبيكة (Color Bars)</span>
              <input
                type="checkbox"
                checked={includeColorBars}
                onChange={(e) => setIncludeColorBars(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200 cursor-pointer">
              <span className="font-bold text-stone-800">روابط تفاعلية نشطة (Clickable URL Links & QR)</span>
              <input
                type="checkbox"
                checked={includeHyperlinks}
                onChange={(e) => setIncludeHyperlinks(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Backup, Snapshots, and Packaging */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-bold text-stone-900 text-sm font-cairo flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-700" />
            <span>حزم النسخ الاحتياطي ونقاط الاستعادة (Snapshots & Backups)</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>تصدير حزمة العدد (.json)</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>استيراد حزمة (.json)</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>

        {/* Create Snapshot */}
        <div className="flex items-center gap-3 pt-2">
          <input
            type="text"
            placeholder="اسم نقطة الاستعادة (مثلاً: قبل تغيير ألوان الهوية)..."
            value={snapshotLabel}
            onChange={(e) => setSnapshotLabel(e.target.value)}
            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
          />
          <button
            onClick={() => {
              if (snapshotLabel.trim()) {
                onSaveSnapshot(snapshotLabel.trim());
                setSnapshotLabel('');
              }
            }}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
          >
            حفظ نقطة استعادة
          </button>
        </div>

        {/* Existing Snapshots */}
        {snapshots.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-stone-600 block">نقاط الاستعادة المحفوظة:</span>
            <div className="space-y-1.5">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="flex items-center justify-between p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs"
                >
                  <div>
                    <strong className="text-stone-800 block">{snap.label}</strong>
                    <span className="text-stone-400 font-mono text-[10px]">{snap.timestamp}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من استعادة النسخة "${snap.label}"؟`)) {
                        onRestoreSnapshot(snap.issue);
                      }
                    }}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    استعادة
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
