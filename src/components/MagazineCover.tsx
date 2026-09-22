import React from 'react';
import { Issue } from '../types';
import { TahwasLogo } from './TahwasLogo';
import { getEffectiveTheme } from '../data/themes';

interface MagazineCoverProps {
  issue: Issue;
  variant?: 'editor' | 'page';
  className?: string;
}

export const MagazineCover: React.FC<MagazineCoverProps> = ({
  issue,
  variant = 'page',
  className = '',
}) => {
  const { cover } = issue;
  const theme = getEffectiveTheme(issue);
  const primaryColor = issue.brandColors?.primary || theme.accentInk || '#0D5C46';
  const secondaryColor = issue.brandColors?.secondary || theme.accent || '#D97706';

  const isEditor = variant === 'editor';
  const isFramed = cover.templateId === 'framed-editorial';

  const displayPrice = cover.price || issue.price;
  const hasCoverLines = cover.lines && cover.lines.length > 0;

  return (
    <div
      className={`relative overflow-hidden select-none flex flex-col justify-between text-right font-cairo ${
        isEditor
          ? 'w-full aspect-[210/297] rounded-2xl p-6 shadow-2xl'
          : 'w-full h-full p-8 sm:p-10'
      } ${className}`}
      style={{
        backgroundImage: `url(${cover.photoUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1C2421',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Cinematic Multi-Stop Scrim Overlay for maximum legibility */}
      {cover.contrastScrim && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0, 0, 0, 0.58) 0%, rgba(0, 0, 0, 0.15) 18%, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0) 65%, rgba(0, 0, 0, 0.35) 80%, rgba(0, 0, 0, 0.82) 100%)',
          }}
        />
      )}

      {/* 2. Prestige Inset Border Frame (Only for framed-editorial template) */}
      {isFramed && (
        <div className="absolute inset-4 sm:inset-5 border border-white/40 pointer-events-none z-20" />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. TOP SECTION: Meta Bar + Masthead                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 text-right space-y-3 flex-shrink-0 w-full pt-1">
        {/* Top Issue Meta & Price Strip (strictly unentered data is omitted) */}
        <div className="flex items-center justify-between border-b border-white/20 pb-2 text-xs">
          <div className="flex items-center gap-2 text-stone-200 text-[10.5px] sm:text-xs">
            {cover.editionLabel ? (
              <span className="font-bold text-stone-200">{cover.editionLabel}</span>
            ) : issue.title ? (
              <span className="font-semibold text-stone-200 line-clamp-1">{issue.title}</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[11px] font-mono px-3 py-0.5 rounded shadow-xs bg-white/90 text-stone-900 border border-white/40">
              {issue.number} {issue.date ? `• ${issue.date}` : ''}
            </span>
            {displayPrice && displayPrice.trim().length > 0 && (
              <span className="text-[10px] text-stone-200 font-mono hidden sm:inline bg-black/40 px-2 py-0.5 rounded border border-white/15">
                السعر: {displayPrice}
              </span>
            )}
          </div>
        </div>

        {/* Central Masthead (Unified Logo + Magazine Name Styled with Logo Colors) */}
        <div className="pt-1">
          <TahwasLogo
            size="masthead"
            layout="cover"
            inverted={true}
            showTagline={!!cover.tagline}
            customLogoUrl={issue.logoUrl}
            customColors={{ primary: primaryColor, secondary: secondaryColor }}
            magazineName={issue.magazineName}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. MID SECTION: Distributed Cover Stories (Thumbnails & Subtitles) */}
      {/* ------------------------------------------------------------------ */}
      {(() => {
        const lines = cover.lines || [];
        if (lines.length === 0) return null;

        const topLines = lines.filter((l) => l.position === 'top');
        const bottomLines = lines.filter((l) => l.position === 'bottom');
        const midLines = lines.filter((l) => l.position !== 'top' && l.position !== 'bottom');

        const rightLines = midLines.filter((l, idx) => {
          if (l.position === 'right') return true;
          if (l.position === 'left') return false;
          return idx % 2 === 0;
        });

        const leftLines = midLines.filter((l, idx) => {
          if (l.position === 'left') return true;
          if (l.position === 'right') return false;
          return idx % 2 === 1;
        });

        const renderStoryCard = (line: typeof lines[0], align: 'right' | 'left' = 'right') => {
          const linkedPage = line.articleId
            ? issue.sequence.find((s) => s.refId === line.articleId)?.startPage
            : undefined;

          return (
            <div
              key={line.id}
              className={`rounded-2xl p-2.5 sm:p-3 bg-black/60 backdrop-blur-md border border-white/20 shadow-xl w-full sm:max-w-[270px] lg:max-w-[290px] text-right flex items-start gap-2.5 transition-all ${
                align === 'left' ? 'sm:self-end' : 'sm:self-start'
              }`}
            >
              {/* Thumbnail Image if provided */}
              {line.imageUrl && (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-white/70 shadow-md flex-shrink-0 bg-stone-900 relative">
                  <img
                    src={line.imageUrl}
                    alt={line.text}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  {line.category ? (
                    <span
                      className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md text-white border shadow-xs"
                      style={{
                        backgroundColor: `${primaryColor}e6`,
                        borderColor: `${secondaryColor}88`,
                      }}
                    >
                      {line.category}
                    </span>
                  ) : <span />}

                  {linkedPage && (
                    <span className="text-[10px] font-mono font-bold text-amber-300 flex-shrink-0">
                      ص {linkedPage}
                    </span>
                  )}
                </div>

                <h4 className="font-black text-white text-xs sm:text-[13px] leading-snug drop-shadow-sm line-clamp-2">
                  {line.text}
                </h4>

                {line.subtitle && (
                  <p className="text-[10px] sm:text-[11px] text-stone-200/90 leading-tight mt-1 line-clamp-2 font-medium">
                    {line.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        };

        return (
          <div className="relative z-10 my-auto py-2 w-full space-y-3">
            {/* Optional Top Banner Line */}
            {topLines.length > 0 && (
              <div className="w-full flex flex-col gap-2">
                {topLines.map((line) => (
                  <div
                    key={line.id}
                    className="p-2 sm:p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-between text-xs text-white"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {line.imageUrl && (
                        <img
                          src={line.imageUrl}
                          alt={line.text}
                          className="w-7 h-7 rounded-lg object-cover border border-white/50 flex-shrink-0"
                        />
                      )}
                      {line.category && (
                        <span className="font-bold text-[9px] px-2 py-0.5 rounded bg-amber-500/80 text-stone-950 flex-shrink-0">
                          {line.category}
                        </span>
                      )}
                      <span className="font-bold text-white text-xs sm:text-[13px] truncate">
                        {line.text}
                      </span>
                      {line.subtitle && (
                        <span className="text-stone-300 text-[11px] hidden sm:inline truncate">
                          — {line.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Distributed Left and Right Flanks */}
            {(rightLines.length > 0 || leftLines.length > 0) && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
                {/* Right Flank (Primary in RTL) */}
                <div className="flex flex-col items-start gap-2.5 sm:gap-3 w-full">
                  {rightLines.map((line) => renderStoryCard(line, 'right'))}
                </div>

                {/* Left Flank (Secondary in RTL, staggered slightly for magazine rhythm) */}
                <div className="flex flex-col items-end gap-2.5 sm:gap-3 w-full sm:pt-3">
                  {leftLines.map((line) => renderStoryCard(line, 'left'))}
                </div>
              </div>
            )}

            {/* Optional Bottom Line */}
            {bottomLines.length > 0 && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bottomLines.map((line) => renderStoryCard(line, 'right'))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ------------------------------------------------------------------ */}
      {/* 5. BOTTOM SECTION: Headline & Clean Newsstand Footer               */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 text-right space-y-3 flex-shrink-0 w-full mt-auto">
        {/* Main Cover Feature Headline Box (strictly using user data) */}
        {cover.headline && (
          <div className="p-4 sm:p-5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 space-y-1.5 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-cairo leading-tight drop-shadow-lg">
              {cover.headline}
            </h2>

            {cover.tagline && (
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-2xl drop-shadow-sm font-medium">
                {cover.tagline}
              </p>
            )}
          </div>
        )}

        {/* Footer: Only displays entered website, barcode, or clean baseline */}
        {issue.website || cover.website || cover.barcode || issue.barcode ? (
          <div className="pt-2 flex items-center justify-between text-[10px] sm:text-xs text-stone-300 border-t border-white/20 font-mono">
            {cover.barcode || issue.barcode ? (
              <div className="bg-white/95 px-2.5 py-1 rounded flex items-center gap-1.5 shadow-xs text-stone-950">
                <span className="text-[9px] font-bold font-mono">{cover.barcode || issue.barcode}</span>
              </div>
            ) : (
              <span className="text-stone-300">{issue.magazineName}</span>
            )}

            {issue.website || cover.website ? (
              <div className="flex items-center gap-3 font-mono">
                <span className="font-bold text-stone-200 text-xs">{issue.website || cover.website}</span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10.5px] text-stone-300 font-mono">
            <span>{issue.magazineName}</span>
            <span>{issue.number} {issue.date ? `• ${issue.date}` : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};
