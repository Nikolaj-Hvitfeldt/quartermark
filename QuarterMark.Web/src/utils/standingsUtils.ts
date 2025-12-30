/**
 * Shared utilities for standings displays across games
 */

import { PlayerDto } from '../types';

export const STANDINGS_CONSTANTS = {
  TITLES: {
    CURRENT_STANDINGS: 'Current Standings',
    FINAL_STANDINGS: 'Final Standings',
  },
  BUTTONS: {
    NEXT_QUESTION: 'Next Question →',
    END_ROUND: 'End Round',
    VIEW_STANDINGS: 'View Standings →',
  },
  PROGRESS_FORMAT: (current: number, total: number) => 
    `Question ${current} of ${total} complete`,
} as const;

/**
 * Sort players by score (excluding host)
 */
export function sortPlayersByScore(players: PlayerDto[]): PlayerDto[] {
  return [...players]
    .filter(p => !p.isHost)
    .sort((a, b) => b.score - a.score);
}

