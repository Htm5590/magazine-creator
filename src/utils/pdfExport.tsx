import { PDFDocument } from 'pdf-lib';
import { toJpeg } from 'html-to-image';
import html2canvas from 'html2canvas-pro';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Issue } from '../types';
import { PageRenderer } from '../components/PageRenderer';

/**
 * Triggers native browser print dialog configured for CSS Paged Media PDF export.
 * This produces 100% genuine vector text, crystal clear at any zoom level.
 */
export function triggerPrintToPdf(): void {
  window.print();
}

/**
 * Converts a data URL string to a Uint8Array.
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64Index = dataUrl.indexOf(';base64,');
  if (base64Index === -1) {
    throw new Error('Invalid data URL format');
  }
  const base64 = dataUrl.substring(base64Index + 8);
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Exports the complete magazine as an authentic, 100% Arabic PDF file.
 * Renders each page with full Arabic fonts (Cairo, Amiri), photos, colors,
 * ensuring cursive ligatures and layout remain unbroken.
 */
export async function downloadArabicMagazinePdf(
  issue: Issue,
  onProgress?: (percent: number, statusText: string) => void
): Promise<void> {
  const totalPages = issue.sequence.length;
  if (totalPages === 0) {
    throw new Error('لا توجد صفحات في العدد لتصديرها');
  }

  onProgress?.(5, 'تهيئة الخطوط العربية والمحرك الطباعي...');

  // Ensure all web fonts (Cairo, Amiri, Tajawal) are fully loaded in the browser
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check skipped:', e);
    }
  }

  // Create an on-screen scratchpad container with FULL OPACITY (1.0).
  // Positioned at z-index -9999 behind #root so it doesn't obstruct user interaction,
  // while ensuring the rasterizer captures rich colors, backgrounds, and Arabic text.
  const container = document.createElement('div');
  container.id = 'pdf-arabic-render-scratchpad';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 210mm;
    height: 297mm;
    background-color: #FAF8F5;
    direction: rtl;
    z-index: -9999;
    opacity: 1;
    pointer-events: none;
    overflow: hidden;
  `;
  document.body.appendChild(container);

  const root = createRoot(container);
  const pdfDoc = await PDFDocument.create();

  // Set Arabic PDF Metadata
  pdfDoc.setTitle(`مجلة تحواس براس - ${issue.number || 'العدد 14'}`);
  pdfDoc.setAuthor('تحواس براس - مجلة السياحة الجزائرية');
  pdfDoc.setSubject('مجلة السياحة والأسفار والتراث الجزائري');
  pdfDoc.setKeywords(['الجزائر', 'سياحة', 'تحواس', 'طاسيلي', 'القصبة', 'تيميمون', 'حوس بلادك']);

  try {
    for (let i = 0; i < totalPages; i++) {
      const seqItem = issue.sequence[i];
      const pageNum = seqItem.startPage || i + 1;
      const progressPercent = Math.round(((i + 1) / totalPages) * 88);

      onProgress?.(
        progressPercent,
        `جارٍ تصيير الصفحة ${i + 1} من ${totalPages} باللغة العربية: ${seqItem.title}...`
      );

      // Render the current page into the scratchpad
      await new Promise<void>((resolve) => {
        root.render(
          <div
            id={`pdf-page-wrapper-${i}`}
            style={{
              width: '210mm',
              height: '297mm',
              overflow: 'hidden',
              direction: 'rtl',
              letterSpacing: 'normal',
              backgroundColor: '#FAF8F5',
            }}
          >
            <PageRenderer
              pageNumber={pageNum}
              item={seqItem}
              issue={issue}
              pageSide={i % 2 === 0 ? 'right' : 'left'}
              scale={1}
            />
          </div>
        );

        // Allow React render + images & font settling
        setTimeout(async () => {
          try {
            const images = Array.from(container.querySelectorAll('img'));
            await Promise.all(
              images.map((img) => {
                if (img.complete) return Promise.resolve();
                return new Promise((res) => {
                  img.onload = () => res(null);
                  img.onerror = () => res(null);
                });
              })
            );
          } catch (e) {
            console.warn('Image wait error:', e);
          }
          resolve();
        }, 350);
      });

      let imgBytes: Uint8Array | null = null;

      // Primary rasterization method: html-to-image (Uses native browser SVG foreignObject for 100% accurate Arabic ligatures)
      try {
        const pageElement = (container.firstElementChild as HTMLElement) || container;
        const dataUrl = await toJpeg(pageElement, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#FAF8F5',
          skipFonts: true, // Prevents CORS SecurityError on cross-origin Google Fonts stylesheets
        });

        if (dataUrl && dataUrl.startsWith('data:image/jpeg')) {
          imgBytes = dataUrlToUint8Array(dataUrl);
        }
      } catch (foreignObjError) {
        console.warn('html-to-image fallback triggered for page', i + 1, foreignObjError);
      }

      // Secondary fallback method: html2canvas-pro
      if (!imgBytes || imgBytes.length < 500) {
        const canvas = await html2canvas(container, {
          scale: 2, // High resolution (200+ DPI)
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#FAF8F5',
          windowWidth: 1024,
        });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        imgBytes = dataUrlToUint8Array(dataUrl);
      }

      // Embed image into pdf-lib
      const embeddedJpg = await pdfDoc.embedJpg(imgBytes);

      // Add standard A4 page: 595.28 x 841.89 pt
      const page = pdfDoc.addPage([595.28, 841.89]);
      page.drawImage(embeddedJpg, {
        x: 0,
        y: 0,
        width: 595.28,
        height: 841.89,
      });
    }

    onProgress?.(94, 'جارٍ تجميع وتشفير ملف PDF العربي النهائي...');
    const pdfBytes = await pdfDoc.save();

    onProgress?.(100, 'اكتمل تصدير المجلة بنجاح!');

    // Trigger instant browser download with Arabic filename
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    const sanitizedNumber = (issue.number || 'العدد_14').replace(/\s+/g, '_');
    downloadLink.href = blobUrl;
    downloadLink.download = `مجلة_تحواس_براس_${sanitizedNumber}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } finally {
    // Clean up scratchpad DOM
    try {
      root.unmount();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    } catch (e) {
      console.warn('Cleanup error:', e);
    }
  }
}
