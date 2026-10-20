import React, { useState, useEffect } from 'react';
import { usePlannerStore } from '../store/usePlannerStore';
import { ENERGY_CONFIG } from '../types';
import { formatTime, formatDuration, parseDateSafe } from '../utils/timeEngine';
import {
  Play,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Scissors,
  Sparkles,
  CheckCircle,
  GripVertical,
} from 'lucide-react';
import { isWithinInterval } from 'date-fns';

export const TimelineView: React.FC = () => {
  const {
    tasks,
    activeTaskId,
    startTask,
    completeTask,
    adjustTaskDurationById,
    reorderTasks,
    deleteTask,
    splitTask,
    addTask,
    setActiveModal,
  } = usePlannerStore();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDuration, setQuickDuration] = useState(30);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Keep live time marker updated
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleAddBetween = (index: number) => {
    if (!quickTitle.trim()) return;
    const prevTask = tasks[index];
    addTask(
      {
        title: quickTitle.trim(),
        durationMinutes: quickDuration,
        energyLevel: 'deep',
      },
      prevTask.id
    );
    setInsertIndex(null);
    setQuickTitle('');
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-slate-800/80 p-4 sm:p-6 lg:p-7 relative">
      {/* Timeline Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-5 sm:mb-6 border-b border-slate-800/80 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Adaptive Timeline</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-normal">
              {tasks.length} blocks
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fluid blocks that slide automatically. No calendar guilt when things shift.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Add Task Button */}
          <button
            onClick={() => setActiveModal('add-task')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          {/* Live Clock Badge */}
          <div className="flex items-center gap-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-live-dot" />
            <span className="text-slate-400 hidden xs:inline">Current:</span>
            <span className="font-mono font-semibold text-rose-300">{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Task Blocks List */}
      {tasks.length === 0 ? (
        <div className="py-16 text-center">
          <Clock className="w-12 h-12 text-violet-400 mx-auto mb-3 stroke-[1.5] animate-pulse" />
          <h3 className="text-base font-bold text-white mb-1">Your timeline is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Enter your tasks directly and pick the time with our interactive analog clock, or use quick dump.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setActiveModal('add-task')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all cursor-pointer transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task (Analog Clock)</span>
            </button>
            <button
              onClick={() => setActiveModal('dump')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            >
              Quick Dump
            </button>
            <button
              onClick={() => setActiveModal('templates')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800 transition-all cursor-pointer"
            >
              Routines
            </button>
          </div>
        </div>
      ) : (
        <div className="relative space-y-3">
          {tasks.map((task, index) => {
            const energy = ENERGY_CONFIG[task.energyLevel];
            const isActive = task.id === activeTaskId || task.status === 'active';
            const isCompleted = task.status === 'completed';
            const isSkipped = task.status === 'skipped';

            // Check if current real-world time falls inside this block
            let isCurrentTimeHere = false;
            try {
              const start = parseDateSafe(task.startTime);
              const end = parseDateSafe(task.endTime);
              isCurrentTimeHere = isWithinInterval(currentTime, { start, end });
            } catch (e) {
              // ignore
            }

            return (
              <React.Fragment key={task.id}>
                {/* Real-time Indicator Line if current time is here and task not completed */}
                {isCurrentTimeHere && !isCompleted && (
                  <div className="relative flex items-center my-1 z-20">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold shadow-lg shadow-rose-500/40">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>NOW ({formatTime(currentTime)})</span>
                    </div>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-rose-500 via-rose-500/80 to-transparent ml-2 shadow-[0_0_8px_#f43f5e]" />
                  </div>
                )}

                {/* Timeline Block Card */}
                <div
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedIndex !== null && draggedIndex !== index) {
                      reorderTasks(draggedIndex, index);
                      setDraggedIndex(null);
                    }
                  }}
                  className={`group relative rounded-xl border transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900/90 border-violet-500/60 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/40'
                      : isCompleted
                      ? 'bg-slate-950/50 border-slate-800/50 opacity-60 hover:opacity-90'
                      : isSkipped
                      ? 'bg-slate-950/40 border-slate-800/40 opacity-40 line-through'
                      : 'glass-card glass-card-hover'
                  }`}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: isCompleted ? '#475569' : energy.color,
                  }}
                >
                  <div className="p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    {/* Left: Drag Handle, Status Icon & Info */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {/* Drag Handle */}
                      <button
                        title="Drag to reorder"
                        className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1 -ml-1 transition-colors"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>

                      {/* Status / Play Button */}
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isActive ? (
                        <button
                          onClick={() => completeTask(task.id)}
                          title="Click to complete"
                          className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-600/30 hover:bg-emerald-600 transition-all cursor-pointer group/btn"
                        >
                          <CheckCircle className="w-4 h-4 hidden group-hover/btn:block" />
                          <Sparkles className="w-4 h-4 block group-hover/btn:hidden animate-pulse" />
                        </button>
                      ) : (
                        <button
                          onClick={() => startTask(task.id)}
                          title="Start focus on this block"
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white border border-slate-700 hover:border-violet-500 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </button>
                      )}

                      {/* Title & Notes */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-semibold text-sm ${
                              isCompleted ? 'text-slate-400 line-through' : isActive ? 'text-white' : 'text-slate-200'
                            }`}
                          >
                            {task.title}
                          </span>

                          {/* Energy Badge */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${energy.badgeBg}`}>
                            {energy.label}
                          </span>

                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 animate-pulse">
                              NOW ACTIVE
                            </span>
                          )}
                        </div>

                        {task.notes && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Right: Time Range, Duration Adjusters & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 w-full md:w-auto pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-800/80 flex-wrap sm:flex-nowrap">
                      {/* Time Range Badge */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {formatTime(task.startTime)} – {formatTime(task.endTime)}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="font-semibold text-slate-200">{formatDuration(task.durationMinutes)}</span>
                      </div>

                      {/* Quick Adjust Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustTaskDurationById(task.id, -5)}
                          title="Shrink -5m"
                          disabled={task.durationMinutes <= 5}
                          className="px-1.5 py-1 text-[11px] rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-30 cursor-pointer"
                        >
                          -5m
                        </button>
                        <button
                          onClick={() => adjustTaskDurationById(task.id, 5)}
                          title="Extend +5m"
                          className="px-1.5 py-1 text-[11px] rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                        >
                          +5m
                        </button>
                        <button
                          onClick={() => adjustTaskDurationById(task.id, 15)}
                          title="Extend +15m"
                          className="px-1.5 py-1 text-[11px] rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer hidden sm:block"
                        >
                          +15m
                        </button>
                      </div>

                      {/* More Menu / Actions */}
                      <div className="flex items-center gap-1">
                        {/* Split Task Button */}
                        <button
                          onClick={() => splitTask(task.id)}
                          title="Split into two sessions with 5m micro-break"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Modal */}
                        <button
                          onClick={() => setActiveModal('edit-task', task.id)}
                          title="Edit Task Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Up / Down */}
                        <div className="hidden sm:flex flex-col">
                          <button
                            onClick={() => reorderTasks(index, index - 1)}
                            disabled={index === 0}
                            title="Move Up"
                            className="p-0.5 text-slate-500 hover:text-slate-300 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => reorderTasks(index, index + 1)}
                            disabled={index === tasks.length - 1}
                            title="Move Down"
                            className="p-0.5 text-slate-500 hover:text-slate-300 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => deleteTask(task.id)}
                          title="Delete Block"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline "Add Task Here" divider button */}
                <div className="relative group/divider py-1 flex items-center justify-center">
                  <div className="h-[1px] w-full bg-slate-800/40 group-hover/divider:bg-slate-700/60 transition-colors" />
                  <button
                    onClick={() => setInsertIndex(insertIndex === index ? null : index)}
                    title="Insert task here"
                    className="absolute bg-slate-900 hover:bg-violet-600 text-slate-500 hover:text-white border border-slate-800 hover:border-violet-500 rounded-full p-1 opacity-0 group-hover/divider:opacity-100 transition-all cursor-pointer transform scale-90 hover:scale-100 z-10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Insert Task Inline Form */}
                {insertIndex === index && (
                  <div className="bg-slate-900/90 rounded-xl p-3 border border-violet-500/40 shadow-xl my-2 flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      placeholder="Task title (e.g. Code Review, Coffee Break)"
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddBetween(index);
                        if (e.key === 'Escape') setInsertIndex(null);
                      }}
                      autoFocus
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 w-full"
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <select
                        value={quickDuration}
                        onChange={(e) => setQuickDuration(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value={15}>15m</option>
                        <option value={25}>25m</option>
                        <option value={30}>30m</option>
                        <option value={45}>45m</option>
                        <option value={60}>60m</option>
                      </select>
                      <button
                        onClick={() => handleAddBetween(index)}
                        className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Insert
                      </button>
                      <button
                        onClick={() => setInsertIndex(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
