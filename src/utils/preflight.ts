import { Issue, PreflightItem } from '../types';

/**
 * Runs comprehensive preflight inspection before export (§6.13)
 */
export function runPreflight(issue: Issue): PreflightItem[] {
  const items: PreflightItem[] = [];

  // 1. Blocking Checks
  if (issue.sequence.length === 0) {
    items.push({
      id: 'block-no-items',
      severity: 'blocking',
      title: 'العدد فارغ تماماً',
      description: 'يجب إضافة مقالات وإعلانات لتوليد المجلة.',
      stepTarget: 2,
    });
  }

  if (!issue.cover.photoUrl) {
    items.push({
      id: 'block-cover-photo',
      severity: 'blocking',
      title: 'صورة الغلاف مفقودة',
      description: 'يرجى اختيار صورة رئيسية لغلاف المجلة في استوديو الغلاف.',
      stepTarget: 5,
    });
  }

  issue.articles.forEach((art) => {
    if (!art.title.trim()) {
      items.push({
        id: `block-art-title-${art.id}`,
        severity: 'blocking',
        title: `مقال بدون عنوان`,
        description: 'هناك مقال يفتقد إلى العنوان الرئيسي.',
        stepTarget: 2,
        targetId: art.id,
      });
    }
    if (!art.body.trim()) {
      items.push({
        id: `block-art-body-${art.id}`,
        severity: 'blocking',
        title: `مقال بدون محتوى: "${art.title}"`,
        description: 'يجب إدخال نص المقال قبل التصدير.',
        stepTarget: 2,
        targetId: art.id,
      });
    }
  });

  // 2. Warnings
  const totalPages = issue.sequence.reduce((sum, item) => sum + item.pageCount, 0);
  if (totalPages % 2 !== 0) {
    items.push({
      id: 'warn-odd-pages',
      severity: 'warning',
      title: `عدد صفحات المجلة فردي (${totalPages} صفحة)`,
      description: 'تتطلب المجلات زوجاً متكافئاً من الصفحات لضبط السبريدات المتقابلة. يوصى بإضافة صفحة ختامية أو إعلان إضافي.',
      stepTarget: 4,
    });
  }

  // Check spread ads parity
  issue.sequence.forEach((item) => {
    if (item.itemType === 'ad' && item.pageCount >= 2 && item.startPage && item.startPage % 2 !== 0) {
      items.push({
        id: `warn-spread-parity-${item.id}`,
        severity: 'warning',
        title: `إعلان سبريد مزدوج في صفحة فردية (${item.startPage})`,
        description: `إعلان "${item.title}" يحتاج أن يبدأ في صفحة زوجية ليظهر كصفحتين متقابلتين طبيعياً.`,
        stepTarget: 4,
        targetId: item.id,
      });
    }
  });

  // Check image credits
  let missingCreditsCount = 0;
  issue.articles.forEach((art) => {
    art.images.forEach((img) => {
      if (!img.credit) missingCreditsCount++;
    });
  });
  if (missingCreditsCount > 0) {
    items.push({
      id: 'warn-missing-credits',
      severity: 'warning',
      title: `${missingCreditsCount} صور تفتقر إلى حقوق التصوير والمصدر`,
      description: 'يُنصح بذكر اسم المصور أو أرشيف الصور لكل صورة لضمان الاحترافية.',
      stepTarget: 2,
    });
  }

  // 3. Info & Statistics
  const totalWords = issue.articles.reduce((sum, a) => sum + a.wordCount, 0);
  const readingTimeMin = Math.max(1, Math.round(totalWords / 200));
  const adPages = issue.sequence
    .filter((s) => s.itemType === 'ad' || s.itemType === 'composite-ad' || s.itemType === 'backCover')
    .reduce((sum, s) => sum + s.pageCount, 0);
  const adRatio = Math.round((adPages / Math.max(1, totalPages)) * 100);

  items.push({
    id: 'info-stats',
    severity: 'info',
    title: `إحصائيات العدد: ${totalPages} صفحة و ${issue.articles.length} مقالات`,
    description: `إجمالي الكلمات: ${totalWords.toLocaleString()} كلمة • زمن القراءة المقدر: ${readingTimeMin} دقيقة • نسبة الإعلانات: ${adRatio}% (${adPages} صفحات إعلانية)`,
    stepTarget: 6,
  });

  return items;
}
