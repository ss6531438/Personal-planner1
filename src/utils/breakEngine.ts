export interface BreakOption {
  minutes: number;
  label: string;
  tagline: string;
  isAllowed: boolean;
  lockReason?: string;
  recommended?: boolean;
}

/**
 * Calculates allowed break durations according to task duration rules:
 * - 30 mins task or below: only 5 mins break allowed
 * - For every 1-hour task (or more): 5, 10, or 15 mins breaks allowed
 * - Tasks between 31m and 59m: 5 or 10 mins breaks allowed
 */
export function getBreakOptionsForTask(taskDurationMinutes: number): {
  options: BreakOption[];
  recommendedMinutes: number;
  categoryRuleText: string;
} {
  const is30OrBelow = taskDurationMinutes <= 30;
  const isOneHourOrMore = taskDurationMinutes >= 60;

  const options: BreakOption[] = [
    {
      minutes: 5,
      label: '5 Mins Break',
      tagline: 'Micro Reset: Sip water, hydrate & roll shoulders',
      isAllowed: true,
      recommended: is30OrBelow,
    },
    {
      minutes: 10,
      label: '10 Mins Break',
      tagline: 'Active Recharge: Walk around, stretch & eye rest',
      isAllowed: !is30OrBelow,
      lockReason: is30OrBelow
        ? '30 mins task or below: only 5 mins break allowed'
        : undefined,
      recommended: !is30OrBelow && !isOneHourOrMore,
    },
    {
      minutes: 15,
      label: '15 Mins Break',
      tagline: 'Deep Restoration: Mindful breath, snack & fresh air',
      isAllowed: isOneHourOrMore,
      lockReason: !isOneHourOrMore
        ? 'Requires 1-hour session or longer'
        : undefined,
      recommended: isOneHourOrMore,
    },
  ];

  let recommendedMinutes = 5;
  if (isOneHourOrMore) recommendedMinutes = 15;
  else if (!is30OrBelow) recommendedMinutes = 10;

  let categoryRuleText = '';
  if (is30OrBelow) {
    categoryRuleText = '⚡ 30m or below task: only 5 mins micro-break allowed to maintain flow.';
  } else if (isOneHourOrMore) {
    categoryRuleText = '🌟 1-Hour+ Deep Session: You can choose 5, 10, or 15 mins break!';
  } else {
    categoryRuleText = '🌿 Mid-length session: Choose between 5 or 10 mins break.';
  }

  return { options, recommendedMinutes, categoryRuleText };
}
