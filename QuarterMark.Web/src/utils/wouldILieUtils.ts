// Would I Lie game constants and utilities
import i18n from '../i18n/config';

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

// Getters so the texts follow the current language
export const WOULD_I_LIE_TITLES = {
  get WHO_KNOWS() { return i18n.t('wouldILieGame.whoKnows'); },
  get WHOS_TELLING_TRUTH() { return i18n.t('wouldILieGame.whosTellingTruth'); },
  get VOTING_IN_PROGRESS() { return i18n.t('wouldILieGame.votingInProgress'); },
  get ANSWER_REVEALED() { return i18n.t('wouldILieGame.answerRevealed'); },
  get ROUND_COMPLETE() { return i18n.t('wouldILieGame.roundComplete'); },
  get FINAL_STANDINGS() { return i18n.t('wouldILieGame.finalStandings'); },
  get CURRENT_STANDINGS() { return i18n.t('wouldILieGame.currentStandings'); },
};

export const WOULD_I_LIE_MESSAGES = {
  get WAITING_FOR_HOST() { return i18n.t('game.waitingForRound'); },
  get WAITING_FOR_VOTING() { return i18n.t('wouldILieGame.waitingForVoting'); },
  get CLAIMER_WAITING() { return i18n.t('wouldILieGame.claimerWaiting'); },
  get VOTE_SUBMITTED() { return i18n.t('wouldILieGame.voteSubmitted'); },
  get WAITING_FOR_VOTES() { return i18n.t('wouldILieGame.waitingForVotes'); },
  get CLAIMS_TO_KNOW() { return i18n.t('wouldILieGame.claimsToKnow'); },
  get VOTE_FOR_THEM() { return i18n.t('wouldILieGame.voteForThem'); },
  get TRUTH_TELLER() { return i18n.t('wouldILieGame.truthTellerBadge'); },
  get YOUR_VOTE() { return i18n.t('wouldILieGame.yourVote'); },
  get LOADING() { return i18n.t('common.loading'); },
  get SKAAL() { return i18n.t('wouldILieGame.skaal'); },
  get ROUND_COMPLETE_SKAAL() { return i18n.t('wouldILieGame.roundCompleteSkaal'); },
};

// Color classes for the 2-option answer grid
export const OPTION_COLORS = ['option-blue', 'option-purple'] as const;

export function getOptionColorClass(index: number): string {
  return OPTION_COLORS[index % OPTION_COLORS.length];
}

// Result message generation
export function getClaimerResultMessage(votesReceived: number): string {
  if (votesReceived > 0) {
    const points = votesReceived * WOULD_I_LIE_SCORING.POINTS_PER_VOTE_RECEIVED;
    return i18n.t('wouldILieGame.receivedVotes', { count: votesReceived, points });
  }
  return i18n.t('wouldILieGame.noVotes');
}

export function getVoterResultMessage(isCorrect: boolean): string {
  if (isCorrect) {
    return i18n.t('wouldILieGame.guessedRight', { points: WOULD_I_LIE_SCORING.CORRECT_VOTE });
  }
  return i18n.t('wouldILieGame.guessedWrong');
}

// Calculate votes received by a player
export function calculateVotesReceived(votes: Record<string, string>, playerName: string): number {
  return Object.values(votes).filter(v => v === playerName).length;
}

