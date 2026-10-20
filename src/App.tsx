import React, { useEffect, useRef } from 'react';
import { usePlannerStore } from './store/usePlannerStore';
import { Header } from './components/Header';
import { FocusHUD } from './components/FocusHUD';
import { TimelineView } from './components/TimelineView';
import { AddTaskModal } from './components/AddTaskModal';
import { TakeBreakModal } from './components/TakeBreakModal';
import { QuickDumpModal } from './components/QuickDumpModal';
import { TemplatesModal } from './components/TemplatesModal';
import { EditTaskModal } from './components/EditTaskModal';
import { SettingsModal } from './components/SettingsModal';
import { ClockSoundStudioModal } from './components/ClockSoundStudioModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ToastContainer } from './components/ToastContainer';
import { getScheduleMetrics, formatDuration } from './utils/timeEngine';
import { Sparkles, Shield, Compass } from 'lucide-react';

export const App: React.FC = () => {
  const {
    tasks,
    viewMode,
    isFullscreenFocus,
    togglePlayPause,
    skipTask,
    addTimeToActiveTask,
    toggleFullscreenFocus,
    setActiveModal,
    activeModal,
    tickTimer,
    isTimerRunning,
    activeTaskId,
    isScreenDimmedOnFocus,
  } = usePlannerStore();

  const isDimmed = Boolean(isTimerRunning && activeTaskId && isScreenDimmedOnFocus);
  const metrics = getScheduleMetrics(tasks);
  const lastTickRef = useRef<number>(0);

  // High-precision timer loop with tab visibility drift compensation
  useEffect(() => {
    if (!isTimerRunning) return;

    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - lastTickRef.current;
      lastTickRef.current = now;

      // In case the tab was throttled in background, tick appropriately (clamped 1 to 60)
      const ticks = Math.max(1, Math.min(60, Math.round(elapsedMs / 1000)));
      for (let i = 0; i < ticks; i++) {
        tickTimer();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, tickTimer]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (isFullscreenFocus) {
          toggleFullscreenFocus();
        }
        return;
      }

      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        skipTask();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        addTimeToActiveTask(5);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreenFocus();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setActiveModal('add-task');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setActiveModal('dump');
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setActiveModal('clock-studio');
      } else if (e.key === '?') {
        e.preventDefault();
        setActiveModal('shortcuts');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeModal,
    isFullscreenFocus,
    togglePlayPause,
    skipTask,
    addTimeToActiveTask,
    toggleFullscreenFocus,
    setActiveModal,
  ]);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-violet-500/30 selection:text-violet-200 relative">
      {/* Ambient Spotlight Backdrop Overlay when Dimmer is Active */}
      {isDimmed && (
        <div
          className="fixed inset-0 bg-[#04060d]/80 backdrop-blur-[2px] pointer-events-none z-20 transition-opacity duration-700 animate-in fade-in"
          style={{
            background:
              'radial-gradient(circle at 35% 45%, rgba(15, 23, 42, 0.45) 0%, rgba(4, 6, 13, 0.92) 75%)',
          }}
        />
      )}

      {/* Top Navigation */}
      <div className={`screen-dim-target relative z-10 ${isDimmed ? 'screen-dimmed' : ''}`}>
        <Header />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl 2xl:max-w-[1600px] mx-auto p-3 sm:p-5 lg:p-7 relative">
        {/* Banner: Adaptive Philosophy Reminder */}
        <div
          className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl glass-card border border-violet-500/20 bg-gradient-to-r from-violet-950/20 via-slate-900/40 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg screen-dim-target ${
            isDimmed ? 'screen-dimmed' : ''
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                Anti-Rigid Schedule Engine
              </h3>
              <p className="text-xs text-slate-400">
                Running behind or starting late? Click <strong className="text-cyan-400 font-semibold">Snap to Now</strong> or <strong className="text-amber-400 font-semibold">Push +15m</strong> without calendar guilt.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80 text-xs font-mono text-slate-400">
            <div className="bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-lg text-center md:text-left">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Deep</span>
              <strong className="text-violet-300">{formatDuration(metrics.deepWorkMinutes)}</strong>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-lg text-center md:text-left">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Rest</span>
              <strong className="text-emerald-300">{formatDuration(metrics.restMinutes)}</strong>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-lg text-center md:text-left">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Total</span>
              <strong className="text-white">{formatDuration(metrics.totalDurationMinutes)}</strong>
            </div>
          </div>
        </div>

        {/* Dynamic View Layouts */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-5 lg:gap-6 xl:gap-8 items-start">
            {/* Focus HUD Column (Elevated & Spotlighted) */}
            <div className={`lg:col-span-5 xl:col-span-5 2xl:col-span-5 lg:sticky lg:top-28 relative z-30 transition-all duration-700`}>
              <FocusHUD />
            </div>

            {/* Timeline Column (Dimmed when in focus) */}
            <div className={`lg:col-span-7 xl:col-span-7 2xl:col-span-7 screen-dim-target ${isDimmed ? 'screen-dimmed' : ''}`}>
              <TimelineView />
            </div>
          </div>
        )}

        {viewMode === 'focus' && (
          <div className="max-w-2xl 2xl:max-w-3xl mx-auto py-2 sm:py-4 relative z-30">
            <FocusHUD />
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="max-w-4xl 2xl:max-w-5xl mx-auto py-2 relative z-10">
            <TimelineView />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`w-full glass-panel border-t border-slate-800/80 py-4 px-6 mt-12 text-center text-xs text-slate-500 screen-dim-target relative z-10 ${
          isDimmed ? 'screen-dimmed' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-semibold text-slate-300">FlowState</span>
            <span>• Time is fluid. Focus without guilt.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" /> 100% Local & Private
            </span>
            <span>•</span>
            <button
              onClick={() => setActiveModal('shortcuts')}
              className="hover:text-slate-200 cursor-pointer"
            >
              Shortcuts (<kbd className="font-mono text-[10px] text-violet-400">?</kbd>)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <TakeBreakModal />
      <AddTaskModal />
      <QuickDumpModal />
      <TemplatesModal />
      <EditTaskModal />
      <SettingsModal />
      <ClockSoundStudioModal />
      <KeyboardShortcutsModal />
      <ToastContainer />
    </div>
  );
};
export default App;
