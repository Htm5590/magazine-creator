import { ProofFlag, Article } from '../types';

/**
 * Local Proofreading Engine (§6.11)
 * Strictly READ-ONLY. Emits advisory flags only.
 * NEVER alters or mutates author's text.
 */
export function checkArticleText(article: Article): ProofFlag[] {
  const flags: ProofFlag[] = [];
  const text = `${article.title} ${article.subtitle || ''} ${article.body}`;

  // 1. Repeated words check (e.g. "في في", "the the", "de de")
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    const current = words[i].trim();
    const next = words[i + 1].trim();
    if (
      current.length > 1 &&
      current.toLowerCase() === next.toLowerCase() &&
      !/^[\d\W]+$/.test(current)
    ) {
      flags.push({
        id: `flag-rep-${article.id}-${i}`,
        articleId: article.id,
        quote: `${current} ${next}`,
        kind: 'repetition',
        message: `تكرار محتمل للكلمة: "${current}" مرتين متتاليتين`,
        suggestion: current,
      });
    }
  }

  // 2. Arabic punctuation spacing rules (e.g. space before comma/period in Arabic)
  const punctuationErrors = [
    { pattern: /\s+[،,\.؟\?!؛;:]/g, message: 'علامة ترقيم مسبوقة بفراغ غير ملائم' },
    { pattern: /[،,][^\s\d]/g, message: 'فاصلة غير متبوعة بمسافة فاصلة' },
    { pattern: /([أإآا])([أإآا]{2,})/g, message: 'تكرار غير مبرر لحروف المد' },
  ];

  punctuationErrors.forEach((rule, rIdx) => {
    let match;
    while ((match = rule.pattern.exec(text)) !== null) {
      if (flags.length < 15) {
        flags.push({
          id: `flag-punct-${article.id}-${rIdx}-${match.index}`,
          articleId: article.id,
          quote: match[0],
          kind: 'punctuation',
          message: rule.message,
        });
      }
    }
  });

  // 3. Common Tourism & Spelling Watchlist (Arabic and French/English)
  const commonTypos: { word: string; suggestion: string; lang: string }[] = [
    { word: 'انشالله', suggestion: 'إن شاء الله', lang: 'ar' },
    { word: 'لاكن', suggestion: 'لكن', lang: 'ar' },
    { word: 'هاذا', suggestion: 'هذا', lang: 'ar' },
    { word: 'هاذه', suggestion: 'هذه', lang: 'ar' },
    { word: 'الذى', suggestion: 'الذي', lang: 'ar' },
    { word: 'التى', suggestion: 'التي', lang: 'ar' },
    { word: 'اليونسكوو', suggestion: 'اليونسكو', lang: 'ar' },
    { word: 'algerie', suggestion: 'Algérie', lang: 'fr' },
    { word: 'tassili', suggestion: 'Tassili', lang: 'fr' },
  ];

  commonTypos.forEach((typo, tIdx) => {
    const regex = new RegExp(`\\b${typo.word}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      flags.push({
        id: `flag-spelling-${article.id}-${tIdx}-${match.index}`,
        articleId: article.id,
        quote: match[0],
        kind: 'spelling',
        message: `تنبيه إملائي: يُفضل كتابة "${typo.suggestion}" بدلاً من "${match[0]}"`,
        suggestion: typo.suggestion,
      });
    }
  });

  return flags;
}

export function checkIssueProofreading(articles: Article[]): ProofFlag[] {
  return articles.flatMap((art) => checkArticleText(art));
}
