import type { DayTemplate, TaskBlock } from '../types';
import { addMinutes } from 'date-fns';

export const BUILT_IN_TEMPLATES: DayTemplate[] = [
  {
    id: 'deep-work-sprint',
    name: 'Deep Work Sprint (Pomodoro Flow)',
    description: 'High-leverage focus blocks with structured micro-recharges to stay in continuous flow state.',
    icon: 'Brain',
    blocks: [
      { title: 'Intention Setting & Workspace Prep', durationMinutes: 15, energyLevel: 'routine', notes: 'Clear tabs, silence notifications, define key outcome' },
      { title: 'Deep Work Block 1: Complex Problem', durationMinutes: 50, energyLevel: 'deep', notes: 'Highest leverage challenge of the day' },
      { title: 'Micro Recharge: Hydrate & Stretch', durationMinutes: 10, energyLevel: 'rest', notes: 'Step away from screen' },
      { title: 'Deep Work Block 2: Implementation', durationMinutes: 50, energyLevel: 'deep', notes: 'Flow state execution' },
      { title: 'Micro Recharge: Outdoor Breath', durationMinutes: 10, energyLevel: 'rest', notes: 'Natural sunlight reset' },
      { title: 'Deep Work Block 3: Polish & Tests', durationMinutes: 50, energyLevel: 'deep', notes: 'Tie loose ends and verify logic' },
      { title: 'Session Review & Note Capture', durationMinutes: 20, energyLevel: 'admin', notes: 'Log learnings, commits and next actions' },
    ],
  },
  {
    id: 'balanced-workday',
    name: 'Balanced Workday',
    description: 'Full day designed around natural energy rhythms: morning deep focus, afternoon meetings, evening shutdown.',
    icon: 'Briefcase',
    blocks: [
      { title: 'Morning Movement & Hydration', durationMinutes: 40, energyLevel: 'routine', notes: 'Exercise, stretch, prepare mindset' },
      { title: 'Healthy Breakfast & Coffee', durationMinutes: 30, energyLevel: 'rest', notes: 'Nourishment without digital rush' },
      { title: 'Deep Focus: Primary Goal', durationMinutes: 90, energyLevel: 'deep', notes: 'Tackle the #1 most important task' },
      { title: 'Coffee & Screen Break', durationMinutes: 15, energyLevel: 'rest', notes: 'Quick mental breather' },
      { title: 'Deep Focus: Secondary Objective', durationMinutes: 75, energyLevel: 'deep', notes: 'Complete core milestone' },
      { title: 'Lunch & Fresh Air Walk', durationMinutes: 45, energyLevel: 'rest', notes: 'Proper midday recharge' },
      { title: 'Team Sync & Collaboration', durationMinutes: 45, energyLevel: 'admin', notes: 'Meetings and alignment' },
      { title: 'Inbox Zero, PR Reviews & Async Comms', durationMinutes: 60, energyLevel: 'admin', notes: 'Batched communication' },
      { title: 'Daily Shutdown & Next Day Prep', durationMinutes: 20, energyLevel: 'routine', notes: 'Clean desk, review metrics, switch off' },
    ],
  },
  {
    id: 'weekend-reset',
    name: 'Weekend Reset & Wellness',
    description: 'A restorative flow blending joyful movement, creative side projects, chores, and relaxation.',
    icon: 'Sun',
    blocks: [
      { title: 'Gentle Morning Yoga & Tea', durationMinutes: 45, energyLevel: 'rest', notes: 'Slow morning pacing' },
      { title: 'Weekend Brunch with Music', durationMinutes: 45, energyLevel: 'rest', notes: 'Enjoy good food' },
      { title: 'Passionate Creative Project', durationMinutes: 120, energyLevel: 'deep', notes: 'Build something fun without deadlines' },
      { title: 'Quick Household Organization', durationMinutes: 45, energyLevel: 'routine', notes: 'Tidy space, laundry, errands' },
      { title: 'Outdoor Walk / Nature Recharge', durationMinutes: 60, energyLevel: 'rest', notes: 'No phone, pure presence' },
      { title: 'Reading & Casual Learning', durationMinutes: 60, energyLevel: 'routine', notes: 'Engaging book or documentary' },
      { title: 'Relaxing Evening & Social Time', durationMinutes: 90, energyLevel: 'rest', notes: 'Friends, family, or movie night' },
    ],
  },
  {
    id: 'emergency-recovery',
    name: 'Emergency Schedule Recovery',
    description: 'When running very late or overwhelmed: rapid high-impact 25-minute bursts to regain momentum.',
    icon: 'Zap',
    blocks: [
      { title: 'Rapid Triage: Top 2 Priorities Only', durationMinutes: 10, energyLevel: 'routine', notes: 'Eliminate anything non-critical' },
      { title: 'Burst Focus #1: Urgent Deliverable', durationMinutes: 25, energyLevel: 'deep', notes: 'Zero distractions sprint' },
      { title: 'Quick Breathing Reset', durationMinutes: 5, energyLevel: 'rest', notes: 'Deep inhale/exhale' },
      { title: 'Burst Focus #2: Urgent Deliverable', durationMinutes: 25, energyLevel: 'deep', notes: 'Ship or finish draft' },
      { title: 'Quick Break & Water', durationMinutes: 10, energyLevel: 'rest', notes: 'Hydrate' },
      { title: 'Key Communication / Dispatch', durationMinutes: 20, energyLevel: 'admin', notes: 'Send off completed work' },
    ],
  },
];

/**
 * Generate TaskBlocks from a template anchored at a start date
 */
export function instantiateTemplate(template: DayTemplate, startTime: Date = new Date()): TaskBlock[] {
  let currentTime = startTime;
  return template.blocks.map((block, index) => {
    const start = currentTime;
    const end = addMinutes(start, block.durationMinutes);
    currentTime = end;

    return {
      id: `task-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      title: block.title,
      durationMinutes: block.durationMinutes,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      energyLevel: block.energyLevel,
      status: index === 0 ? 'active' : 'pending',
      notes: block.notes,
    };
  });
}
