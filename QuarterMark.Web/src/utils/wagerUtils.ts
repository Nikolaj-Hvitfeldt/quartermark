/**
 * Wager game utilities and constants
 */

import { PlayerDto } from '../types';

export const WAGER_CONSTANTS = {
  MULTIPLIER: 2, // Players win double their wager if correct
} as const;

/**
 * Calculate net points gained/lost from a wager
 * @param wagerAmount - The amount wagered
 * @param isCorrect - Whether the answer was correct
 * @returns Net points change (positive for win, negative for loss)
 */
export function calculateWagerResult(wagerAmount: number, isCorrect: boolean): number {
  if (isCorrect) {
    // Win: get double the wager (2x), net gain = wager amount
    // Example: wager 50, win 100, net = +50
    return wagerAmount;
  } else {
    // Lose: lose the wager amount
    // Example: wager 50, lose 50, net = -50
    return -wagerAmount;
  }
}

/**
 * Calculate total winnings from a correct wager
 * @param wagerAmount - The amount wagered
 * @returns Total points won (wager amount * multiplier)
 */
export function calculateWinnings(wagerAmount: number): number {
  return wagerAmount * WAGER_CONSTANTS.MULTIPLIER;
}

/**
 * Get count of non-host players
 */
export function getNonHostPlayerCount(players: PlayerDto[]): number {
  return players.filter(p => !p.isHost).length;
}

