import { PlayerDto } from '../types';

export const GAME_CONSTANTS = {
  TOTAL_GAMES: 5,
  DRINKING_WHEEL_AFTER_GAME_2: 2,
  DRINKING_WHEEL_AFTER_GAME_4: 4,
  COMPLETION_SCREEN_DELAY_AFTER_WHEEL: 3000,
  PLAYER_ROUND_END_DELAY_WOULD_ILIE: 3000,
  PLAYER_ROUND_END_DELAY_CONTESTANT_GUESS: 2000,
  PLAYER_ROUND_END_DELAY_QUIZ: 2000,
  PLAYER_ROUND_END_DELAY_SOCIAL_MEDIA_GUESS: 2000,
  DRINKING_WHEEL_SPIN_COMPLETE_DELAY: 3000,
  CONTESTANT_GUESS_POINTS_PER_CORRECT: 10,
} as const;

export function getGameName(type: string): string {
  switch (type) {
    case 'WouldILie':
      return 'Would I Lie to You?';
    case 'ContestantGuess':
      return 'Contestant Guess';
    case 'Quiz':
      return 'Quiz of 2025';
    case 'SocialMediaGuess':
      return 'Social Media Guess';
    case 'Wager':
      return 'All-In Wager';
    default:
      return type;
  }
}

export function sortPlayersByScore(
  players: PlayerDto[],
  accumulatedScores: Record<string, number>,
  excludeHost: boolean = true
): PlayerDto[] {
  const filtered = excludeHost ? players.filter(p => !p.isHost) : players;
  return [...filtered].sort(
    (a, b) => (accumulatedScores[b.name] || 0) - (accumulatedScores[a.name] || 0)
  );
}

export function shouldShowDrinkingWheel(gameNumber: number): boolean {
  return (
    gameNumber === GAME_CONSTANTS.DRINKING_WHEEL_AFTER_GAME_2 ||
    gameNumber === GAME_CONSTANTS.DRINKING_WHEEL_AFTER_GAME_4
  );
}

export function getNextGameType(currentGameNumber: number): string {
  // Game sequence: 1=WouldILie, 2=ContestantGuess, 3=Quiz, 4=SocialMediaGuess, 5=Wager
  if (currentGameNumber === 1) {
    return 'contestantGuess';
  } else if (currentGameNumber === 2) {
    return 'quiz';
  } else if (currentGameNumber === 3) {
    return 'socialMediaGuess';
  } else if (currentGameNumber === 4) {
    return 'wager';
  } else {
    // Default to Would I Lie
    return 'wouldILie';
  }
}


