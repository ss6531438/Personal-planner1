import React, { useState, useEffect } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { getBreakOptionsForTask } from '../utils/breakEngine';
import {
  Coffee,
  Lock,
  Check,
  Plus,
  X,
  Droplets,
  Eye,
  Wind,
  Smile,
} from 'lucide-react';

export const TakeBreakModal: React.FC = () => {
  const {
    breakModalData,
    closeBreakModal,
    startBreak,
    skipBreakAndAdvance,
    addTimeToActiveTask,
    togglePlayPause,
  } = usePlannerStore();

  const taskDuration = breakModalData?.durationMinutes || 30;
  const { options, recommendedMinutes, categoryRuleText } = getBreakOptionsForTask(taskDuration);

  const [selectedBreakMinutes, setSelectedBreakMinutes] = useState<number>(recommendedMinutes);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');

  // Sync default selection when modal opens
  useEffect(() => {
    setSelectedBreakMinutes(recommendedMinutes);
  }, [recommendedMinutes, breakModalData]);

  // Guided breathing cycle animation loop
  useEffect(() => {
    if (!breakModalData) return;
    const phases: ('Inhale' | 'Hold' | 'Exhale' | 'Rest')[] = ['Inhale', 'Hold', 'Exhale', 'Rest'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setBreathingPhase(phases[idx]);
    }, 3500);
    return () => clearInterval(interval);
  }, [breakModalData]);

  if (!breakModalData) return null;

  const handleStartBreak = () => {
    startBreak(selectedBreakMinutes);
  };

  const handleNeedMoreTime = () => {
    addTimeToActiveTask(5);
    togglePlayPause();
    closeBreakModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl shadow-2xl shadow-emerald-500/20 overflow-hidden flex flex-col relative max-h-[92vh]">
        {/* Ambient Emerald Aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-emerald-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-800/80 bg-slate-950/70 flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1.5px] shadow-lg shadow-emerald-500/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Time is Up! Take a Break</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Recharge
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Completed: <strong className="text-slate-200">"{breakModalData.taskTitle}"</strong> ({breakModalData.durationMinutes}m session)
              </p>
            </div>
          </div>

          <button
            onClick={() => closeBreakModal()}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto max-h-[75vh] relative z-10">
          {/* Rule Guidance Banner */}
          <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-300">
            <span>{categoryRuleText}</span>
            <span className="font-mono text-[11px] font-semibold bg-emerald-900/60 px-2 py-0.5 rounded">
              Task: {taskDuration}m
            </span>
          </div>

          {/* Break Options Cards (Enforcing 5m for <=30m, and 5/10/15m for 1h tasks) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2.5">
              Select Your Break Duration
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {options.map((opt) => {
                const isSelected = selectedBreakMinutes === opt.minutes;
                const isLocked = !opt.isAllowed;

                return (
                  <div
                    key={opt.minutes}
                    onClick={() => {
                      if (!isLocked) {
                        setSelectedBreakMinutes(opt.minutes);
                      }
                    }}
                    className={`relative rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                      isLocked
                        ? 'bg-slate-950/50 border-slate-800/60 opacity-40 cursor-not-allowed select-none'
                        : isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/60 cursor-pointer transform scale-[1.02]'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900 cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-base font-extrabold ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                          {opt.label}
                        </span>

                        {isLocked ? (
                          <div title={opt.lockReason} className="p-1 rounded bg-slate-800/80 text-slate-500">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        ) : isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : null}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug">{opt.tagline}</p>
                    </div>

                    {isLocked && opt.lockReason && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-medium">
                        {opt.lockReason}
                      </div>
                    )}

                    {!isLocked && opt.recommended && (
                      <div className="mt-3 pt-1">
                        <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Recommended
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Guided Box Breathing Section */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Expanding Breathing Orb */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full bg-emerald-500/30 blur-md transition-all duration-1000 ${
                    breathingPhase === 'Inhale' || breathingPhase === 'Hold' ? 'scale-125 opacity-80' : 'scale-90 opacity-30'
                  }`}
                />
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 transition-all duration-1000 ${
                    breathingPhase === 'Inhale' || breathingPhase === 'Hold' ? 'scale-110' : 'scale-90'
                  }`}
                >
                  <Wind className="w-5 h-5" />
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-white block">Micro Breath Reset</span>
                <span className="text-xs text-emerald-300 font-mono font-semibold animate-pulse">
                  {breathingPhase === 'Inhale' && 'Breathe In slowly... (Expand lungs)'}
                  {breathingPhase === 'Hold' && 'Hold breath gently... (Calm heart)'}
                  {breathingPhase === 'Exhale' && 'Breathe Out smoothly... (Release tension)'}
                  {breathingPhase === 'Rest' && 'Rest & relax shoulders...'}
                </span>
              </div>
            </div>

            {/* Quick Self-Care Reminders */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className="flex items-center gap-1 text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                <Droplets className="w-3 h-3 text-cyan-400" /> Drink water
              </span>
              <span className="flex items-center gap-1 text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                <Eye className="w-3 h-3 text-emerald-400" /> 20-20-20 rule
              </span>
              <span className="flex items-center gap-1 text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                <Smile className="w-3 h-3 text-amber-400" /> Stretch spine
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <button
            onClick={handleNeedMoreTime}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus className="w-3.5 h-3.5 text-violet-400" />
            <span>Need +5 mins to finish task</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => skipBreakAndAdvance()}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Skip Break
            </button>

            <button
              onClick={handleStartBreak}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer transform hover:scale-[1.02]"
            >
              <Coffee className="w-4 h-4 fill-current" />
              <span>Start {selectedBreakMinutes}m Break</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
