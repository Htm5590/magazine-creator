/**
 * Core Type Definitions for Tahwas Presse - Tourism Magazine Studio (mag-studio)
 */

export type Lang = 'ar' | 'fr' | 'en';
export type Dir = 'rtl' | 'ltr';

export type PagePreset = 'a4' | 'tablet45' | 'letter' | 'square' | 'custom';

export interface PageDimensions {
  preset: PagePreset;
  widthMm: number;
  heightMm: number;
  marginInnerMm: number;
  marginOuterMm: number;
  marginTopMm: number;
  marginBottomMm: number;
  gutterMm: number;
}

export type ThemeId =
  | 'tahwas-sahara'
  | 'coastal'
  | 'desert'
  | 'metropolis'
  | 'alpine-nature'
  | 'heritage';

export interface ThemeTokens {
  id: ThemeId;
  name: { ar: string; fr: string; en: string };
  description: { ar: string; fr: string; en: string };
  paper: string;
  ink: string;
  inkMuted: string;
  accent: string;
  accentLight: string;
  accentInk: string;
  ruleColor: string;
  scrim: string;
  cardBg: string;
  fonts: {
    arabicDisplay: string;
    arabicText: string;
    latinDisplay: string;
    latinText: string;
  };
  borderRadius: string;
  ornamentStyle: 'sahara' | 'geometric' | 'classic' | 'minimal' | 'nature' | 'heritage';
}

export interface TravelFacts {
  destination: string;
  region: string;
  bestTime: string;
  duration: string;
  budget: 'budget' | 'medium' | 'luxury';
  howToReach: string;
  climateTip: string;
  currency: string;
  languages: string;
  customNotes?: string;
}

export interface ArticleImage {
  id: string;
  url: string;
  role: 'hero' | 'inline' | 'gallery' | 'sidebar';
  caption?: string;
  credit?: string;
  alt?: string;
  order: number;
  focalPoint?: { x: number; y: number }; // 0 to 1
  widthPx?: number;
  heightPx?: number;
}

export type ArticleLayoutId = 'full-text' | 'image-text' | 'two-columns';

export type ArticleTemplateId =
  | 'full-text'
  | 'image-text'
  | 'two-columns'
  | 'opener-hero'
  | 'opener-spread'
  | 'split-half'
  | 'classic-2col'
  | 'single-column-longform'
  | 'photo-essay'
  | 'full-image-page'
  | 'pullquote-feature'
  | 'brief-pair'
  | 'interview-qa'
  | 'guide-list';

export interface ArticleLayoutOption {
  id: ArticleLayoutId;
  name: string;
  nameEn: string;
  description: string;
  tag: string;
}

export const ARTICLE_LAYOUT_OPTIONS: ArticleLayoutOption[] = [
  {
    id: 'full-text',
    name: 'نص كامل',
    nameEn: 'Full Text',
    description: 'تركيز كامل على السرد التحريري مع حرف استهلالي مكبر واقتباس أنيق، مثالي للمقالات الأدبية والتقارير المعمقة.',
    tag: 'قراءة مريحة',
  },
  {
    id: 'image-text',
    name: 'صورة مع نص',
    nameEn: 'Image & Text',
    description: 'صورة بانورامية بارزة مع بطاقة الوجهة تليها فقرات المقال وصندوق السفر، مثالي للاستطلاعات البصرية واستكشاف المعالم.',
    tag: 'بصري متوازن',
  },
  {
    id: 'two-columns',
    name: 'عمودين',
    nameEn: 'Two Columns',
    description: 'تخطيط صحفي كلاسيكي بعمودين متوازيين مع توازن هندسي بين الفقرات وصندوق المعلومات والاقتباس.',
    tag: 'صحفي كلاسيكي',
  },
];

export function normalizeArticleLayout(templateId?: string): ArticleLayoutId {
  if (!templateId) return 'two-columns';
  if (templateId === 'full-text' || templateId === 'single-column-longform') return 'full-text';
  if (
    templateId === 'image-text' ||
    templateId === 'split-half' ||
    templateId === 'opener-hero' ||
    templateId === 'photo-essay' ||
    templateId === 'opener-spread'
  ) {
    return 'image-text';
  }
  return 'two-columns';
}

export interface Article {
  id: string;
  category?: string; // تصنيف المقال (مثل: سياحة داخلية، تقارير، استكشاف، تراث)
  kicker: string;
  title: string;
  subtitle?: string;
  byline?: string;
  lang: Lang;
  dir: Dir;
  body: string; // Plain text or HTML markdown preserving author integrity
  pullQuotes: string[];
  facts?: TravelFacts;
  images: ArticleImage[];
  templateId: ArticleTemplateId;
  estimatedPages: number;
  wordCount: number;
}

export type AdFormat =
  | 'cover-back'
  | 'cover-inside-front'
  | 'cover-inside-back'
  | 'full'
  | 'spread'
  | 'half-h'
  | 'half-v'
  | 'quarter'
  | 'strip';

export interface AdDesignedFields {
  headline: string;
  body: string;
  callToAction: string;
  advertiserName: string;
  phone?: string;
  website?: string;
  qrCodeUrl?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  logoUrl?: string;
  bgImageUrl?: string;
  categoryTag?: string;
}

export interface Ad {
  id: string;
  advertiser: string;
  format: AdFormat;
  sourceType: 'upload' | 'designed';
  artworkUrl?: string;
  designedFields?: AdDesignedFields;
  url?: string;
  advertorial?: boolean; // Small "إعلان / Publicité" marker
  positionPreference?: 'anywhere' | 'front' | 'middle' | 'back' | 'pinned';
  pinnedPage?: number;
  notes?: string;
}

export type CoverTemplateId =
  | 'hero-full'
  | 'framed-editorial'
  | 'split-modern'
  | 'minimal-bold'
  | 'tahwas-signature'
  | 'magazine-panoramic';

export interface CoverLine {
  id: string;
  text: string;
  subtitle?: string; // عنوان فرعي أو سطر وصفي شارح تحت العنوان
  imageUrl?: string; // صورة مصغرة للموضوع على الغلاف
  articleId?: string;
  category?: string;
  position?: 'auto' | 'right' | 'left' | 'top' | 'bottom';
}

export interface Cover {
  templateId: CoverTemplateId;
  photoUrl: string;
  photoFocal?: { x: number; y: number };
  mastheadTitle: string;
  headline: string;
  tagline: string;
  lines: CoverLine[];
  price?: string;
  website?: string;
  barcode?: string;
  editionLabel?: string;
  accentColor?: string;
  contrastScrim: boolean;
  backCoverType: 'ad' | 'closing-page';
  backCoverAdId?: string;
  backCoverMessage?: {
    title: string;
    description: string;
    website?: string;
    socialHandle?: string;
    nextIssueTeaser?: string;
  };
}

export interface FrontMatter {
  showToc: boolean;
  tocTitle: string;
  showEditorNote: boolean;
  editorNoteTitle: string;
  editorName: string;
  editorRole: string;
  editorPhotoUrl?: string;
  editorNoteBody: string;
  showMasthead: boolean;
  mastheadRoles: { role: string; name: string }[];
}

export interface SequenceItem {
  id: string;
  itemType: 'cover' | 'frontMatter' | 'article' | 'ad' | 'composite-ad' | 'filler' | 'backCover';
  refId: string; // articleId or adId or 'toc' or 'editor-note'
  title: string;
  pageCount: number;
  startPage?: number;
  pinned?: boolean;
  subItems?: { adId: string; format: AdFormat }[];
  attachedAdId?: string; // Optional half-page ad placed on the same page with this article
  layoutVariation?: 'standard' | 'article-with-bottom-ad' | 'article-with-top-ad';
}

export interface ShuffleRules {
  minEditorialBetweenAds: number;
  allowAdjacentAds: boolean;
  respectPositions: boolean;
  ensureEvenPages: boolean;
}

export interface PreflightItem {
  id: string;
  severity: 'blocking' | 'warning' | 'info';
  title: string;
  description: string;
  stepTarget: number;
  targetId?: string;
}

export interface ProofFlag {
  id: string;
  articleId: string;
  quote: string;
  kind: 'spelling' | 'grammar' | 'punctuation' | 'repetition';
  message: string;
  suggestion?: string;
  dismissed?: boolean;
}

export interface Snapshot {
  id: string;
  timestamp: string;
  label: string;
  issue: Issue;
}

export interface BrandCustomColors {
  primary: string;
  secondary: string;
  paper?: string;
  accentLight?: string;
  ink?: string;
}

export interface Issue {
  id: string;
  magazineName: string;
  logoUrl?: string;
  brandColors?: BrandCustomColors;
  number: string;
  title: string;
  date: string;
  price?: string;
  website?: string;
  barcode?: string;
  defaultLang: Lang;
  defaultDir: Dir;
  page: PageDimensions;
  themeId: ThemeId;
  articles: Article[];
  ads: Ad[];
  cover: Cover;
  frontMatter: FrontMatter;
  sequence: SequenceItem[];
  includeAdsInIssue?: boolean; // When false, the magazine is published as an ad-free editorial edition
  shuffleSeed: number;
  status: 'draft' | 'ready' | 'exported';
  createdAt: string;
  updatedAt: string;
}
