import React from 'react';

interface TahwasLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'masthead';
  showTagline?: boolean;
  inverted?: boolean;
  customLogoUrl?: string;
  customColors?: { primary?: string; secondary?: string };
  magazineName?: string;
  layout?: 'horizontal' | 'vertical' | 'cover';
}

export const TahwasLogo: React.FC<TahwasLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  inverted = false,
  customLogoUrl,
  customColors,
  magazineName = 'تحواس براس',
  layout = 'horizontal',
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    masthead: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  const titleSizes = {
    sm: 'text-sm font-bold',
    md: 'text-xl font-black',
    lg: 'text-3xl font-black',
    xl: 'text-4xl sm:text-5xl font-black',
    masthead: 'text-4xl sm:text-5xl lg:text-6xl font-black',
  };

  const primary = customColors?.primary || '#0D5C46';
  const secondary = customColors?.secondary || '#D97706';

  const isCoverMasthead = size === 'masthead' || layout === 'cover';

  // Extract Arabic brand name & French/English subtitle cleanly
  const hasTahwas = magazineName.includes('تحواس');
  const mainArabicName = hasTahwas ? 'تحواس براس' : magazineName;
  const nameWords = (mainArabicName || 'تحواس براس').trim().split(/\s+/);

  return (
    <div
      className={`select-none ${
        isCoverMasthead
          ? 'w-full flex flex-col items-center justify-center text-center'
          : layout === 'vertical'
          ? 'flex flex-col items-center gap-2 text-center'
          : 'flex items-center gap-3.5 text-right'
      } ${className}`}
    >
      {/* 1. Custom Brand Emblem or Stylized Algerian Desert Emblem */}
      {isCoverMasthead ? (
        <div className="w-full flex flex-col items-center space-y-2">
          {/* Top Brand Emblem & Title Group */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
            {customLogoUrl ? (
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 relative flex items-center justify-center rounded-2xl overflow-hidden flex-shrink-0 border shadow-2xl p-1"
                style={{
                  borderColor: inverted ? 'rgba(255, 255, 255, 0.3)' : '#E7E5E4',
                  backgroundColor: inverted ? 'rgba(255, 255, 255, 0.95)' : '#FFFFFF',
                }}
              >
                <img
                  src={customLogoUrl}
                  alt={magazineName}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 relative flex items-center justify-center rounded-2xl shadow-2xl overflow-hidden flex-shrink-0 border"
                style={{
                  borderColor: inverted ? 'rgba(255, 255, 255, 0.3)' : '#E7E5E4',
                  background: inverted
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,240,230,0.95) 100%)'
                    : `linear-gradient(135deg, ${primary} 0%, #06281D 100%)`,
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
                  {/* Sahara Dune Layers */}
                  <path
                    d="M 5 80 Q 35 48 65 68 T 95 62 L 95 95 L 5 95 Z"
                    fill={secondary}
                    opacity="0.95"
                  />
                  {/* Algerian Oasis Palm Tree */}
                  <path
                    d="M 50 18 C 50 35 38 52 26 58 C 40 50 50 40 52 28 C 54 40 64 50 78 58 C 66 52 54 35 50 18 Z"
                    fill={inverted ? primary : '#FAF8F5'}
                  />
                  {/* Majestic Golden Compass Star */}
                  <polygon
                    points="50,10 53,24 66,27 53,30 50,44 47,30 34,27 47,24"
                    fill={secondary}
                  />
                  <circle cx="50" cy="27" r="3" fill={inverted ? primary : '#FAF8F5'} />
                </svg>
              </div>
            )}

            {/* Authoritative Masthead Typography Styled with Logo Colors */}
            <div className="flex flex-col items-center">
              <h1
                className={`${titleSizes.masthead} font-cairo leading-none tracking-normal flex items-center justify-center gap-3 sm:gap-4 flex-wrap`}
              >
                {nameWords.map((word, idx) => {
                  const wordColor = idx % 2 === 0 ? primary : secondary;
                  return (
                    <span
                      key={idx}
                      style={{
                        color: wordColor,
                        textShadow: inverted
                          ? '0 3px 12px rgba(0,0,0,0.95), 0 0 2px rgba(255,255,255,0.45)'
                          : '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
              </h1>
              <div className="flex items-center gap-2 mt-2 font-mono">
                <span className="h-px w-6 sm:w-12 bg-white/30" />
                <span className="text-xs sm:text-sm font-semibold text-stone-200 tracking-wider">
                  TAHWAS PRESSE • REVUE DE TOURISME
                </span>
                <span className="h-px w-6 sm:w-12 bg-white/30" />
              </div>
            </div>
          </div>

          {/* Subtitle Slogan Strip */}
          {showTagline && (
            <div className="pt-1 flex items-center justify-center gap-3 text-xs text-stone-200">
              <span className="font-bold text-white">حوس بلادك ! 🇩🇿</span>
              <span>•</span>
              <span className="text-stone-300">أول مجلة سياحية متخصصة في اكتشاف الجزائر والتراث الوطني</span>
            </div>
          )}
        </div>
      ) : (
        /* Standard Header/Footer Logo Layout */
        <>
          {customLogoUrl ? (
            <div
              className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0 border ${
                inverted ? 'border-white/20 bg-white/10' : 'border-stone-200 bg-white shadow-xs'
              }`}
            >
              <img
                src={customLogoUrl}
                alt={magazineName}
                className="w-full h-full object-contain p-1"
              />
            </div>
          ) : (
            <div
              className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl shadow-xs overflow-hidden flex-shrink-0 border`}
              style={{
                borderColor: inverted ? 'rgba(255,255,255,0.2)' : '#E7E5E4',
                background: inverted
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,248,245,0.9) 100%)'
                  : `linear-gradient(135deg, ${primary} 0%, #063828 100%)`,
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none">
                <path
                  d="M 10 75 Q 35 45 65 65 T 95 60 L 95 90 L 10 90 Z"
                  fill={secondary}
                  opacity="0.9"
                />
                <path
                  d="M 50 20 C 50 35 40 50 30 55 C 42 48 50 38 52 28 C 55 38 64 48 74 55 C 65 48 56 35 50 20 Z"
                  fill={inverted ? primary : '#FAF8F5'}
                />
                <polygon
                  points="50,12 53,24 65,27 53,30 50,42 47,30 35,27 47,24"
                  fill={secondary}
                />
                <circle cx="50" cy="27" r="2.5" fill={inverted ? primary : '#FAF8F5'} />
              </svg>
            </div>
          )}

          {/* Typography Styled with Logo Colors */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {nameWords.map((word, idx) => {
                const wordColor = idx % 2 === 0 ? primary : secondary;
                return (
                  <span
                    key={idx}
                    className={`${titleSizes[size]} font-cairo font-black`}
                    style={{ color: wordColor }}
                  >
                    {word}
                  </span>
                );
              })}
              {hasTahwas && (
                <span className="font-outfit text-xs font-bold uppercase text-stone-400">
                  PRESSE
                </span>
              )}
            </div>
            {showTagline && (
              <span
                className={`text-[11px] font-medium leading-none mt-0.5 ${
                  inverted ? 'text-stone-300' : 'text-stone-500'
                }`}
              >
                حوس بلادك ! • مجلة السياحة الجزائرية
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
