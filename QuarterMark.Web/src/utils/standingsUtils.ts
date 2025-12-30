/**
 * Shared utilities for standings displays across games
 */

import { PlayerDto } from '../types';
import { TFunction } from 'i18next';

export const getStandingsConstants = (t: TFunction) => ({
  TITLES: {
    CURRENT_STANDINGS: t('standings.currentStandings'),
    FINAL_STANDINGS: t('standings.finalStandings'),
  },
  BUTTONS: {
    NEXT_QUESTION: t('standings.nextQuestion'),
    END_ROUND: t('standings.endRound'),
    VIEW_STANDINGS: t('standings.viewStandings'),
  },
  PROGRESS_FORMAT: (current: number, total: number) => 
    t('standings.progressFormat', { current, total }),
});

/**
 * Sort players by score (excluding host)
 */
export function sortPlayersByScore(players: PlayerDto[]): PlayerDto[] {
  return [...players]
    .filter(p => !p.isHost)
    .sort((a, b) => b.score - a.score);
}

