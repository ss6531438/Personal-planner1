import React, { useState } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { getScheduleMetrics, formatTime } from '../utils/timeEngine';
import {
  Sparkles,
  Zap,
  Clock,
  Maximize2,
  FileText,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  Plus,
  RefreshCw,
  FastForward,
  Minimize2,
} from 'lucide-react';
import type { AudioNoiseType } from '../types';

export const Header: React.FC = () => {
  const {
    tasks,
    viewMode,
    setViewMode,
    isFullscreenFocus,
    toggleFullscreenFocus,
    pushDay,
    compressBreaks,
    syncToNow,
    setActiveModal,
    settings,
    setAmbientSound,
    setAmbientVolume,
  } = usePlannerStore();

  const [isAmbientMenuOpen, setIsAmbientMenuOpen] = useState(false);
  const metrics = getScheduleMetrics(tasks);

  const ambientOptions: { type: AudioNoiseType; label: string }[] = [
    { type: 'none', label: 'Off / Muted' },
    { type: 'rain', label: 'Gentle Rain' },
    { type: 'ocean', label: 'Ocean Surf' },
    { type: 'campfire', label: 'Hearth Campfire' },
    { type: 'stream', label: 'Forest Stream' },
    { type: 'zen-bowl', label: 'Tibetan Zen Bowl' },
    { type: 'birds', label: 'Twilight Birds' },
    { type: 'binaural', label: 'Alpha Flow (10Hz)' },
    { type: 'brown', label: 'Brown Noise (Deep)' },
    { type: 'white', label: 'Focus White Noise' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all backdrop-blur-xl">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto flex flex-col gap-2.5">
        {/* Top Row: Brand + Schedule Badge + View Switcher + Add Task */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          {/* Brand & Progress Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-white">FlowState</span>
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Fluid Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Adaptive Routine & Focus Planner</p>
            </div>

            {/* Quick Metrics Badge */}
            {metrics.totalTasks > 0 && (
              <div className="hidden sm:flex items-center gap-2.5 text-xs bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300 ml-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    {metrics.completedCount}/{metrics.totalTasks} done ({metrics.progressPercentage}%)
                  </span>
                </div>
                {metrics.estimatedDayEnd && (
                  <div className="hidden lg:flex items-center gap-1 text-slate-400 border-l border-slate-700/60 pl-2.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Est: <strong className="text-slate-200">{formatTime(metrics.estimatedDayEnd)}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: View Mode Toggle & Primary Add Task Button */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle (Available on ALL screen sizes!) */}
            <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 text-xs shadow-inner">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-[11px] sm:text-xs ${
                  viewMode === 'split'
                    ? 'bg-violet-600/30 text-violet-200 border border-violet-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Split View (HUD + Timeline)"
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('focus')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-[11px] sm:text-xs ${
                  viewMode === 'focus'
                    ? 'bg-violet-600/30 text-violet-200 border border-violet-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Focus Timer HUD"
              >
                Focus
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium text-[11px] sm:text-xs ${
                  viewMode === 'timeline'
                    ? 'bg-violet-600/30 text-violet-200 border border-violet-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Adaptive Timeline Only"
              >
                Timeline
              </button>
            </div>

            {/* Primary Add Task Button */}
            <button
              onClick={() => setActiveModal('add-task')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/25 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
              <Clock className="w-3 h-3 text-violet-200 ml-0.5 hidden xs:inline" />
            </button>
          </div>
        </div>

        {/* Second Row: Smooth Swipeable / Responsive Quick Adjustments Strip */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5 -mx-1 px-1">
          {/* Snap to Now button */}
          <button
            onClick={() => syncToNow()}
            title="Slide active task to right now (No calendar guilt!)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Snap to Now</span>
          </button>

          {/* Push Day +15m button */}
          <button
            onClick={() => pushDay(15)}
            title="Slide all remaining tasks forward by 15 minutes"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-400" />
            <span>Push +15m</span>
          </button>

          {/* Compress Breaks button */}
          <button
            onClick={() => compressBreaks(25)}
            title="Shrink rest breaks automatically to recover lost schedule time"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compress Breaks</span>
          </button>

          {/* Quick Dump */}
          <button
            onClick={() => setActiveModal('dump')}
            title="Natural Language Quick-Dump Day"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>Quick Dump</span>
            <span className="hidden lg:inline text-[10px] bg-slate-800 px-1 py-0.2 rounded font-mono text-slate-400">
              D
            </span>
          </button>

          {/* Templates */}
          <button
            onClick={() => setActiveModal('templates')}
            title="Daily Routine Presets & Templates"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Templates</span>
          </button>

          {/* Antique Clock & Sound Studio */}
          <button
            onClick={() => setActiveModal('clock-studio')}
            title="Antique Clock & Sound Studio (Designs & Ticking Sounds)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap group"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span>Clock Studio</span>
          </button>

          {/* Ambient Noise Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsAmbientMenuOpen(!isAmbientMenuOpen)}
              title="Ambient Sound Generator"
              className={`p-1.5 text-xs rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                settings.ambientType !== 'none'
                  ? 'bg-violet-900/40 border-violet-500/50 text-violet-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
              }`}
            >
              {settings.ambientType !== 'none' ? (
                <Volume2 className="w-4 h-4 text-violet-400 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isAmbientMenuOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-56 rounded-xl glass-panel shadow-2xl p-3 z-50 border border-slate-700">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-200">Ambient Focus Sound</span>
                  <span className="text-[10px] text-slate-400">Web Audio</span>
                </div>
                <div className="space-y-1 mb-3">
                  {ambientOptions.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => {
                        setAmbientSound(opt.type);
                      }}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                        settings.ambientType === opt.type
                          ? 'bg-violet-600/30 text-violet-200 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {settings.ambientType === opt.type && (
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      )}
                    </button>
                  ))}
                </div>

                {settings.ambientType !== 'none' && (
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Volume</span>
                      <span>{Math.round(settings.ambientVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.ambientVolume}
                      onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => toggleFullscreenFocus()}
            title="Toggle Distraction-Free Fullscreen (F)"
            className="p-1.5 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-all cursor-pointer shrink-0"
          >
            {isFullscreenFocus ? <Minimize2 className="w-4 h-4 text-violet-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Shortcuts Guide */}
          <button
            onClick={() => setActiveModal('shortcuts')}
            title="Keyboard Shortcuts (?)"
            className="p-1.5 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-all cursor-pointer shrink-0"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings & Portability */}
          <button
            onClick={() => setActiveModal('settings')}
            title="Settings & Export/Import"
            className="p-1.5 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-all cursor-pointer shrink-0"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
