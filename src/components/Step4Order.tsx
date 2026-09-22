import React, { useState } from 'react';
import { Issue, SequenceItem, ShuffleRules, Ad } from '../types';
import {
  suggestEditorialOrder,
  shuffleWithRules,
  validateSequence,
  recalculatePageNumbers,
} from '../utils/shuffleSolver';
import {
  Sparkles,
  Shuffle,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Layers,
  Wrench,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  SlidersHorizontal,
  FileText,
  Eye,
  Megaphone,
  Ban,
  Edit3,
} from 'lucide-react';
import { FrontMatterEditor } from './FrontMatterEditor';

interface Step4OrderProps {
  issue: Issue;
  onUpdateSequence: (seq: SequenceItem[], seed?: number) => void;
  onUpdateIssue?: (patch: Partial<Issue>) => void;
  onNext: () => void;
}

export const Step4Order: React.FC<Step4OrderProps> = ({
  issue,
  onUpdateSequence,
  onUpdateIssue,
  onNext,
}) => {
  const [insertModalOpen, setInsertModalOpen] = useState(false);
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);
  const [selectedAdForInsert, setSelectedAdForInsert] = useState<string>('');
  const [showFrontMatterModal, setShowFrontMatterModal] = useState(false);

  const rules: ShuffleRules = {
    minEditorialBetweenAds: 2,
    allowAdjacentAds: false,
    respectPositions: true,
    ensureEvenPages: true,
  };

  const adsEnabled = issue.includeAdsInIssue !== false;
  const sequence = recalculatePageNumbers(issue.sequence);
  const violations = validateSequence(sequence, rules);

  const handleSuggestOrder = () => {
    const suggested = suggestEditorialOrder(issue);
    onUpdateSequence(suggested);
  };

  const handleShuffle = () => {
    const nextSeed = issue.shuffleSeed ? issue.shuffleSeed + 13 : Math.floor(Math.random() * 1000000);
    const { sequence: shuffled, seed } = shuffleWithRules(sequence, rules, nextSeed);
    onUpdateSequence(shuffled, seed);
  };

  const handleTogglePin = (id: string) => {
    const updated = sequence.map((it) => {
      if (it.id === id) {
        return { ...it, pinned: !it.pinned };
      }
      return it;
    });
    onUpdateSequence(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 1 || targetIndex >= sequence.length - 1) return; // Keep cover and back cover fixed

    const newSeq = [...sequence];
    [newSeq[index], newSeq[targetIndex]] = [newSeq[targetIndex], newSeq[index]];
    onUpdateSequence(recalculatePageNumbers(newSeq));
  };

  const handleAutoRepair = () => {
    const repaired = suggestEditorialOrder(issue);
    onUpdateSequence(repaired);
  };

  // Toggle master ads setting (Ad-free vs Ads enabled)
  const handleToggleAdsMaster = (enabled: boolean) => {
    if (!enabled) {
      // Filter out all ad pages
      const adFreeSeq = sequence.filter(
        (item) => item.itemType !== 'ad' && item.itemType !== 'composite-ad'
      );
      const recalculated = recalculatePageNumbers(adFreeSeq);
      if (onUpdateIssue) {
        onUpdateIssue({
          includeAdsInIssue: false,
          sequence: recalculated,
          cover: { ...issue.cover, backCoverType: 'closing-page' },
        });
      } else {
        onUpdateSequence(recalculated);
      }
    } else {
      // Re-enable ads using editorial suggestion
      const restored = suggestEditorialOrder({ ...issue, includeAdsInIssue: true });
      if (onUpdateIssue) {
        onUpdateIssue({
          includeAdsInIssue: true,
          sequence: restored,
          cover: { ...issue.cover, backCoverType: 'ad' },
        });
      } else {
        onUpdateSequence(restored);
      }
    }
  };

  // Change which ad is displayed on a specific ad page
  const handleChangeAdOnPage = (sequenceItemId: string, value: string) => {
    const newSeq = sequence.map((item) => {
      if (item.id !== sequenceItemId) return item;

      if (value === 'composite-ont-aurassi') {
        return {
          ...item,
          itemType: 'composite-ad' as const,
          refId: 'comp-ont-aurassi',
          title: 'صفحة إعلانات مدمجة: الديوان الوطني وفندق الأوراسي',
          subItems: [
            { adId: 'ad-ont', format: 'half-h' as const },
            { adId: 'ad-hotel-aurassi', format: 'half-h' as const },
          ],
        };
      }

      if (value === 'composite-tahwas-handicraft') {
        return {
          ...item,
          itemType: 'composite-ad' as const,
          refId: 'comp-travel-craft',
          title: 'صفحة إعلانات مدمجة: وكالة أسفار تحواس والصناعات التقليدية',
          subItems: [
            { adId: 'ad-tahwas-travel', format: 'quarter' as const },
            { adId: 'ad-handicraft-store', format: 'quarter' as const },
          ],
        };
      }

      const selectedAd = issue.ads.find((a) => a.id === value);
      return {
        ...item,
        itemType: 'ad' as const,
        refId: value,
        title: selectedAd ? `إعلان: ${selectedAd.advertiser}` : item.title,
        subItems: undefined,
      };
    });

    onUpdateSequence(recalculatePageNumbers(newSeq));
  };

  // Delete an ad page from the sequence
  const handleDeleteAdPage = (sequenceItemId: string) => {
    const newSeq = sequence.filter((item) => item.id !== sequenceItemId);
    onUpdateSequence(recalculatePageNumbers(newSeq));
  };

  // Insert a new ad page after a specific index
  const handleInsertAdPage = () => {
    if (insertAfterIndex === null) return;

    let newItem: SequenceItem;
    if (selectedAdForInsert === 'composite-ont-aurassi') {
      newItem = {
        id: `seq-comp-${Date.now()}`,
        itemType: 'composite-ad',
        refId: 'comp-ont-aurassi',
        title: 'صفحة إعلانات مدمجة: الديوان الوطني وفندق الأوراسي',
        pageCount: 1,
        subItems: [
          { adId: 'ad-ont', format: 'half-h' },
          { adId: 'ad-hotel-aurassi', format: 'half-h' },
        ],
      };
    } else {
      const ad = issue.ads.find((a) => a.id === selectedAdForInsert) || issue.ads[0];
      newItem = {
        id: `seq-ad-${Date.now()}`,
        itemType: 'ad',
        refId: ad?.id || 'ad-custom',
        title: ad ? `إعلان: ${ad.advertiser}` : 'صفحة إعلانية جديدة',
        pageCount: 1,
      };
    }

    const newSeq = [...sequence];
    newSeq.splice(insertAfterIndex + 1, 0, newItem);
    onUpdateSequence(recalculatePageNumbers(newSeq));

    setInsertModalOpen(false);
    setInsertAfterIndex(null);
  };

  const totalPages = sequence.reduce((sum, s) => sum + s.pageCount, 0);
  const adPagesCount = sequence.filter(
    (s) => s.itemType === 'ad' || s.itemType === 'composite-ad'
  ).length;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Step Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2">
            الخطوة 4 من 7: ضبط مواضع الإعلانات وترتيب الصفحات
          </span>
          <h1 className="text-2xl font-black text-stone-900 font-cairo">
            ترتيب صفحات العدد ومواضع الإعلانات ({totalPages} صفحة إجمالية)
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            حدد بدقة موضع كل إعلان على أرقام الصفحات، عيّن الإعلانات المدمجة أو الفردية، أو انشر العدد كإصدار تحريري خالص بدون أي إعلانات.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSuggestOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="اقتراح ترتيب تلقائي متوازن"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-600" />
            <span>الترتيب النموذجي</span>
          </button>

          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>خلط ذكي مع القواعد</span>
          </button>

          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <span>المتابعة للغلاف</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* MASTER ADS TOGGLE CARD */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              adsEnabled ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-stone-100 text-stone-500'
            }`}
          >
            {adsEnabled ? <Megaphone className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900 font-cairo text-sm">
                تضمين الإعلانات التجارية في هذا العدد
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  adsEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {adsEnabled ? `مفعل (${adPagesCount} صفحات إعلانية)` : 'معطل (إصدار تحريري خالص)'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {adsEnabled
                ? 'يحتوي هذا العدد على مساحات إشهارية للمؤسسات الشريكة موزعة بين المقالات والغلافين الداخلي والخلفي.'
                : 'تم استبعاد جميع الصفحات الإعلانية، وسيتم تصدير المجلة كعدد تحريري خالص بدون أي محتوى إعلاني.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => handleToggleAdsMaster(!adsEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              adsEnabled
                ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {adsEnabled ? (
              <>
                <Ban className="w-3.5 h-3.5" />
                <span>إزالة كل الإعلانات (عدد تحريري)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تفعيل ونشر الإعلانات في العدد</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* QUICK DISTRIBUTION MAP */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-300">
          <span className="font-bold flex items-center gap-1.5 font-cairo">
            <Layers className="w-4 h-4 text-emerald-400" />
            خريطة توزيع صفحات العدد (تخطيط مسطح A4)
          </span>
          <span className="font-mono text-[11px] text-stone-400">
            {totalPages} صفحة • {adPagesCount} صفحة إعلانية
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5 pt-1">
          {sequence.map((item) => {
            const isAd = item.itemType === 'ad' || item.itemType === 'composite-ad';
            const isCover = item.itemType === 'cover' || item.itemType === 'backCover';

            return (
              <div
                key={item.id}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isCover
                    ? 'bg-stone-800 border-stone-700 text-white'
                    : isAd
                    ? 'bg-amber-950/70 border-amber-500/60 text-amber-200'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
                }`}
                title={`ص ${item.startPage}: ${item.title}`}
              >
                <span className="block text-[10px] font-mono font-bold">ص {item.startPage}</span>
                <span className="block text-[9px] truncate mt-0.5 opacity-80">
                  {isCover ? 'غلاف' : isAd ? 'إعلان' : 'مقال'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Violations / Constraint Warnings Alert */}
      {violations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                تنبيهات توافق الترتيب والسبريد ({violations.length})
              </h4>
              <ul className="text-xs text-amber-800 mt-1 space-y-0.5 list-disc list-inside">
                {violations.map((v, idx) => (
                  <li key={idx}>{v.message.ar}</li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={handleAutoRepair}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-2xs flex-shrink-0 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>إصلاح تلقائي للترتيب</span>
          </button>
        </div>
      )}

      {/* Sequence List with Precision Controls */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span className="text-base font-cairo">تسلسل وتفاصيل كل صفحة في العدد</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              مقال تحريري
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
              إعلان تجاري
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-700 inline-block" />
              غلاف / مقدمة
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {sequence.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === sequence.length - 1;
            const isCover = item.itemType === 'cover';
            const isBackCover = item.itemType === 'backCover';
            const isAd = item.itemType === 'ad' || item.itemType === 'composite-ad';
            const isFixed = isCover || isBackCover;

            const badgeColor = isCover || isBackCover
              ? 'bg-stone-800 text-white'
              : isAd
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-emerald-50 text-emerald-900 border border-emerald-200';

            return (
              <div key={item.id} className="space-y-1">
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    item.pinned
                      ? 'bg-stone-50/90 border-stone-300 shadow-xs'
                      : isAd
                      ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {/* Page Number & Type Tag */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-16 text-center flex-shrink-0">
                        <span className="block text-xs font-mono font-bold text-stone-900 bg-stone-100 px-2 py-1 rounded border border-stone-200">
                          ص {item.startPage}
                          {item.pageCount > 1 ? `-${(item.startPage || 1) + item.pageCount - 1}` : ''}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
                          {item.pageCount === 1 ? 'صفحة واحدة' : `${item.pageCount} صفحات`}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${badgeColor}`}>
                            {item.itemType === 'cover'
                              ? 'الغلاف الأمامي'
                              : item.itemType === 'backCover'
                              ? 'الغلاف الخلفي'
                              : item.itemType === 'frontMatter'
                              ? 'الفهرس والافتتاحية'
                              : item.itemType === 'composite-ad'
                              ? 'إعلان مدمج (نصفين)'
                              : isAd
                              ? 'إعلان تجاري كامل'
                              : 'مقال سياحي'}
                          </span>
                          {item.startPage && item.startPage % 2 === 0 ? (
                            <span className="text-[10px] text-stone-400 bg-stone-100 px-1 rounded">صفحة زوجية (يسار)</span>
                          ) : (
                            <span className="text-[10px] text-stone-400 bg-stone-100 px-1 rounded">صفحة فردية (يمين)</span>
                          )}
                          {item.pinned && (
                            <span className="text-[10px] text-amber-700 bg-amber-100 px-1 rounded flex items-center gap-1 font-bold">
                              <Lock className="w-2.5 h-2.5" />
                              موضع مثبت
                            </span>
                          )}
                        </div>

                        {/* Title or Ad Assignment Selector */}
                        {isAd ? (
                          <div className="space-y-2 mt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <label className="text-xs font-bold text-stone-700 font-cairo flex-shrink-0">
                                الإعلان المعروض في صفحة {item.startPage}:
                              </label>
                              <select
                                value={
                                  item.itemType === 'composite-ad'
                                    ? 'composite-ont-aurassi'
                                    : item.refId
                                }
                                onChange={(e) => handleChangeAdOnPage(item.id, e.target.value)}
                                className="bg-white border border-amber-300 text-stone-900 rounded-lg px-2.5 py-1 text-xs font-bold focus:ring-1 focus:ring-amber-500 max-w-md"
                              >
                                <optgroup label="إعلانات مدمجة مركبة (نصفين)">
                                  <option value="composite-ont-aurassi">
                                    [صفحة مدمجة] الديوان الوطني للسياحة + فندق الأوراسي (نصفين)
                                  </option>
                                  <option value="composite-tahwas-handicraft">
                                    [صفحة مدمجة] وكالة أسفار تحواس + دار الصناعات التقليدية
                                  </option>
                                </optgroup>
                                <optgroup label="إعلانات مفردة كاملة">
                                  {issue.ads.map((ad) => (
                                    <option key={ad.id} value={ad.id}>
                                      {ad.advertiser} ({ad.format})
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>
                            <p className="text-[11px] text-stone-500">
                              العنوان الحالي: <span className="font-bold text-stone-800">{item.title}</span>
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-stone-900 truncate font-cairo">
                                {item.title}
                              </h4>
                              {item.itemType === 'frontMatter' && (
                                <p className="text-[11px] text-stone-500 mt-0.5">
                                  افتتاحية رئيس التحرير: <span className="font-semibold text-emerald-800">{issue.frontMatter?.editorNoteTitle || 'افتتاحية العدد'}</span>
                                </p>
                              )}
                            </div>

                            {item.itemType === 'frontMatter' && onUpdateIssue && (
                              <button
                                type="button"
                                onClick={() => setShowFrontMatterModal(true)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>تعديل كلمة رئيس التحرير والصورة ✍️</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                      {isAd && (
                        <button
                          onClick={() => handleDeleteAdPage(item.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                          title="حذف هذه الصفحة الإعلانية من العدد"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleTogglePin(item.id)}
                        disabled={isFixed}
                        title={item.pinned ? 'إلغاء التثبيت' : 'تثبيت في هذا الموضع'}
                        className={`p-1.5 rounded transition-colors ${
                          item.pinned
                            ? 'text-amber-700 bg-amber-100/70 hover:bg-amber-200'
                            : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                        } disabled:opacity-40 disabled:pointer-events-none`}
                      >
                        {item.pinned ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={isFirst || index === 1 || item.pinned}
                          className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-20 rounded hover:bg-white cursor-pointer"
                          title="تحريك الصفحة لأعلى (تقديم)"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={isLast || index === sequence.length - 2 || item.pinned}
                          className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-20 rounded hover:bg-white cursor-pointer"
                          title="تحريك الصفحة لأسفل (تأخير)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insertion helper line between pages */}
                {adsEnabled && index > 0 && index < sequence.length - 1 && (
                  <div className="flex items-center justify-center py-0.5 opacity-40 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setInsertAfterIndex(index);
                        setSelectedAdForInsert(issue.ads[0]?.id || 'composite-ont-aurassi');
                        setInsertModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-stone-500 hover:text-amber-700 flex items-center gap-1 bg-stone-50 hover:bg-amber-50 px-2.5 py-0.5 rounded-full border border-stone-200 hover:border-amber-300 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إدراج صفحة إعلانية بعد صفحة {item.startPage}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* INSERT AD MODAL */}
      {insertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <h3 className="font-black text-stone-900 text-lg font-cairo">
              إدراج صفحة إعلانية جديدة
            </h3>
            <p className="text-xs text-stone-600">
              اختر الإعلان أو الحزمة الإعلانية التي ترغب في إدراجها بعد الصفحة المحددة.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">الإعلان المطلوب إدراجه:</label>
              <select
                value={selectedAdForInsert}
                onChange={(e) => setSelectedAdForInsert(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 font-bold"
              >
                <option value="composite-ont-aurassi">
                  [صفحة مدمجة] الديوان الوطني للسياحة + فندق الأوراسي (نصفين)
                </option>
                {issue.ads.map((ad) => (
                  <option key={ad.id} value={ad.id}>
                    {ad.advertiser} ({ad.format})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setInsertModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleInsertAdPage}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
              >
                إدراج في التسلسل
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Front Matter (Editor's Letter & Masthead) Modal */}
      {showFrontMatterModal && issue.frontMatter && onUpdateIssue && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-cairo">
                  محرر الافتتاحية وكلمة رئيس التحرير والفهرس
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  قم بتعديل العنوان، النص، صورة الكاتب، وهيئة التحرير (الصفحة رقم 2)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFrontMatterModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <FrontMatterEditor
              issue={issue}
              onChange={(updated) => onUpdateIssue(updated)}
              variant="modal"
              onClose={() => setShowFrontMatterModal(false)}
            />

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowFrontMatterModal(false)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs"
              >
                حفظ وإغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
