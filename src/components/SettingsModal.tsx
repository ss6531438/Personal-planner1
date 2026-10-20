import React, { useRef, useState } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { playCompletionChime } from '../utils/audioEngine';
import {
  X,
  Settings,
  Download,
  Upload,
  Volume2,
  Trash2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    settings,
    updateSettings,
    exportData,
    importData,
    resetToDemoSchedule,
    clearAllTasks,
    addToast,
  } = usePlannerStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteInput, setPasteInput] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);

  if (activeModal !== 'settings') return null;

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flowstate-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Schedule data exported successfully!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importData(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasteImport = () => {
    if (!pasteInput.trim()) return;
    if (importData(pasteInput.trim())) {
      setShowPasteBox(false);
      setPasteInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Settings & Portability</h3>
              <p className="text-xs text-slate-400">Offline-first storage & focus sound engine.</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto">
          {/* Audio & Feedback Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Audio Feedback (Web Audio API)</span>
            </h4>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-4">
              {/* Auto Chime Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Completion Zen Chime</span>
                  <span className="text-[11px] text-slate-500">
                    Plays a gentle harmonic chime when a focus session ends
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoChime}
                    onChange={(e) => updateSettings({ autoChime: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              {/* Chime Volume & Test */}
              {settings.autoChime && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Chime Volume</span>
                      <span>{Math.round(settings.chimeVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={settings.chimeVolume}
                      onChange={(e) => updateSettings({ chimeVolume: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => playCompletionChime(settings.chimeVolume)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 cursor-pointer"
                  >
                    Test Sound
                  </button>
                </div>
              )}
            </div>

            {/* Antique Clock & Mechanical Ticking Link */}
            <div className="bg-slate-950 rounded-xl p-4 border border-amber-600/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-200 block">
                  Antique Clocks & Mechanical Ticking
                </span>
                <span className="text-[11px] text-slate-400">
                  Current: <strong className="text-slate-200 capitalize">{settings.clockStyle.replace('-', ' ')}</strong>
                  {' • '}Ticking: <strong className="text-slate-200 capitalize">{settings.tickingSound.replace('-', ' ')}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveModal('clock-studio');
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer transition-colors"
              >
                Open Studio
              </button>
            </div>
          </div>

          {/* Privacy & Offline-First Storage */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Offline-First Data & Backups</span>
            </h4>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                FlowState is entirely local. No trackers, no accounts, and no servers. All routines and tasks stay securely in your browser's local storage.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Export */}
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export JSON</span>
                </button>

                {/* Import */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-violet-400" />
                  <span>Import JSON File</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Paste JSON text option */}
              <div>
                <button
                  onClick={() => setShowPasteBox(!showPasteBox)}
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-medium cursor-pointer"
                >
                  {showPasteBox ? 'Hide Paste Box' : 'Or paste raw JSON text...'}
                </button>

                {showPasteBox && (
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={4}
                      value={pasteInput}
                      onChange={(e) => setPasteInput(e.target.value)}
                      placeholder="Paste valid FlowState JSON string here..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-violet-500"
                    />
                    <button
                      onClick={handlePasteImport}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Import Pasted JSON
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reset / Danger Zone */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Schedule Management
            </h4>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Reset Demo Flow</span>
                <span className="text-[11px] text-slate-500">Restore the default Balanced Workday schedule</span>
              </div>
              <button
                type="button"
                onClick={resetToDemoSchedule}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-cyan-400" />
                <span>Reset Demo</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-rose-300 block">Clear All Tasks</span>
                <span className="text-[11px] text-slate-500">Wipe today's schedule for a fresh canvas</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all tasks for today?')) {
                    clearAllTasks();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-medium cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg transition-colors cursor-pointer text-center"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
