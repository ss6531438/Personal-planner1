import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TaskBlock,
  DayTemplate,
  PlannerSettings,
  AudioNoiseType,
  EnergyLevel,
  AnalogClockStyle,
  SecondsHandMode,
  ClockCustomColors,
  TimerDisplayMode,
  TickingSoundType,
} from '../types';
import {
  recalculateTimeline,
  pushTimeline,
  adjustTaskDuration,
  compressBreaks as compressBreaksUtil,
  skipTaskAndPullNext,
  completeTaskAndAdvance,
  syncScheduleToNow,
} from '../utils/timeEngine';
import { instantiateTemplate } from '../utils/templates';
import { playCompletionChime, ambientSound, clockTickingSound } from '../utils/audioEngine';
import { addMinutes } from 'date-fns';
import confetti from 'canvas-confetti';

interface ToastNotification {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning';
}

interface PlannerState {
  tasks: TaskBlock[];
  activeTaskId: string | null;
  isTimerRunning: boolean;
  timerRemainingSeconds: number;
  viewMode: 'split' | 'timeline' | 'focus';
  isFullscreenFocus: boolean;
  isScreenDimmedOnFocus: boolean;
  breakModalData: {
    taskId: string;
    taskTitle: string;
    durationMinutes: number;
  } | null;
  customTemplates: DayTemplate[];
  settings: PlannerSettings;
  activeModal: 'add-task' | 'dump' | 'templates' | 'shortcuts' | 'settings' | 'edit-task' | 'clock-studio' | null;
  editingTaskId: string | null;
  toasts: ToastNotification[];

  // Actions
  setTasks: (tasks: TaskBlock[]) => void;
  tickTimer: () => void;
  togglePlayPause: () => void;
  startTask: (id: string) => void;
  completeTask: (id?: string) => void;
  skipTask: (id?: string) => void;
  openBreakModal: (taskId?: string) => void;
  closeBreakModal: () => void;
  startBreak: (breakMinutes: number) => void;
  skipBreakAndAdvance: () => void;
  addTimeToActiveTask: (minutes: number) => void;
  adjustTaskDurationById: (taskId: string, deltaMinutes: number) => void;
  pushDay: (minutes: number) => void;
  compressBreaks: (minutesToSave?: number) => void;
  syncToNow: () => void;
  addTask: (taskData: { title: string; durationMinutes: number; energyLevel: EnergyLevel; notes?: string }, insertAfterId?: string) => void;
  updateTask: (id: string, updates: Partial<TaskBlock>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  splitTask: (taskId: string) => void;

  // View & Modals
  setViewMode: (mode: 'split' | 'timeline' | 'focus') => void;
  toggleFullscreenFocus: () => void;
  toggleScreenDimmer: () => void;
  setActiveModal: (modal: 'add-task' | 'dump' | 'templates' | 'shortcuts' | 'settings' | 'edit-task' | 'clock-studio' | null, editingTaskId?: string | null) => void;
  addToast: (text: string, type?: 'info' | 'success' | 'warning') => void;
  removeToast: (id: string) => void;

  // Presets & Backup
  loadTemplate: (template: DayTemplate, startAtNow?: boolean) => void;
  saveCurrentAsTemplate: (name: string, description: string, icon: string) => void;
  deleteCustomTemplate: (templateId: string) => void;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  resetToDemoSchedule: () => void;
  clearAllTasks: () => void;

  // Ambient & Audio Settings
  updateSettings: (partial: Partial<PlannerSettings>) => void;
  setAmbientSound: (type: AudioNoiseType) => void;
  setAmbientVolume: (vol: number) => void;
  setTickingSound: (type: TickingSoundType) => void;
  setTickingVolume: (vol: number) => void;
  testTickingSound: () => void;
  setClockStyle: (style: AnalogClockStyle) => void;
  setTimerDisplayMode: (mode: TimerDisplayMode) => void;
  setSecondsHandMode: (mode: SecondsHandMode) => void;
  setClockHandsMode: (mode: 'realtime' | 'countdown') => void;
}

const DEFAULT_CUSTOM_COLORS: ClockCustomColors = {
  dialBg: '#0b1120',
  bezel: '#b45309',
  hands: '#f59e0b',
  secondsHand: '#ef4444',
  accent: '#8b5cf6',
  numerals: '#fde68a',
};

const DEFAULT_SETTINGS: PlannerSettings = {
  autoChime: true,
  chimeVolume: 0.6,
  ambientType: 'none',
  ambientVolume: 0.35,
  defaultTaskDuration: 30,
  defaultEnergyLevel: 'deep',
  theme: 'dark',
  timerDisplayMode: 'analog',
  clockStyle: 'grandfather',
  secondsHandMode: 'tick',
  numeralsStyle: 'roman',
  clockColorPreset: 'brass-ivory',
  clockCustomColors: DEFAULT_CUSTOM_COLORS,
  clockHandsMode: 'realtime',
  tickingSound: 'antique-pendulum',
  tickingVolume: 0.45,
  tickingOnlyWhileRunning: true,
  showPendulum: true,
  showGears: true,
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskId: null,
      isTimerRunning: false,
      timerRemainingSeconds: 25 * 60,
      viewMode: 'split',
      isFullscreenFocus: false,
      isScreenDimmedOnFocus: true,
      breakModalData: null,
      customTemplates: [],
      settings: DEFAULT_SETTINGS,
      activeModal: null,
      editingTaskId: null,
      toasts: [],

      setTasks: (tasks) => {
        const recalculated = recalculateTimeline(tasks);
        const active = recalculated.find((t) => t.status === 'active');
        set({
          tasks: recalculated,
          activeTaskId: active ? active.id : null,
          timerRemainingSeconds: active ? active.durationMinutes * 60 : 25 * 60,
        });
      },

      tickTimer: () => {
        const { isTimerRunning, timerRemainingSeconds, activeTaskId, tasks, settings, addToast } = get();
        if (!isTimerRunning) return;

        // Auto-heal activeTaskId if missing or desynced
        let currentActiveId = activeTaskId;
        if (!currentActiveId && tasks.length > 0) {
          const activeTask = tasks.find((t) => t.status === 'active') || tasks.find((t) => t.status === 'pending');
          if (activeTask) {
            currentActiveId = activeTask.id;
            set({ activeTaskId: activeTask.id });
          }
        }

        // Mechanical Clock Ticking sound during active timer
        try {
          if (settings?.tickingSound && settings.tickingSound !== 'none') {
            clockTickingSound.playTick(
              timerRemainingSeconds % 2 === 0,
              settings.tickingSound,
              typeof settings.tickingVolume === 'number' ? settings.tickingVolume : 0.45
            );
          }
        } catch (audioErr) {
          console.warn('Clock tick audio warning:', audioErr);
        }

        if (timerRemainingSeconds > 1) {
          set({ timerRemainingSeconds: timerRemainingSeconds - 1 });
        } else if (timerRemainingSeconds === 1) {
          // Time is up!
          const active = currentActiveId ? tasks.find((t) => t.id === currentActiveId) : null;
          set({
            timerRemainingSeconds: 0,
            isTimerRunning: false,
            breakModalData: active
              ? {
                  taskId: active.id,
                  taskTitle: active.title,
                  durationMinutes: active.durationMinutes,
                }
              : {
                  taskId: 'standalone-focus',
                  taskTitle: 'Focus Session',
                  durationMinutes: 25,
                },
          });
          if (settings?.autoChime) {
            playCompletionChime(settings?.chimeVolume ?? 0.6);
          }
          addToast('Time is up! Take some break 🌿', 'success');
        } else {
          // In overtime / negative count
          set({ timerRemainingSeconds: timerRemainingSeconds - 1 });
        }
      },

      togglePlayPause: () => {
        const { isTimerRunning, tasks, activeTaskId, startTask } = get();
        if (!isTimerRunning) {
          // Starting or resuming timer
          if (!activeTaskId) {
            const firstPending = tasks.find((t) => t.status === 'pending' || t.status === 'active');
            if (firstPending) {
              startTask(firstPending.id);
              return;
            } else {
              // No pending tasks: create a default 25m Focus Block so user has a real task
              const now = new Date();
              const end = new Date(now.getTime() + 25 * 60 * 1000);
              const newTask: TaskBlock = {
                id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                title: 'Deep Focus Block',
                durationMinutes: 25,
                energyLevel: 'deep',
                status: 'active',
                startTime: now.toISOString(),
                endTime: end.toISOString(),
              };
              set({
                tasks: [newTask, ...tasks],
                activeTaskId: newTask.id,
                timerRemainingSeconds: 25 * 60,
                isTimerRunning: true,
              });
              return;
            }
          } else {
            // Check if activeTaskId points to an active task
            const current = tasks.find((t) => t.id === activeTaskId);
            if (current && current.status !== 'active') {
              startTask(current.id);
              return;
            }
          }
        }
        set({ isTimerRunning: !isTimerRunning });
      },

      startTask: (id: string) => {
        const { tasks } = get();
        const target = tasks.find((t) => t.id === id);
        if (!target) return;

        const updated = tasks.map((t) => {
          if (t.id === id) {
            return { ...t, status: 'active' as const };
          }
          if (t.status === 'active') {
            return { ...t, status: 'pending' as const };
          }
          return t;
        });

        const recalculated = recalculateTimeline(updated, { anchorActiveStartToNow: true });
        const currentActive = recalculated.find((t) => t.id === id);

        set({
          tasks: recalculated,
          activeTaskId: id,
          isTimerRunning: true,
          timerRemainingSeconds: currentActive ? currentActive.durationMinutes * 60 : 30 * 60,
        });
      },

      completeTask: (id?: string) => {
        const { tasks, activeTaskId, settings, addToast } = get();
        const targetId = id || activeTaskId;
        if (!targetId) return;

        const targetTask = tasks.find((t) => t.id === targetId);

        // Sound & Confetti celebration!
        if (settings.autoChime) {
          playCompletionChime(settings.chimeVolume);
        }
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
          });
        } catch (e) {
          // ignore if canvas not ready
        }

        const recalculated = completeTaskAndAdvance(tasks, targetId);
        const newActive = recalculated.find((t) => t.status === 'active');
        const isRest = targetTask?.energyLevel === 'rest';

        set({
          tasks: recalculated,
          activeTaskId: newActive ? newActive.id : null,
          isTimerRunning: isRest ? !!newActive : false,
          timerRemainingSeconds: newActive ? newActive.durationMinutes * 60 : 0,
          breakModalData:
            !isRest && targetTask
              ? {
                  taskId: targetId,
                  taskTitle: targetTask.title,
                  durationMinutes: targetTask.durationMinutes,
                }
              : null,
        });

        addToast(`Completed: ${targetTask?.title || 'Task'} 🎉`, 'success');
      },

      skipTask: (id?: string) => {
        const { tasks, activeTaskId, addToast } = get();
        const targetId = id || activeTaskId;
        if (!targetId) return;

        const skippedTask = tasks.find((t) => t.id === targetId);
        const recalculated = skipTaskAndPullNext(tasks, targetId);
        const newActive = recalculated.find((t) => t.status === 'active');

        set({
          tasks: recalculated,
          activeTaskId: newActive ? newActive.id : null,
          isTimerRunning: !!newActive,
          timerRemainingSeconds: newActive ? newActive.durationMinutes * 60 : 0,
        });

        addToast(`Skipped: ${skippedTask?.title || 'Task'}. Next task pulled forward!`, 'info');
      },

      openBreakModal: (taskId?: string) => {
        const { tasks, activeTaskId } = get();
        const targetId = taskId || activeTaskId;
        const targetTask = tasks.find((t) => t.id === targetId);
        if (targetTask) {
          set({
            breakModalData: {
              taskId: targetTask.id,
              taskTitle: targetTask.title,
              durationMinutes: targetTask.durationMinutes,
            },
          });
        }
      },

      closeBreakModal: () => {
        set({ breakModalData: null });
      },

      startBreak: (breakMinutes: number) => {
        const { tasks, breakModalData, settings, addToast } = get();
        const now = new Date();
        const targetTaskId = breakModalData?.taskId;

        // 1. Ensure current focus task is completed if it was still active/pending
        let currentTasks = tasks;
        if (targetTaskId) {
          const targetTask = currentTasks.find((t) => t.id === targetTaskId);
          if (targetTask && targetTask.status !== 'completed') {
            currentTasks = completeTaskAndAdvance(currentTasks, targetTaskId);
          }
        }

        // 2. Insert new break block right at the current time
        const breakTaskId = `break-${Date.now()}`;
        const breakBlock: TaskBlock = {
          id: breakTaskId,
          title: 'Mind & Body Recharge',
          durationMinutes: breakMinutes,
          startTime: now.toISOString(),
          endTime: addMinutes(now, breakMinutes).toISOString(),
          energyLevel: 'rest',
          status: 'active',
          notes: `${breakMinutes}-minute restorative recharge (hydration, stretch & eye rest)`,
        };

        // Insert break right after completed task or at top of pending queue
        const completedIndex = currentTasks.findIndex((t) => t.id === targetTaskId);
        let updatedList: TaskBlock[];
        if (completedIndex !== -1) {
          updatedList = [
            ...currentTasks.slice(0, completedIndex + 1),
            breakBlock,
            ...currentTasks.slice(completedIndex + 1),
          ];
        } else {
          updatedList = [breakBlock, ...currentTasks];
        }

        const recalculated = recalculateTimeline(updatedList);

        if (settings.autoChime) {
          playCompletionChime(settings.chimeVolume);
        }

        set({
          tasks: recalculated,
          activeTaskId: breakTaskId,
          timerRemainingSeconds: breakMinutes * 60,
          isTimerRunning: true,
          breakModalData: null,
        });

        addToast(`Started ${breakMinutes}m break. Breathe deeply & recharge! 🌿`, 'success');
      },

      skipBreakAndAdvance: () => {
        const { tasks, breakModalData, addToast } = get();
        const targetTaskId = breakModalData?.taskId;

        let currentTasks = tasks;
        if (targetTaskId) {
          const targetTask = currentTasks.find((t) => t.id === targetTaskId);
          if (targetTask && targetTask.status !== 'completed') {
            currentTasks = completeTaskAndAdvance(currentTasks, targetTaskId);
          }
        }

        const recalculated = recalculateTimeline(currentTasks);
        const nextActive = recalculated.find((t) => t.status === 'active');

        set({
          tasks: recalculated,
          activeTaskId: nextActive ? nextActive.id : null,
          timerRemainingSeconds: nextActive ? nextActive.durationMinutes * 60 : 0,
          isTimerRunning: !!nextActive,
          breakModalData: null,
        });

        addToast('Break skipped. Continuing with next task!', 'info');
      },

      addTimeToActiveTask: (minutes: number) => {
        const { tasks, activeTaskId, timerRemainingSeconds, addToast } = get();
        if (!activeTaskId) return;

        const recalculated = adjustTaskDuration(tasks, activeTaskId, minutes);
        set({
          tasks: recalculated,
          timerRemainingSeconds: Math.max(0, timerRemainingSeconds + minutes * 60),
        });

        addToast(`Added +${minutes}m to current block`, 'info');
      },

      adjustTaskDurationById: (taskId: string, deltaMinutes: number) => {
        const { tasks, activeTaskId, timerRemainingSeconds } = get();
        const recalculated = adjustTaskDuration(tasks, taskId, deltaMinutes);

        let newSeconds = timerRemainingSeconds;
        if (taskId === activeTaskId) {
          newSeconds = Math.max(0, timerRemainingSeconds + deltaMinutes * 60);
        }

        set({
          tasks: recalculated,
          timerRemainingSeconds: newSeconds,
        });
      },

      pushDay: (minutes: number) => {
        const { tasks, addToast } = get();
        const pushed = pushTimeline(tasks, minutes);
        set({ tasks: pushed });
        addToast(`Slid remaining schedule forward by +${minutes}m`, 'info');
      },

      compressBreaks: (minutesToSave = 25) => {
        const { tasks, addToast } = get();
        const { updatedTasks, savedMinutes } = compressBreaksUtil(tasks, minutesToSave);
        set({ tasks: updatedTasks });
        if (savedMinutes > 0) {
          addToast(`Recovered ${savedMinutes} minutes by compressing break buffers! ⚡`, 'success');
        } else {
          addToast('No eligible rest breaks found to compress.', 'info');
        }
      },

      syncToNow: () => {
        const { tasks, activeTaskId, addToast } = get();
        const synced = syncScheduleToNow(tasks);
        const active = synced.find((t) => t.id === activeTaskId || t.status === 'active');

        set({
          tasks: synced,
          activeTaskId: active ? active.id : null,
          timerRemainingSeconds: active ? active.durationMinutes * 60 : 25 * 60,
        });
        addToast('Synced schedule to current time without guilt ✨', 'success');
      },

      addTask: (taskData, insertAfterId) => {
        const { tasks, addToast } = get();
        const newTask: TaskBlock = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: taskData.title.trim() || 'Focus Session',
          durationMinutes: Math.max(1, taskData.durationMinutes),
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          energyLevel: taskData.energyLevel,
          status: 'pending',
          notes: taskData.notes,
        };

        let updatedTasks: TaskBlock[];
        if (insertAfterId) {
          const idx = tasks.findIndex((t) => t.id === insertAfterId);
          if (idx !== -1) {
            updatedTasks = [...tasks.slice(0, idx + 1), newTask, ...tasks.slice(idx + 1)];
          } else {
            updatedTasks = [...tasks, newTask];
          }
        } else {
          updatedTasks = [...tasks, newTask];
        }

        const recalculated = recalculateTimeline(updatedTasks);
        set({ tasks: recalculated });
        addToast(`Added: ${newTask.title}`, 'info');
      },

      updateTask: (id, updates) => {
        const { tasks, activeTaskId, timerRemainingSeconds } = get();
        const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
        const recalculated = recalculateTimeline(updated);

        let newTimerSecs = timerRemainingSeconds;
        if (id === activeTaskId && updates.durationMinutes !== undefined) {
          const diffMins = updates.durationMinutes - (tasks.find((t) => t.id === id)?.durationMinutes || 0);
          newTimerSecs = Math.max(0, timerRemainingSeconds + diffMins * 60);
        }

        set({
          tasks: recalculated,
          timerRemainingSeconds: newTimerSecs,
        });
      },

      deleteTask: (id) => {
        const { tasks, activeTaskId, addToast } = get();
        const target = tasks.find((t) => t.id === id);
        const filtered = tasks.filter((t) => t.id !== id);
        const recalculated = recalculateTimeline(filtered);

        let nextActiveId = activeTaskId;
        let isRunning = get().isTimerRunning;
        let timerSecs = get().timerRemainingSeconds;

        if (id === activeTaskId) {
          const nextActive = recalculated.find((t) => t.status === 'active' || t.status === 'pending');
          if (nextActive) {
            nextActive.status = 'active';
            nextActiveId = nextActive.id;
            timerSecs = nextActive.durationMinutes * 60;
          } else {
            nextActiveId = null;
            isRunning = false;
            timerSecs = 0;
          }
        }

        set({
          tasks: recalculated,
          activeTaskId: nextActiveId,
          isTimerRunning: isRunning,
          timerRemainingSeconds: timerSecs,
        });

        addToast(`Deleted: ${target?.title || 'Task'}`, 'info');
      },

      reorderTasks: (fromIndex, toIndex) => {
        const { tasks } = get();
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= tasks.length || toIndex >= tasks.length) return;

        const reordered = [...tasks];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);

        const recalculated = recalculateTimeline(reordered);
        set({ tasks: recalculated });
      },

      splitTask: (taskId: string) => {
        const { tasks, addToast } = get();
        const index = tasks.findIndex((t) => t.id === taskId);
        if (index === -1) return;

        const orig = tasks[index];
        if (orig.durationMinutes < 15) {
          addToast('Task is too short to split (min 15m).', 'warning');
          return;
        }

        const half = Math.floor(orig.durationMinutes / 2);
        const part1: TaskBlock = {
          ...orig,
          id: `task-${Date.now()}-part1`,
          title: `${orig.title} (Part 1)`,
          durationMinutes: half,
        };

        const breakBlock: TaskBlock = {
          id: `task-${Date.now()}-break`,
          title: 'Quick Micro-Break',
          durationMinutes: 5,
          startTime: '',
          endTime: '',
          energyLevel: 'rest',
          status: 'pending',
          notes: 'Stand up, stretch & eye rest',
        };

        const part2: TaskBlock = {
          ...orig,
          id: `task-${Date.now()}-part2`,
          title: `${orig.title} (Part 2)`,
          durationMinutes: orig.durationMinutes - half,
          status: 'pending',
        };

        const updated = [
          ...tasks.slice(0, index),
          part1,
          breakBlock,
          part2,
          ...tasks.slice(index + 1),
        ];

        const recalculated = recalculateTimeline(updated);
        set({ tasks: recalculated });
        addToast(`Split "${orig.title}" into 2 focus sessions with a 5m break!`, 'success');
      },

      setViewMode: (mode) => set({ viewMode: mode }),

      toggleFullscreenFocus: () => {
        set((state) => ({ isFullscreenFocus: !state.isFullscreenFocus }));
      },

      toggleScreenDimmer: () => {
        set((state) => ({ isScreenDimmedOnFocus: !state.isScreenDimmedOnFocus }));
        get().addToast(
          get().isScreenDimmedOnFocus ? 'Focus Screen Dimmer enabled' : 'Focus Screen Dimmer disabled',
          'info'
        );
      },

      setActiveModal: (modal, editingTaskId = null) => {
        set({ activeModal: modal, editingTaskId });
      },

      addToast: (text, type = 'info') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        set((state) => ({
          toasts: [...state.toasts.slice(-3), { id, text, type }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, 3600);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      loadTemplate: (template, startAtNow = true) => {
        const startTime = startAtNow ? new Date() : new Date();
        const newTasks = instantiateTemplate(template, startTime);
        const recalculated = recalculateTimeline(newTasks);
        const active = recalculated.find((t) => t.status === 'active');

        set({
          tasks: recalculated,
          activeTaskId: active ? active.id : null,
          isTimerRunning: false,
          timerRemainingSeconds: active ? active.durationMinutes * 60 : 30 * 60,
          activeModal: null,
        });

        get().addToast(`Loaded template: ${template.name}`, 'success');
      },

      saveCurrentAsTemplate: (name, description, icon) => {
        const { tasks, customTemplates, addToast } = get();
        if (tasks.length === 0) {
          addToast('No tasks to save as template', 'warning');
          return;
        }

        const newTemplate: DayTemplate = {
          id: `custom-${Date.now()}`,
          name: name.trim() || 'My Custom Flow',
          description: description.trim() || 'Custom saved daily routine',
          icon: icon || 'Calendar',
          blocks: tasks.map((t) => ({
            title: t.title,
            durationMinutes: t.durationMinutes,
            energyLevel: t.energyLevel,
            notes: t.notes,
          })),
        };

        set({
          customTemplates: [newTemplate, ...customTemplates],
        });
        addToast(`Template "${newTemplate.name}" saved!`, 'success');
      },

      deleteCustomTemplate: (templateId) => {
        set((state) => ({
          customTemplates: state.customTemplates.filter((t) => t.id !== templateId),
        }));
        get().addToast('Template deleted', 'info');
      },

      exportData: () => {
        const { tasks, customTemplates, settings } = get();
        return JSON.stringify(
          {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            tasks,
            customTemplates,
            settings,
          },
          null,
          2
        );
      },

      importData: (jsonStr) => {
        try {
          const data = JSON.parse(jsonStr);
          if (Array.isArray(data.tasks)) {
            const recalculated = recalculateTimeline(data.tasks);
            const active = recalculated.find((t) => t.status === 'active');

            set({
              tasks: recalculated,
              customTemplates: Array.isArray(data.customTemplates) ? data.customTemplates : get().customTemplates,
              settings: data.settings ? { ...get().settings, ...data.settings } : get().settings,
              activeTaskId: active ? active.id : null,
              timerRemainingSeconds: active ? active.durationMinutes * 60 : 25 * 60,
              isTimerRunning: false,
            });

            get().addToast('Data imported successfully!', 'success');
            return true;
          }
          throw new Error('Invalid JSON structure');
        } catch (err) {
          get().addToast('Failed to import JSON data. Format invalid.', 'warning');
          return false;
        }
      },

      resetToDemoSchedule: () => {
        set({
          tasks: [],
          activeTaskId: null,
          timerRemainingSeconds: 0,
          isTimerRunning: false,
        });
        get().addToast('Reset to a clean, empty schedule', 'info');
      },

      clearAllTasks: () => {
        set({
          tasks: [],
          activeTaskId: null,
          isTimerRunning: false,
          timerRemainingSeconds: 0,
        });
        get().addToast('Cleared all tasks', 'info');
      },

      updateSettings: (partial) => {
        set((state) => {
          const newSettings = { ...state.settings, ...partial };
          if (partial.ambientVolume !== undefined) {
            ambientSound.setVolume(partial.ambientVolume);
          }
          if (partial.tickingVolume !== undefined) {
            clockTickingSound.setVolume(partial.tickingVolume);
          }
          if (partial.tickingSound !== undefined) {
            clockTickingSound.setType(partial.tickingSound);
          }
          return { settings: newSettings };
        });
      },

      setAmbientSound: (type) => {
        const { settings } = get();
        set({ settings: { ...settings, ambientType: type } });
        ambientSound.start(type, settings.ambientVolume);
      },

      setAmbientVolume: (vol) => {
        const { settings } = get();
        set({ settings: { ...settings, ambientVolume: vol } });
        ambientSound.setVolume(vol);
      },

      setTickingSound: (type) => {
        const { settings, addToast } = get();
        set({ settings: { ...settings, tickingSound: type } });
        clockTickingSound.setType(type);
        if (type !== 'none') {
          clockTickingSound.playTick(true, type, settings.tickingVolume);
          addToast(`Clock tick: ${type.replace('-', ' ')}`, 'info');
        } else {
          addToast('Clock ticking muted', 'info');
        }
      },

      setTickingVolume: (vol) => {
        const { settings } = get();
        set({ settings: { ...settings, tickingVolume: vol } });
        clockTickingSound.setVolume(vol);
      },

      testTickingSound: () => {
        const { settings } = get();
        clockTickingSound.playTick(true, settings.tickingSound, settings.tickingVolume);
        setTimeout(() => {
          clockTickingSound.playTick(false, settings.tickingSound, settings.tickingVolume);
        }, 500);
      },

      setClockStyle: (style) => {
        const { settings, addToast } = get();
        set({ settings: { ...settings, clockStyle: style } });
        addToast(`Clock style: ${style.replace('-', ' ')}`, 'info');
      },

      setTimerDisplayMode: (mode) => {
        const { settings } = get();
        set({ settings: { ...settings, timerDisplayMode: mode } });
      },

      setSecondsHandMode: (mode) => {
        const { settings } = get();
        set({ settings: { ...settings, secondsHandMode: mode } });
      },

      setClockHandsMode: (mode) => {
        const { settings, addToast } = get();
        set({ settings: { ...settings, clockHandsMode: mode } });
        addToast(mode === 'realtime' ? 'Clock: Live Real-Time Time' : 'Clock: Focus Countdown Chronometer', 'info');
      },
    }),
    {
      name: 'flowstate-clean-planner-v3',
      partialize: (state) => ({
        tasks: state.tasks,
        activeTaskId: state.activeTaskId,
        customTemplates: state.customTemplates,
        settings: state.settings,
        viewMode: state.viewMode,
      }),
      merge: (persistedState: any, currentState: PlannerState) => {
        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...(persistedState?.settings || {}),
          clockCustomColors: {
            ...DEFAULT_CUSTOM_COLORS,
            ...(persistedState?.settings?.clockCustomColors || {}),
          },
        };
        const tasks = Array.isArray(persistedState?.tasks) ? persistedState.tasks : currentState.tasks;
        const active = tasks.find((t: any) => t.status === 'active');
        const activeTaskId = persistedState?.activeTaskId || (active ? active.id : null);

        return {
          ...currentState,
          ...persistedState,
          tasks,
          activeTaskId,
          settings: mergedSettings,
          timerRemainingSeconds: active ? active.durationMinutes * 60 : 25 * 60,
          isTimerRunning: false,
        };
      },
    }
  )
);
