import { ThemeTokens, ThemeId } from '../types';

export const THEMES: Record<ThemeId, ThemeTokens> = {
  'tahwas-sahara': {
    id: 'tahwas-sahara',
    name: {
      ar: 'تحواس صحراء الجزائر (الأصلي الفاخر)',
      fr: 'Tahwas Sahara & Oasis Éditorial',
      en: 'Tahwas Sahara & Oasis Editorial',
    },
    description: {
      ar: 'الهوية التحريرية الرسمية: أخضر الواحات العميق الموشح بالذهب والبرونز الصحراوي الأصيل',
      fr: "L'identité éditoriale officielle : Vert cyprès profond et or antique saharien",
      en: 'Official editorial identity: Deep cypress green and antique Sahara bronze',
    },
    paper: '#FAF7F2',
    ink: '#1B1E1C',
    inkMuted: '#585E5A',
    accent: '#9E7438', // Antique Warm Bronze / Ochre Gold
    accentLight: '#F4EFE6',
    accentInk: '#16382C', // Deep Editorial Cypress Green
    ruleColor: '#E0D8CB',
    scrim: 'linear-gradient(to top, rgba(16, 42, 33, 0.95) 0%, rgba(16, 42, 33, 0.5) 45%, transparent 100%)',
    cardBg: '#FFFFFF',
    fonts: {
      arabicDisplay: 'Cairo, Noto Sans Arabic, sans-serif',
      arabicText: 'Cairo, Noto Sans Arabic, sans-serif',
      latinDisplay: 'Playfair Display, serif',
      latinText: 'Outfit, sans-serif',
    },
    borderRadius: '4px',
    ornamentStyle: 'sahara',
  },
  coastal: {
    id: 'coastal',
    name: {
      ar: 'زرقة المتوسط والساحل الجزائري',
      fr: 'Bleu Méditerranéen & Côte',
      en: 'Mediterranean Blue & Coastal',
    },
    description: {
      ar: 'أزرق كحلي متوسطي عميق يترجم سحر وهران، تيبازة، بجاية وعنابة',
      fr: "Profondeur marine méditerranéenne d'Oran, Tipasa à Bejaia et Annaba",
      en: 'Deep Mediterranean navy and coastal sea mist from Oran to Annaba',
    },
    paper: '#F7F9FA',
    ink: '#141C22',
    inkMuted: '#4E5C68',
    accent: '#2D6682', // Slate Sea Blue
    accentLight: '#E9EFF3',
    accentInk: '#1A374D', // Deep Mediterranean Navy
    ruleColor: '#D5DFE6',
    scrim: 'linear-gradient(to top, rgba(20, 36, 50, 0.95) 0%, rgba(45, 102, 130, 0.45) 55%, transparent 100%)',
    cardBg: '#FFFFFF',
    fonts: {
      arabicDisplay: 'El Messiri, Cairo, sans-serif',
      arabicText: 'Tajawal, sans-serif',
      latinDisplay: 'Playfair Display, serif',
      latinText: 'Outfit, sans-serif',
    },
    borderRadius: '6px',
    ornamentStyle: 'geometric',
  },
  desert: {
    id: 'desert',
    name: {
      ar: 'كثبان تيميمون والقورارة الدافئة',
      fr: 'Dunes de Timimoun & Gourara',
      en: 'Timimoun Dunes & Gourara',
    },
    description: {
      ar: 'دفء الطين المغري التحريري والقصور العتيقة وبساتين الواحات الخالدة',
      fr: "Chaleur de l'ocre rouge, ksour anciens et palmeraies sahariennes",
      en: 'Warm terracotta clay, ancient ksour, and desert palm groves in Gourara',
    },
    paper: '#FAF6F0',
    ink: '#221B17',
    inkMuted: '#61534C',
    accent: '#9A6335', // Warm Desert Dune Bronze
    accentLight: '#F4EBE0',
    accentInk: '#5E2F1B', // Deep Terracotta Earth
    ruleColor: '#E0D4C5',
    scrim: 'linear-gradient(to top, rgba(34, 27, 23, 0.95) 0%, rgba(154, 99, 53, 0.45) 55%, transparent 100%)',
    cardBg: '#FFFFFF',
    fonts: {
      arabicDisplay: 'Amiri, serif',
      arabicText: 'Cairo, sans-serif',
      latinDisplay: 'Playfair Display, serif',
      latinText: 'Outfit, sans-serif',
    },
    borderRadius: '2px',
    ornamentStyle: 'sahara',
  },
  metropolis: {
    id: 'metropolis',
    name: {
      ar: 'عصري حبري وأناقة المدن الكبرى',
      fr: 'Métropole Moderne & Élégance',
      en: 'Modern Metropolis & Elegance',
    },
    description: {
      ar: 'خطوط تحريرية رصينة للمدن الكبرى، الفنادق الفاخرة وسياحة الأعمال',
      fr: "Ligne éditoriale moderne pour les métropoles, l'hôtellerie et le voyage d'affaires",
      en: 'Sharp modern editorial feel for luxury hospitality, cities, and business travel',
    },
    paper: '#F9F9F8',
    ink: '#161717',
    inkMuted: '#5C5E5F',
    accent: '#586361', // Warm Titanium Grey
    accentLight: '#ECECEB',
    accentInk: '#222828', // Deep Charcoal
    ruleColor: '#D7D8D6',
    scrim: 'linear-gradient(to top, rgba(22, 23, 23, 0.96) 0%, rgba(22, 23, 23, 0.4) 60%, transparent 100%)',
    cardBg: '#FFFFFF',
    fonts: {
      arabicDisplay: 'Cairo, sans-serif',
      arabicText: 'Cairo, sans-serif',
      latinDisplay: 'Outfit, sans-serif',
      latinText: 'Outfit, sans-serif',
    },
    borderRadius: '6px',
    ornamentStyle: 'minimal',
  },
  'alpine-nature': {
    id: 'alpine-nature',
    name: {
      ar: 'غابات جرجرة وجبال الأطلس الخضراء',
      fr: 'Forêts du Djurdjura & Montagnes',
      en: 'Djurdjura Pine & Atlas Mountains',
    },
    description: {
      ar: 'طبيعة الجزائر الخلابة، سياحة المغامرات، المشي الجبلي والثلوج',
      fr: "Randonnées, sommets enneigés, parcs nationaux et nature sauvage d'Algérie",
      en: 'Hiking, snowy peaks, national parks, and wild Algerian mountain nature',
    },
    paper: '#F7F8F5',
    ink: '#152018',
    inkMuted: '#4B594F',
    accent: '#4C6E52', // Sage Moss Green
    accentLight: '#E8EFE9',
    accentInk: '#1B3B28', // Forest Pine Canopy
    ruleColor: '#D3DFD5',
    scrim: 'linear-gradient(to top, rgba(21, 32, 24, 0.95) 0%, rgba(76, 110, 82, 0.4) 60%, transparent 100%)',
    cardBg: '#FFFFFF',
    fonts: {
      arabicDisplay: 'Tajawal, sans-serif',
      arabicText: 'Cairo, sans-serif',
      latinDisplay: 'Playfair Display, serif',
      latinText: 'Outfit, sans-serif',
    },
    borderRadius: '4px',
    ornamentStyle: 'nature',
  },
  heritage: {
    id: 'heritage',
    name: {
      ar: 'تراث القصبة والأندلس والآثار العتيقة',
      fr: 'Casbah & Héritage Andalou',
      en: 'Casbah & Andalusian Heritage',
    },
    description: {
      ar: 'أصالة التاريخ الجزائري والزليج العتيق وقصور العهد العثماني والروماني',
      fr: 'Histoire millénaire, zellige raffiné, vestiges romains et ruelles historiques',
      en: 'Centuries of history, intricate zellige, Roman ruins, and historic medinas',
    },
    paper: '#FAF7F4',
    ink: '#201919',
    inkMuted: '#625252',
    accent: '#855246', // Terracotta Tile Earth
    accentLight: '#F2E7E5',
    accentInk: '#4D1B24', // Casbah Velvet Pomegranate
    ruleColor: '#DDD0CD',
    scrim: 'linear-gradient(to top, rgba(32, 25, 25, 0.96) 0%, rgba(77, 27, 36, 0.45) 60%, transparent 100%)',
    cardBg: '#FFFFFF',
    fonts: {
      arabicDisplay: 'Amiri, serif',
      arabicText: 'Cairo, serif',
      latinDisplay: 'Playfair Display, serif',
      latinText: 'Outfit, sans-serif',
    },
    borderRadius: '2px',
    ornamentStyle: 'heritage',
  },
};

/**
 * Returns the effective theme tokens, merging preset theme with any custom brand colors
 * extracted from the magazine logo or configured by the user.
 */
export function getEffectiveTheme(issue: { themeId: ThemeId; brandColors?: { primary: string; secondary: string; paper?: string; accentLight?: string; ink?: string } }): ThemeTokens {
  const base = THEMES[issue.themeId] || THEMES['tahwas-sahara'];
  if (!issue.brandColors) return base;

  const { primary, secondary, paper, accentLight, ink } = issue.brandColors;
  return {
    ...base,
    accent: secondary || base.accent,
    accentInk: primary || base.accentInk,
    accentLight: accentLight || `${secondary}20`,
    paper: paper || base.paper,
    ink: ink || base.ink,
    ruleColor: secondary ? `${secondary}33` : base.ruleColor,
    scrim: primary
      ? `linear-gradient(to top, ${primary}F2 0%, ${primary}66 50%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.6) 100%)`
      : base.scrim,
  };
}

