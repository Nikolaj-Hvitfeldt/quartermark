/**
 * Score persistence utilities
 * 
 * Scores are accumulated across all games through GameSessionService.CompleteGameAsync:
 * - Each game's round scores are added to GameSession.AccumulatedScores
 * - Player.Score is updated to match AccumulatedScores for display
 * - AccumulatedScores persist throughout the entire game session
 * - The player with the highest accumulated score at the end wins
 */

import { PlayerDto } from '../types';

/**
 * Get the winner from accumulated scores
 */
export function getWinner(
  players: PlayerDto[],
  accumulatedScores: Record<string, number>
): PlayerDto | null {
  if (players.length === 0) return null;

  const sortedPlayers = [...players].sort(
    (a, b) => (accumulatedScores[b.name] || 0) - (accumulatedScores[a.name] || 0)
  );

  return sortedPlayers[0];
}

