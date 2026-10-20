import React from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { X, Keyboard } from 'lucide-react';

export const KeyboardShortcutsModal: React.FC = () => {
  const { activeModal, setActiveModal } = usePlannerStore();

  if (activeModal !== 'shortcuts') return null;

  const shortcuts = [
    { key: 'A', desc: 'Add new task with Analog Clock & future date' },
    { key: 'Space', desc: 'Pause or Resume the active focus timer' },
    { key: 'C', desc: 'Open Antique Clock & Sound Studio (Designs & Ticking)' },
    { key: 'N', desc: 'Advance to next task (Skip/Pull forward)' },
    { key: '+', desc: 'Add 5 minutes to active task without schedule friction' },
    { key: 'F', desc: 'Toggle Distraction-Free Fullscreen Focus HUD' },
    { key: 'D', desc: 'Open Natural Language Quick-Dump Day parser' },
    { key: '?', desc: 'Open this Keyboard Shortcuts cheat sheet' },
    { key: 'Esc', desc: 'Close any open modal or exit fullscreen' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shrink-0">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Keyboard Shortcuts</h3>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 gap-2"
            >
              <span className="text-xs text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-mono font-bold bg-slate-850 text-violet-300 border border-slate-750 rounded-lg shadow-sm shrink-0">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-colors cursor-pointer text-center"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
