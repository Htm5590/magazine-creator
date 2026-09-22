import React, { useState, useEffect } from 'react';
import { Ad, AdFormat, AdDesignedFields, PageDimensions } from '../types';
import { computeAdGeometry, packFractionalAds } from '../utils/adGeometry';
import QRCode from 'qrcode';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  QrCode as QrIcon,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  Phone,
  Globe,
  Tag,
  CheckCircle2,
  X,
  Check,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';

const ADVERTISER_IMAGE_PRESETS = [
  {
    name: 'موبيليس الجزائر (Mobilis 4G/5G)',
    advertiser: 'موبيليس - شريك التحول الرقمي',
    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    website: 'https://www.mobilis.dz',
    category: 'اتصالات وتكنولوجيا',
  },
  {
    name: 'الخطوط الجوية الجزائرية (Air Algérie)',
    advertiser: 'الخطوط الجوية الجزائرية',
    url: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=80',
    website: 'https://www.airalgerie.dz',
    category: 'طيران ونقل جوي',
  },
  {
    name: 'فندق الأوراسي الجزائر (El Aurassi Hotel)',
    advertiser: 'فندق الأوراسي الدولي',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    website: 'https://el-aurassi.dz',
    category: 'فندقة وضيافة راقية',
  },
  {
    name: 'مخيم طاسيلي الصحراوي (Tassili Glamping)',
    advertiser: 'مخيم طاسيلي إكسبيديشن',
    url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    website: 'https://tassiliexp.dz',
    category: 'سياحة صحراوية واستكشاف',
  },
  {
    name: 'الديوان الوطني للسياحة (ONT Algérie)',
    advertiser: 'الديوان الوطني الجزائري للسياحة',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    website: 'https://ont.dz',
    category: 'ترويج سياحي وطني',
  },
];

interface Step3AdsProps {
  ads: Ad[];
  onUpdateAds: (ads: Ad[]) => void;
  page: PageDimensions;
  includeAdsInIssue?: boolean;
  onToggleAdsMaster?: (enabled: boolean) => void;
  onNext: () => void;
}

export const Step3Ads: React.FC<Step3AdsProps> = ({
  ads,
  onUpdateAds,
  page,
  includeAdsInIssue = true,
  onToggleAdsMaster,
  onNext,
}) => {
  const [selectedAdId, setSelectedAdId] = useState<string | null>(ads[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string>('');

  const selectedAd = ads.find((a) => a.id === selectedAdId) || ads[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingAd) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditingAd({
          ...editingAd,
          sourceType: 'upload',
          artworkUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatLabels: Record<AdFormat, { name: string; tag: string }> = {
    'cover-back': { name: 'الغلاف الخلفي الخارجي', tag: 'موقع مميز أول' },
    'cover-inside-front': { name: 'الغلاف الداخلي الأمامي', tag: 'موقع مميز ثانٍ' },
    'cover-inside-back': { name: 'الغلاف الداخلي الخلفي', tag: 'موقع مميز' },
    full: { name: 'صفحة إعلانية كاملة', tag: 'كاملة 1/1' },
    spread: { name: 'سبريد إعلاني مزدوج (صفحتان)', tag: 'بانوراما 2/1' },
    'half-h': { name: 'نصف صفحة أفقي', tag: 'مدمج 1/2' },
    'half-v': { name: 'نصف صفحة عمودي', tag: 'مدمج 1/2' },
    quarter: { name: 'ربع صفحة', tag: 'مدمج 1/4' },
    strip: { name: 'شريط إعلاني سفلي/علوي', tag: 'شريط 1/3' },
  };

  useEffect(() => {
    if (editingAd?.designedFields?.website) {
      QRCode.toDataURL(editingAd.designedFields.website, { width: 120, margin: 1 })
        .then((url) => setQrPreviewUrl(url))
        .catch(() => setQrPreviewUrl(''));
    }
  }, [editingAd?.designedFields?.website]);

  const handleCreateAd = () => {
    const newAd: Ad = {
      id: `ad-${Date.now()}`,
      advertiser: 'فندق وريزورت واحة النخيل',
      format: 'half-h',
      sourceType: 'designed',
      designedFields: {
        headline: 'واحة النخيل: منتجع سياحي واستشفائي فاخر',
        body: 'استمتع بإقامة صحراوية 5 نجوم مع حمامات معدنية استشفائية، أطباق تقليدية راقية ورحلات دفع رباعي خاصة.',
        callToAction: 'احجز عطلتك الآن',
        advertiserName: 'ريزورت واحة النخيل',
        phone: '+213 29 70 00 00',
        website: 'tahwaspresse.dz',
        bgColor: '#0D5C46',
        textColor: '#FFFFFF',
        accentColor: '#F59E0B',
        categoryTag: 'سياحة واستجمام',
      },
      url: 'https://tahwaspresse.dz',
      advertorial: false,
      positionPreference: 'middle',
    };

    onUpdateAds([...ads, newAd]);
    setSelectedAdId(newAd.id);
    setEditingAd(newAd);
    setIsEditing(true);
  };

  const handleDeleteAd = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      const remaining = ads.filter((a) => a.id !== id);
      onUpdateAds(remaining);
      if (selectedAdId === id) setSelectedAdId(remaining[0]?.id || null);
    }
  };

  const handleSaveEdit = () => {
    if (!editingAd) return;
    const newAds = ads.map((a) => (a.id === editingAd.id ? editingAd : a));
    onUpdateAds(newAds);
    setIsEditing(false);
    setEditingAd(null);
  };

  // Packed composite pages
  const compositePlans = packFractionalAds(ads);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Step Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold mb-2">
            الخطوة 3 من 7: إدارة وتصميم الإعلانات
          </span>
          <h1 className="text-2xl font-black text-stone-900 font-cairo">
            إعلانات المجلة ومصمم الإعلانات المدمج ({ads.length} إعلانات)
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            صمم إعلانات المعلنين مباشرة مع كود QR تفاعلي، أو ارفع التصاميم الجاهزة بدقة ومقاسات مجلة تحواس.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateAd}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة إعلان جديد</span>
          </button>

          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <span>المتابعة للترتيب</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* MASTER ADS TOGGLE CARD */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              includeAdsInIssue ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-stone-100 text-stone-500'
            }`}
          >
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900 font-cairo text-sm">
                حالة الإعلانات التجارية في هذا العدد
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  includeAdsInIssue ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {includeAdsInIssue ? 'مفعل (نشر الإعلانات)' : 'معطل (إصدار تحريري خالص بدون إعلانات)'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {includeAdsInIssue
                ? 'الإعلانات مفعلة وستظهر في صفحات المجلة والملف النهائي المصدر.'
                : 'تم إيقاف ظهور الإعلانات في هذا العدد، مع الاحتفاظ ببياناتها في الأرشيف.'}
            </p>
          </div>
        </div>

        {onToggleAdsMaster && (
          <button
            onClick={() => onToggleAdsMaster(!includeAdsInIssue)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              includeAdsInIssue
                ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {includeAdsInIssue ? 'تعطيل الإعلانات (إصدار تحريري خالص)' : 'تفعيل الإعلانات في هذا العدد'}
          </button>
        )}
      </div>

      {/* Main Grid: Ads List & Live Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ads List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-stone-600">
            <span>قائمة إعلانات العدد</span>
            <span>{ads.length} إعلانات مسجلة</span>
          </div>

          <div className="space-y-2">
            {ads.map((ad) => {
              const isSelected = ad.id === selectedAdId;
              const formatInfo = formatLabels[ad.format] || { name: ad.format, tag: 'إعلان' };
              const geometry = computeAdGeometry(ad.format, page);

              return (
                <div
                  key={ad.id}
                  onClick={() => setSelectedAdId(ad.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-600/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                      {formatInfo.name}
                    </span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAd(JSON.parse(JSON.stringify(ad)));
                          setIsEditing(true);
                        }}
                        className="p-1 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                        title="تعديل الإعلان"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteAd(ad.id, e)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50"
                        title="حذف الإعلان"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-stone-900 text-sm font-cairo truncate">
                    {ad.advertiser}
                  </h3>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/50 text-[11px] text-stone-500">
                    <span className="font-mono text-[10px]">
                      {geometry.widthMm} × {geometry.heightMm} مم
                    </span>
                    {ad.advertorial && (
                      <span className="text-amber-800 bg-amber-100 px-1.5 rounded font-bold text-[10px]">
                        مادة إعلانية
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ad.sourceType === 'upload' || ad.artworkUrl
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {ad.sourceType === 'upload' || ad.artworkUrl ? 'صورة جاهزة من المعلن 🖼️' : 'تصميم مدمج 🎨'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fractional Ads Packing Box */}
          {compositePlans.length > 0 && (
            <div className="bg-stone-100/80 rounded-xl p-4 border border-stone-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <Layers className="w-4 h-4 text-amber-700" />
                <span>حزم الإعلانات الجزئية المدمجة (Composite Pages)</span>
              </div>
              <p className="text-stone-600 text-[11px]">
                تم تجميع {compositePlans.length} صفحة إعلانات مركبة تلقائياً من الإعلانات الأفقية والربعية لتوفير المساحة.
              </p>
              <div className="space-y-1">
                {compositePlans.map((plan, pIdx) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-stone-200 text-[11px]"
                  >
                    <span>صفحة مجمعة #{pIdx + 1} ({plan.slots.length} إعلانات)</span>
                    <span className="text-emerald-700 font-bold">مكتملة ومتناسقة</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Ad Preview & Details */}
        <div className="lg:col-span-7">
          {selectedAd ? (
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {formatLabels[selectedAd.format]?.name || selectedAd.format}
                  </span>
                  <h2 className="text-xl font-bold text-stone-900 font-cairo mt-1">
                    {selectedAd.advertiser}
                  </h2>
                  {selectedAd.url && (
                    <a
                      href={selectedAd.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{selectedAd.url}</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => {
                    setEditingAd(JSON.parse(JSON.stringify(selectedAd)));
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل بيانات الإعلان</span>
                </button>
              </div>

              {/* Ad Card Visual Preview */}
              {selectedAd.sourceType === 'upload' || selectedAd.artworkUrl ? (
                <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs relative bg-stone-950 aspect-[16/9] flex items-center justify-center group">
                  <img
                    src={selectedAd.artworkUrl}
                    className="w-full h-full object-cover"
                    alt={selectedAd.advertiser}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-5 text-white flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[11px] font-mono text-emerald-300 font-bold">
                          صورة إعلانية جاهزة مرسلة من طرف المعلن مباشرة
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-cairo">{selectedAd.advertiser}</h3>
                      {selectedAd.url && (
                        <span className="text-xs text-stone-300 font-mono mt-0.5 block">{selectedAd.url}</span>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-xs text-xs font-mono border border-white/20 font-bold">
                      {formatLabels[selectedAd.format]?.name}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                  <div
                    className="p-6 text-right relative overflow-hidden"
                    style={{
                      backgroundColor: selectedAd.designedFields?.bgColor || '#0D5C46',
                      color: selectedAd.designedFields?.textColor || '#FFFFFF',
                      backgroundImage: selectedAd.designedFields?.bgImageUrl
                        ? `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3)), url(${selectedAd.designedFields.bgImageUrl})`
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {selectedAd.designedFields?.categoryTag && (
                      <span
                        className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold mb-3"
                        style={{
                          backgroundColor: selectedAd.designedFields?.accentColor || '#F59E0B',
                          color: '#000000',
                        }}
                      >
                        {selectedAd.designedFields.categoryTag}
                      </span>
                    )}

                    <h3 className="text-lg md:text-xl font-black font-cairo leading-snug">
                      {selectedAd.designedFields?.headline || 'عنوان الإعلان البارز'}
                    </h3>

                    <p className="text-xs mt-2 leading-relaxed opacity-90 max-w-lg">
                      {selectedAd.designedFields?.body || 'نص الإعلان والعرض الخاص بالمعلن...'}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-white/20">
                      <div className="space-y-1 text-xs">
                        {selectedAd.designedFields?.phone && (
                          <div className="flex items-center gap-1.5 opacity-90">
                            <Phone className="w-3.5 h-3.5" />
                            <span dir="ltr">{selectedAd.designedFields.phone}</span>
                          </div>
                        )}
                        {selectedAd.designedFields?.website && (
                          <div className="flex items-center gap-1.5 opacity-90">
                            <Globe className="w-3.5 h-3.5" />
                            <span>{selectedAd.designedFields.website}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {selectedAd.designedFields?.callToAction && (
                          <button
                            className="px-4 py-2 rounded-lg text-xs font-bold shadow-md pointer-events-none"
                            style={{
                              backgroundColor: selectedAd.designedFields?.accentColor || '#D97706',
                              color: '#FFFFFF',
                            }}
                          >
                            {selectedAd.designedFields.callToAction}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Exact Geometry Dimensions */}
              {(() => {
                const geom = computeAdGeometry(selectedAd.format, page);
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">العرض والارتفاع</span>
                      <span className="font-bold text-stone-800 font-mono">
                        {geom.widthMm} × {geom.heightMm} مم
                      </span>
                    </div>
                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">دقة الويب (~150 DPI)</span>
                      <span className="font-bold text-stone-800 font-mono">
                        {geom.recommendedPixelsWeb.width}×{geom.recommendedPixelsWeb.height} px
                      </span>
                    </div>
                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">دقة الطباعة (~220 DPI)</span>
                      <span className="font-bold text-stone-800 font-mono">
                        {geom.recommendedPixelsHigh.width}×{geom.recommendedPixelsHigh.height} px
                      </span>
                    </div>
                    <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">الموضع المفضل</span>
                      <span className="font-bold text-stone-800">
                        {selectedAd.positionPreference === 'pinned'
                          ? `مثبت (صفحة ${selectedAd.pinnedPage || 'محددة'})`
                          : selectedAd.positionPreference || 'أي مكان'}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-stone-400 border border-stone-200">
              اختر إعلاناً لمعاينته.
            </div>
          )}
        </div>
      </div>

      {/* Ad Edit Modal */}
      {isEditing && editingAd && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span className="font-bold font-cairo text-sm">محرر ومصمم الإعلانات المدمج</span>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-right flex-1">
              {/* Type Switcher Tab */}
              <div className="flex bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingAd({ ...editingAd, sourceType: 'designed' })}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    editingAd.sourceType !== 'upload'
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>تصميم إعلاني مدمج (نصوص وألوان)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAd({ ...editingAd, sourceType: 'upload' })}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    editingAd.sourceType === 'upload'
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>صورة جاهزة مرسلة من المعلن مباشرة</span>
                </button>
              </div>

              {/* Common Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">اسم المعلن / الشريك الرسمي</label>
                  <input
                    type="text"
                    value={editingAd.advertiser}
                    onChange={(e) => setEditingAd({ ...editingAd, advertiser: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">مقاس وتنسيق الإعلان بالمجلة</label>
                  <select
                    value={editingAd.format}
                    onChange={(e) => setEditingAd({ ...editingAd, format: e.target.value as AdFormat })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  >
                    {(Object.keys(formatLabels) as AdFormat[]).map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {formatLabels[fmt].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DIRECT IMAGE AD SECTION */}
              {editingAd.sourceType === 'upload' ? (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <Upload className="w-4 h-4 text-emerald-700" />
                      <span>رفع صورة الإعلان الجاهزة من جهازك أو إدخال رابطها</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          تحميل ملف الصورة (PNG, JPG, WebP)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full text-xs text-stone-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer bg-white p-1 rounded-lg border border-stone-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          أو رابط مباشر لصورة الإعلان (URL)
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/ad-artwork.jpg"
                          value={editingAd.artworkUrl || ''}
                          onChange={(e) => setEditingAd({ ...editingAd, artworkUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Presets */}
                    <div>
                      <span className="block text-[11px] font-bold text-stone-600 mb-1.5">
                        نماذج إعلانات سريعة لشركات جزائرية ومعلنين (للتجربة المباشرة):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ADVERTISER_IMAGE_PRESETS.map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() =>
                              setEditingAd({
                                ...editingAd,
                                advertiser: preset.advertiser,
                                artworkUrl: preset.url,
                                url: preset.website,
                                designedFields: {
                                  ...(editingAd.designedFields as AdDesignedFields),
                                  website: preset.website,
                                  categoryTag: preset.category,
                                },
                              })
                            }
                            className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            + {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Artwork Preview */}
                  {editingAd.artworkUrl ? (
                    <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-900 relative aspect-[16/9] max-h-52 flex items-center justify-center">
                      <img
                        src={editingAd.artworkUrl}
                        className="w-full h-full object-cover"
                        alt="معاينة إعلان المعلن"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/75 backdrop-blur-xs p-2 text-center text-xs text-white">
                        <span>معاينة الصورة المرفوعة بنجاح للإعلان</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center text-stone-500 text-xs">
                      يرجى اختيار صورة من جهازك أو الضغط على أحد النماذج أعلاه
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      رابط الموقع الإلكتروني للمعلن (لتوليد كود QR التفاعلي)
                    </label>
                    <input
                      type="url"
                      value={editingAd.url || editingAd.designedFields?.website || ''}
                      onChange={(e) =>
                        setEditingAd({
                          ...editingAd,
                          url: e.target.value,
                          designedFields: {
                            ...(editingAd.designedFields as AdDesignedFields),
                            website: e.target.value,
                          },
                        })
                      }
                      placeholder="https://company.dz"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>
              ) : (
                /* DESIGNED AD SECTION */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">عنوان الإعلان الترويجي</label>
                    <input
                      type="text"
                      value={editingAd.designedFields?.headline || ''}
                      onChange={(e) =>
                        setEditingAd({
                          ...editingAd,
                          designedFields: {
                            ...(editingAd.designedFields as AdDesignedFields),
                            headline: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">نص العرض والوصف</label>
                    <textarea
                      rows={3}
                      value={editingAd.designedFields?.body || ''}
                      onChange={(e) =>
                        setEditingAd({
                          ...editingAd,
                          designedFields: {
                            ...(editingAd.designedFields as AdDesignedFields),
                            body: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">زر الإجراء (CTA)</label>
                      <input
                        type="text"
                        value={editingAd.designedFields?.callToAction || ''}
                        onChange={(e) =>
                          setEditingAd({
                            ...editingAd,
                            designedFields: {
                              ...(editingAd.designedFields as AdDesignedFields),
                              callToAction: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">رقم الهاتف للتواصل</label>
                      <input
                        type="text"
                        value={editingAd.designedFields?.phone || ''}
                        onChange={(e) =>
                          setEditingAd({
                            ...editingAd,
                            designedFields: {
                              ...(editingAd.designedFields as AdDesignedFields),
                              phone: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">الموقع الإلكتروني / الرابط</label>
                      <input
                        type="text"
                        value={editingAd.designedFields?.website || ''}
                        onChange={(e) =>
                          setEditingAd({
                            ...editingAd,
                            designedFields: {
                              ...(editingAd.designedFields as AdDesignedFields),
                              website: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Optional background photo for designed ads */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      صورة خلفية أو منتج ترويجي (رابط URL اختياري)
                    </label>
                    <input
                      type="url"
                      value={editingAd.designedFields?.bgImageUrl || ''}
                      onChange={(e) =>
                        setEditingAd({
                          ...editingAd,
                          designedFields: {
                            ...(editingAd.designedFields as AdDesignedFields),
                            bgImageUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                      dir="ltr"
                    />
                  </div>

                  {/* Color styling */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">لون الخلفية</label>
                      <input
                        type="color"
                        value={editingAd.designedFields?.bgColor || '#0D5C46'}
                        onChange={(e) =>
                          setEditingAd({
                            ...editingAd,
                            designedFields: {
                              ...(editingAd.designedFields as AdDesignedFields),
                              bgColor: e.target.value,
                            },
                          })
                        }
                        className="w-full h-8 rounded cursor-pointer border border-stone-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">لون الزر والتمييز</label>
                      <input
                        type="color"
                        value={editingAd.designedFields?.accentColor || '#F59E0B'}
                        onChange={(e) =>
                          setEditingAd({
                            ...editingAd,
                            designedFields: {
                              ...(editingAd.designedFields as AdDesignedFields),
                              accentColor: e.target.value,
                            },
                          })
                        }
                        className="w-full h-8 rounded cursor-pointer border border-stone-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">تصنيف الإعلان (Badge)</label>
                      <input
                        type="text"
                        value={editingAd.designedFields?.categoryTag || ''}
                        onChange={(e) =>
                          setEditingAd({
                            ...editingAd,
                            designedFields: {
                              ...(editingAd.designedFields as AdDesignedFields),
                              categoryTag: e.target.value,
                            },
                          })
                        }
                        placeholder="سياحة وفنادق"
                        className="w-full px-2 py-1 bg-white border border-stone-200 rounded text-xs mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* QR Preview & Advertorial toggle */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={editingAd.advertorial || false}
                    onChange={(e) => setEditingAd({ ...editingAd, advertorial: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>تمييز كمحتوى إعلاني ("إعلان / Publicité")</span>
                </label>

                {qrPreviewUrl && (
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <QrIcon className="w-4 h-4 text-stone-700" />
                    <span>كود QR تفاعلي جاهز للربط في ملف PDF</span>
                    <img src={qrPreviewUrl} className="w-8 h-8 rounded border border-stone-200" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between flex-shrink-0">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                حفظ الإعلان
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
