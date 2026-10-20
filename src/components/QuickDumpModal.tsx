import React, { useState, useMemo } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { parseQuickDumpText, SAMPLE_QUICK_DUMP } from '../utils/parser';
import { ENERGY_CONFIG } from '../types';
import { formatDuration, formatTime } from '../utils/timeEngine';
import {
  X,
  Sparkles,
  RotateCcw,
  Check,
  HelpCircle,
} from 'lucide-react';

export const QuickDumpModal: React.FC = () => {
  const { activeModal, setActiveModal, setTasks, tasks, addToast } = usePlannerStore();
  const [inputText, setInputText] = useState(SAMPLE_QUICK_DUMP);
  const [mode, setMode] = useState<'replace' | 'append'>('replace');

  // Live parsing
  const parsed = useMemo(() => {
    return parseQuickDumpText(inputText, new Date());
  }, [inputText]);

  if (activeModal !== 'dump') return null;

  const handleApply = () => {
    if (parsed.tasks.length === 0) {
      addToast('No valid tasks detected. Check syntax examples.', 'warning');
      return;
    }

    if (mode === 'replace') {
      setTasks(parsed.tasks);
      addToast(`Replaced schedule with ${parsed.tasks.length} fluid blocks!`, 'success');
    } else {
      setTasks([...tasks, ...parsed.tasks]);
      addToast(`Appended ${parsed.tasks.length} new blocks to your day!`, 'success');
    }

    setActiveModal(null);
  };

  const totalMinutes = parsed.items.reduce((acc, item) => acc + item.durationMinutes, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Natural Language Quick-Dump</h3>
              <p className="text-xs text-slate-400">Type or paste your day. We handle the time math & chaining.</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 overflow-y-auto">
          {/* Left Column: Text Input */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Daily Stream Input
              </label>
              <button
                onClick={() => setInputText(SAMPLE_QUICK_DUMP)}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Load Sample Input</span>
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleApply();
                }
              }}
              rows={12}
              placeholder="e.g.&#10;8:00am Morning workout 45m (routine)&#10;Breakfast & coffee 30m&#10;Deep Work: Build API 2h (high)&#10;Lunch break 45m (rest)&#10;Client sync 30m (admin)"
              className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-700/80 rounded-xl p-3.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 leading-relaxed resize-none shadow-inner"
            />

            {/* Syntax Helpers */}
            <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-violet-400" />
                <span>Smart Tagging & Formatting:</span>
              </div>
              <p>• <strong>Times:</strong> <code className="text-slate-300">8:30am</code>, <code className="text-slate-300">14:00</code> (defaults to chaining if omitted)</p>
              <p>• <strong>Durations:</strong> <code className="text-slate-300">45m</code>, <code className="text-slate-300">1.5h</code>, <code className="text-slate-300">90m</code>, <code className="text-slate-300">2h 15m</code></p>
              <p>• <strong>Energy:</strong> <code className="text-violet-300">(high)</code>, <code className="text-amber-300">(admin)</code>, <code className="text-emerald-300">(rest)</code>, <code className="text-sky-300">(routine)</code></p>
            </div>
          </div>

          {/* Right Column: Live Detection Preview */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Live Parsed Preview
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {parsed.items.length} tasks • {formatDuration(totalMinutes)}
              </span>
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-y-auto max-h-[340px] space-y-2">
              {parsed.tasks.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-6 text-slate-500 text-xs">
                  Type above to see detected tasks, chained start times, and energy tags in real-time.
                </div>
              ) : (
                parsed.tasks.map((task, idx) => {
                  const energy = ENERGY_CONFIG[task.energyLevel];
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-slate-500 font-mono text-[11px] w-4">{idx + 1}.</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-200 truncate">{task.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {formatTime(task.startTime)} – {formatTime(task.endTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${energy.badgeBg}`}>
                          {energy.label}
                        </span>
                        <span className="font-mono text-slate-300 text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                          {formatDuration(task.durationMinutes)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Destination Mode Selector */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('replace')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    mode === 'replace'
                      ? 'bg-violet-600/30 text-violet-200 border-violet-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Replace Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setMode('append')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    mode === 'append'
                      ? 'bg-violet-600/30 text-violet-200 border-violet-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Append to Day
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Ctrl+Enter</kbd> to apply instantly
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={parsed.tasks.length === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 transition-all cursor-pointer disabled:opacity-40"
            >
              <Check className="w-4 h-4" />
              <span>Apply {parsed.tasks.length} Blocks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
