import type { EnergyLevel, TaskBlock } from '../types';
import { addMinutes, setHours, setMinutes, setSeconds } from 'date-fns';

export interface ParsedItem {
  raw: string;
  title: string;
  durationMinutes: number;
  energyLevel: EnergyLevel;
  startTime?: Date;
}

/**
 * Intelligent Natural Language Parser for day quick-dump input
 */
export function parseQuickDumpText(
  text: string,
  baseDate: Date = new Date()
): { items: ParsedItem[]; tasks: TaskBlock[] } {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'));

  const parsedItems: ParsedItem[] = [];

  for (const line of lines) {
    let workingLine = line;

    // 1. Check for explicit start time (e.g. 7:30am, 14:00, 8pm, 9:15)
    let explicitStartTime: Date | undefined;
    const timeMatch = workingLine.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);

    if (timeMatch && (timeMatch[2] !== undefined || timeMatch[3] !== undefined)) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3]?.toLowerCase();

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        explicitStartTime = setSeconds(setMinutes(setHours(baseDate, hours), minutes), 0);
        // Remove time string from working line
        workingLine = workingLine.replace(timeMatch[0], ' ');
      }
    }

    // 2. Check for Energy level tag: e.g. (high), [deep], #admin, (rest)
    let energyLevel: EnergyLevel = 'routine';
    let energyExplicit = false;

    const energyTagMatch = workingLine.match(/[\(\[\#](high|deep|creative|admin|shallow|rest|break|wellness|recharge|routine|chore|errand|low)[\)\]]?/i);
    if (energyTagMatch) {
      const tag = energyTagMatch[1].toLowerCase();
      energyExplicit = true;
      if (['high', 'deep', 'creative'].includes(tag)) energyLevel = 'deep';
      else if (['admin', 'shallow'].includes(tag)) energyLevel = 'admin';
      else if (['rest', 'break', 'wellness', 'recharge'].includes(tag)) energyLevel = 'rest';
      else if (['routine', 'chore', 'errand', 'low'].includes(tag)) energyLevel = 'routine';

      workingLine = workingLine.replace(energyTagMatch[0], ' ');
    }

    // 3. Check for Duration: e.g. 45m, 2h, 1.5h, 90m, 1h30m, 20 mins
    let durationMinutes = 30; // default
    const compositeHourMinMatch = workingLine.match(/\b(\d+)\s*(?:h|hr|hrs|hour|hours)\s*(\d+)\s*(?:m|min|mins|minutes)?\b/i);
    const hourMatch = workingLine.match(/\b(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i);
    const minMatch = workingLine.match(/\b(\d+)\s*(?:m|min|mins|minutes)\b/i);

    if (compositeHourMinMatch) {
      const h = parseInt(compositeHourMinMatch[1], 10);
      const m = parseInt(compositeHourMinMatch[2], 10);
      durationMinutes = h * 60 + m;
      workingLine = workingLine.replace(compositeHourMinMatch[0], ' ');
    } else if (hourMatch) {
      const h = parseFloat(hourMatch[1]);
      durationMinutes = Math.round(h * 60);
      workingLine = workingLine.replace(hourMatch[0], ' ');
    } else if (minMatch) {
      durationMinutes = parseInt(minMatch[1], 10);
      workingLine = workingLine.replace(minMatch[0], ' ');
    }

    // 4. Infer energy level from content if not explicitly tagged
    if (!energyExplicit) {
      const lower = workingLine.toLowerCase();
      if (/\b(lunch|dinner|breakfast|break|walk|recharge|meditat|stretch|nap|coffee|snack|shower|tea)\b/.test(lower)) {
        energyLevel = 'rest';
      } else if (/\b(deep|build|code|programm|architect|api|feature|writ|design|study|research|focus)\b/.test(lower)) {
        energyLevel = 'deep';
      } else if (/\b(email|inbox|meeting|sync|call|review|prs|admin|tax|bills|invoice|planning|standup)\b/.test(lower)) {
        energyLevel = 'admin';
      } else if (/\b(workout|gym|exercise|laundry|clean|dishes|grocer|errand|routine)\b/.test(lower)) {
        energyLevel = 'routine';
      }
    }

    // 5. Clean up title
    const cleanedTitle = workingLine
      .replace(/^[-\*\d\.\:\s]+/, '') // remove bullet points or numbers
      .replace(/[\(\)\[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    parsedItems.push({
      raw: line,
      title: cleanedTitle || 'Focus Session',
      durationMinutes: Math.max(1, durationMinutes),
      energyLevel,
      startTime: explicitStartTime,
    });
  }

  // 6. Chain parsed items into full TaskBlock array
  let currentTime = baseDate;
  const tasks: TaskBlock[] = [];

  for (let i = 0; i < parsedItems.length; i++) {
    const item = parsedItems[i];
    let start: Date;

    if (item.startTime) {
      start = item.startTime;
    } else {
      start = currentTime;
    }

    const end = addMinutes(start, item.durationMinutes);
    currentTime = end;

    tasks.push({
      id: `task-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      title: item.title,
      durationMinutes: item.durationMinutes,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      energyLevel: item.energyLevel,
      status: i === 0 ? 'active' : 'pending',
    });
  }

  return { items: parsedItems, tasks };
}

/**
 * Sample quick-dump text for immediate testing
 */
export const SAMPLE_QUICK_DUMP = `8:30am Morning workout & stretch 45m (routine)
Breakfast & coffee 30m (rest)
Deep Work: Core architecture & API 90m (high)
Quick mental recharge & walk 15m (rest)
Sprint sync & team planning 45m (admin)
Lunch & read 45m (rest)
Deep Work: Client feature implementation 2h (high)
Review PRs, emails & roadmap 45m (admin)
Daily shutdown & tomorrow prep 20m (routine)`;
