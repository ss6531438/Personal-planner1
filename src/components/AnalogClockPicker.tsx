import React, { useState, useRef, useCallback } from 'react';
import { format, isToday, parseISO, isBefore, addMinutes } from 'date-fns';
import { Calendar, Sun, Moon } from 'lucide-react';
import { clockTickingSound } from '../utils/audioEngine';

interface AnalogClockPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (dateStr: string) => void;
  selectedHour: number; // 1-12
  selectedMinute: number; // 0-59
  selectedPeriod: 'AM' | 'PM';
  onTimeChange: (hour: number, minute: number, period: 'AM' | 'PM') => void;
}

export const AnalogClockPicker: React.FC<AnalogClockPickerProps> = ({
  selectedDate,
  onDateChange,
  selectedHour,
  selectedMinute,
  selectedPeriod,
  onTimeChange,
}) => {
  const [mode, setMode] = useState<'hours' | 'minutes'>('hours');
  const clockRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Calculate 24h date object from current selection
  const getSelectedDateTime = useCallback(() => {
    let h24 = selectedHour;
    if (selectedPeriod === 'PM' && h24 < 12) h24 += 12;
    if (selectedPeriod === 'AM' && h24 === 12) h24 = 0;

    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, h24, selectedMinute, 0);
    return date;
  }, [selectedDate, selectedHour, selectedMinute, selectedPeriod]);

  // Check if chosen time is in the past for today
  const isPastTime = isToday(parseISO(selectedDate)) && isBefore(getSelectedDateTime(), new Date());

  const handlePointerCalculation = (e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = e.clientX - centerX;
    const y = e.clientY - centerY;

    // Angle in degrees from 12 o'clock (top) clockwise
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (mode === 'hours') {
      let hour = Math.round(angle / 30);
      if (hour === 0) hour = 12;
      if (hour !== selectedHour) {
        clockTickingSound.playTick(true, 'pocket-watch', 0.22);
      }
      onTimeChange(hour, selectedMinute, selectedPeriod);
    } else {
      // Minutes: 0 to 59
      let minute = Math.round(angle / 6);
      if (minute >= 60) minute = 0;
      if (minute !== selectedMinute) {
        clockTickingSound.playTick(false, 'pocket-watch', 0.18);
      }
      onTimeChange(selectedHour, minute, selectedPeriod);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handlePointerCalculation(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    handlePointerCalculation(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      // If finished setting hour, smoothly switch to minute mode!
      if (mode === 'hours') {
        setTimeout(() => setMode('minutes'), 150);
      }
    }
  };

  // Quick preset: Align to now or ahead
  const setTimeToAhead = (minutesAhead: number) => {
    const future = addMinutes(new Date(), minutesAhead);
    onDateChange(format(future, 'yyyy-MM-dd'));
    let h = future.getHours();
    const m = future.getMinutes();
    const p: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    onTimeChange(h, m, p);
  };

  // Clock Hand angles
  const minuteAngle = selectedMinute * 6;
  const activeHandAngle = mode === 'hours' ? (selectedHour % 12) * 30 : minuteAngle;

  const clockRadius = 100; // px
  const numberRadius = 78; // px

  return (
    <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Date Picker (Enforcing Ahead / Future Only) */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-violet-400" />
            <span>Select Date (Ahead / Future)</span>
          </span>
          {isToday(parseISO(selectedDate)) && (
            <span className="text-[10px] bg-violet-950 text-violet-300 px-1.5 py-0.5 rounded border border-violet-800/60 font-medium">
              Today
            </span>
          )}
        </label>

        <div className="flex items-center gap-2">
          <input
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value >= todayStr) {
                onDateChange(e.target.value);
              }
            }}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono cursor-pointer"
          />

          <button
            type="button"
            onClick={() => onDateChange(todayStr)}
            className={`px-2.5 py-2 text-xs rounded-xl font-medium border transition-all cursor-pointer ${
              selectedDate === todayStr
                ? 'bg-violet-600/30 text-violet-200 border-violet-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              const tomorrow = addMinutes(new Date(), 24 * 60);
              onDateChange(format(tomorrow, 'yyyy-MM-dd'));
            }}
            className="px-2.5 py-2 text-xs rounded-xl font-medium bg-slate-900 text-slate-400 border border-slate-800 hover:text-white transition-all cursor-pointer"
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* Digital Time Header & AM/PM Toggle */}
      <div className="flex items-center justify-between bg-slate-900/80 rounded-xl p-3 border border-slate-800">
        {/* Clickable HH : MM display */}
        <div className="flex items-center gap-1 font-mono text-2xl font-bold">
          <button
            type="button"
            onClick={() => setMode('hours')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              mode === 'hours'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {String(selectedHour).padStart(2, '0')}
          </button>
          <span className="text-slate-500 animate-pulse">:</span>
          <button
            type="button"
            onClick={() => setMode('minutes')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              mode === 'minutes'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {String(selectedMinute).padStart(2, '0')}
          </button>
        </div>

        {/* AM / PM switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onTimeChange(selectedHour, selectedMinute, 'AM')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              selectedPeriod === 'AM'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>AM</span>
          </button>
          <button
            type="button"
            onClick={() => onTimeChange(selectedHour, selectedMinute, 'PM')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              selectedPeriod === 'PM'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>PM</span>
          </button>
        </div>
      </div>

      {/* Warning if user picked past time for today */}
      {isPastTime && (
        <div className="flex items-center justify-between text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/60 p-2 rounded-lg">
          <span>This time is earlier today. Shift to right now?</span>
          <button
            type="button"
            onClick={() => setTimeToAhead(0)}
            className="underline font-semibold hover:text-amber-200 cursor-pointer ml-2"
          >
            Snap to Current Time
          </button>
        </div>
      )}

      {/* Interactive Analog Clock Face */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="text-[11px] text-slate-400 mb-2 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>{mode === 'hours' ? 'Click or drag hand to set Hour' : 'Click or drag hand to set Minute'}</span>
        </div>

        <div
          ref={clockRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-56 h-56 rounded-full bg-slate-900 border-4 border-amber-600/60 shadow-2xl shadow-amber-950/30 flex items-center justify-center select-none cursor-pointer touch-none ring-1 ring-amber-400/30"
        >
          {/* Subtle Concentric Rings & Antique Rail Track */}
          <div className="absolute inset-2 rounded-full border border-amber-500/20 pointer-events-none" />
          <div className="absolute inset-10 rounded-full border border-slate-800/60 pointer-events-none" />

          {/* Clock Center Pin */}
          <div className="absolute w-3.5 h-3.5 rounded-full bg-amber-400 z-30 shadow-md shadow-amber-500/50 border border-amber-200" />

          {/* Clock Hand Line & Target Head */}
          <div
            className="absolute top-1/2 left-1/2 origin-top z-20 pointer-events-none transition-transform duration-75"
            style={{
              transform: `rotate(${activeHandAngle + 180}deg) translateX(-50%)`,
              width: '2px',
              height: `${numberRadius}px`,
              background: 'linear-gradient(to bottom, #8b5cf6, #a78bfa)',
            }}
          >
            {/* Hand End Circle Node */}
            <div className="absolute -bottom-3 -left-3 w-7 h-7 rounded-full bg-violet-600/90 border-2 border-white shadow-lg flex items-center justify-center transform scale-90" />
          </div>

          {/* Clock Numbers (1-12 for Hours, 00-55 for Minutes) */}
          {mode === 'hours'
            ? Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                const angle = (num * 30 - 90) * (Math.PI / 180);
                const x = clockRadius + numberRadius * Math.cos(angle);
                const y = clockRadius + numberRadius * Math.sin(angle);
                const isSelected = selectedHour === num;

                return (
                  <div
                    key={num}
                    style={{ left: `${x}px`, top: `${y}px` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all pointer-events-none z-10 ${
                      isSelected ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {num}
                  </div>
                );
              })
            : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((min) => {
                const angle = (min * 6 - 90) * (Math.PI / 180);
                const x = clockRadius + numberRadius * Math.cos(angle);
                const y = clockRadius + numberRadius * Math.sin(angle);
                const isSelected = selectedMinute === min;

                return (
                  <div
                    key={min}
                    style={{ left: `${x}px`, top: `${y}px` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all pointer-events-none z-10 ${
                      isSelected ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {String(min).padStart(2, '0')}
                  </div>
                );
              })}
        </div>

        {/* Quick Forward Jumps */}
        <div className="flex items-center gap-1.5 mt-3 sm:mt-4 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => setTimeToAhead(0)}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
          >
            Now
          </button>
          <button
            type="button"
            onClick={() => setTimeToAhead(15)}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 hover:bg-slate-850 text-violet-300 border border-slate-800 transition-colors cursor-pointer"
          >
            +15m
          </button>
          <button
            type="button"
            onClick={() => setTimeToAhead(30)}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 hover:bg-slate-850 text-violet-300 border border-slate-800 transition-colors cursor-pointer"
          >
            +30m
          </button>
          <button
            type="button"
            onClick={() => setTimeToAhead(60)}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 hover:bg-slate-850 text-violet-300 border border-slate-800 transition-colors cursor-pointer"
          >
            +1 hour
          </button>
        </div>
      </div>
    </div>
  );
};
