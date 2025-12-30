// Fireworks configuration
export const FIREWORK_COLORS = [
  '#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', 
  '#f9ca24', '#f0932b', '#6c5ce7', '#a29bfe',
  '#ff85a2', '#00d4aa', '#ff9f43', '#ee5a24'
] as const;

export const FIREWORK_SIZES = ['small', 'medium', 'large'] as const;
export type FireworkSize = typeof FIREWORK_SIZES[number];

export const FIREWORKS_CONFIG = {
  PARTICLES_PER_BURST: 15,
  MAX_PARTICLES: 45,
  BURST_INTERVAL_MS: 2000,
  SPARKS_PER_FIREWORK: 12,
  SPARK_DEGREES: 30, // 360 / 12 = 30 degrees per spark
  INITIAL_DELAY_MAX: 2,
  X_POSITION_MIN: 10,
  X_POSITION_MAX: 90,
  Y_POSITION_MIN: 10,
  Y_POSITION_MAX: 50,
} as const;

// Podium dimensions (in pixels)
export const PODIUM_DIMENSIONS = {
  FIRST: { width: 140, height: 160 },
  SECOND: { width: 120, height: 120 },
  THIRD: { width: 120, height: 90 },
  AVATAR: { size: 80 },
  MEDAL: { size: 2.5 },
  CROWN: { size: 3 },
} as const;

export const PODIUM_DIMENSIONS_MOBILE = {
  FIRST: { width: 100, height: 120 },
  SECOND: { width: 85, height: 90 },
  THIRD: { width: 85, height: 70 },
  AVATAR: { size: 60 },
  MEDAL: { size: 2 },
  CROWN: { size: 2.5 },
} as const;

// Final results text
export const FINAL_RESULTS_TEXT = {
  TITLE: 'Final Results',
  SUBTITLE: 'Happy New Year',
  PRIZE_MESSAGE: 'You win a firm handshake from the host',
  WAITING_MESSAGE: 'Waiting for host to end the game...',
} as const;

// Auto-show delay for players (milliseconds)
export const FINAL_RESULTS_AUTO_SHOW_DELAY_MS = 3000;

