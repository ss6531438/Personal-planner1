import React from 'react';

interface AnimatedDigitProps {
  char: string;
  position: string;
  className?: string;
}

const AnimatedDigit: React.FC<AnimatedDigitProps> = React.memo(({ char, position, className = '' }) => {
  return (
    <span
      key={`${position}-${char}`}
      className={`inline-block animate-digit-roll tabular-nums font-mono select-none ${className}`}
    >
      {char}
    </span>
  );
});

interface AnimatedCountdownTimerProps {
  secondsRemaining: number;
  isRunning: boolean;
  glowColor?: string;
  size?: 'large' | 'radial' | 'compact';
  floatingNotification?: string | null;
}

export const AnimatedCountdownTimer: React.FC<AnimatedCountdownTimerProps> = ({
  secondsRemaining,
  isRunning,
  glowColor = 'rgba(139, 92, 246, 0.7)',
  size = 'large',
  floatingNotification = null,
}) => {
  const isOvertime = secondsRemaining <= 0;
  const isFinalMinute = secondsRemaining > 0 && secondsRemaining <= 60;
  const absRemaining = Math.abs(secondsRemaining);

  const totalMinutes = Math.floor(absRemaining / 60);
  const totalSeconds = absRemaining % 60;

  const minStr = String(totalMinutes).padStart(2, '0');
  const secStr = String(totalSeconds).padStart(2, '0');

  // Character breakdown
  const minuteDigits = minStr.split('');
  const secondDigits = secStr.split('');

  // Sizing tokens
  const isRadial = size === 'radial';
  const isCompact = size === 'compact';

  const digitTextSize = isCompact
    ? 'text-2xl sm:text-3xl'
    : isRadial
    ? 'text-4xl sm:text-5xl'
    : 'text-4xl sm:text-6xl md:text-7xl';

  const podPadding = isCompact
    ? 'px-1.5 py-0.5 rounded-lg'
    : isRadial
    ? 'px-2 py-1 rounded-xl'
    : 'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl';

  const colonSize = isCompact
    ? 'text-xl mx-0.5'
    : isRadial
    ? 'text-3xl mx-1'
    : 'text-4xl sm:text-5xl md:text-6xl mx-1 sm:mx-2';

  // Active theme glow
  const currentGlow = isOvertime
    ? 'rgba(245, 158, 11, 0.85)'
    : isFinalMinute
    ? 'rgba(239, 68, 68, 0.85)'
    : glowColor;

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${
        isRunning && !isCompact ? 'animate-timer-tick' : ''
      }`}
    >
      {/* Floating extension notification (+5m / +1m) */}
      {floatingNotification && (
        <div
          key={floatingNotification + Date.now()}
          className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-float-fade"
        >
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-wider bg-violet-600/90 text-white border border-violet-400/50 shadow-lg shadow-violet-600/50 backdrop-blur-md">
            {floatingNotification}
          </span>
        </div>
      )}

      {/* Main Digit Display Container */}
      <div
        className={`flex items-center justify-center font-mono font-extrabold tracking-tight transition-all duration-300 relative ${
          isOvertime
            ? 'text-amber-300 animate-overtime-flash'
            : isFinalMinute
            ? 'text-rose-300'
            : 'text-white'
        }`}
        style={{
          textShadow: isRunning ? `0 0 28px ${currentGlow}, 0 0 10px ${currentGlow}` : 'none',
        }}
      >
        {/* Overtime Negative Sign / Indicator */}
        {isOvertime && secondsRemaining < 0 && (
          <div
            className={`mr-1.5 sm:mr-2 flex items-center justify-center font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg ${
              isRadial ? 'px-1.5 py-0.5 text-xl' : 'px-2 py-1 text-2xl sm:text-3xl'
            }`}
          >
            <span>+</span>
          </div>
        )}

        {/* Minutes Pod */}
        <div
          className={`flex items-center timer-digit-card border transition-all duration-300 ${podPadding} ${
            isFinalMinute
              ? 'border-rose-500/40 bg-rose-950/20'
              : isOvertime
              ? 'border-amber-500/40 bg-amber-950/20'
              : isRunning
              ? 'border-white/15'
              : 'border-white/5 opacity-80'
          }`}
        >
          {minuteDigits.map((digit, idx) => (
            <AnimatedDigit
              key={`min-${idx}-${digit}`}
              char={digit}
              position={`min-${idx}`}
              className={digitTextSize}
            />
          ))}
        </div>

        {/* Pulsing Colon Separator */}
        <div
          className={`flex flex-col items-center justify-center font-bold font-mono transition-opacity ${colonSize} ${
            isRunning
              ? isFinalMinute
                ? 'animate-colon-fast text-rose-400'
                : 'animate-colon-blink text-violet-300'
              : 'opacity-40 text-slate-400'
          }`}
        >
          <span>:</span>
        </div>

        {/* Seconds Pod */}
        <div
          className={`flex items-center timer-digit-card border transition-all duration-300 ${podPadding} ${
            isFinalMinute
              ? 'border-rose-500/40 bg-rose-950/20 animate-urgency'
              : isOvertime
              ? 'border-amber-500/40 bg-amber-950/20'
              : isRunning
              ? 'border-white/15'
              : 'border-white/5 opacity-80'
          }`}
        >
          {secondDigits.map((digit, idx) => (
            <AnimatedDigit
              key={`sec-${idx}-${digit}`}
              char={digit}
              position={`sec-${idx}`}
              className={digitTextSize}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Urgency / Overtime Micro-Badge */}
      {isFinalMinute && (
        <div className="mt-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-300 text-[10px] sm:text-[11px] font-mono font-bold animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
          <span>FINAL STRETCH • {absRemaining}s</span>
        </div>
      )}
    </div>
  );
};
