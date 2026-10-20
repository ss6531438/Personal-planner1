import React, { useState, useEffect } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import type { EnergyLevel } from '../types';
import { ENERGY_CONFIG } from '../types';
import { AnalogClockPicker } from './AnalogClockPicker';
import { format, addMinutes, parseISO } from 'date-fns';
import { X, Check, Sparkles, Clock } from 'lucide-react';

export const EditTaskModal: React.FC = () => {
  const { activeModal, editingTaskId, tasks, updateTask, setActiveModal, addToast } = usePlannerStore();

  const task = tasks.find((t) => t.id === editingTaskId);

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('deep');
  const [notes, setNotes] = useState('');

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDuration(task.durationMinutes);
      setEnergyLevel(task.energyLevel);
      setNotes(task.notes || '');

      try {
        const start = parseISO(task.startTime);
        setSelectedDate(format(start, 'yyyy-MM-dd'));
        let h = start.getHours();
        const m = start.getMinutes();
        const p: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        setSelectedHour(h);
        setSelectedMinute(m);
        setSelectedPeriod(p);
      } catch (e) {
        // fallback
      }
    }
  }, [task]);

  if (activeModal !== 'edit-task' || !task) return null;

  const handleTimeChange = (hour: number, minute: number, period: 'AM' | 'PM') => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
  };

  const calculateStartDateTime = (): Date => {
    let h24 = selectedHour;
    if (selectedPeriod === 'PM' && h24 < 12) h24 += 12;
    if (selectedPeriod === 'AM' && h24 === 12) h24 = 0;

    const [year, month, day] = selectedDate.split('-').map(Number);
    return new Date(year, month - 1, day, h24, selectedMinute, 0);
  };

  const handleSave = () => {
    if (!title.trim()) {
      addToast('Task title cannot be empty', 'warning');
      return;
    }

    const startDate = calculateStartDateTime();
    const durationMins = Math.max(1, duration);
    const endDate = addMinutes(startDate, durationMins);

    updateTask(task.id, {
      title: title.trim(),
      durationMinutes: durationMins,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      energyLevel,
      notes: notes.trim() || undefined,
    });

    addToast('Task updated!', 'success');
    setActiveModal(null);
  };

  const durationPresets = [15, 25, 30, 45, 60, 90];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Edit Focus Block</h3>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body: Two Columns */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 overflow-y-auto">
          {/* Left: Metadata */}
          <div className="lg:col-span-6 space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Architect Core Engine"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Duration */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Duration (Minutes)
                </label>
                <span className="text-xs font-mono font-bold text-violet-300 bg-violet-950/70 px-2 py-0.5 rounded border border-violet-800/60">
                  {duration} minutes
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {durationPresets.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`px-3 py-1.5 text-xs rounded-xl font-mono border transition-all cursor-pointer ${
                      duration === mins
                        ? 'bg-violet-600 text-white border-violet-500 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <input
                type="number"
                min={1}
                max={480}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>

            {/* Energy Category */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Energy Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(ENERGY_CONFIG) as EnergyLevel[]).map((level) => {
                  const config = ENERGY_CONFIG[level];
                  const isSelected = energyLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEnergyLevel(level)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-violet-500/80 ring-1 ring-violet-500/40'
                          : 'bg-slate-950/80 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${config.textAccent}`}>{config.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{config.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Notes / Key Outcome
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="What does done look like?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
          </div>

          {/* Right: Analog Clock Time Picker */}
          <div className="lg:col-span-6">
            <AnalogClockPicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              selectedPeriod={selectedPeriod}
              onTimeChange={handleTimeChange}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-start">
            <Clock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="truncate">
              {selectedDate} at{' '}
              {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')} {selectedPeriod}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
