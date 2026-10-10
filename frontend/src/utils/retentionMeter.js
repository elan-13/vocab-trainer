/**
 * Calculates Ebbinghaus Forgetting Curve retention health & battery percentage.
 * @param {object} word - The vocabulary word object { interval, easiness_factor, repetition, next_review }
 * @returns {object} - { percentage, status, color, label, badgeText, batteryLevel, isDue }
 */
export const calculateMemoryBattery = (word) => {
  if (!word) {
    return {
      percentage: 0,
      status: 'Unknown',
      color: 'var(--text-dim)',
      label: 'Unknown',
      badgeText: '🪫 0%',
      batteryLevel: 0,
      isDue: false,
    };
  }

  // If newly created card with 0 repetitions, it has never been memorized yet
  if (word.repetition === 0 && word.interval === 0) {
    return {
      percentage: 15,
      status: 'Unlearned',
      color: '#f59e0b',
      label: 'Initial Learning Cycle',
      badgeText: '⚡ Initial Memory',
      batteryLevel: 1,
      isDue: true,
    };
  }

  const now = new Date().getTime();
  const nextReviewTime = new Date(word.next_review).getTime();
  const totalIntervalMs = Math.max(1, word.interval) * 24 * 60 * 60 * 1000;

  // If overdue or due right now
  if (nextReviewTime <= now) {
    const overdueMs = now - nextReviewTime;
    const overdueDays = overdueMs / (24 * 60 * 60 * 1000);
    // Exponential decay once past review date
    const decayedPercent = Math.max(10, Math.round(30 * Math.exp(-overdueDays * 0.3)));

    return {
      percentage: decayedPercent,
      status: 'Critical',
      color: '#ef4444',
      label: 'Memory Decayed (Recharge Due!)',
      badgeText: `🪫 ${decayedPercent}% Critical`,
      batteryLevel: 0,
      isDue: true,
    };
  }

  // Not due yet: memory is in active scheduled retention window
  const timeRemainingMs = nextReviewTime - now;
  const ratioRemaining = Math.min(1, Math.max(0, timeRemainingMs / totalIntervalMs));

  // Modeled Ebbinghaus retention: drops smoothly from 98% down to ~35% threshold at due time
  const retentionPercent = Math.round(35 + Math.pow(ratioRemaining, 0.7) * 63);

  if (retentionPercent >= 85) {
    return {
      percentage: retentionPercent,
      status: 'Peak',
      color: '#10b981',
      label: 'Peak Long-Term Retention',
      badgeText: `🔋 ${retentionPercent}% Peak`,
      batteryLevel: 4,
      isDue: false,
    };
  } else if (retentionPercent >= 65) {
    return {
      percentage: retentionPercent,
      status: 'Solid',
      color: '#3b82f6',
      label: 'Solid Neural Trace',
      badgeText: `🔋 ${retentionPercent}% Solid`,
      batteryLevel: 3,
      isDue: false,
    };
  } else {
    return {
      percentage: retentionPercent,
      status: 'Fading',
      color: '#f59e0b',
      label: 'Fading Trace (Approaching Review)',
      badgeText: `🪫 ${retentionPercent}% Fading`,
      batteryLevel: 2,
      isDue: false,
    };
  }
};
