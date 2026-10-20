import type { TaskBlock } from '../types';
import { addMinutes, format, parseISO, isValid, differenceInMinutes } from 'date-fns';

/**
 * Format an ISO string or Date to 12-hour human time (e.g. "9:30 AM")
 */
export function formatTime(timeInput: string | Date | undefined): string {
  if (!timeInput) return '--:--';
  const date = typeof timeInput === 'string' ? parseISO(timeInput) : timeInput;
  if (!isValid(date)) return '--:--';
  return format(date, 'h:mm a');
}

/**
 * Format duration in minutes to readable string (e.g. "45m", "1h 30m", "2h")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) minutes = 0;
  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.round(minutes % 60);

  if (hours === 0) return `${remainingMins}m`;
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
}

/**
 * Ensure an ISO string is a valid Date
 */
export function parseDateSafe(val: string | Date): Date {
  if (val instanceof Date) return val;
  const parsed = parseISO(val);
  return isValid(parsed) ? parsed : new Date();
}

/**
 * Recalculate start and end times across a chained array of tasks.
 * Completed/skipped tasks preserve historical times.
 * Active and pending tasks chain fluidly from their start or previous end time.
 */
export function recalculateTimeline(
  tasks: TaskBlock[],
  options?: {
    anchorActiveStartToNow?: boolean;
    referenceTime?: Date;
  }
): TaskBlock[] {
  if (!tasks || tasks.length === 0) return [];

  const now = options?.referenceTime || new Date();
  const updatedTasks: TaskBlock[] = [];
  let previousEndTime: Date | null = null;

  for (let i = 0; i < tasks.length; i++) {
    const task = { ...tasks[i] };
    const taskDuration = Math.max(1, task.durationMinutes || 15);

    if (task.status === 'completed' || task.status === 'skipped') {
      // Retain existing start/end if valid
      const existingStart = parseDateSafe(task.startTime);
      const calculatedEnd = addMinutes(existingStart, taskDuration);
      task.startTime = existingStart.toISOString();
      task.endTime = task.endTime ? parseDateSafe(task.endTime).toISOString() : calculatedEnd.toISOString();
      previousEndTime = parseDateSafe(task.endTime);
      updatedTasks.push(task);
      continue;
    }

    if (task.status === 'active') {
      let taskStart: Date;
      if (options?.anchorActiveStartToNow) {
        taskStart = now;
      } else {
        taskStart = task.startTime ? parseDateSafe(task.startTime) : now;
      }
      const taskEnd = addMinutes(taskStart, taskDuration);
      task.startTime = taskStart.toISOString();
      task.endTime = taskEnd.toISOString();
      previousEndTime = taskEnd;
      updatedTasks.push(task);
      continue;
    }

    // Pending tasks
    let taskStart: Date;
    if (previousEndTime) {
      taskStart = previousEndTime;
    } else {
      taskStart = task.startTime ? parseDateSafe(task.startTime) : now;
    }

    const taskEnd = addMinutes(taskStart, taskDuration);
    task.startTime = taskStart.toISOString();
    task.endTime = taskEnd.toISOString();
    previousEndTime = taskEnd;
    updatedTasks.push(task);
  }

  return updatedTasks;
}

/**
 * Slide the entire remaining timeline forward (or backward) by X minutes.
 */
export function pushTimeline(tasks: TaskBlock[], minutes: number, fromTaskId?: string): TaskBlock[] {
  let startIndex = 0;
  if (fromTaskId) {
    const foundIndex = tasks.findIndex((t) => t.id === fromTaskId);
    if (foundIndex !== -1) startIndex = foundIndex;
  } else {
    // Default to first active or pending task
    const activeOrPending = tasks.findIndex((t) => t.status === 'active' || t.status === 'pending');
    if (activeOrPending !== -1) startIndex = activeOrPending;
  }

  return tasks.map((task, idx) => {
    if (idx < startIndex || task.status === 'completed' || task.status === 'skipped') {
      return task;
    }
    const currentStart = parseDateSafe(task.startTime);
    const newStart = addMinutes(currentStart, minutes);
    const newEnd = addMinutes(newStart, task.durationMinutes);
    return {
      ...task,
      startTime: newStart.toISOString(),
      endTime: newEnd.toISOString(),
    };
  });
}

/**
 * Adjust duration of a specific task and cascade start/end times forward
 */
export function adjustTaskDuration(
  tasks: TaskBlock[],
  taskId: string,
  deltaMinutes: number
): TaskBlock[] {
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return tasks;

  const updatedTasks = [...tasks];
  const targetTask = { ...updatedTasks[taskIndex] };
  const newDuration = Math.max(1, targetTask.durationMinutes + deltaMinutes);
  targetTask.durationMinutes = newDuration;
  updatedTasks[taskIndex] = targetTask;

  return recalculateTimeline(updatedTasks);
}

/**
 * Compress Breaks: Identifies recharge/rest tasks and reduces their duration
 * to recover schedule time without sacrificing deep work!
 */
export function compressBreaks(
  tasks: TaskBlock[],
  targetMinutesToSave: number = 30
): { updatedTasks: TaskBlock[]; savedMinutes: number } {
  let remainingToSave = targetMinutesToSave;
  let totalSaved = 0;

  const modified = tasks.map((task) => {
    if (task.status === 'completed' || task.status === 'skipped') {
      return task;
    }

    if (task.energyLevel === 'rest' && remainingToSave > 0 && task.durationMinutes > 5) {
      // Minimum break is 5 minutes
      const maxCanDeduct = task.durationMinutes - 5;
      const deduct = Math.min(remainingToSave, Math.max(5, Math.floor(maxCanDeduct * 0.5)));
      if (deduct > 0) {
        remainingToSave -= deduct;
        totalSaved += deduct;
        return {
          ...task,
          durationMinutes: task.durationMinutes - deduct,
        };
      }
    }
    return task;
  });

  return {
    updatedTasks: recalculateTimeline(modified),
    savedMinutes: totalSaved,
  };
}

/**
 * Skip a task and pull the next pending task to immediately become active
 */
export function skipTaskAndPullNext(tasks: TaskBlock[], taskId: string): TaskBlock[] {
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return tasks;

  const updated = [...tasks];
  updated[taskIndex] = {
    ...updated[taskIndex],
    status: 'skipped',
  };

  // Find next pending task and set it active starting now
  const nextPendingIndex = updated.findIndex(
    (t, idx) => idx > taskIndex && t.status === 'pending'
  );

  const now = new Date();
  if (nextPendingIndex !== -1) {
    updated[nextPendingIndex] = {
      ...updated[nextPendingIndex],
      status: 'active',
      startTime: now.toISOString(),
      endTime: addMinutes(now, updated[nextPendingIndex].durationMinutes).toISOString(),
    };
  }

  return recalculateTimeline(updated);
}

/**
 * Complete a task early or on time, and pull the next pending task to start now
 */
export function completeTaskAndAdvance(tasks: TaskBlock[], taskId: string): TaskBlock[] {
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return tasks;

  const now = new Date();
  const currentTask = updatedTaskDuration(tasks[taskIndex], now);

  const updated = [...tasks];
  updated[taskIndex] = {
    ...currentTask,
    status: 'completed',
    completedAt: now.toISOString(),
    endTime: now.toISOString(),
  };

  // Find next pending task and activate it
  const nextPendingIndex = updated.findIndex((t) => t.status === 'pending');
  if (nextPendingIndex !== -1) {
    updated[nextPendingIndex] = {
      ...updated[nextPendingIndex],
      status: 'active',
      startTime: now.toISOString(),
      endTime: addMinutes(now, updated[nextPendingIndex].durationMinutes).toISOString(),
    };
  }

  return recalculateTimeline(updated);
}

function updatedTaskDuration(task: TaskBlock, completionTime: Date): TaskBlock {
  const start = parseDateSafe(task.startTime);
  const diffMinutes = Math.max(1, differenceInMinutes(completionTime, start));
  return {
    ...task,
    actualDurationMinutes: diffMinutes,
  };
}

/**
 * Align active/pending tasks so active task starts at current local time
 */
export function syncScheduleToNow(tasks: TaskBlock[]): TaskBlock[] {
  const activeIndex = tasks.findIndex((t) => t.status === 'active');
  const targetIndex = activeIndex !== -1 ? activeIndex : tasks.findIndex((t) => t.status === 'pending');

  if (targetIndex === -1) return tasks;

  const now = new Date();
  const updated = [...tasks];
  updated[targetIndex] = {
    ...updated[targetIndex],
    status: 'active',
    startTime: now.toISOString(),
    endTime: addMinutes(now, updated[targetIndex].durationMinutes).toISOString(),
  };

  return recalculateTimeline(updated);
}

/**
 * Calculate overall schedule metrics
 */
export function getScheduleMetrics(tasks: TaskBlock[]) {
  if (!tasks || tasks.length === 0) {
    return {
      totalTasks: 0,
      completedCount: 0,
      totalDurationMinutes: 0,
      deepWorkMinutes: 0,
      restMinutes: 0,
      estimatedDayEnd: null,
      progressPercentage: 0,
    };
  }

  let totalDurationMinutes = 0;
  let completedDurationMinutes = 0;
  let deepWorkMinutes = 0;
  let restMinutes = 0;
  let completedCount = 0;

  for (const t of tasks) {
    totalDurationMinutes += t.durationMinutes;
    if (t.energyLevel === 'deep') deepWorkMinutes += t.durationMinutes;
    if (t.energyLevel === 'rest') restMinutes += t.durationMinutes;
    if (t.status === 'completed') {
      completedCount++;
      completedDurationMinutes += t.actualDurationMinutes || t.durationMinutes;
    }
  }

  const lastTask = tasks[tasks.length - 1];
  const estimatedDayEnd = lastTask ? lastTask.endTime : null;

  const progressPercentage =
    totalDurationMinutes > 0
      ? Math.round((completedDurationMinutes / totalDurationMinutes) * 100)
      : 0;

  return {
    totalTasks: tasks.length,
    completedCount,
    totalDurationMinutes,
    deepWorkMinutes,
    restMinutes,
    estimatedDayEnd,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
  };
}

/**
 * Calculate how many minutes ahead or behind schedule relative to now
 */
export function getTimeDrift(activeTask: TaskBlock | undefined): {
  minutesDiff: number;
  status: 'on-track' | 'running-late' | 'ahead' | 'no-active';
  label: string;
} {
  if (!activeTask || activeTask.status !== 'active') {
    return { minutesDiff: 0, status: 'no-active', label: 'Idle' };
  }

  const now = new Date();
  const expectedEnd = parseDateSafe(activeTask.endTime);
  const diffFromEnd = differenceInMinutes(expectedEnd, now);

  if (diffFromEnd < 0) {
    const overdueMins = Math.abs(diffFromEnd);
    return {
      minutesDiff: overdueMins,
      status: 'running-late',
      label: `${overdueMins}m overtime`,
    };
  }

  return {
    minutesDiff: diffFromEnd,
    status: 'on-track',
    label: `${diffFromEnd}m remaining`,
  };
}
