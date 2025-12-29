/**
 * Quiz game utilities
 */

export const QUIZ_SCORING = {
  BASE_POINTS: 10,
  FIRST_PLACE_BONUS: 10,
  SECOND_PLACE_BONUS: 5,
  FIRST_PLACE_TOTAL: 20, // BASE_POINTS + FIRST_PLACE_BONUS
  SECOND_PLACE_TOTAL: 15, // BASE_POINTS + SECOND_PLACE_BONUS
} as const;

/**
 * Get bonus message text based on points earned
 */
export function getBonusMessage(points: number): string {
  if (points === QUIZ_SCORING.FIRST_PLACE_TOTAL) {
    return '🥇 First place bonus!';
  }
  if (points === QUIZ_SCORING.SECOND_PLACE_TOTAL) {
    return '🥈 Second place bonus!';
  }
  return '';
}

/**
 * Calculate points earned by comparing previous and new scores
 */
export function calculatePointsEarned(
  previousScore: number,
  newScore: number
): number {
  return newScore - previousScore;
}

