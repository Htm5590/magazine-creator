import { PageDimensions, AdFormat, Ad } from '../types';

export interface AdGeometry {
  widthMm: number;
  heightMm: number;
  recommendedPixelsWeb: { width: number; height: number };
  recommendedPixelsHigh: { width: number; height: number };
}

/**
 * Computes exact ad dimensions dynamically from page size and margins (Appendix A)
 * Never hardcodes millimetres!
 */
export function computeAdGeometry(format: AdFormat, page: PageDimensions): AdGeometry {
  const W = page.widthMm;
  const H = page.heightMm;
  const mi = page.marginInnerMm;
  const mo = page.marginOuterMm;
  const mt = page.marginTopMm;
  const mb = page.marginBottomMm;
  const g = page.gutterMm;

  const TW = W - mi - mo; // Type area width
  const TH = H - mt - mb; // Type area height

  let widthMm = W;
  let heightMm = H;

  switch (format) {
    case 'cover-back':
    case 'cover-inside-front':
    case 'cover-inside-back':
    case 'full':
      widthMm = W;
      heightMm = H;
      break;

    case 'spread':
      widthMm = W * 2;
      heightMm = H;
      break;

    case 'half-h':
      widthMm = TW;
      heightMm = (TH - g) / 2;
      break;

    case 'half-v':
      widthMm = (TW - g) / 2;
      heightMm = TH;
      break;

    case 'quarter':
      widthMm = (TW - g) / 2;
      heightMm = (TH - g) / 2;
      break;

    case 'strip':
      widthMm = TW;
      heightMm = (TH - 2 * g) / 3;
      break;

    default:
      widthMm = TW;
      heightMm = TH;
  }

  // Recommended pixels: mm / 25.4 * DPI
  const toPixels = (mm: number, dpi: number) => Math.round((mm / 25.4) * dpi);

  return {
    widthMm: Math.round(widthMm * 10) / 10,
    heightMm: Math.round(heightMm * 10) / 10,
    recommendedPixelsWeb: {
      width: toPixels(widthMm, 150),
      height: toPixels(heightMm, 150),
    },
    recommendedPixelsHigh: {
      width: toPixels(widthMm, 220),
      height: toPixels(heightMm, 220),
    },
  };
}

export interface CompositePagePlan {
  id: string;
  slots: { adId: string; format: AdFormat }[];
  isComplete: boolean;
}

/**
 * Composite Ad Packer:
 * Groups fractional ads (half-h, half-v, quarter, strip) into composite ad pages.
 */
export function packFractionalAds(ads: Ad[]): CompositePagePlan[] {
  const fractional = ads.filter(
    (a) => a.format === 'half-h' || a.format === 'half-v' || a.format === 'quarter' || a.format === 'strip'
  );

  const plans: CompositePagePlan[] = [];
  const visited = new Set<string>();

  // 1. Pack 2x half-h
  const halfH = fractional.filter((a) => a.format === 'half-h');
  for (let i = 0; i < halfH.length; i += 2) {
    if (i + 1 < halfH.length) {
      plans.push({
        id: `comp-half-h-${i}`,
        slots: [
          { adId: halfH[i].id, format: 'half-h' },
          { adId: halfH[i + 1].id, format: 'half-h' },
        ],
        isComplete: true,
      });
      visited.add(halfH[i].id);
      visited.add(halfH[i + 1].id);
    }
  }

  // 2. Pack 2x half-v
  const halfV = fractional.filter((a) => a.format === 'half-v');
  for (let i = 0; i < halfV.length; i += 2) {
    if (i + 1 < halfV.length) {
      plans.push({
        id: `comp-half-v-${i}`,
        slots: [
          { adId: halfV[i].id, format: 'half-v' },
          { adId: halfV[i + 1].id, format: 'half-v' },
        ],
        isComplete: true,
      });
      visited.add(halfV[i].id);
      visited.add(halfV[i + 1].id);
    }
  }

  // 3. Pack 4x quarters
  const quarters = fractional.filter((a) => a.format === 'quarter');
  for (let i = 0; i < quarters.length; i += 4) {
    if (i + 3 < quarters.length) {
      plans.push({
        id: `comp-quarters-${i}`,
        slots: [
          { adId: quarters[i].id, format: 'quarter' },
          { adId: quarters[i + 1].id, format: 'quarter' },
          { adId: quarters[i + 2].id, format: 'quarter' },
          { adId: quarters[i + 3].id, format: 'quarter' },
        ],
        isComplete: true,
      });
      for (let j = 0; j < 4; j++) visited.add(quarters[i + j].id);
    }
  }

  // Remaining fractional ads grouped as mixed composite pages
  const remaining = fractional.filter((a) => !visited.has(a.id));
  if (remaining.length > 0) {
    plans.push({
      id: `comp-misc-remaining`,
      slots: remaining.map((a) => ({ adId: a.id, format: a.format })),
      isComplete: remaining.length >= 2,
    });
  }

  return plans;
}
