import { BrandCustomColors } from '../types';

export interface ExtractedPalette extends BrandCustomColors {
  name: string;
}

export const TOURISM_LOGO_PRESETS = [
  {
    id: 'tahwas-oasis',
    name: 'أخضر الواحات والبرونز الصحراوي (تحواس الأصلي الفاخر)',
    description: 'شعار واحة النخيل وبوصلة الترحال الجزائرية',
    primary: '#16382C',
    secondary: '#9E7438',
    paper: '#FAF7F2',
    accentLight: '#F4EFE6',
    ink: '#1B1E1C',
    svgType: 'palm-compass',
  },
  {
    id: 'sahara-gazelle',
    name: 'غزال الهقار والرمل الذهبي العتيق',
    description: 'شعار غزال الرمال وشمس طاسيلي الدافئة',
    primary: '#5E2F1B',
    secondary: '#B5884B',
    paper: '#FAF6F0',
    accentLight: '#F5ECE1',
    ink: '#221B17',
    svgType: 'gazelle',
  },
  {
    id: 'casbah-heritage',
    name: 'عنابي القصبة والزليج الأندلسي الرصين',
    description: 'شعار أقواس وقصور القصبة المحروسة',
    primary: '#4D1B24',
    secondary: '#8C5648',
    paper: '#FAF7F4',
    accentLight: '#F3E8E6',
    ink: '#201919',
    svgType: 'arch',
  },
  {
    id: 'mediterranean-blue',
    name: 'كحلي المتوسط الرصين وشواطئ وهران',
    description: 'شعار أمواج المتوسط ونوارس الساحل',
    primary: '#1A374D',
    secondary: '#2D6682',
    paper: '#F7F9FA',
    accentLight: '#E9EFF3',
    ink: '#141C22',
    svgType: 'waves',
  },
  {
    id: 'djurdjura-nature',
    name: 'أخضر جرجرة الصنوبري وسكون الأطلس',
    description: 'شعار قمم الأطلس وغابات الأرز والطيور الحرة',
    primary: '#1B3B28',
    secondary: '#4C6E52',
    paper: '#F7F8F5',
    accentLight: '#E8EFE9',
    ink: '#152018',
    svgType: 'mountain',
  },
  {
    id: 'timimoun-terracotta',
    name: 'طين تيميمون الأحمر التحريري وقصور القورارة',
    description: 'شعار القصور الطينية الحمراء ونخيل الصحراء',
    primary: '#69331C',
    secondary: '#9E6436',
    paper: '#FAF6F1',
    accentLight: '#F5EBE1',
    ink: '#241B15',
    svgType: 'ksar',
  },
];

/**
 * Extracts dominant colors from an image URL or base64 data URL using an HTML5 Canvas.
 */
export async function extractColorsFromImage(imageUrl: string): Promise<BrandCustomColors> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(TOURISM_LOGO_PRESETS[0]);
        }

        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        const colorCounts: Record<string, { r: number; g: number; b: number; count: number; sat: number; brightness: number }> = {};

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Skip transparent or near-white / near-black pixels for dominant color
          if (a < 128) continue;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness > 245 || brightness < 15) continue;

          // Simple saturation calculation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;

          // Quantize color to 32 steps
          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;
          const key = `${qr},${qg},${qb}`;

          if (!colorCounts[key]) {
            colorCounts[key] = { r: qr, g: qg, b: qb, count: 0, sat, brightness };
          }
          colorCounts[key].count++;
        }

        const colors = Object.values(colorCounts).sort((a, b) => {
          // Weight by frequency and saturation
          const scoreA = a.count * (1 + a.sat * 2);
          const scoreB = b.count * (1 + b.sat * 2);
          return scoreB - scoreA;
        });

        if (colors.length === 0) {
          return resolve(TOURISM_LOGO_PRESETS[0]);
        }

        const primaryRgb = colors[0];
        const secondaryRgb = colors.length > 1 ? colors[1] : colors[0];

        const toHex = (c: { r: number; g: number; b: number }) =>
          `#${[c.r, c.g, c.b].map((x) => Math.min(255, Math.max(0, x)).toString(16).padStart(2, '0')).join('')}`;

        const primaryHex = toHex(primaryRgb);
        let secondaryHex = toHex(secondaryRgb);

        if (secondaryHex === primaryHex) {
          secondaryHex = '#D97706'; // default Sahara gold fallback
        }

        resolve({
          primary: primaryHex,
          secondary: secondaryHex,
          paper: '#FAF8F5',
          accentLight: '#FEF3C7',
          ink: '#1A211D',
        });
      } catch (err) {
        console.warn('Canvas color extraction failed, falling back to default:', err);
        resolve(TOURISM_LOGO_PRESETS[0]);
      }
    };

    img.onerror = () => {
      resolve(TOURISM_LOGO_PRESETS[0]);
    };

    img.src = imageUrl;
  });
}
