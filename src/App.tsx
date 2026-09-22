import React, { useState, useEffect, useRef } from 'react';
import { Issue, Lang, SequenceItem } from './types';
import { demoIssue } from './data/demoIssue';
import { Header } from './components/Header';
import { Step1IssueSetup } from './components/Step1IssueSetup';
import { Step2Articles } from './components/Step2Articles';
import { Step3Ads } from './components/Step3Ads';
import { Step4Order } from './components/Step4Order';
import { Step5CoverStudio } from './components/Step5CoverStudio';
import { Step6Review } from './components/Step6Review';
import { Step7Export } from './components/Step7Export';
import { PageRenderer } from './components/PageRenderer';
import { AISettingsModal } from './components/AISettingsModal';
import { X, ChevronRight, ChevronLeft, Eye, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'tahwas_magazine_issue_v1';
const SNAPSHOTS_KEY = 'tahwas_magazine_snapshots_v1';

export default function App() {
  // Load initial issue from localStorage or demoIssue
  const [issue, setIssue] = useState<Issue>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using demo issue.');
    }
    return demoIssue;
  });

  // Undo / Redo history
  const [historyPast, setHistoryPast] = useState<Issue[]>([]);
  const [historyFuture, setHistoryFuture] = useState<Issue[]>([]);

  // Snapshots
  const [snapshots, setSnapshots] = useState<{ id: string; timestamp: string; label: string; issue: Issue }[]>(() => {
    try {
      const saved = localStorage.getItem(SNAPSHOTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Current Step (1 - 7)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [lang, setLang] = useState<Lang>('ar');
  const [lastSavedAt, setLastSavedAt] = useState<string>('الآن');
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState<boolean>(false);
  const [drawerPageIndex, setDrawerPageIndex] = useState<number>(0);
  const [isGlobalAISettingsOpen, setIsGlobalAISettingsOpen] = useState<boolean>(false);

  // Autosave to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issue));
      const now = new Date();
      setLastSavedAt(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [issue]);

  // Set RTL direction on html
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Push to history on issue updates
  const updateIssue = (updated: Partial<Issue>) => {
    setHistoryPast((prev) => [...prev.slice(-20), issue]);
    setHistoryFuture([]);
    setIssue((prev) => ({ ...prev, ...updated }));
  };

  const handleUndo = () => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((prev) => prev.slice(0, prev.length - 1));
    setHistoryFuture((prev) => [issue, ...prev]);
    setIssue(previous);
  };

  const handleRedo = () => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture((prev) => prev.slice(1));
    setHistoryPast((prev) => [...prev, issue]);
    setIssue(next);
  };

  const handleLoadDemo = () => {
    if (confirm('هل تريد إعادة تحميل العدد النموذجي الكامل لمجلة تحواس براس؟')) {
      updateIssue(demoIssue);
      setCurrentStep(1);
    }
  };

  const handleSaveSnapshot = (label: string) => {
    const newSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toLocaleString('ar-DZ'),
      label,
      issue: JSON.parse(JSON.stringify(issue)),
    };
    const updated = [newSnapshot, ...snapshots.slice(0, 9)];
    setSnapshots(updated);
    try {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleRestoreSnapshot = (restored: Issue) => {
    updateIssue(restored);
  };

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-cairo flex flex-col justify-between selection:bg-amber-200">
      {/* Top Application Header & Navigation Bar */}
      <Header
        currentStep={currentStep}
        onStepChange={(step) => setCurrentStep(step)}
        lang={lang}
        onLangChange={(l) => setLang(l)}
        onLoadDemo={handleLoadDemo}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        lastSavedAt={lastSavedAt}
        onTogglePreviewDrawer={() => setPreviewDrawerOpen(true)}
        issueNumber={issue.number}
        logoUrl={issue.logoUrl}
        brandColors={issue.brandColors}
        magazineName={issue.magazineName}
        onOpenAISettings={() => setIsGlobalAISettingsOpen(true)}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 pb-16">
        {currentStep === 1 && (
          <Step1IssueSetup
            issue={issue}
            onChange={(updated) => updateIssue(updated)}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2Articles
            articles={issue.articles}
            onUpdateArticles={(arts) => updateIssue({ articles: arts })}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <Step3Ads
            ads={issue.ads}
            onUpdateAds={(ads) => updateIssue({ ads })}
            page={issue.page}
            includeAdsInIssue={issue.includeAdsInIssue !== false}
            onToggleAdsMaster={(enabled) => {
              if (!enabled) {
                const adFreeSeq = issue.sequence.filter(
                  (s) => s.itemType !== 'ad' && s.itemType !== 'composite-ad'
                );
                updateIssue({
                  includeAdsInIssue: false,
                  sequence: adFreeSeq,
                  cover: { ...issue.cover, backCoverType: 'closing-page' },
                });
              } else {
                updateIssue({
                  includeAdsInIssue: true,
                  cover: { ...issue.cover, backCoverType: 'ad' },
                });
              }
            }}
            onNext={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 4 && (
          <Step4Order
            issue={issue}
            onUpdateSequence={(seq, seed) =>
              updateIssue({ sequence: seq, ...(seed ? { shuffleSeed: seed } : {}) })
            }
            onUpdateIssue={(patch) => updateIssue(patch)}
            onNext={() => setCurrentStep(5)}
          />
        )}

        {currentStep === 5 && (
          <Step5CoverStudio
            issue={issue}
            onUpdateCover={(cover) => updateIssue({ cover })}
            onNext={() => setCurrentStep(6)}
          />
        )}

        {currentStep === 6 && (
          <Step6Review
            issue={issue}
            onNext={() => setCurrentStep(7)}
          />
        )}

        {currentStep === 7 && (
          <Step7Export
            issue={issue}
            onImportIssue={(imported) => updateIssue(imported)}
            onSaveSnapshot={handleSaveSnapshot}
            snapshots={snapshots}
            onRestoreSnapshot={handleRestoreSnapshot}
          />
        )}
      </main>

      {/* Quick Preview Modal / Drawer */}
      {previewDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-stone-800 overflow-hidden flex flex-col h-[92vh]">
            {/* Drawer Header */}
            <div className="p-4 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">المعاينة السريعة لصفحات المجلة</span>
                <span className="text-xs text-stone-400 font-mono">
                  (صفحة {drawerPageIndex + 1} من {issue.sequence.length})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={drawerPageIndex}
                  onChange={(e) => setDrawerPageIndex(Number(e.target.value))}
                  className="bg-stone-800 text-white border border-stone-700 rounded px-2.5 py-1 text-xs font-mono"
                >
                  {issue.sequence.map((seq, idx) => (
                    <option key={seq.id} value={idx}>
                      ص {seq.startPage}: {seq.title}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setPreviewDrawerOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body Canvas */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-stone-900">
              <div style={{ transform: 'scale(0.7)', transformOrigin: 'center center' }}>
                <PageRenderer
                  pageNumber={issue.sequence[drawerPageIndex]?.startPage || drawerPageIndex + 1}
                  item={issue.sequence[drawerPageIndex] || issue.sequence[0]}
                  issue={issue}
                  pageSide={drawerPageIndex % 2 === 0 ? 'right' : 'left'}
                />
              </div>
            </div>

            {/* Drawer Navigation Footer */}
            <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-white text-xs">
              <button
                onClick={() => setDrawerPageIndex((prev) => Math.min(issue.sequence.length - 1, prev + 1))}
                disabled={drawerPageIndex >= issue.sequence.length - 1}
                className="flex items-center gap-1 px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 rounded-xl"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الصفحة التالية</span>
              </button>

              <span className="font-mono text-stone-400">
                {drawerPageIndex + 1} / {issue.sequence.length}
              </span>

              <button
                onClick={() => setDrawerPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={drawerPageIndex <= 0}
                className="flex items-center gap-1 px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 rounded-xl"
              >
                <span>الصفحة السابقة</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print-Only Document Container (@media print) */}
      <div id="print-magazine-root" className="hidden print:block print-magazine-root">
        {issue.sequence.map((seq, idx) => (
          <div key={seq.id} className="print-page-break">
            <PageRenderer
              pageNumber={seq.startPage || idx + 1}
              item={seq}
              issue={issue}
              pageSide={idx % 2 === 0 ? 'right' : 'left'}
              scale={1}
            />
          </div>
        ))}
      </div>

      {/* Global AI Settings Modal */}
      <AISettingsModal
        isOpen={isGlobalAISettingsOpen}
        onClose={() => setIsGlobalAISettingsOpen(false)}
      />
    </div>
  );
}
