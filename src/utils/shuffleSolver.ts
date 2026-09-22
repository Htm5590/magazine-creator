import { SequenceItem, ShuffleRules, Issue } from '../types';

/**
 * Seeded PRNG using Mulberry32 algorithm
 */
export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Re-indexes page numbers for a sequence of items
 */
export function recalculatePageNumbers(sequence: SequenceItem[]): SequenceItem[] {
  let currentPage = 1;
  return sequence.map((item) => {
    const updated = {
      ...item,
      startPage: currentPage,
    };
    currentPage += item.pageCount;
    return updated;
  });
}

export interface ConstraintViolation {
  code: string;
  message: { ar: string; fr: string; en: string };
  itemIds: string[];
  severity: 'warning' | 'error';
  autoFixable?: boolean;
}

/**
 * Validates magazine sequence against editorial constraints (§6.5)
 */
export function validateSequence(
  sequence: SequenceItem[],
  rules: ShuffleRules
): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  const indexed = recalculatePageNumbers(sequence);

  // 1. Check spread items start on even pages
  indexed.forEach((item) => {
    if (item.startPage && item.pageCount >= 2 && item.itemType === 'ad') {
      if (item.startPage % 2 !== 0) {
        violations.push({
          code: 'SPREAD_ODD_PAGE',
          message: {
            ar: `إعلان السبريد "${item.title}" يبدأ في صفحة فردية (${item.startPage}). يجب أن يبدأ في صفحة زوجية ليتوافق مع السبريد.`,
            fr: `L'annonce double page "${item.title}" commence sur une page impaire (${item.startPage}). Elle doit débuter sur une page paire.`,
            en: `Spread ad "${item.title}" starts on an odd page (${item.startPage}). It must start on an even page.`,
          },
          itemIds: [item.id],
          severity: 'error',
          autoFixable: true,
        });
      }
    }
  });

  // 2. Check no two adjacent full ads (if rule enabled)
  if (!rules.allowAdjacentAds) {
    for (let i = 0; i < indexed.length - 1; i++) {
      const cur = indexed[i];
      const next = indexed[i + 1];
      const isCurAd = cur.itemType === 'ad' || cur.itemType === 'composite-ad';
      const isNextAd = next.itemType === 'ad' || next.itemType === 'composite-ad';

      if (isCurAd && isNextAd && cur.itemType !== 'backCover' && next.itemType !== 'backCover') {
        violations.push({
          code: 'ADJACENT_ADS',
          message: {
            ar: `إعلانان متتاليان: "${cur.title}" و "${next.title}". يُفضل فصلهما بمقال تحريري لراحة القارئ.`,
            fr: `Deux annonces consécutives : "${cur.title}" et "${next.title}".`,
            en: `Two adjacent ads: "${cur.title}" and "${next.title}". Consider separating them with editorial content.`,
          },
          itemIds: [cur.id, next.id],
          severity: 'warning',
          autoFixable: true,
        });
      }
    }
  }

  // 3. Check total page count is even (for physical and PDF spread integrity)
  const totalPages = indexed.reduce((sum, item) => sum + item.pageCount, 0);
  if (rules.ensureEvenPages && totalPages % 2 !== 0) {
    violations.push({
      code: 'ODD_TOTAL_PAGES',
      message: {
        ar: `إجمالي صفحات العدد فردي (${totalPages} صفحة). تتطلب المجلات زوجاً متكافئاً من الصفحات لتناغم السبريدات.`,
        fr: `Le nombre total de pages est impair (${totalPages} pages). Un total pair est requis pour les doubles pages.`,
        en: `Total page count is odd (${totalPages} pages). Magazines require an even number of pages for spread alignment.`,
      },
      itemIds: [],
      severity: 'warning',
      autoFixable: true,
    });
  }

  return violations;
}

/**
 * Suggests an optimal editorial order based on rhythm and pacing (Heuristic)
 */
export function suggestEditorialOrder(issue: Issue): SequenceItem[] {
  // Partition items
  const cover = issue.sequence.find((s) => s.itemType === 'cover');
  const frontMatter = issue.sequence.find((s) => s.itemType === 'frontMatter');
  const backCover = issue.sequence.find((s) => s.itemType === 'backCover');

  const articles = [...issue.articles].sort((a, b) => {
    // Opener templates first, then long articles, then visual essays
    if (a.templateId === 'opener-hero' || a.templateId === 'opener-spread') return -1;
    if (b.templateId === 'opener-hero' || b.templateId === 'opener-spread') return 1;
    return b.wordCount - a.wordCount;
  });

  const ads = issue.includeAdsInIssue === false 
    ? [] 
    : issue.ads.filter((a) => a.format !== 'cover-back');

  const newSequence: SequenceItem[] = [];

  // Page 1: Cover
  if (cover) newSequence.push(cover);

  // Inside front cover ad (if any and ads enabled)
  if (issue.includeAdsInIssue !== false) {
    const insideFrontAd = ads.find((a) => a.format === 'cover-inside-front');
    if (insideFrontAd) {
      newSequence.push({
        id: `seq-ad-${insideFrontAd.id}`,
        itemType: 'ad',
        refId: insideFrontAd.id,
        title: `إعلان: ${insideFrontAd.advertiser}`,
        pageCount: 1,
        pinned: true,
      });
    }
  }

  // Page 3: TOC & Editor note
  if (frontMatter) newSequence.push(frontMatter);

  // Interleave articles and ads
  const remainingAds = issue.includeAdsInIssue === false
    ? []
    : ads.filter((a) => a.format !== 'cover-inside-front' && a.format !== 'cover-back');
  let adIdx = 0;

  articles.forEach((art, idx) => {
    newSequence.push({
      id: `seq-art-${art.id}`,
      itemType: 'article',
      refId: art.id,
      title: art.title,
      pageCount: art.estimatedPages,
    });

    // After every 2 articles or after a long opener, place an ad if available
    if (issue.includeAdsInIssue !== false && (idx === 0 || idx % 2 === 1) && adIdx < remainingAds.length) {
      const ad = remainingAds[adIdx++];
      newSequence.push({
        id: `seq-ad-${ad.id}`,
        itemType: 'ad',
        refId: ad.id,
        title: `إعلان: ${ad.advertiser}`,
        pageCount: ad.format === 'spread' ? 2 : 1,
      });
    }
  });

  // Remaining ads
  if (issue.includeAdsInIssue !== false) {
    while (adIdx < remainingAds.length) {
      const ad = remainingAds[adIdx++];
      newSequence.push({
        id: `seq-ad-${ad.id}`,
        itemType: 'ad',
        refId: ad.id,
        title: `إعلان: ${ad.advertiser}`,
        pageCount: ad.format === 'spread' ? 2 : 1,
      });
    }
  }

  // Back cover
  if (backCover) newSequence.push(backCover);

  return recalculatePageNumbers(newSequence);
}

/**
 * Shuffles unpinned editorial items with rules & seed (§6.5 and Appendix C)
 */
export function shuffleWithRules(
  currentSequence: SequenceItem[],
  rules: ShuffleRules,
  seed: number
): { sequence: SequenceItem[]; seed: number; repaired: boolean } {
  const rng = mulberry32(seed);

  // 1. Separate pinned/fixed vs free items
  const fixedPositions: { index: number; item: SequenceItem }[] = [];
  const freeItems: SequenceItem[] = [];

  currentSequence.forEach((item, index) => {
    if (
      item.pinned ||
      item.itemType === 'cover' ||
      item.itemType === 'frontMatter' ||
      item.itemType === 'backCover'
    ) {
      fixedPositions.push({ index, item });
    } else {
      freeItems.push(item);
    }
  });

  // 2. Fisher-Yates shuffle with seeded RNG
  for (let i = freeItems.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [freeItems[i], freeItems[j]] = [freeItems[j], freeItems[i]];
  }

  // 3. Reconstruct full sequence
  const combined: SequenceItem[] = [];
  let freeIdx = 0;

  for (let i = 0; i < currentSequence.length; i++) {
    const fixed = fixedPositions.find((fp) => fp.index === i);
    if (fixed) {
      combined.push(fixed.item);
    } else if (freeIdx < freeItems.length) {
      combined.push(freeItems[freeIdx++]);
    }
  }

  // Any remaining free items
  while (freeIdx < freeItems.length) {
    combined.splice(combined.length - 1, 0, freeItems[freeIdx++]);
  }

  // 4. Validate and apply local repair if needed (e.g. no adjacent ads)
  let result = recalculatePageNumbers(combined);
  let violations = validateSequence(result, rules);
  let repaired = false;

  if (violations.length > 0) {
    // Simple local swap repair
    for (let i = 1; i < result.length - 2; i++) {
      const cur = result[i];
      const next = result[i + 1];
      if (
        (cur.itemType === 'ad' || cur.itemType === 'composite-ad') &&
        (next.itemType === 'ad' || next.itemType === 'composite-ad') &&
        !cur.pinned &&
        !next.pinned
      ) {
        // Find next non-ad to swap
        const swapIdx = result.findIndex(
          (it, idx) => idx > i + 1 && it.itemType === 'article' && !it.pinned
        );
        if (swapIdx !== -1) {
          [result[i + 1], result[swapIdx]] = [result[swapIdx], result[i + 1]];
          repaired = true;
          break;
        }
      }
    }
    result = recalculatePageNumbers(result);
  }

  return {
    sequence: result,
    seed,
    repaired,
  };
}
