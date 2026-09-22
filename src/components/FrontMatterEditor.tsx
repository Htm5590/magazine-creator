import React, { useRef } from 'react';
import { Issue, FrontMatter } from '../types';
import {
  FileText,
  User,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface FrontMatterEditorProps {
  issue: Issue;
  onChange: (updated: Partial<Issue>) => void;
  variant?: 'card' | 'modal';
  onClose?: () => void;
}

const EDITOR_PHOTO_PRESETS = [
  {
    name: 'بورتريه صحفي رسمي',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'بورتريه كاتب وإعلامي',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'بورتريه صحفية واستكشاف',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'بورتريه مؤسس ومحرر',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
];

export const FrontMatterEditor: React.FC<FrontMatterEditorProps> = ({
  issue,
  onChange,
  variant = 'card',
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontMatter = issue.frontMatter;

  const updateFrontMatter = (updated: Partial<FrontMatter>) => {
    onChange({
      frontMatter: {
        ...frontMatter,
        ...updated,
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateFrontMatter({
          editorPhotoUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMastheadRole = () => {
    const newRoles = [
      ...frontMatter.mastheadRoles,
      { role: 'محرر صحفي', name: 'اسم الصحفي' },
    ];
    updateFrontMatter({ mastheadRoles: newRoles });
  };

  const handleRemoveMastheadRole = (index: number) => {
    const newRoles = frontMatter.mastheadRoles.filter((_, i) => i !== index);
    updateFrontMatter({ mastheadRoles: newRoles });
  };

  const handleUpdateMastheadRole = (index: number, key: 'role' | 'name', value: string) => {
    const newRoles = [...frontMatter.mastheadRoles];
    newRoles[index] = { ...newRoles[index], [key]: value };
    updateFrontMatter({ mastheadRoles: newRoles });
  };

  const content = (
    <div className="space-y-6 text-right font-cairo">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 font-cairo">
              كلمة رئيس التحرير والفهرس (Éditorial & Ours)
            </h2>
            <p className="text-xs text-stone-500">
              تحرير افتتاحية العدد، اسم رئيس التحرير، صورته الشخصية، وفريق هيئة التحرير.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
            <input
              type="checkbox"
              checked={frontMatter.showEditorNote}
              onChange={(e) => updateFrontMatter({ showEditorNote: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span>تضمين كلمة رئيس التحرير بالعدد</span>
          </label>
        </div>
      </div>

      {/* Editor Identity & Portrait Photo Upload */}
      <div className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
          <User className="w-4 h-4 text-emerald-700" />
          <span>بيانات وصورة رئيس التحرير</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Portrait Photo & Upload */}
          <div className="md:col-span-4 flex flex-col items-center text-center space-y-3">
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-stone-200 border-2 border-stone-300 shadow-sm flex items-center justify-center group">
              {frontMatter.editorPhotoUrl ? (
                <img
                  src={frontMatter.editorPhotoUrl}
                  alt={frontMatter.editorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-stone-400" />
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="w-full space-y-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع صورة من جهازك 📷</span>
              </button>

              <div className="text-[10px] text-stone-500 font-mono">
                يدعم صيغ JPG, PNG, WebP
              </div>
            </div>

            {/* Quick Presets */}
            <div className="w-full pt-2 border-t border-stone-200/80">
              <span className="text-[10.5px] font-bold text-stone-600 block mb-1">
                أو اختر صورة بورتريه صحفي:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {EDITOR_PHOTO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    title={preset.name}
                    onClick={() => updateFrontMatter({ editorPhotoUrl: preset.url })}
                    className="w-full aspect-square rounded-lg overflow-hidden border border-stone-200 hover:border-emerald-600 transition-colors cursor-pointer"
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor Info Fields */}
          <div className="md:col-span-8 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم رئيس التحرير
                </label>
                <input
                  type="text"
                  value={frontMatter.editorName}
                  onChange={(e) => updateFrontMatter({ editorName: e.target.value })}
                  placeholder="أحمد بلقاسم"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold focus:outline-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  الصفة / المنصب التحريري
                </label>
                <input
                  type="text"
                  value={frontMatter.editorRole}
                  onChange={(e) => updateFrontMatter({ editorRole: e.target.value })}
                  placeholder="رئيس تحرير مجلة تحواس براس"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                عنوان كلمة رئيس التحرير (Headline)
              </label>
              <input
                type="text"
                value={frontMatter.editorNoteTitle}
                onChange={(e) => updateFrontMatter({ editorNoteTitle: e.target.value })}
                placeholder="كلمة رئيس التحرير: الجزائر.. قارة بكر تأسر القلوب"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-black focus:outline-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                رابط الصورة الشخصية المباشر (URL اختياري)
              </label>
              <input
                type="text"
                value={frontMatter.editorPhotoUrl || ''}
                onChange={(e) => updateFrontMatter({ editorPhotoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editor Note Body (Full Text Editor) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>نص كلمة رئيس التحرير الكامل (محرر نصي مفتوح لكتابة وتغيير أي محتوى)</span>
          </label>
          <span className="text-[11px] text-stone-500 font-mono">
            {frontMatter.editorNoteBody.split(/\s+/).filter(Boolean).length} كلمة
          </span>
        </div>

        <textarea
          rows={9}
          value={frontMatter.editorNoteBody}
          onChange={(e) => updateFrontMatter({ editorNoteBody: e.target.value })}
          placeholder="اكتب كلمة رئيس التحرير وافتتاحية العدد هنا... يمكنك كتابة فقرات متعددة وتفاصيل الترحيب بالقراء وشعار العدد."
          className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-sm font-cairo leading-relaxed focus:outline-emerald-700 shadow-2xs"
        />
        <p className="text-[11px] text-stone-500">
          * تلميح: سيتم تنسيق الفقرة الأولى تلقائياً مع حرف استهلالي مكبّر (Drop Cap) فاخر في الصفحة المطبوعة.
        </p>
      </div>

      {/* Masthead Editorial Board (Ours de presse) */}
      <div className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>هيئة التحرير وفريق النشر (Ours de presse)</span>
          </div>

          <button
            type="button"
            onClick={handleAddMastheadRole}
            className="text-xs text-emerald-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة عضو جديد</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {frontMatter.mastheadRoles.map((role, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center gap-2 text-xs"
            >
              <input
                type="text"
                value={role.role}
                onChange={(e) => handleUpdateMastheadRole(idx, 'role', e.target.value)}
                placeholder="الصفة / الدور"
                className="w-1/3 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-700"
              />
              <input
                type="text"
                value={role.name}
                onChange={(e) => handleUpdateMastheadRole(idx, 'name', e.target.value)}
                placeholder="الاسم الكامل"
                className="flex-1 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-900"
              />
              <button
                type="button"
                onClick={() => handleRemoveMastheadRole(idx)}
                className="text-stone-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                title="حذف"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col justify-between">
          <div className="overflow-y-auto pr-1 flex-1">
            {content}
          </div>
          <div className="pt-4 border-t border-stone-200 mt-4 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              سيتم حفظ وتحديث صفحة كلمة رئيس التحرير فوراً في كل أنحاء المجلة
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              تم وحفظ التعديلات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
      {content}
    </div>
  );
};
