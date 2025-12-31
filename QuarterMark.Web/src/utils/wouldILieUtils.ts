// Would I Lie game constants and utilities

/**
 * Deterministically shuffle an array using a seed value
 * This ensures all players see the same randomized order
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
  const shuffled = [...array];
  // Create a simple seeded random function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  // Use hash as seed for shuffling
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash) + i;
    hash = hash & hash;
    const j = Math.abs(hash) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const WOULD_I_LIE_SCORING = {
  CORRECT_VOTE: 10,
  POINTS_PER_VOTE_RECEIVED: 10,
} as const;

export const WOULD_I_LIE_TITLES = {
  WHO_KNOWS: 'Who knows this person?',
  WHOS_TELLING_TRUTH: "Who's telling the truth?",
  VOTING_IN_PROGRESS: 'Voting in Progress',
  ANSWER_REVEALED: 'Answer Revealed!',
  ROUND_COMPLETE: '🎉 Round Complete!',
  FINAL_STANDINGS: 'Final Standings',
  CURRENT_STANDINGS: 'Current Standings',
} as const;

export const WOULD_I_LIE_MESSAGES = {
  WAITING_FOR_HOST: 'Waiting for host to start the round...',
  WAITING_FOR_VOTING: 'Waiting for host to start voting...',
  CLAIMER_WAITING: 'You claimed to know them. Waiting for voting to start...',
  VOTE_SUBMITTED: '✓ Vote submitted! Waiting for other players...',
  WAITING_FOR_VOTES: 'Waiting for other players to vote...',
  CLAIMS_TO_KNOW: 'Claims to know them',
  VOTE_FOR_THEM: 'Vote for them',
  TRUTH_TELLER: '✓ Truth Teller',
  YOUR_VOTE: 'Your Vote',
  LOADING: 'Loading...',
  SKAAL: 'SKÅL!',
  ROUND_COMPLETE_SKAAL: 'Round complete - SKÅL!',
} as const;

// Color classes for the 2-option answer grid
export const OPTION_COLORS = ['option-blue', 'option-purple'] as const;

export function getOptionColorClass(index: number): string {
  return OPTION_COLORS[index % OPTION_COLORS.length];
}

// Result message generation
export function getClaimerResultMessage(votesReceived: number): string {
  if (votesReceived > 0) {
    const points = votesReceived * WOULD_I_LIE_SCORING.POINTS_PER_VOTE_RECEIVED;
    return `🎉 You received ${votesReceived} vote(s)! +${points} points`;
  }
  return '😅 No one voted for you. 0 points';
}

export function getVoterResultMessage(isCorrect: boolean): string {
  if (isCorrect) {
    return `🎉 You guessed correctly! +${WOULD_I_LIE_SCORING.CORRECT_VOTE} points`;
  }
  return '❌ You guessed wrong! 0 points';
}

// Calculate votes received by a player
export function calculateVotesReceived(votes: Record<string, string>, playerName: string): number {
  return Object.values(votes).filter(v => v === playerName).length;
}

