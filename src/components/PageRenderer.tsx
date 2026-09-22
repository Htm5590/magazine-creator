import React from 'react';
import { Issue, SequenceItem, normalizeArticleLayout } from '../types';
import { MagazineCover } from './MagazineCover';
import { TahwasLogo } from './TahwasLogo';
import { getEffectiveTheme } from '../data/themes';
import {
  Compass,
  MapPin,
  Calendar,
  Plane,
  Lightbulb,
  Phone,
  Globe,
  Quote,
  FileText,
  Camera,
  QrCode,
} from 'lucide-react';

interface PageRendererProps {
  pageNumber: number;
  item: SequenceItem;
  issue: Issue;
  pageSide?: 'left' | 'right';
  scale?: number;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  pageNumber,
  item,
  issue,
  pageSide,
  scale = 1,
}) => {
  const theme = getEffectiveTheme(issue);
  const isCover = item.itemType === 'cover';
  const isBackCover = item.itemType === 'backCover';
  const isAd = item.itemType === 'ad' || item.itemType === 'composite-ad';
  const isEven = pageNumber % 2 === 0;

  // Find linked article or ad
  const article = issue.articles.find((a) => a.id === item.refId);
  const ad = issue.ads.find((a) => a.id === item.refId);

  const primaryColor = issue.brandColors?.primary || theme.accentInk || '#0D5C46';
  const secondaryColor = issue.brandColors?.secondary || theme.accent || '#D97706';

  return (
    <div
      className="magazine-page bg-white relative overflow-hidden select-none border border-stone-200/90 shadow-lg text-stone-900 font-cairo flex flex-col justify-between"
      style={{
        width: '210mm',
        height: '297mm',
        minHeight: '297mm',
        maxHeight: '297mm',
        padding: isCover || isBackCover || isAd ? '0' : '13mm 14mm 13mm 14mm',
        backgroundColor: theme.paper || '#FAF8F5',
        color: theme.ink || '#1A211D',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        boxSizing: 'border-box',
      }}
    >
      {/* ---------------------------------------------------- */}
      {/* 1. TOURISM MAGAZINE COVER PAGE                       */}
      {/* ---------------------------------------------------- */}
      {isCover && <MagazineCover issue={issue} variant="page" />}

      {/* ---------------------------------------------------- */}
      {/* 2. TABLE OF CONTENTS & EDITORIAL NOTE (FRONT MATTER) */}
      {/* ---------------------------------------------------- */}
      {item.itemType === 'frontMatter' && (
        <div className="w-full h-full flex flex-col justify-between">
          {/* Running Head with Custom Logo */}
          <div
            className="flex items-center justify-between border-b pb-2 text-xs"
            style={{ borderColor: theme.ruleColor }}
          >
            <div className="flex items-center gap-2">
              <TahwasLogo
                size="sm"
                customLogoUrl={issue.logoUrl}
                customColors={{ primary: primaryColor, secondary: secondaryColor }}
                magazineName={issue.magazineName}
                showTagline={false}
              />
              <span className="text-stone-400 font-mono">| مجلة السياحة الجزائرية</span>
            </div>
            <span className="font-bold text-stone-700 font-cairo text-[11px]">
              فهرس المحتويات والافتتاحية • SOMMAIRE & ÉDITO
            </span>
          </div>

          {/* Main Front Matter Layout */}
          <div className="grid grid-cols-12 gap-6 my-auto">
            {/* Table of Contents Column (Sommaire) */}
            <div className="col-span-5 space-y-3.5">
              <div>
                <span className="text-[11px] font-bold block text-stone-500">
                  دليل الاستكشاف والتحقيقات
                </span>
                <h2 className="text-2xl font-black text-stone-950 font-cairo leading-none mt-1">
                  المحتويات
                </h2>
              </div>

              {/* Curated Editorial Articles List */}
              <div className="space-y-2.5 pt-1">
                {issue.sequence
                  .filter((seq) => seq.itemType === 'article')
                  .map((seq) => {
                    const linkedArt = issue.articles.find((a) => a.id === seq.refId);
                    const formattedPage = String(seq.startPage || 1).padStart(2, '0');

                    return (
                      <div
                        key={seq.id}
                        className="p-2.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:border-stone-400 hover:bg-stone-50/50 transition-all flex items-center justify-between gap-2.5"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <span className="text-[9.5px] font-bold block text-stone-500">
                            {linkedArt?.category ? `${linkedArt.category} • ${linkedArt.kicker}` : (linkedArt?.kicker || 'استكشاف سياحي')}
                          </span>
                          <strong className="block text-stone-950 font-bold text-xs leading-snug">
                            {linkedArt?.title || seq.title}
                          </strong>
                        </div>

                        <div className="px-2 py-1 rounded font-mono font-bold text-stone-800 text-xs flex-shrink-0 bg-stone-100 border border-stone-200/80">
                          ص {formattedPage}
                        </div>
                      </div>
                    );
                  })}

                {/* Additional Issue Key Features */}
                <div className="pt-2 border-t border-stone-200/80 space-y-1.5 text-[11px] text-stone-600">
                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <span className="font-medium">الغلاف الرئيسي: {issue.cover.headline.slice(0, 30)}...</span>
                    <span className="font-mono font-bold text-stone-800">ص 01</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <span className="font-medium">كلمة رئيس التحرير والفريق الصحفي</span>
                    <span className="font-mono font-bold text-stone-800">ص 02</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-medium">الغلاف الخلفي والشركاء الرسميون</span>
                    <span className="font-mono font-bold text-stone-800">ص {issue.sequence.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor's Note Column (Éditorial & Ours de presse) */}
            <div className="col-span-7 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3 flex flex-col justify-between">
              {/* Header with Editor Portrait */}
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                {issue.frontMatter.editorPhotoUrl ? (
                  <img
                    src={issue.frontMatter.editorPhotoUrl}
                    alt={issue.frontMatter.editorName}
                    className="w-13 h-13 rounded-full object-cover border border-stone-200 shadow-xs flex-shrink-0"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 font-bold text-xs flex-shrink-0">
                    {issue.frontMatter.editorName?.charAt(0) || 'م'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-stone-950 font-cairo leading-snug">
                    {issue.frontMatter.editorNoteTitle || 'كلمة رئيس التحرير'}
                  </h3>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    بقلم: {issue.frontMatter.editorName} ({issue.frontMatter.editorRole})
                  </span>
                </div>
              </div>

              {/* Editor Letter Body with Drop Cap - Dynamically rendered from state */}
              <div className="text-xs text-stone-700 leading-relaxed font-cairo text-justify space-y-2">
                {(() => {
                  const rawBody = issue.frontMatter.editorNoteBody || '';
                  const paras = rawBody.split('\n\n').map((p) => p.trim()).filter(Boolean);
                  if (paras.length === 0) {
                    return <p className="text-stone-500 italic">أدخل كلمة رئيس التحرير في محرر المجلة.</p>;
                  }
                  const firstP = paras[0];
                  const firstChar = firstP.charAt(0);
                  const restFirst = firstP.slice(1);
                  const otherParas = paras.slice(1, 3); // Fit neatly in editorial page

                  return (
                    <>
                      <p>
                        <span className="float-right text-3xl font-black pl-2 pr-1 leading-none text-stone-900">
                          {firstChar}
                        </span>
                        {restFirst}
                      </p>
                      {otherParas.map((para, pIdx) => (
                        <p key={pIdx}>{para}</p>
                      ))}
                    </>
                  );
                })()}
              </div>

              {/* Editor Signature & Slogan Stamp */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-stone-900 block">{issue.frontMatter.editorName}</span>
                  <span className="text-[10px] text-stone-400">{issue.frontMatter.editorRole}</span>
                </div>
                <div className="px-3 py-1 rounded-lg border border-stone-200 bg-stone-50 text-center text-xs font-bold text-emerald-800">
                  حوس بلادك ! 🇩🇿
                </div>
              </div>

              {/* Official Masthead Credits (Ours de presse) */}
              <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-[10px] text-stone-500 font-mono">
                {issue.frontMatter.mastheadRoles.slice(0, 4).map((role, rIdx) => (
                  <div key={rIdx}>
                    <span className="text-stone-400 block">{role.role}:</span>
                    <span className="font-bold text-stone-800">{role.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Folio */}
          <div className="flex items-center justify-between border-t border-stone-200 pt-2 text-xs text-stone-400 font-mono">
            <span>صفحة {pageNumber}</span>
            <span>مجلة تحواس براس • {issue.number}</span>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. AUTHENTIC TOURISM ARTICLE PAGES                   */}
      {/* ---------------------------------------------------- */}
      {item.itemType === 'article' && article && (() => {
        const attachedAd = item.attachedAdId
          ? issue.ads.find((a) => a.id === item.attachedAdId)
          : undefined;

        if (attachedAd) {
          // Dual Layout: Editorial Story (Top 60%) + Half-Page Partner Ad (Bottom 40%)
          return (
            <div className="w-full h-full flex flex-col justify-between overflow-hidden">
              {/* Running Head with Custom Logo */}
              <div
                className="flex items-center justify-between border-b pb-1.5 text-xs flex-shrink-0"
                style={{ borderColor: theme.ruleColor }}
              >
                <div className="flex items-center gap-2">
                  <TahwasLogo
                    size="sm"
                    customLogoUrl={issue.logoUrl}
                    customColors={{ primary: primaryColor, secondary: secondaryColor }}
                    magazineName={issue.magazineName}
                    showTagline={false}
                  />
                  <span className="text-stone-400 font-mono">| استكشاف الجزائر</span>
                </div>
                <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-700 border border-stone-200/60">
                  {article.category || article.kicker}
                </span>
              </div>

              {/* Top Editorial Story Section */}
              <div className="my-auto space-y-2.5">
                <div className="space-y-0.5">
                  <h2 className="text-xl lg:text-2xl font-black text-stone-950 font-cairo leading-snug">
                    {article.title}
                  </h2>
                  {article.subtitle && (
                    <p className="text-[11.5px] text-stone-600 font-medium leading-relaxed line-clamp-2">
                      {article.subtitle}
                    </p>
                  )}
                  {article.byline && (
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 pt-0.5">
                      <span className="font-bold text-stone-800">{article.byline}</span>
                      <span>•</span>
                      <span>قسم التحقيقات الميدانية</span>
                    </div>
                  )}
                </div>

                {/* 2-Column Split: Image on side + Body Story */}
                <div className="grid grid-cols-12 gap-3.5 items-start">
                  {article.images.length > 0 && (
                    <div className="col-span-5 rounded-xl overflow-hidden border border-stone-200/90 aspect-[4/3] relative bg-stone-100 shadow-2xs">
                      <img
                        src={article.images[0].url}
                        className="w-full h-full object-cover"
                        alt={article.images[0].caption}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 text-white text-[10px]">
                        <span className="font-bold block truncate">{article.images[0].caption}</span>
                      </div>
                    </div>
                  )}

                  <div className={`space-y-2 text-xs text-stone-800 leading-relaxed font-cairo text-justify ${article.images.length > 0 ? 'col-span-7' : 'col-span-12'}`}>
                    {article.body
                      .split('\n\n')
                      .slice(0, 2)
                      .map((p, idx) => (
                        <p key={idx} className="leading-relaxed text-[11px] sm:text-xs">
                          {p}
                        </p>
                      ))}

                    {article.pullQuotes?.[0] && (
                      <div className="p-3 my-1 border-r-2 border-stone-800 bg-stone-50/70 text-stone-900 font-semibold italic text-[11px]">
                        <p>"{article.pullQuotes[0]}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Advertorial Divider Line */}
              <div className="my-1.5 flex items-center gap-2.5 flex-shrink-0">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-[9.5px] font-mono font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  مساحة إشهارية • الشريك السياحي الرسمي • ESPACE PUBLICITAIRE
                </span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Bottom Half-Page Ad Section */}
              <div className="flex-shrink-0">
                {attachedAd.sourceType === 'upload' || attachedAd.artworkUrl ? (
                  /* Advertiser Direct Artwork Image */
                  <div className="relative rounded-xl overflow-hidden border border-stone-200/90 bg-stone-900 aspect-[21/8] sm:aspect-[24/8] shadow-xs flex items-center justify-center">
                    <img
                      src={attachedAd.artworkUrl}
                      className="w-full h-full object-cover"
                      alt={attachedAd.advertiser}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-2.5 text-white flex items-center justify-between text-xs">
                      <span className="font-bold text-[11px]">{attachedAd.advertiser}</span>
                      {attachedAd.url && (
                        <span className="font-mono text-[10px] text-amber-300">{attachedAd.url}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Designed Half-Page Ad Card */
                  <div
                    className="p-3.5 sm:p-4 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xs border"
                    style={{
                      backgroundColor: attachedAd.designedFields?.bgColor || '#142C23',
                      borderColor: `${attachedAd.designedFields?.accentColor || secondaryColor}50`,
                      color: attachedAd.designedFields?.textColor || '#FFFFFF',
                      backgroundImage: attachedAd.designedFields?.bgImageUrl
                        ? `linear-gradient(to right, rgba(12,18,15,0.92) 0%, rgba(12,18,15,0.55) 60%, rgba(12,18,15,0.85) 100%), url(${attachedAd.designedFields.bgImageUrl})`
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="px-2.5 py-0.5 rounded text-[10px] font-bold border"
                        style={{
                          borderColor: `${attachedAd.designedFields?.accentColor || secondaryColor}80`,
                          color: attachedAd.designedFields?.accentColor || secondaryColor,
                          backgroundColor: 'rgba(0,0,0,0.4)',
                        }}
                      >
                        {attachedAd.designedFields?.categoryTag || 'شريك سياحي'}
                      </span>
                      <span className="text-[10px] text-white/80 font-mono font-bold">
                        {attachedAd.designedFields?.advertiserName || attachedAd.advertiser}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-3 items-center my-1">
                      <div className="col-span-8 sm:col-span-9 space-y-1 text-right">
                        <h3 className="text-base sm:text-lg font-black font-cairo leading-snug drop-shadow-sm">
                          {attachedAd.designedFields?.headline || attachedAd.advertiser}
                        </h3>
                        <p className="text-[11px] text-stone-200 leading-relaxed line-clamp-2">
                          {attachedAd.designedFields?.body}
                        </p>
                      </div>

                      <div className="col-span-4 sm:col-span-3 flex flex-col items-center justify-center gap-1.5">
                        <div className="bg-white/95 p-1 rounded-lg shadow-xs">
                          <QrCode className="w-8 h-8 text-stone-900" />
                        </div>
                        {attachedAd.designedFields?.callToAction && (
                          <span
                            className="px-3 py-1 rounded-md text-[10px] font-bold text-stone-950 shadow-xs text-center block w-full truncate"
                            style={{
                              backgroundColor: attachedAd.designedFields?.accentColor || secondaryColor,
                            }}
                          >
                            {attachedAd.designedFields.callToAction}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10.5px] text-stone-200">
                      <div className="flex items-center gap-3">
                        {attachedAd.designedFields?.phone && (
                          <div className="flex items-center gap-1 font-mono" dir="ltr">
                            <Phone className="w-3 h-3 text-amber-400" />
                            <span>{attachedAd.designedFields.phone}</span>
                          </div>
                        )}
                        {attachedAd.designedFields?.website && (
                          <div className="flex items-center gap-1 font-mono">
                            <Globe className="w-3 h-3 text-amber-400" />
                            <span>{attachedAd.designedFields.website}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Folio */}
              <div className="flex items-center justify-between border-t border-stone-200 pt-1.5 text-xs text-stone-400 font-mono flex-shrink-0">
                <span>صفحة {pageNumber}</span>
                <span>مجلة تحواس براس — حوس بلادك !</span>
              </div>
            </div>
          );
        }

        // Standard Full-Page Article Layout
        return (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Running Head with Custom Logo */}
            <div
              className="flex items-center justify-between border-b pb-2 text-xs"
              style={{ borderColor: theme.ruleColor }}
            >
              <div className="flex items-center gap-2">
                <TahwasLogo
                  size="sm"
                  customLogoUrl={issue.logoUrl}
                  customColors={{ primary: primaryColor, secondary: secondaryColor }}
                  magazineName={issue.magazineName}
                  showTagline={false}
                />
                <span className="text-stone-400 font-mono">| استكشاف الجزائر</span>
              </div>
              <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-700 border border-stone-200/60">
                {article.category || article.kicker}
              </span>
            </div>

            {/* Article Content Layout based on selected Layout Template */}
            {(() => {
              const layoutType = normalizeArticleLayout(article.templateId);
              const paragraphs = article.body.split('\n\n').filter(Boolean);

              const renderTravelFacts = () => {
                if (!article.facts) return null;
                return (
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-2 text-[11px] shadow-2xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-stone-200 font-bold text-stone-900">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-emerald-800" />
                        <span className="text-xs font-black">بطاقة المسافر (Travel Guide)</span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-500">{issue.number}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-stone-400 block text-[9.5px]">الوجهة والمنطقة:</span>
                          <strong className="text-stone-800 text-[10.5px]">
                            {article.facts.destination}
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-stone-400 block text-[9.5px]">أفضل وقت للزيارة:</span>
                          <span className="text-stone-800 text-[10.5px]">
                            {article.facts.bestTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1 border-t border-stone-200/60">
                      <Plane className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-stone-400 block text-[9.5px]">الوصول والتنقل:</span>
                        <span className="text-stone-700 text-[10.5px] leading-snug">
                          {article.facts.howToReach}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1 border-t border-stone-200/60">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-stone-400 block text-[9.5px]">نصيحة المرشد السياحي:</span>
                        <span className="text-stone-700 text-[10.5px] leading-snug">
                          {article.facts.climateTip}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              };

              const renderPullQuote = () => {
                if (!article.pullQuotes?.[0]) return null;
                return (
                  <div className="p-3.5 my-2 border-r-2 border-stone-800 bg-stone-50 text-stone-900 font-semibold italic space-y-1">
                    <Quote className="w-4 h-4 text-stone-500" />
                    <p className="text-xs leading-normal">"{article.pullQuotes[0]}"</p>
                  </div>
                );
              };

              if (layoutType === 'full-text') {
                /* 1. قالب نص كامل (Full Text Longform) */
                return (
                  <div className="my-auto space-y-3.5 max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="space-y-1 text-center border-b border-stone-200 pb-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10.5px] font-bold mx-auto mb-1">
                        <span>قراءة كاملة</span>
                        <span>•</span>
                        <span>{article.category || article.kicker}</span>
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-black text-stone-950 font-cairo leading-snug">
                        {article.title}
                      </h2>
                      {article.subtitle && (
                        <p className="text-xs text-stone-600 font-medium leading-relaxed max-w-lg mx-auto">
                          {article.subtitle}
                        </p>
                      )}
                      {article.byline && (
                        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
                          <span className="font-bold text-stone-800">{article.byline}</span>
                          <span>•</span>
                          <span>قسم التحقيقات الميدانية</span>
                        </div>
                      )}
                    </div>

                    {/* Text flow with Drop Cap */}
                    <div className="space-y-3 text-xs text-stone-800 leading-relaxed font-cairo text-justify">
                      {paragraphs[0] && (
                        <div>
                          {article.images.length > 0 && (
                            <div className="float-left ml-4 mb-2 w-44 rounded-xl overflow-hidden border border-stone-200 shadow-xs bg-stone-100">
                              <img
                                src={article.images[0].url}
                                className="w-full h-28 object-cover"
                                alt={article.images[0].caption}
                              />
                              <div className="p-1.5 bg-stone-50 text-[9.5px] text-stone-600 border-t border-stone-200">
                                <span className="block truncate font-bold">{article.images[0].caption}</span>
                              </div>
                            </div>
                          )}
                          <p className="text-[12px] leading-relaxed">
                            <span className="float-right text-3xl sm:text-4xl font-black pl-3 pr-1 text-stone-950 leading-none">
                              {paragraphs[0].charAt(0)}
                            </span>
                            {paragraphs[0].slice(1)}
                          </p>
                        </div>
                      )}

                      {renderPullQuote()}

                      {paragraphs.slice(1, 3).map((p, idx) => (
                        <p key={idx} className="text-[12px] leading-relaxed">
                          {p}
                        </p>
                      ))}

                      {renderTravelFacts()}

                      {paragraphs.slice(3).map((p, idx) => (
                        <p key={idx} className="text-[12px] leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              }

              if (layoutType === 'image-text') {
                /* 2. قالب صورة مع نص (Image with Text Split) */
                return (
                  <div className="my-auto space-y-3">
                    {/* Large Panoramic Hero Image */}
                    {article.images.length > 0 && (
                      <div className="rounded-2xl overflow-hidden border border-stone-200/90 aspect-[16/8.5] relative bg-stone-100 shadow-xs">
                        <img
                          src={article.images[0].url}
                          className="w-full h-full object-cover"
                          alt={article.images[0].caption}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 text-white flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span className="font-bold">{article.images[0].caption}</span>
                          </div>
                          <span className="opacity-80 font-mono text-[10px]">
                            {article.images[0].credit}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Headline */}
                    <div className="space-y-1">
                      <h2 className="text-xl lg:text-2xl font-black text-stone-950 font-cairo leading-snug">
                        {article.title}
                      </h2>
                      {article.subtitle && (
                        <p className="text-xs text-stone-600 font-medium leading-relaxed">
                          {article.subtitle}
                        </p>
                      )}
                      {article.byline && (
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-0.5">
                          <span className="font-bold text-stone-800">{article.byline}</span>
                          <span>•</span>
                          <span>عدسة تحواس براس</span>
                        </div>
                      )}
                    </div>

                    {/* Split Narrative & Facts */}
                    <div className="grid grid-cols-12 gap-4 text-xs text-stone-800 leading-relaxed font-cairo text-justify">
                      <div className="col-span-7 space-y-2.5">
                        {paragraphs.slice(0, 2).map((p, idx) => (
                          <p key={idx} className="leading-relaxed">
                            {p}
                          </p>
                        ))}
                        {renderPullQuote()}
                      </div>

                      <div className="col-span-5 space-y-2.5">
                        {renderTravelFacts()}
                        {paragraphs.slice(2, 3).map((p, idx) => (
                          <p key={idx} className="leading-relaxed text-[11px] text-stone-600">
                            {p}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              /* 3. قالب عمودين (Classic Two Columns) */
              return (
                <div className="my-auto space-y-3.5">
                  {/* Title & Byline Header */}
                  <div className="space-y-1 border-b border-stone-200 pb-2">
                    <h2 className="text-2xl lg:text-3xl font-black text-stone-950 font-cairo leading-snug">
                      {article.title}
                    </h2>
                    {article.subtitle && (
                      <p className="text-xs text-stone-600 font-medium leading-relaxed">
                        {article.subtitle}
                      </p>
                    )}
                    {article.byline && (
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-0.5">
                        <span className="font-bold text-stone-800">{article.byline}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Camera className="w-3 h-3 text-stone-400" />
                          <span>عدسة: فريد بن سالم</span>
                        </span>
                        <span>•</span>
                        <span>قسم التحقيقات الميدانية</span>
                      </div>
                    )}
                  </div>

                  {/* 2-Column Story Flow */}
                  <div className="grid grid-cols-2 gap-5 text-xs text-stone-800 leading-relaxed font-cairo text-justify">
                    {/* Left Column: Top Image if exists + First Paragraphs + Pullquote */}
                    <div className="space-y-3">
                      {article.images.length > 0 && (
                        <div className="rounded-xl overflow-hidden border border-stone-200 aspect-[16/9] relative bg-stone-100 shadow-2xs">
                          <img
                            src={article.images[0].url}
                            className="w-full h-full object-cover"
                            alt={article.images[0].caption}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-[10px]">
                            <span className="font-bold block truncate">{article.images[0].caption}</span>
                          </div>
                        </div>
                      )}

                      {paragraphs.slice(0, 2).map((p, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {p}
                        </p>
                      ))}

                      {renderPullQuote()}
                    </div>

                    {/* Right Column: Remaining Paragraphs + Essential Travel Facts Box */}
                    <div className="space-y-3">
                      {paragraphs.slice(2, 4).map((p, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {p}
                        </p>
                      ))}

                      {renderTravelFacts()}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Folio */}
            <div className="flex items-center justify-between border-t border-stone-200 pt-2 text-xs text-stone-400 font-mono">
              <span>صفحة {pageNumber}</span>
              <span>مجلة تحواس براس — حوس بلادك !</span>
            </div>
          </div>
        );
      })()}

      {/* ---------------------------------------------------- */}
      {/* 4. FULL BLEED LUXURY ADVERTISEMENT PAGES             */}
      {/* ---------------------------------------------------- */}
      {isAd && (() => {
        // Resolve sub ads if composite, or single ad
        const isComposite = item.itemType === 'composite-ad' || (item.subItems && item.subItems.length > 0);
        const resolvedSubAds = (item.subItems || [])
          .map((sub) => issue.ads.find((a) => a.id === sub.adId))
          .filter((a): a is NonNullable<typeof a> => Boolean(a));

        // Single ad lookup
        const singleAd = issue.ads.find((a) => a.id === item.refId) || (resolvedSubAds.length > 0 ? resolvedSubAds[0] : undefined);

        return (
          <div className="w-full h-full flex flex-col justify-between overflow-hidden relative">
            {/* Top Micro Advertorial Bar */}
            <div className="absolute top-0 inset-x-0 z-30 bg-black/55 backdrop-blur-xs px-6 py-2 flex items-center justify-between text-[10px] text-white/90 font-mono border-b border-white/10">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>مساحة إشهارية • الشريك السياحي الرسمي • ESPACE PUBLICITAIRE</span>
              </span>
              <span>{issue.magazineName || 'مجلة تحواس براس'}</span>
            </div>

            {/* AD CONTENT AREA */}
            <div className="flex-1 w-full h-full flex flex-col pt-8">
              {isComposite && resolvedSubAds.length >= 2 ? (
                /* Composite Multi-Ad Layout (Clean 50/50 Full Bleed Halves) */
                <div className="flex flex-col h-full w-full">
                  {resolvedSubAds.map((subAd, sIdx) => {
                    if (subAd.sourceType === 'upload' || subAd.artworkUrl) {
                      return (
                        <div
                          key={subAd.id || sIdx}
                          className={`flex-1 w-full relative overflow-hidden bg-stone-900 flex items-center justify-center ${
                            sIdx === 0 ? 'border-b border-white/20' : ''
                          }`}
                        >
                          <img
                            src={subAd.artworkUrl}
                            className="w-full h-full object-cover"
                            alt={subAd.advertiser}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              <span className="font-bold">{subAd.advertiser}</span>
                            </div>
                            {subAd.url && (
                              <span className="font-mono text-[10px] text-amber-300">{subAd.url}</span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    const bg = subAd.designedFields?.bgColor || (sIdx === 0 ? '#142C23' : '#131C26');
                    const textCol = subAd.designedFields?.textColor || '#FFFFFF';
                    const accentCol = subAd.designedFields?.accentColor || (sIdx === 0 ? '#C59E50' : '#9FAEB8');
                    const bgImg = subAd.designedFields?.bgImageUrl;

                    return (
                      <div
                        key={subAd.id || sIdx}
                        className={`flex-1 w-full p-8 relative flex flex-col justify-between ${
                          sIdx === 0 ? 'border-b border-white/20' : ''
                        }`}
                        style={{
                          backgroundColor: bg,
                          color: textCol,
                          backgroundImage: bgImg
                            ? `linear-gradient(to top, rgba(12,18,15,0.92) 0%, rgba(12,18,15,0.45) 50%, rgba(12,18,15,0.75) 100%), url(${bgImg})`
                            : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="inline-block px-3 py-0.5 rounded text-[11px] font-bold border"
                              style={{
                                borderColor: `${accentCol}80`,
                                color: accentCol,
                                backgroundColor: 'rgba(0,0,0,0.4)',
                              }}
                            >
                              {subAd.designedFields?.categoryTag || 'شريك سياحي رسمي'}
                            </span>
                            <span className="text-[11px] font-bold text-white/80 font-mono">
                              {subAd.designedFields?.advertiserName || subAd.advertiser}
                            </span>
                          </div>

                          <h3 className="text-2xl font-black font-cairo leading-snug drop-shadow-md">
                            {subAd.designedFields?.headline || subAd.advertiser}
                          </h3>

                          <p className="text-xs mt-2 text-stone-200 leading-relaxed max-w-xl line-clamp-3">
                            {subAd.designedFields?.body}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-4 text-[11px] text-stone-200">
                            {subAd.designedFields?.phone && (
                              <div className="flex items-center gap-1.5 font-mono" dir="ltr">
                                <Phone className="w-3.5 h-3.5 text-amber-400" />
                                <span>{subAd.designedFields.phone}</span>
                              </div>
                            )}
                            {subAd.designedFields?.website && (
                              <div className="flex items-center gap-1.5 font-mono">
                                <Globe className="w-3.5 h-3.5 text-amber-400" />
                                <span>{subAd.designedFields.website}</span>
                              </div>
                            )}
                          </div>

                          <span
                            className="px-4 py-2 rounded-lg font-bold text-xs shadow-md text-stone-950"
                            style={{ backgroundColor: accentCol }}
                          >
                            {subAd.designedFields?.callToAction || 'اكتشف المزيد'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : singleAd ? (
                /* Full Page Single Ad (Full Bleed Edge to Edge) */
                singleAd.sourceType === 'upload' || singleAd.artworkUrl ? (
                  /* Direct Advertiser Full Page Image Artwork */
                  <div className="w-full h-full relative overflow-hidden bg-stone-950 flex items-center justify-center">
                    <img
                      src={singleAd.artworkUrl}
                      className="w-full h-full object-cover"
                      alt={singleAd.advertiser}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 text-white flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 block font-bold">
                          الشريك السياحي الرسمي • {issue.magazineName || 'مجلة تحواس براس'}
                        </span>
                        <h4 className="font-bold text-base mt-0.5">{singleAd.advertiser}</h4>
                      </div>
                      {singleAd.url && (
                        <span className="font-mono text-xs text-amber-300 bg-black/50 px-3 py-1 rounded-full border border-white/20">
                          {singleAd.url}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                <div
                  className="w-full h-full p-10 flex flex-col justify-between relative"
                  style={{
                    backgroundColor: singleAd.designedFields?.bgColor || primaryColor,
                    color: singleAd.designedFields?.textColor || '#FFFFFF',
                    backgroundImage: singleAd.designedFields?.bgImageUrl
                      ? `linear-gradient(to top, rgba(12,18,15,0.95) 0%, rgba(12,18,15,0.45) 45%, rgba(12,18,15,0.8) 100%), url(${singleAd.designedFields.bgImageUrl})`
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="pt-4">
                    <span
                      className="inline-block px-3.5 py-1 rounded text-xs font-bold mb-4 border"
                      style={{
                        borderColor: `${singleAd.designedFields?.accentColor || secondaryColor}80`,
                        color: singleAd.designedFields?.accentColor || secondaryColor,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                      }}
                    >
                      {singleAd.designedFields?.categoryTag || 'شريك سياحي رسمي'}
                    </span>
                    <h3 className="text-3xl lg:text-4xl font-black font-cairo leading-tight drop-shadow-lg max-w-xl">
                      {singleAd.designedFields?.headline || singleAd.advertiser}
                    </h3>
                    <p className="text-sm mt-4 text-stone-100 leading-relaxed max-w-lg drop-shadow-sm">
                      {singleAd.designedFields?.body}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/20 flex items-center justify-between text-xs">
                    <div className="space-y-2">
                      {singleAd.designedFields?.phone && (
                        <div className="flex items-center gap-2 font-mono text-sm text-stone-100" dir="ltr">
                          <Phone className="w-4 h-4 text-amber-400" />
                          <span>{singleAd.designedFields.phone}</span>
                        </div>
                      )}
                      {singleAd.designedFields?.website && (
                        <div className="flex items-center gap-2 font-mono text-sm text-stone-100">
                          <Globe className="w-4 h-4 text-amber-400" />
                          <span>{singleAd.designedFields.website}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-white/90 p-1.5 rounded-lg shadow-sm">
                        <QrCode className="w-9 h-9 text-stone-900" />
                      </div>
                      <span
                        className="px-6 py-3 text-stone-950 rounded-xl font-bold shadow-lg text-sm"
                        style={{ backgroundColor: singleAd.designedFields?.accentColor || secondaryColor }}
                      >
                        {singleAd.designedFields?.callToAction || 'احجز الآن'}
                      </span>
                    </div>
                  </div>
                </div>
                )
              ) : (
                /* Fallback if no ad is assigned yet */
                <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center space-y-4 text-stone-600 bg-stone-50">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-lg font-bold text-stone-900 font-cairo">
                      صفحة إعلانية مخصصة (صفحة {pageNumber})
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      لم يتم تعيين إعلان تجاري محدد لهذه الصفحة بعد. يمكنك تحديد الإعلان المعروض بدقة من خطوة "ترتيب وتخطيط الصفحات" أو إزالتها إذا كان هذا الإصدار بدون إعلانات.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ---------------------------------------------------- */}
      {/* 5. BACK COVER PAGE (CLOSING & OFFICIAL PARTNER)      */}
      {/* ---------------------------------------------------- */}
      {isBackCover && (
        <div
          className="w-full h-full p-10 flex flex-col justify-between text-white relative overflow-hidden"
          style={{
            backgroundColor: '#141A17',
            backgroundImage: 'linear-gradient(180deg, #1A221E 0%, #0E1411 100%)',
          }}
        >
          {/* Top Brand Marker with Custom Logo */}
          <div className="flex items-center justify-between border-b border-white/20 pb-3 relative z-10">
            <TahwasLogo
              size="md"
              inverted={true}
              customLogoUrl={issue.logoUrl}
              customColors={{ primary: primaryColor, secondary: secondaryColor }}
              magazineName={issue.magazineName}
              showTagline={false}
            />
            <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-white/15 text-white border border-white/20">
              {issue.number} • {issue.date}
            </span>
          </div>

          {/* Official Back Cover Ad Banner OR Editorial Closing */}
          {(() => {
            const selectedBackAd =
              issue.ads.find((a) => a.id === issue.cover.backCoverAdId) ||
              issue.ads.find((a) => a.format === 'cover-back');

            if (issue.includeAdsInIssue !== false && issue.cover.backCoverType === 'ad' && selectedBackAd) {
              if (selectedBackAd.sourceType === 'upload' && selectedBackAd.artworkUrl) {
                return (
                  <div className="my-auto relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                    <img
                      src={selectedBackAd.artworkUrl}
                      alt={selectedBackAd.advertiser || 'إعلان الغلاف الخلفي'}
                      className="w-full h-auto object-cover max-h-[500px]"
                    />
                  </div>
                );
              }
              const website = selectedBackAd.designedFields?.website || selectedBackAd.url;
              return (
                <div className="bg-stone-950/60 backdrop-blur-xs p-8 rounded-3xl border border-white/15 space-y-4 my-auto shadow-2xl relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase block text-stone-300">
                      {selectedBackAd.designedFields?.advertiserName || selectedBackAd.advertiser}
                    </span>
                    {website && (
                      <span className="text-xs text-white/80 font-mono font-bold">{website}</span>
                    )}
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-black font-cairo leading-snug">
                    {selectedBackAd.designedFields?.headline || selectedBackAd.advertiser}
                  </h3>
                  {selectedBackAd.designedFields?.body && (
                    <p className="text-xs text-stone-200 leading-relaxed">
                      {selectedBackAd.designedFields.body}
                    </p>
                  )}

                  {selectedBackAd.designedFields?.callToAction && (
                    <div className="pt-3 border-t border-white/20 flex items-center justify-end">
                      <span className="px-6 py-2.5 text-stone-950 rounded-xl font-bold text-xs shadow-md bg-white hover:bg-stone-100">
                        {selectedBackAd.designedFields.callToAction}
                      </span>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div className="bg-stone-950/60 backdrop-blur-xs p-8 rounded-3xl border border-white/15 space-y-5 my-auto shadow-xl text-center relative z-10">
                <span className="text-xs font-bold uppercase block font-mono text-stone-300">
                  رسالة التحرير الختامية
                </span>
                <h3 className="text-2xl lg:text-3xl font-black font-cairo leading-snug">
                  {typeof issue.cover.backCoverMessage === 'string'
                    ? issue.cover.backCoverMessage
                    : issue.cover.backCoverMessage?.title || issue.magazineName}
                </h3>
                {typeof issue.cover.backCoverMessage === 'object' && issue.cover.backCoverMessage?.description ? (
                  <p className="text-xs text-stone-300 leading-relaxed max-w-lg mx-auto">
                    {issue.cover.backCoverMessage.description}
                  </p>
                ) : (
                  <p className="text-xs text-stone-300 leading-relaxed max-w-lg mx-auto">
                    {issue.cover.tagline || issue.title}
                  </p>
                )}
                <div className="pt-2 flex items-center justify-center gap-3">
                  <span className="text-xs text-stone-400 font-mono">{issue.number}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-xs text-white font-mono font-bold">{issue.magazineName} {issue.date ? `• ${issue.date}` : ''}</span>
                </div>
              </div>
            );
          })()}

          {/* Closing Editorial Footer: Strictly only displaying entered data */}
          <div className="p-4 bg-stone-950/70 rounded-2xl border border-white/10 text-xs text-stone-300 space-y-2 text-center font-mono relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              {issue.barcode || issue.cover.barcode ? (
                <div className="bg-white px-2 py-0.5 rounded text-stone-950 flex items-center gap-1">
                  <span className="text-[9px] font-bold font-mono">{issue.barcode || issue.cover.barcode}</span>
                </div>
              ) : (
                <span className="text-[10px] text-stone-400 font-mono">{issue.number} {issue.date ? `• ${issue.date}` : ''}</span>
              )}
              <p className="font-bold text-white font-cairo text-xs">
                {issue.magazineName}
              </p>
              {issue.website || issue.cover.website ? (
                <span className="text-[10px] text-stone-300 font-mono">{issue.website || issue.cover.website}</span>
              ) : (
                <span />
              )}
            </div>
            <p className="text-stone-400 text-[10px]">
              جميع الحقوق محفوظة © {issue.magazineName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
