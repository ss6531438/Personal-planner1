import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { ENERGY_CONFIG, CLOCK_COLOR_PRESETS } from '../types';
import { formatTime } from '../utils/timeEngine';
import { Settings2, Volume2, VolumeX, Sparkles, Clock } from 'lucide-react';

interface AntiqueAnalogClockProps {
  size?: number; // width/height in px, default 280
  showControls?: boolean;
  interactive?: boolean;
}

const ROMAN_NUMERALS = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
const ARABIC_NUMERALS = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

export const AntiqueAnalogClock: React.FC<AntiqueAnalogClockProps> = ({
  size = 280,
  showControls = true,
  interactive = true,
}) => {
  const {
    tasks,
    activeTaskId,
    isTimerRunning,
    timerRemainingSeconds,
    settings,
    setActiveModal,
    setTickingSound,
    setClockHandsMode,
  } = usePlannerStore();

  const [realTime, setRealTime] = useState<Date>(() => new Date());
  const [smoothSecondsAngle, setSmoothSecondsAngle] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  // Live real-time clock synchronization loop
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const isRealtime = (settings?.clockHandsMode ?? 'realtime') === 'realtime';

  // Active task & calculations
  const activeTask = useMemo(() => {
    const found = tasks.find((t) => t.id === activeTaskId && t.status === 'active') || tasks.find((t) => t.status === 'active');
    if (found) return found;
    if (isTimerRunning || activeTaskId) {
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

  // Resolved colors
  const activeColors = useMemo(() => {
    if (settings?.clockColorPreset === 'custom') {
      return settings?.clockCustomColors || CLOCK_COLOR_PRESETS['brass-ivory'].colors;
    }
    const preset = settings?.clockColorPreset || 'brass-ivory';
    return CLOCK_COLOR_PRESETS[preset]?.colors || CLOCK_COLOR_PRESETS['brass-ivory'].colors;
  }, [settings?.clockColorPreset, settings?.clockCustomColors]);

  const energyColor = activeTask ? ENERGY_CONFIG[activeTask.energyLevel].color : activeColors.accent;

  // Real-time smooth sweep loop when secondsHandMode === 'smooth'
  useEffect(() => {
    if (settings?.secondsHandMode !== 'smooth') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const updateSmooth = () => {
      const now = new Date();
      if (isRealtime) {
        const s = now.getSeconds();
        const ms = now.getMilliseconds();
        const angle = (s + ms / 1000) * 6;
        setSmoothSecondsAngle(angle);
      } else {
        const absRemaining = Math.abs(timerRemainingSeconds);
        const remainingSecondsInMinute = absRemaining % 60;
        const baseElapsed = (60 - remainingSecondsInMinute) % 60;
        const angle = baseElapsed * 6;
        setSmoothSecondsAngle(angle);
      }
      animFrameRef.current = requestAnimationFrame(updateSmooth);
    };

    animFrameRef.current = requestAnimationFrame(updateSmooth);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [settings?.secondsHandMode, isRealtime, timerRemainingSeconds]);

  // Real-Time Hand Angles:
  const currentHours = realTime.getHours();
  const currentMinutes = realTime.getMinutes();
  const currentSeconds = realTime.getSeconds();

  const realtimeHourAngle = ((currentHours % 12) + currentMinutes / 60 + currentSeconds / 3600) * 30;
  const realtimeMinuteAngle = (currentMinutes + currentSeconds / 60) * 6;
  const realtimeSecondAngle = settings?.secondsHandMode === 'smooth' ? smoothSecondsAngle : currentSeconds * 6;

  // Countdown Chronometer Hand Angles:
  const absRemaining = Math.abs(timerRemainingSeconds);
  const remainingMins = absRemaining / 60;
  const countdownMinuteAngle = (remainingMins % 60) * 6;
  const countdownHourAngle = ((remainingMins / 60) % 12) * 30;
  const countdownSecondAngle =
    settings?.secondsHandMode === 'smooth'
      ? smoothSecondsAngle
      : ((60 - (absRemaining % 60)) % 60) * 6;

  // Final Resolved Hand Angles:
  const hourAngle = isRealtime ? realtimeHourAngle : countdownHourAngle;
  const minuteAngle = isRealtime ? realtimeMinuteAngle : countdownMinuteAngle;
  const secondsAngle = isRealtime ? realtimeSecondAngle : countdownSecondAngle;

  // Center & radius geometry
  const center = size / 2;
  const radius = center - 16;
  const numberRadius = radius * 0.76;
  const minuteHashRadius = radius * 0.91;

  // Focus sector arc calculation:
  let sectorPath = '';
  let isFullDisc = false;
  let targetPipX = 0;
  let targetPipY = 0;
  let hasTargetPip = false;
  let targetEndTimeStr = '';

  if (isRealtime) {
    if (activeTask) {
      const taskDurationMinutes = Math.max(1, activeTask.durationMinutes || 25);
      const totalSecs = taskDurationMinutes * 60;
      const elapsedSecs = Math.max(0, totalSecs - timerRemainingSeconds);

      // Session start time (derived from elapsed time relative to current realTime)
      const sessionStart = new Date(realTime.getTime() - elapsedSecs * 1000);
      // Session finish time (realTime + remaining seconds)
      const sessionEnd = new Date(realTime.getTime() + Math.max(0, timerRemainingSeconds) * 1000);
      targetEndTimeStr = formatTime(sessionEnd);

      const startMin = sessionStart.getMinutes() + sessionStart.getSeconds() / 60;
      const endMin = sessionEnd.getMinutes() + sessionEnd.getSeconds() / 60;

      const startAngleDeg = (startMin % 60) * 6;
      const endAngleDeg = (endMin % 60) * 6;
      const diffDeg = ((endAngleDeg - startAngleDeg) % 360 + 360) % 360;

      if (diffDeg >= 359) {
        isFullDisc = true;
      } else if (diffDeg > 0.5) {
        const radStart = ((startAngleDeg - 90) * Math.PI) / 180;
        const radEnd = ((endAngleDeg - 90) * Math.PI) / 180;
        const sx = center + radius * 0.88 * Math.cos(radStart);
        const sy = center + radius * 0.88 * Math.sin(radStart);
        const ex = center + radius * 0.88 * Math.cos(radEnd);
        const ey = center + radius * 0.88 * Math.sin(radEnd);
        const largeArc = diffDeg > 180 ? 1 : 0;

        sectorPath = `M ${center} ${center} L ${sx} ${sy} A ${radius * 0.88} ${radius * 0.88} 0 ${largeArc} 1 ${ex} ${ey} Z`;

        targetPipX = ex;
        targetPipY = ey;
        hasTargetPip = true;
      }
    }
  } else {
    // Countdown Mode: from 12 o'clock (0°) clockwise by remaining session fraction
    const totalDurationSeconds = Math.max(1, (activeTask?.durationMinutes || 25) * 60);
    const progressFraction = Math.max(0, Math.min(1, (totalDurationSeconds - timerRemainingSeconds) / totalDurationSeconds));
    const sectorAngleDeg = (1 - progressFraction) * 360;

    if (sectorAngleDeg >= 359) {
      isFullDisc = true;
    } else if (sectorAngleDeg > 1) {
      const sectorEndAngleRad = ((sectorAngleDeg - 90) * Math.PI) / 180;
      const sectorStartX = center;
      const sectorStartY = center - radius * 0.88;
      const sectorEndX = center + radius * 0.88 * Math.cos(sectorEndAngleRad);
      const sectorEndY = center + radius * 0.88 * Math.sin(sectorEndAngleRad);
      const largeArcFlag = sectorAngleDeg > 180 ? 1 : 0;

      sectorPath = `M ${center} ${center} L ${sectorStartX} ${sectorStartY} A ${radius * 0.88} ${radius * 0.88} 0 ${largeArcFlag} 1 ${sectorEndX} ${sectorEndY} Z`;
    }
  }

  const clockStyle = settings.clockStyle;

  return (
    <div className="relative flex flex-col items-center justify-center select-none group">
      {/* Antique Pocket Watch Hanging Crown Bow Ring (if Pocket Watch style) */}
      {clockStyle === 'pocket-watch' && (
        <div className="flex flex-col items-center -mb-2 z-10">
          {/* Hanging Bow Ring */}
          <div
            className="w-12 h-8 rounded-t-full border-4 border-b-0 shadow-md"
            style={{
              borderColor: activeColors.bezel,
              background: 'transparent',
            }}
          />
          {/* Winding Crown Knob with knurling */}
          <div
            className="w-7 h-3 rounded-sm shadow-inner -mt-1 border"
            style={{
              background: `linear-gradient(to right, ${activeColors.bezel}, #fef08a, ${activeColors.bezel})`,
              borderColor: 'rgba(0,0,0,0.5)',
            }}
          />
        </div>
      )}

      {/* Main SVG Clock Dial */}
      <div
        className="relative flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.01] w-full"
        style={{ maxWidth: `${size}px` }}
        onClick={() => {
          if (interactive) setActiveModal('clock-studio');
        }}
        title="Click to customize Antique Clock & Ticking Sounds"
      >
        {/* Ambient Backlight Glow */}
        <div
          className={`absolute rounded-full blur-2xl pointer-events-none transition-all duration-700 ${
            isTimerRunning ? 'opacity-40 animate-pulse' : 'opacity-15'
          }`}
          style={{
            width: '85%',
            height: '85%',
            backgroundColor: energyColor,
          }}
        />

        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="relative z-10 overflow-visible w-full h-auto aspect-square max-w-full"
        >
          <defs>
            {/* Metallic Bezel Gradient */}
            <linearGradient id="antiqueBezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="25%" stopColor={activeColors.bezel} />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="75%" stopColor={activeColors.bezel} />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>

            {/* Steampunk Copper & Bronze Rim Gradient */}
            <radialGradient id="steampunkRimGrad" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor={activeColors.dialBg} />
              <stop offset="94%" stopColor={activeColors.bezel} />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>

            {/* Dial Face Texture Gradient */}
            <radialGradient id="antiqueDialFace" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={activeColors.dialBg} stopOpacity="0.95" />
              <stop offset="70%" stopColor={activeColors.dialBg} stopOpacity="1" />
              <stop offset="98%" stopColor="#020617" stopOpacity="1" />
            </radialGradient>

            {/* Sector / Shaded Focus Wedge Gradient */}
            <radialGradient id="focusSectorGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={energyColor} stopOpacity="0.1" />
              <stop offset="75%" stopColor={energyColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={energyColor} stopOpacity="0.4" />
            </radialGradient>

            {/* Antique Hands Drop Shadow */}
            <filter id="antiqueHandShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1.5" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.75" />
            </filter>

            {/* Second Hand Glow Filter */}
            <filter id="secondHandGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={activeColors.secondsHand} floodOpacity="0.6" />
            </filter>
          </defs>

          {/* 1. OUTER BEZEL & CASING */}
          {/* Outer Bezel Rim */}
          <circle
            cx={center}
            cy={center}
            r={radius + 8}
            fill="none"
            stroke="url(#antiqueBezelGrad)"
            strokeWidth={clockStyle === 'chronometer' ? 14 : clockStyle === 'steampunk' ? 12 : 8}
            className="filter drop-shadow-xl"
          />

          {/* Steampunk / Chronometer Rivets / Hex Bolts */}
          {(clockStyle === 'steampunk' || clockStyle === 'chronometer') &&
            Array.from({ length: 12 }).map((_, i) => {
              const ang = (i * 30 * Math.PI) / 180;
              const bx = center + (radius + 8) * Math.cos(ang);
              const by = center + (radius + 8) * Math.sin(ang);
              return (
                <circle
                  key={i}
                  cx={bx}
                  cy={by}
                  r={clockStyle === 'steampunk' ? 2.5 : 2}
                  fill="#fef08a"
                  stroke="#451a03"
                  strokeWidth={0.8}
                />
              );
            })}

          {/* Inner Beaded / Knurled Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius + 1}
            fill="none"
            stroke={activeColors.bezel}
            strokeWidth={1.5}
            strokeDasharray={clockStyle === 'art-deco' ? '3 3' : '1 3'}
          />

          {/* 2. DIAL FACE BACKGROUND */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="url(#antiqueDialFace)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />

          {/* Antique Guilloché Sunburst Engraving Patterns */}
          <circle
            cx={center}
            cy={center}
            r={radius * 0.85}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
            strokeDasharray="4 8"
          />
          <circle
            cx={center}
            cy={center}
            r={radius * 0.58}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={1}
          />

          {/* Art Deco Sunburst Rays */}
          {clockStyle === 'art-deco' && (
            <g opacity="0.12">
              {Array.from({ length: 24 }).map((_, i) => {
                const ang = (i * 15 * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={center + radius * 0.3 * Math.cos(ang)}
                    y1={center + radius * 0.3 * Math.sin(ang)}
                    x2={center + radius * 0.8 * Math.cos(ang)}
                    y2={center + radius * 0.8 * Math.sin(ang)}
                    stroke={activeColors.numerals}
                    strokeWidth={i % 2 === 0 ? 1.5 : 0.8}
                  />
                );
              })}
            </g>
          )}

          {/* Steampunk Rotating Skeleton Gear Cogs (Decorative) */}
          {clockStyle === 'steampunk' && settings.showGears && (
            <g className="origin-center transition-all opacity-30">
              {/* Center Brass Gear */}
              <circle
                cx={center}
                cy={center}
                r={radius * 0.36}
                fill="none"
                stroke={activeColors.bezel}
                strokeWidth={3}
                strokeDasharray="4 6"
                className={isTimerRunning ? 'animate-orbit' : ''}
                style={{ transformOrigin: `${center}px ${center}px` }}
              />
              {/* Secondary Counter-rotating Cog */}
              <circle
                cx={center - 32}
                cy={center - 20}
                r={radius * 0.22}
                fill="none"
                stroke="#c2410c"
                strokeWidth={2.5}
                strokeDasharray="3 4"
                className={isTimerRunning ? 'animate-orbit-reverse' : ''}
                style={{ transformOrigin: `${center - 32}px ${center - 20}px` }}
              />
            </g>
          )}

          {/* Chronometer Marine Compass Rose */}
          {clockStyle === 'chronometer' && (
            <g opacity="0.18" stroke={activeColors.numerals} fill="none">
              <polygon
                points={`${center},${center - 30} ${center + 6},${center - 6} ${center + 30},${center} ${center + 6},${center + 6} ${center},${center + 30} ${center - 6},${center + 6} ${center - 30},${center} ${center - 6},${center - 6}`}
                fill={activeColors.numerals}
                fillOpacity="0.08"
                strokeWidth={1}
              />
              <circle cx={center} cy={center} r={18} strokeWidth={0.8} strokeDasharray="2 3" />
            </g>
          )}          {/* 3. FOCUS TIMER SECTOR (Pie Wedge of Focus Session) */}
          {activeTask && (
            isFullDisc ? (
              <circle
                cx={center}
                cy={center}
                r={radius * 0.88}
                fill="url(#focusSectorGrad)"
                stroke={energyColor}
                strokeWidth={1.5}
                strokeOpacity={0.5}
                className={isTimerRunning ? 'animate-sector-breathe' : ''}
              />
            ) : sectorPath ? (
              <path
                d={sectorPath}
                fill="url(#focusSectorGrad)"
                stroke={energyColor}
                strokeWidth={1.5}
                strokeOpacity={0.6}
                className={`transition-all duration-300 ${isTimerRunning ? 'animate-sector-breathe' : ''}`}
              />
            ) : null
          )}

          {/* Target Finish Diamond Pip on Railroad Track (in Realtime Mode) */}
          {hasTargetPip && (
            <g transform={`translate(${targetPipX}, ${targetPipY})`}>
              <polygon
                points="0,-4.5 4.5,0 0,4.5 -4.5,0"
                fill={energyColor}
                stroke="#ffffff"
                strokeWidth={1}
                className="animate-pulse"
                filter="url(#antiqueHandShadow)"
              />
            </g>
          )}

          {/* Real-time Live Badge inside Antique Dial */}
          <g transform={`translate(${center}, ${center - radius * 0.42})`}>
            <rect
              x={-48}
              y={-9}
              width={96}
              height={18}
              rx={9}
              fill={activeColors.dialBg}
              stroke={isRealtime ? activeColors.bezel : isTimerRunning ? '#f59e0b' : activeColors.bezel}
              strokeWidth={1}
              strokeOpacity={0.8}
            />
            <circle
              cx={-36}
              cy={0}
              r={2.5}
              fill={isRealtime ? '#10b981' : '#f59e0b'}
              className={isTimerRunning ? 'animate-ping' : ''}
            />
            <circle cx={-36} cy={0} r={2} fill={isRealtime ? '#10b981' : '#f59e0b'} />
            <text
              x={6}
              y={0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={8.5}
              fontWeight="bold"
              fontFamily="var(--font-mono), monospace"
              fill={activeColors.numerals}
              letterSpacing="0.05em"
              className={!isRealtime && isTimerRunning ? 'animate-pulse' : ''}
            >
              {isRealtime
                ? realTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
                : `CHRONO ${String(Math.floor(Math.abs(timerRemainingSeconds) / 60)).padStart(2, '0')}:${String(Math.abs(timerRemainingSeconds) % 60).padStart(2, '0')}`}
            </text>
          </g>

          {/* Sub-label: Shows Target Finish Time in Realtime Mode, or Classic Maker Seal */}
          {activeTask && isRealtime && targetEndTimeStr ? (
            <g transform={`translate(${center}, ${center + radius * 0.28})`}>
              <rect
                x={-44}
                y={-8}
                width={88}
                height={16}
                rx={8}
                fill={activeColors.dialBg}
                stroke={energyColor}
                strokeWidth={1}
                strokeOpacity={0.7}
              />
              <text
                x={0}
                y={0.5}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={7}
                fontWeight="bold"
                fontFamily="var(--font-mono), monospace"
                fill={energyColor}
                letterSpacing="0.06em"
              >
                {timerRemainingSeconds <= 0 ? 'OVERTIME' : `ENDS ${targetEndTimeStr}`}
              </text>
            </g>
          ) : (
            <g transform={`translate(${center}, ${center + radius * 0.28})`} opacity={0.85}>
              {/* Spinning Escapement Cogwheel in Chronometer Mode */}
              {!isRealtime && isTimerRunning && (
                <g className="animate-spin origin-center" style={{ animationDuration: '6s' }}>
                  <circle cx={0} cy={-12} r={4.5} fill="none" stroke={activeColors.bezel} strokeWidth={0.8} strokeDasharray="1.5 2" opacity={0.6} />
                  <circle cx={0} cy={-12} r={1.5} fill="#f59e0b" />
                </g>
              )}
              <text
                x={0}
                y={0}
                textAnchor="middle"
                fontSize={7}
                fontWeight="bold"
                fontFamily="Georgia, serif"
                letterSpacing="0.15em"
                fill={activeColors.numerals}
              >
                FLOWSTATE
              </text>
              <text
                x={0}
                y={7}
                textAnchor="middle"
                fontSize={5.5}
                fontFamily="Georgia, serif"
                letterSpacing="0.1em"
                fill={activeColors.bezel}
              >
                CHRONOMETER
              </text>
            </g>
          )}

          {/* 4. RAILROAD MINUTE TRACK & 5-MINUTE MARKERS */}
          {/* Double concentric rail lines */}
          <circle
            cx={center}
            cy={center}
            r={minuteHashRadius}
            fill="none"
            stroke={activeColors.numerals}
            strokeOpacity={0.25}
            strokeWidth={0.8}
          />
          <circle
            cx={center}
            cy={center}
            r={minuteHashRadius - 5}
            fill="none"
            stroke={activeColors.numerals}
            strokeOpacity={0.2}
            strokeWidth={0.8}
          />

          {/* 60 Minute Hashes */}
          {Array.from({ length: 60 }).map((_, i) => {
            const isFiveMin = i % 5 === 0;
            const ang = (i * 6 * Math.PI) / 180;
            const rOuter = minuteHashRadius;
            const rInner = isFiveMin ? minuteHashRadius - 6 : minuteHashRadius - 3.5;

            const x1 = center + rOuter * Math.cos(ang);
            const y1 = center + rOuter * Math.sin(ang);
            const x2 = center + rInner * Math.cos(ang);
            const y2 = center + rInner * Math.sin(ang);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={activeColors.numerals}
                strokeOpacity={isFiveMin ? 0.8 : 0.3}
                strokeWidth={isFiveMin ? 1.8 : 0.8}
              />
            );
          })}

          {/* 5. NUMERALS (Roman, Arabic, or Hash) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const ang = ((i * 30 - 90) * Math.PI) / 180;
            const nx = center + numberRadius * Math.cos(ang);
            const ny = center + numberRadius * Math.sin(ang);

            const numeralText =
              settings?.numeralsStyle === 'roman'
                ? ROMAN_NUMERALS[i]
                : settings?.numeralsStyle === 'arabic'
                ? ARABIC_NUMERALS[i]
                : '•';

            return (
              <text
                key={i}
                x={nx}
                y={ny}
                textAnchor="middle"
                dominantBaseline="central"
                fill={activeColors.numerals}
                fontFamily={
                  settings?.numeralsStyle === 'roman'
                    ? 'Georgia, "Times New Roman", serif'
                    : 'var(--font-sans), sans-serif'
                }
                fontSize={
                  settings?.numeralsStyle === 'hash'
                    ? 18
                    : clockStyle === 'art-deco'
                    ? 13
                    : 11.5
                }
                fontWeight="bold"
                letterSpacing={settings?.numeralsStyle === 'roman' ? '0.05em' : 'normal'}
                className="select-none pointer-events-none drop-shadow-sm"
              >
                {numeralText}
              </text>
            );
          })}

          {/* 6. SUBDIAL (For Vintage Pocket Watch / Chronometer Seconds) */}
          {settings?.secondsHandMode === 'subdial' && (
            <g transform={`translate(${center}, ${center + radius * 0.42})`}>
              <circle
                cx={0}
                cy={0}
                r={radius * 0.22}
                fill={activeColors.dialBg}
                stroke={activeColors.bezel}
                strokeWidth={1}
                strokeOpacity={0.6}
              />
              {Array.from({ length: 12 }).map((_, si) => {
                const sAng = (si * 30 * Math.PI) / 180;
                const sr1 = radius * 0.22;
                const sr2 = si % 3 === 0 ? sr1 - 3 : sr1 - 2;
                return (
                  <line
                    key={si}
                    x1={sr1 * Math.cos(sAng)}
                    y1={sr1 * Math.sin(sAng)}
                    x2={sr2 * Math.cos(sAng)}
                    y2={sr2 * Math.sin(sAng)}
                    stroke={activeColors.numerals}
                    strokeWidth={0.8}
                    strokeOpacity={0.6}
                  />
                );
              })}
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={-radius * 0.18}
                stroke={activeColors.secondsHand}
                strokeWidth={1.5}
                strokeLinecap="round"
                transform={`rotate(${secondsAngle})`}
                filter="url(#secondHandGlow)"
              />
              <circle cx={0} cy={0} r={2} fill={activeColors.secondsHand} />
              <text
                x={0}
                y={radius * 0.12}
                textAnchor="middle"
                fontSize={6}
                fill={activeColors.numerals}
                opacity={0.7}
              >
                SEC
              </text>
            </g>
          )}

          {/* 7. CLOCK HANDS (Hour & Minute Hands) */}
          {/* HOUR HAND */}
          <g
            transform={`rotate(${hourAngle} ${center} ${center})`}
            filter="url(#antiqueHandShadow)"
          >
            <line
              x1={center}
              y1={center + 12}
              x2={center}
              y2={center - radius * 0.52}
              stroke={activeColors.hands}
              strokeWidth={3.5}
              strokeLinecap="round"
            />
            <circle
              cx={center}
              cy={center - radius * 0.42}
              r={5.5}
              fill={activeColors.dialBg}
              stroke={activeColors.hands}
              strokeWidth={2}
            />
            <polygon
              points={`${center},${center - radius * 0.58} ${center - 4},${center - radius * 0.46} ${center + 4},${center - radius * 0.46}`}
              fill={activeColors.hands}
            />
          </g>

          {/* MINUTE HAND */}
          <g
            transform={`rotate(${minuteAngle} ${center} ${center})`}
            filter="url(#antiqueHandShadow)"
          >
            <line
              x1={center}
              y1={center + 16}
              x2={center}
              y2={center - radius * 0.8}
              stroke={activeColors.hands}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <circle
              cx={center}
              cy={center - radius * 0.65}
              r={4.5}
              fill="none"
              stroke={activeColors.hands}
              strokeWidth={1.8}
            />
            <polygon
              points={`${center},${center - radius * 0.86} ${center - 2.5},${center - radius * 0.76} ${center + 2.5},${center - radius * 0.76}`}
              fill={activeColors.hands}
            />
          </g>

          {/* 8. SECONDS HAND */}
          {settings?.secondsHandMode !== 'none' && settings?.secondsHandMode !== 'subdial' && (
            <g
              transform={`rotate(${secondsAngle} ${center} ${center})`}
              filter="url(#secondHandGlow)"
              className={settings?.secondsHandMode === 'tick' ? 'transition-transform duration-75 ease-out' : ''}
            >
              <line
                x1={center}
                y1={center + 20}
                x2={center}
                y2={center - radius * 0.88}
                stroke={activeColors.secondsHand}
                strokeWidth={1.2}
                strokeLinecap="round"
              />
              <circle
                cx={center}
                cy={center + 12}
                r={3}
                fill={activeColors.secondsHand}
              />
            </g>
          )}

          {/* 9. CENTER ARBOR PIN & CAP */}
          <circle cx={center} cy={center} r={6} fill={activeColors.bezel} />
          <circle cx={center} cy={center} r={3.5} fill="#fef08a" />
          <circle cx={center} cy={center} r={1.5} fill="#000000" />
        </svg>

        {/* 10. GRANDFATHER CLOCK SWINGING PENDULUM VITRINE CABINET */}
        {clockStyle === 'grandfather' && settings?.showPendulum && (
          <div className="relative -mt-2 mb-2 flex flex-col items-center z-10">
            <div
              className="w-24 h-24 rounded-b-2xl border-2 border-t-0 shadow-2xl relative flex flex-col items-center overflow-hidden"
              style={{
                background: 'linear-gradient(to bottom, #1c0e05 0%, #0d0602 100%)',
                borderColor: activeColors.bezel,
                boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              {/* Glass Reflection Highlight */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                }}
              />
              {/* Pendulum Rod & Bob Container */}
              <div
                className={`flex flex-col items-center origin-top mt-1 ${
                  isTimerRunning ? 'animate-pendulum' : 'rotate-0'
                }`}
                style={{
                  transformOrigin: 'top center',
                  animationDuration: '2s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                }}
              >
                <div
                  className="w-1.5 h-12 shadow-md"
                  style={{
                    background: `linear-gradient(to right, ${activeColors.bezel}, #fef08a, ${activeColors.bezel})`,
                  }}
                />
                <div
                  className="w-8 h-8 rounded-full border-2 shadow-xl -mt-1 flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, #fef08a 0%, ${activeColors.bezel} 60%, #451a03 100%)`,
                    borderColor: '#fef08a',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full border border-black/30"
                    style={{ backgroundColor: activeColors.dialBg }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Mini Controls under Clock */}
      {showControls && (
        <div className="flex items-center gap-2 mt-3 mb-1 z-20 flex-wrap justify-center w-full">
          {/* Mode Switcher: Real-Time vs Countdown */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 text-xs shadow-sm">
            <button
              type="button"
              onClick={() => setClockHandsMode('realtime')}
              title="Show live actual clock time"
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                isRealtime
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time</span>
            </button>
            <button
              type="button"
              onClick={() => setClockHandsMode('countdown')}
              title="Show remaining focus countdown"
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                !isRealtime
                  ? 'bg-violet-600/30 text-violet-200 font-semibold border border-violet-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Countdown</span>
            </button>
          </div>

          {/* Quick Customize Clock Studio Button */}
          <button
            type="button"
            onClick={() => setActiveModal('clock-studio')}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm group/btn"
          >
            <Settings2 className="w-3.5 h-3.5 text-violet-400 group-hover/btn:rotate-45 transition-transform" />
            <span>Customize</span>
          </button>

          {/* Quick Ticking Mute/Unmute Toggle */}
          <button
            type="button"
            onClick={() => {
              if (settings?.tickingSound === 'none') {
                setTickingSound('antique-pendulum');
              } else {
                setTickingSound('none');
              }
            }}
            title={settings?.tickingSound !== 'none' ? 'Mute Mechanical Ticking' : 'Enable Antique Ticking Sound'}
            className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center gap-1 ${
              settings?.tickingSound !== 'none'
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 shadow-sm'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {settings?.tickingSound !== 'none' ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
