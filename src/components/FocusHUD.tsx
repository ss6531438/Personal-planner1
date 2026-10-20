import React, { useMemo, useState, useEffect } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { ENERGY_CONFIG } from '../types';
import type { EnergyLevel } from '../types';
import { formatTime, formatDuration } from '../utils/timeEngine';
import { AntiqueAnalogClock } from './AntiqueAnalogClock';
import { AnimatedCountdownTimer } from './AnimatedCountdownTimer';
import {
  Play,
  Pause,
  CheckCircle,
  SkipForward,
  Plus,
  Clock,
  Sparkles,
  ArrowRight,
  Maximize2,
  Minimize2,
  Edit2,
  AlertCircle,
  Coffee,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Settings2,
  Disc,
} from 'lucide-react';

export const FocusHUD: React.FC = () => {
  const {
    tasks,
    activeTaskId,
    isTimerRunning,
    timerRemainingSeconds,
    togglePlayPause,
    completeTask,
    skipTask,
    addTimeToActiveTask,
    startTask,
    isFullscreenFocus,
    toggleFullscreenFocus,
    setActiveModal,
    isScreenDimmedOnFocus,
    toggleScreenDimmer,
    settings,
    setTimerDisplayMode,
    setTickingSound,
  } = usePlannerStore();

  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [floatingNotification, setFloatingNotification] = useState<string | null>(null);

  const handleAddTime = (minutes: number) => {
    addTimeToActiveTask(minutes);
    setFloatingNotification(`+${minutes}m Added!`);
    setTimeout(() => {
      setFloatingNotification(null);
    }, 1200);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const liveTimeString = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const estimatedFinishTime = useMemo(() => {
    const finishDate = new Date(currentTime.getTime() + Math.max(0, timerRemainingSeconds) * 1000);
    return formatTime(finishDate);
  }, [currentTime, timerRemainingSeconds]);

  const activeTask = useMemo(() => {
    const found =
      tasks.find((t) => t.id === activeTaskId && t.status === 'active') ||
      tasks.find((t) => t.status === 'active');
    if (found) return found;
    if (isTimerRunning) {
      return {
        id: activeTaskId || 'standalone-focus',
        title: 'Deep Focus Session',
        durationMinutes: Math.max(1, Math.round(timerRemainingSeconds / 60)) || 25,
        energyLevel: 'deep' as const,
        status: 'active' as const,
        startTime: '',
        endTime: '',
      };
    }
    return null;
  }, [tasks, activeTaskId, isTimerRunning, timerRemainingSeconds]);

  const activeIndex = useMemo(
    () => (activeTask ? tasks.findIndex((t) => t.id === activeTask.id) : -1),
    [tasks, activeTask]
  );

  const nextTask = useMemo(() => {
    if (activeIndex === -1) {
      return tasks.find((t) => t.status === 'pending');
    }
    return tasks.slice(activeIndex + 1).find((t) => t.status === 'pending');
  }, [tasks, activeIndex]);

  // Timer math
  const totalSeconds = (activeTask?.durationMinutes || 25) * 60;
  const isOvertime = timerRemainingSeconds <= 0;

  // Progress percentage (clamp 0 to 100)
  const progressPercent = activeTask
    ? Math.max(0, Math.min(100, Math.round(((totalSeconds - timerRemainingSeconds) / totalSeconds) * 100)))
    : 0;

  // SVG Circle parameters
  const radius = 118;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Calculate tip/comet coordinate on the circle
  const angleDeg = (progressPercent / 100) * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  const tipX = 135 + radius * Math.cos(angleRad);
  const tipY = 135 + radius * Math.sin(angleRad);

  const trail1Rad = ((angleDeg - 4.5) * Math.PI) / 180;
  const trail1X = 135 + radius * Math.cos(trail1Rad);
  const trail1Y = 135 + radius * Math.sin(trail1Rad);

  const trail2Rad = ((angleDeg - 9) * Math.PI) / 180;
  const trail2X = 135 + radius * Math.cos(trail2Rad);
  const trail2Y = 135 + radius * Math.sin(trail2Rad);

  const currentEnergy = activeTask ? ENERGY_CONFIG[activeTask.energyLevel] : ENERGY_CONFIG.deep;
  const nextEnergy = nextTask ? ENERGY_CONFIG[nextTask.energyLevel] : null;

  const energyGradients: Record<EnergyLevel, { from: string; via: string; to: string; glow: string }> = {
    deep: { from: '#8b5cf6', via: '#c084fc', to: '#6366f1', glow: 'rgba(139, 92, 246, 0.65)' },
    admin: { from: '#f59e0b', via: '#fbbf24', to: '#ea580c', glow: 'rgba(245, 158, 11, 0.65)' },
    rest: { from: '#10b981', via: '#34d399', to: '#059669', glow: 'rgba(16, 185, 129, 0.65)' },
    routine: { from: '#0ea5e9', via: '#38bdf8', to: '#2563eb', glow: 'rgba(14, 165, 233, 0.65)' },
  };

  const activeGradient = activeTask ? energyGradients[activeTask.energyLevel] : energyGradients.deep;

  // If no task active, show empty focus state
  if (!activeTask) {
    const firstPending = tasks.find((t) => t.status === 'pending');
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center glass-panel rounded-2xl border border-slate-800/80 min-h-[460px]">
        <div className="w-20 h-20 rounded-full bg-violet-600/10 border border-violet-500/30 flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-violet-400 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Ready to enter FlowState?</h2>
        <p className="text-sm text-slate-400 max-w-md mb-8">
          Select an upcoming block to focus without distractions, or start an immediate 25m antique focus session.
        </p>

        {firstPending ? (
          <button
            onClick={() => startTask(firstPending.id)}
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-600/25 transition-all cursor-pointer transform hover:scale-[1.02]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start: {firstPending.title} ({formatDuration(firstPending.durationMinutes)})</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={() => togglePlayPause()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-600/30 transition-all cursor-pointer transform hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start 25m Focus Timer</span>
            </button>
            <button
              onClick={() => setActiveModal('add-task')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold border border-slate-700 transition-all cursor-pointer transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Task</span>
            </button>
            <button
              onClick={() => setActiveModal('clock-studio')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 font-medium transition-all cursor-pointer border border-amber-600/40"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Antique Clocks & Sounds</span>
            </button>
            <button
              onClick={() => setActiveModal('dump')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all cursor-pointer border border-slate-700"
            >
              <span>Quick Dump</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`w-full flex flex-col justify-between transition-all duration-500 ${
        isFullscreenFocus
          ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6 md:p-12 overflow-y-auto'
          : isTimerRunning
          ? 'glass-panel rounded-2xl border-2 border-violet-500/50 p-3.5 sm:p-6 lg:p-7 focus-elevated'
          : 'glass-panel rounded-2xl border border-slate-800/80 p-3.5 sm:p-6 lg:p-7'
      }`}
    >
      {/* Top Bar inside Focus HUD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 sm:mb-5 pb-3 border-b border-slate-800/60">
        {/* Left Side: Energy Badge & Live Wall Clock Time */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all ${currentEnergy.badgeBg} ${
              isTimerRunning ? 'shadow-sm shadow-violet-500/20' : ''
            }`}
          >
            {activeTask.energyLevel === 'rest' ? (
              <Coffee className="w-3.5 h-3.5" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{currentEnergy.label}</span>
          </span>

          {/* Prominent Live Real-Time Wall Clock Badge */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner"
            title="Live Real-Time Wall Clock"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live:</span>
            <span className="text-xs font-mono font-bold text-emerald-300 tracking-wider">
              {liveTimeString}
            </span>
          </div>

          {activeTask.startTime && (
            <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1 bg-slate-900/50 px-2.5 py-1 rounded-full border border-slate-800/60">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>
                {formatTime(activeTask.startTime)} – {formatTime(activeTask.endTime)}
              </span>
            </span>
          )}
        </div>

        {/* Right Side: Quick Tools */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap self-start sm:self-auto">
          {/* Display Mode Switcher (Analog Clock vs Radial Dial vs Dual) */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 text-xs shadow-sm">
            <button
              onClick={() => setTimerDisplayMode('analog')}
              title="Antique Analog Clock Display"
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                settings.timerDisplayMode === 'analog' || settings.timerDisplayMode === 'dual'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">Analog</span>
            </button>
            <button
              onClick={() => setTimerDisplayMode('radial')}
              title="Radial Countdown Dial"
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                settings.timerDisplayMode === 'radial'
                  ? 'bg-violet-600/30 text-violet-200 font-semibold border border-violet-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Disc className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[11px]">Radial</span>
            </button>
          </div>

          {/* Clock & Sound Studio Modal Trigger */}
          <button
            onClick={() => setActiveModal('clock-studio')}
            title="Antique Clock & Sound Studio (Customize Designs & Ticking)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 hover:text-amber-200 transition-all cursor-pointer shadow-sm group"
          >
            <Settings2 className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-90 transition-transform" />
            <span className="hidden sm:inline text-[11px]">Studio</span>
          </button>

          {/* Quick Ticking Sound Toggle */}
          <button
            onClick={() => {
              if (settings.tickingSound === 'none') {
                setTickingSound('antique-pendulum');
              } else {
                setTickingSound('none');
              }
            }}
            title={settings.tickingSound !== 'none' ? `Tick Sound Active: ${settings.tickingSound.replace('-', ' ')} (Click to mute)` : 'Muted Tick Sound (Click to enable)'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              settings.tickingSound !== 'none'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {settings.tickingSound !== 'none' ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Screen Dimmer Toggle */}
          <button
            onClick={() => toggleScreenDimmer()}
            title={isScreenDimmedOnFocus ? 'Focus Screen Dimmer Active' : 'Enable Focus Screen Dimmer'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isScreenDimmedOnFocus
                ? 'bg-violet-950/60 border-violet-500/50 text-violet-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isScreenDimmedOnFocus ? (
              <Eye className="w-3.5 h-3.5 text-violet-400" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Edit Task Modal */}
          <button
            onClick={() => setActiveModal('edit-task', activeTask.id)}
            title="Edit Active Task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => toggleFullscreenFocus()}
            title={isFullscreenFocus ? 'Exit Fullscreen (F)' : 'Fullscreen Focus (F)'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            {isFullscreenFocus ? <Minimize2 className="w-3.5 h-3.5 text-violet-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Focus Centerpiece */}
      <div className="flex flex-col items-center justify-center my-1 relative w-full">
        {/* Task Title & Intention */}
        <div className="text-center max-w-xl mb-3 sm:mb-4 px-1 w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug break-words">
            {activeTask.title}
          </h1>
          {activeTask.notes && (
            <p className="text-xs md:text-sm text-slate-400 mt-1.5 sm:mt-2 bg-slate-900/60 border border-slate-800/60 px-3 py-1.5 rounded-lg inline-block max-w-full truncate">
              {activeTask.notes}
            </p>
          )}

          {/* Target Completion Pill */}
          <div className="mt-2 sm:mt-2.5 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full font-mono text-[11px] flex-wrap justify-center">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Target Finish:</span>
              <strong className="text-amber-300 font-bold">{estimatedFinishTime}</strong>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden sm:inline">{formatDuration(activeTask.durationMinutes)} Block</span>
            </span>
          </div>
        </div>

        {/* Timer Visualization Centerpiece: Antique Analog Clock or Radial Progress Ring */}
        {settings.timerDisplayMode === 'analog' || settings.timerDisplayMode === 'dual' ? (
          <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto gap-3 sm:gap-4">
            {/* Antique Analog Clock with pendulum showcase & direct mode controls */}
            <div className="flex flex-col items-center justify-center w-full">
              <AntiqueAnalogClock size={240} showControls={true} />
            </div>

            {/* Glass Focus Command Center Card */}
            <div className="w-full bg-slate-900/70 rounded-2xl border border-slate-800/90 p-4 sm:p-5 flex flex-col items-center shadow-xl backdrop-blur-md relative z-10">
              {/* Header Status & Finish Info */}
              <div className="w-full flex items-center justify-between mb-2 text-xs">
                {/* Flow State Status */}
                {isOvertime ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 font-bold animate-pulse text-[10px] tracking-wider uppercase">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span>OVERTIME</span>
                  </div>
                ) : (
                  <div>
                    {isTimerRunning ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-950/60 border border-violet-500/30">
                        <div className="flex items-center gap-0.5 h-3.5">
                          <div className="w-0.5 bg-violet-400 rounded-full animate-sound-1" />
                          <div className="w-0.5 bg-violet-400 rounded-full animate-sound-2" />
                          <div className="w-0.5 bg-violet-400 rounded-full animate-sound-3" />
                          <div className="w-0.5 bg-violet-400 rounded-full animate-sound-4" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-violet-300">
                          IN FLOW
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60">
                        PAUSED
                      </span>
                    )}
                  </div>
                )}

                {/* Real-time sync badge */}
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <span>Target:</span>
                  <span className="text-amber-300 font-semibold">{estimatedFinishTime}</span>
                </div>
              </div>

              {/* Large Focus Countdown Digits with Rolling Micro-Animations */}
              <div className="text-center my-2 sm:my-3 relative w-full flex justify-center">
                <AnimatedCountdownTimer
                  secondsRemaining={timerRemainingSeconds}
                  isRunning={isTimerRunning}
                  glowColor={isOvertime ? 'rgba(245, 158, 11, 0.7)' : activeGradient.glow}
                  size="large"
                  floatingNotification={floatingNotification}
                />
              </div>

              {/* Progress Bar */}
              <div className="w-full mt-3 mb-2">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${progressPercent}%`,
                      background: `linear-gradient(to right, ${activeGradient.from}, ${activeGradient.via}, ${activeGradient.to})`,
                      boxShadow: isTimerRunning ? `0 0 8px ${activeGradient.glow}` : 'none',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
                  <span>{progressPercent}% completed</span>
                  <span>{formatDuration(activeTask.durationMinutes)} total</span>
                </div>
              </div>

              {/* Focus HUD Action Controls */}
              <div className="flex items-center gap-2 sm:gap-2.5 mt-3 w-full justify-center flex-wrap pt-3 border-t border-slate-800/60">
                {/* Quick +5m Extension */}
                <button
                  onClick={() => handleAddTime(5)}
                  title="Need 5 more minutes? (+ key)"
                  className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-violet-400" />
                  <span>+5m</span>
                </button>

                {/* Play / Pause Toggle Button */}
                <button
                  onClick={() => togglePlayPause()}
                  title={isTimerRunning ? 'Pause Timer (Space)' : 'Start Timer (Space)'}
                  className={`flex items-center gap-2 px-5 sm:px-6 py-2 rounded-xl font-semibold shadow-lg transition-all cursor-pointer transform hover:scale-[1.02] ${
                    isTimerRunning
                      ? 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700'
                      : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Focus</span>
                    </>
                  )}
                  <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 font-mono text-slate-300">Space</span>
                </button>

                {/* Complete Early Button (Celebratory) */}
                <button
                  onClick={() => completeTask(activeTask.id)}
                  title="Complete this block early & advance"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Done</span>
                </button>

                {/* Skip Button */}
                <button
                  onClick={() => skipTask(activeTask.id)}
                  title="Skip and pull next task to Now (N key)"
                  className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-all cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Skip</span>
                  <span className="text-[10px] px-1 rounded bg-slate-800 font-mono text-slate-400">N</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Radial Celestial Progress Dial */
          <div className="flex flex-col items-center justify-center w-full max-w-md">
            <div className="relative flex items-center justify-center select-none my-2 sm:my-3 w-full max-w-[270px] aspect-square mx-auto">
              {/* Animated Atmospheric Multi-layer Glow */}
              <div
                className={`absolute w-full h-full rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
                  isTimerRunning ? 'animate-aura opacity-50' : 'opacity-20'
                }`}
                style={{
                  backgroundColor: isOvertime ? '#f59e0b' : currentEnergy.color,
                }}
              />

              {/* Concentric Animated Ripple Waves When Running */}
              {isTimerRunning && (
                <>
                  <div
                    className="absolute w-[90%] h-[90%] rounded-full border border-violet-500/30 animate-ripple pointer-events-none"
                    style={{ borderColor: activeGradient.glow }}
                  />
                  <div
                    className="absolute w-[90%] h-[90%] rounded-full border border-violet-500/20 animate-ripple-delayed pointer-events-none"
                    style={{ borderColor: activeGradient.glow }}
                  />
                </>
              )}

              {/* Main SVG Dial */}
              <svg viewBox="0 0 270 270" className="relative z-10 w-full h-auto aspect-square max-w-[270px]">
                <defs>
                  <linearGradient id="focusProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isOvertime ? '#f59e0b' : activeGradient.from} />
                    <stop offset="50%" stopColor={isOvertime ? '#fbbf24' : activeGradient.via} />
                    <stop offset="100%" stopColor={isOvertime ? '#ea580c' : activeGradient.to} />
                  </linearGradient>

                  <filter id="timerGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation={isTimerRunning ? '6' : '3'}
                      floodColor={isOvertime ? '#f59e0b' : currentEnergy.color}
                      floodOpacity={isTimerRunning ? '0.75' : '0.4'}
                    />
                  </filter>
                </defs>

                {/* Celestial Orbiting Dashed Ring */}
                <circle
                  cx={135}
                  cy={135}
                  r={130}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={1}
                  strokeDasharray="4 8"
                  fill="transparent"
                  className={isTimerRunning ? 'animate-orbit origin-center' : ''}
                  style={{ transformOrigin: '135px 135px' }}
                />

                {/* Inner Concentric Guide Ring */}
                <circle
                  cx={135}
                  cy={135}
                  r={95}
                  stroke="rgba(255, 255, 255, 0.04)"
                  strokeWidth={1}
                  fill="transparent"
                />

                {/* 60 Precision Chronometer Dial Notches */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const notchAngle = ((i * 6 - 90) * Math.PI) / 180;
                  const isFive = i % 5 === 0;
                  const rOuter = radius + (isFive ? 9 : 5);
                  const rInner = radius + 2;
                  const x1 = 135 + rInner * Math.cos(notchAngle);
                  const y1 = 135 + rInner * Math.sin(notchAngle);
                  const x2 = 135 + rOuter * Math.cos(notchAngle);
                  const y2 = 135 + rOuter * Math.sin(notchAngle);
                  const isPassed = (i / 60) * 100 <= progressPercent;

                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={
                        isPassed
                          ? isOvertime
                            ? '#f59e0b'
                            : activeGradient.via
                          : 'rgba(255, 255, 255, 0.12)'
                      }
                      strokeWidth={isFive ? 1.8 : 0.9}
                      strokeLinecap="round"
                      className="transition-colors duration-300"
                    />
                  );
                })}

                {/* Background Track Ring */}
                <circle
                  cx={135}
                  cy={135}
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />

                {/* Dynamic Animated Progress Arc */}
                <circle
                  cx={135}
                  cy={135}
                  r={radius}
                  stroke="url(#focusProgressGrad)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  filter="url(#timerGlow)"
                  className="transform -rotate-90 origin-center transition-all duration-500 ease-out"
                  style={{ transformOrigin: '135px 135px' }}
                />

                {/* Glowing Sweep Comet Tip with Sparkle Trail */}
                {progressPercent > 0 && progressPercent < 100 && (
                  <g className="transition-all duration-300 ease-out">
                    {/* Trailing Particle 2 */}
                    <circle
                      cx={trail2X}
                      cy={trail2Y}
                      r={3}
                      fill={isOvertime ? '#f59e0b' : activeGradient.to}
                      opacity={0.35}
                    />
                    {/* Trailing Particle 1 */}
                    <circle
                      cx={trail1X}
                      cy={trail1Y}
                      r={4.5}
                      fill={isOvertime ? '#fbbf24' : activeGradient.via}
                      opacity={0.65}
                    />
                    {/* Outer Comet Pulsing Aura */}
                    <circle
                      cx={tipX}
                      cy={tipY}
                      r={11}
                      fill={isOvertime ? '#f59e0b' : activeGradient.via}
                      opacity={isTimerRunning ? 0.35 : 0.15}
                      className={isTimerRunning ? 'animate-comet-sparkle' : ''}
                    />
                    {/* Main Comet Head */}
                    <circle
                      cx={tipX}
                      cy={tipY}
                      r={6.5}
                      fill={isOvertime ? '#f59e0b' : activeGradient.via}
                      className={isTimerRunning ? 'animate-pulse' : ''}
                      filter="url(#timerGlow)"
                    />
                    <circle cx={tipX} cy={tipY} r={2.8} fill="#ffffff" />
                  </g>
                )}
              </svg>

              {/* Inner Content Display */}
              <div className="absolute z-20 flex flex-col items-center justify-center text-center">
                {/* Live Real-time Pill */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/80 mb-1 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{liveTimeString}</span>
                </div>

                {isOvertime ? (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 mb-0.5 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    <span>OVERTIME</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isTimerRunning ? (
                      <span className="text-[9px] uppercase tracking-widest font-bold text-violet-300 bg-violet-950/70 px-2 py-0.5 rounded-full border border-violet-500/30">
                        IN FLOW
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-800">
                        PAUSED
                      </span>
                    )}
                  </div>
                )}

                <div className="my-1 flex justify-center">
                  <AnimatedCountdownTimer
                    secondsRemaining={timerRemainingSeconds}
                    isRunning={isTimerRunning}
                    glowColor={isOvertime ? 'rgba(245, 158, 11, 0.7)' : activeGradient.glow}
                    size="radial"
                    floatingNotification={floatingNotification}
                  />
                </div>

                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-800 font-mono">
                  <span>{formatDuration(activeTask.durationMinutes)}</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-bold text-slate-200">{progressPercent}%</span>
                </div>
              </div>
            </div>

            {/* Micro-Controls */}
            <div className="flex items-center gap-2 sm:gap-3 mt-3 flex-wrap justify-center relative z-20">
              <button
                onClick={() => handleAddTime(5)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-violet-400" />
                <span>+5m</span>
              </button>

              <button
                onClick={() => togglePlayPause()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all cursor-pointer transform hover:scale-[1.02] ${
                  isTimerRunning
                    ? 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700'
                    : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Focus</span>
                  </>
                )}
                <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 font-mono text-slate-300">Space</span>
              </button>

              <button
                onClick={() => completeTask(activeTask.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Done</span>
              </button>

              <button
                onClick={() => skipTask(activeTask.id)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-all cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Skip</span>
                <span className="text-[10px] px-1 rounded bg-slate-800 font-mono text-slate-400">N</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Up Next Sneak Peek Card */}
      {nextTask ? (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 rounded-xl p-3 border">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Up Next</span>
                {nextEnergy && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${nextEnergy.badgeBg}`}>
                    {nextEnergy.label}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{nextTask.title}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 w-full sm:w-auto justify-between sm:justify-end">
            <span>{formatDuration(nextTask.durationMinutes)}</span>
            <span className="text-slate-600">•</span>
            <span>Starts at {formatTime(nextTask.startTime)}</span>
            <button
              onClick={() => startTask(nextTask.id)}
              className="text-[11px] font-medium text-violet-400 hover:text-violet-300 hover:underline cursor-pointer"
            >
              Start Now
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 pt-2 border-t border-slate-800/60 text-center text-xs text-slate-500">
          Last task of the day! Great momentum.
        </div>
      )}
    </div>
  );
};
