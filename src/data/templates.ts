import { ArticleTemplateId, CoverTemplateId } from '../types';

export interface ArticleTemplateInfo {
  id: ArticleTemplateId;
  name: { ar: string; fr: string; en: string };
  description: { ar: string; fr: string; en: string };
  minImages: number;
  maxImages: number;
  wordRange: { min: number; max: number };
  spreadOpener: boolean;
  bestFor: string;
}

export const ARTICLE_TEMPLATES: ArticleTemplateInfo[] = [
  {
    id: 'opener-hero',
    name: {
      ar: 'افتتاحية صورة كاملة (Hero Opener)',
      fr: 'Ouverture Grande Photo',
      en: 'Hero Image Opener',
    },
    description: {
      ar: 'صفحة صورة كاملة مع عنوان فخم ونص تمهيدي، متبوعة بصفحات النص',
      fr: 'Page photo pleine page avec titre prestigieux puis texte',
      en: 'Full-bleed hero photo page with bold title overlay, followed by text',
    },
    minImages: 1,
    maxImages: 4,
    wordRange: { min: 400, max: 2500 },
    spreadOpener: false,
    bestFor: 'التحقيقات الكبرى والوجهات السياحية الرئيسية',
  },
  {
    id: 'opener-spread',
    name: {
      ar: 'سبريد مزدوج بانورامي (Panoramic Spread)',
      fr: 'Double Page Panoramique',
      en: 'Panoramic Spread Opener',
    },
    description: {
      ar: 'افتتاحية عبر صفحتين متقابلتين تمتد الصورة عبرهما مع كتلة العنوان على اليمين/اليسار',
      fr: 'Ouverture sur deux pages en vis-à-vis avec photo panoramique',
      en: 'Double-page spread with sweeping panorama and title block',
    },
    minImages: 1,
    maxImages: 5,
    wordRange: { min: 600, max: 3000 },
    spreadOpener: true,
    bestFor: 'مناظر الصحراء الشاسعة والمدن الساحلية الكبرى',
  },
  {
    id: 'split-half',
    name: {
      ar: 'مناصفة صورة ونص (Split Half)',
      fr: 'Moitié Photo / Moitié Texte',
      en: 'Split Half Image & Text',
    },
    description: {
      ar: 'توازن بصري متناسق: نصف الصفحة للصورة والنصف الآخر للنص وصندوق الحقائق',
      fr: 'Équilibre parfait : moitié photo, moitié récit et encadré voyage',
      en: 'Balanced half-image, half-narrative layout with facts box',
    },
    minImages: 1,
    maxImages: 3,
    wordRange: { min: 300, max: 1200 },
    spreadOpener: false,
    bestFor: 'المقالات الاستطلاعية المعتدلة واكتشاف المعالم',
  },
  {
    id: 'classic-2col',
    name: {
      ar: 'عمودان تحريريان كلاسيكيان (Classic 2-Column)',
      fr: 'Deux Colonnes Classique',
      en: 'Classic 2-Column Feature',
    },
    description: {
      ar: 'إخراج صحفي تقليدي بعمودين مع حزام علوي للصور واقتباس وسطي أنيق',
      fr: 'Mise en page éditoriale à 2 colonnes avec bandeau photo et citation',
      en: 'Editorial 2-column flow with top image header and centered pull quote',
    },
    minImages: 1,
    maxImages: 6,
    wordRange: { min: 500, max: 2200 },
    spreadOpener: false,
    bestFor: 'المقالات التوثيقية والرحلات الاستكشافية المعمقة',
  },
  {
    id: 'single-column-longform',
    name: {
      ar: 'مقال مطول عمود واحد (Longform Story)',
      fr: 'Grand Récit Colonne Unique',
      en: 'Single Column Longform',
    },
    description: {
      ar: 'هوامش واسعة وقراءة مريحة مع أحرف استهلالية واقتباسات بارزة على الجانب',
      fr: 'Marges généreuses, lecture immersive et exergues latérales',
      en: 'Generous margins, immersive reading typography, side quotes',
    },
    minImages: 1,
    maxImages: 4,
    wordRange: { min: 600, max: 2800 },
    spreadOpener: false,
    bestFor: 'يوميات الرحالة، السير التراثية واللقاءات الشخصية',
  },
  {
    id: 'photo-essay',
    name: {
      ar: 'استطلاع مصور (Photo Essay Gallery)',
      fr: 'Reportage Photo / Galerie',
      en: 'Photo Essay Gallery',
    },
    description: {
      ar: 'شبكة فنية من 3 إلى 6 صور مع بطاقات الشرح وحواشي مختصرة ومقدمة موجزة',
      fr: 'Grille artistique de 3 à 6 photographies avec légendes détaillées',
      en: 'Visual grid of 3 to 6 photographs with detailed captions',
    },
    minImages: 3,
    maxImages: 8,
    wordRange: { min: 150, max: 800 },
    spreadOpener: false,
    bestFor: 'معارض الصور، الصناعات التقليدية، الآثار والفنون الشعبية',
  },
  {
    id: 'full-image-page',
    name: {
      ar: 'صفحة صورة كاملة استراحة (Full Image Page)',
      fr: 'Pleine Page Photo Respiration',
      en: 'Full Image Pacing Page',
    },
    description: {
      ar: 'صورة واحدة ساحرة تغطي كامل الصفحة مع تعليق سفلي أنيق لضبط إيقاع المجلة',
      fr: 'Une seule photo saisissante pour rythmer la lecture',
      en: 'Single striking full-bleed photo giving visual pause to the issue',
    },
    minImages: 1,
    maxImages: 2,
    wordRange: { min: 50, max: 300 },
    spreadOpener: false,
    bestFor: 'اللقطات الفوتوغرافية الاستثنائية والبورتريهات التراثية',
  },
  {
    id: 'pullquote-feature',
    name: {
      ar: 'مقال الاقتباس البارز (Pull Quote Focus)',
      fr: 'Article Focus Citation',
      en: 'Pull Quote Feature',
    },
    description: {
      ar: 'اقتباس عريض بخط جمالي يشغل ثلث الصفحة كعنصر تصميمي مركزي',
      fr: 'Grande citation calligraphique occupant un tiers de page',
      en: 'Large calligraphic pull quote anchoring the editorial spread',
    },
    minImages: 1,
    maxImages: 3,
    wordRange: { min: 350, max: 1500 },
    spreadOpener: false,
    bestFor: 'المقالات الأدبية، انطباعات السياح والشهادات التراثية',
  },
  {
    id: 'brief-pair',
    name: {
      ar: 'مقالان موجزان في صفحة (Briefs Pair)',
      fr: 'Duo de Brèves',
      en: 'Briefs Pair',
    },
    description: {
      ar: 'موضعان قصيران مقسمان أفقياً أو عمودياً في صفحة واحدة مع صور مصغرة',
      fr: 'Deux sujets courts partagés sur une même page',
      en: 'Two short pieces shared on a single page with small images',
    },
    minImages: 1,
    maxImages: 3,
    wordRange: { min: 100, max: 500 },
    spreadOpener: false,
    bestFor: 'أخبار السياحة السريعة، إرشادات السفر والمهرجانات',
  },
  {
    id: 'interview-qa',
    name: {
      ar: 'حوار ولقاء صحفي (Interview Q&A)',
      fr: 'Interview & Rencontre',
      en: 'Interview Q&A',
    },
    description: {
      ar: 'تصميم مخصص للأسئلة والأجوبة مع تمييز أسماء المتحدثين وبورتريه الضيف',
      fr: 'Format questions/réponses avec mise en avant du portrait de l’invité',
      en: 'Question and answer layout with speaker markers and guest portrait',
    },
    minImages: 1,
    maxImages: 4,
    wordRange: { min: 400, max: 2000 },
    spreadOpener: false,
    bestFor: 'لقاءات وزراء السياحة، الحرفيين، الرحالة وأصحاب الفنادق',
  },
  {
    id: 'guide-list',
    name: {
      ar: 'دليل الوجهات والعناوين (Guide & Top List)',
      fr: 'Guide Pratique & Top Adresses',
      en: 'Travel Guide & Top List',
    },
    description: {
      ar: 'قوائم رقمية جذابة: أفضل 5 فنادق، مطاعم، شواطئ أو مسارات مشي',
      fr: 'Listes numérotées pratiques : hôtels, restaurants, plages ou circuits',
      en: 'Numbered curated lists for hotels, restaurants, viewpoints, or trails',
    },
    minImages: 2,
    maxImages: 6,
    wordRange: { min: 300, max: 1600 },
    spreadOpener: false,
    bestFor: 'أدلة السفر العملية وقوائم التوصيات السياحية',
  },
];

export interface CoverTemplateInfo {
  id: CoverTemplateId;
  name: { ar: string; fr: string; en: string };
  description: { ar: string; fr: string; en: string };
  hasFraming: boolean;
}

export const COVER_TEMPLATES: CoverTemplateInfo[] = [
  {
    id: 'tahwas-signature',
    name: {
      ar: 'غلاف تحواس براس الأصيل (Tahwas Signature)',
      fr: 'Signature Tahwas Presse',
      en: 'Tahwas Presse Signature',
    },
    description: {
      ar: 'الترويسة الأصلية لتحواس براس مع شعار الواحة والبوصلة وأشرطة العناوين الذهبية',
      fr: 'En-tête officiel Tahwas Presse avec emblème oasis, boussole et bandeaux or',
      en: 'Official Tahwas Presse masthead with oasis compass emblem and gold banners',
    },
    hasFraming: false,
  },
  {
    id: 'hero-full',
    name: {
      ar: 'صورة بانورامية ممتدة (Full Bleed Hero)',
      fr: 'Plein Cadre Spectaculaire',
      en: 'Full Bleed Spectacle',
    },
    description: {
      ar: 'صورة كاملة الحجم تغطي الغلاف بالكامل مع ترويسة شفافة وعناوين متباينة',
      fr: 'Photo plein écran majestueuse avec titre contrasté et sous-titres épurés',
      en: 'Full edge-to-edge photo with subtle scrim gradient and crisp typography',
    },
    hasFraming: false,
  },
  {
    id: 'framed-editorial',
    name: {
      ar: 'إطار كلاسيكي فاخر (Framed Luxury)',
      fr: 'Cadre Éditorial Raffiné',
      en: 'Framed Luxury Editorial',
    },
    description: {
      ar: 'إطار هندسي بلون السمة يحيط بالصورة المركزية ليعطي هيبة المجلات الفاخرة',
      fr: 'Bordure élégante encadrant la photo centrale façon magazine d’art',
      en: 'Refined border framing the central photo with high-end magazine prestige',
    },
    hasFraming: true,
  },
  {
    id: 'split-modern',
    name: {
      ar: 'تقسيم لوني عصري (Split Color Block)',
      fr: 'Bloc Couleur & Photo',
      en: 'Modern Color Split',
    },
    description: {
      ar: 'كتلة لونية صلبة في الجزء العلوي للترويسة وصورة عريضة في الجزء السفلي',
      fr: 'Bloc de couleur plein en haut pour le titre et photo forte en bas',
      en: 'Solid accent color block for the masthead paired with a punchy lower photo',
    },
    hasFraming: false,
  },
  {
    id: 'minimal-bold',
    name: {
      ar: 'طباعة عريضة عصرية (Minimal Bold)',
      fr: 'Typographie Forte Minimale',
      en: 'Minimalist Bold Type',
    },
    description: {
      ar: 'تركيز فائق على الطباعة العريضة الأنيقة مع مساحات تنفس بيضاء وتفاصيل راقية',
      fr: 'Typographie imposante et épurée, grand impact visuel moderne',
      en: 'Heavy display typography, confident negative space, and refined details',
    },
    hasFraming: false,
  },
  {
    id: 'magazine-panoramic',
    name: {
      ar: 'مجلة السفر العالمية (Global Travel Style)',
      fr: 'Style Grand Reportage Mondial',
      en: 'Global Geographic Style',
    },
    description: {
      ar: 'طراز مجلات السفر العالمية الكبرى مع شريط جانبي لعناوين المقالات والعدد',
      fr: 'Style des grands magazines géographiques internationaux',
      en: 'International travel publication style with side feature stack and issue band',
    },
    hasFraming: true,
  },
];
