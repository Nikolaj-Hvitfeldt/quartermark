// Game rules data for pre-game screens

import { TFunction } from 'i18next';

export interface GameRule {
  emoji: string;
  text: string;
}

export interface GameRulesData {
  title: string;
  subtitle: string;
  rules: GameRule[];
  pointsInfo: string;
  startButtonText: string;
}

// Helper functions to get translated game rules
export function getWouldILieRules(t: TFunction): GameRulesData {
  return {
    title: t('gameRules.wouldILie.title'),
    subtitle: t('gameRules.wouldILie.subtitle'),
    rules: [
      { emoji: '🖼️', text: t('gameRules.wouldILie.rule1') },
      { emoji: '🎭', text: t('gameRules.wouldILie.rule2') },
      { emoji: '🗣️', text: t('gameRules.wouldILie.rule3') },
      { emoji: '🗳️', text: t('gameRules.wouldILie.rule4') },
      { emoji: '✅', text: t('gameRules.wouldILie.rule5') },
    ],
    pointsInfo: t('gameRules.wouldILie.pointsInfo'),
    startButtonText: t('gameRules.wouldILie.startButton'),
  };
}

export function getContestantGuessRules(t: TFunction): GameRulesData {
  return {
    title: t('gameRules.contestantGuess.title'),
    subtitle: t('gameRules.contestantGuess.subtitle'),
    rules: [
      { emoji: '🖼️', text: t('gameRules.contestantGuess.rule1') },
      { emoji: '🤔', text: t('gameRules.contestantGuess.rule2') },
      { emoji: '👆', text: t('gameRules.contestantGuess.rule3') },
      { emoji: '⏱️', text: t('gameRules.contestantGuess.rule4') },
      { emoji: '🎯', text: t('gameRules.contestantGuess.rule5') },
    ],
    pointsInfo: t('gameRules.contestantGuess.pointsInfo'),
    startButtonText: t('gameRules.contestantGuess.startButton'),
  };
}

export function getQuizRules(t: TFunction): GameRulesData {
  return {
    title: t('gameRules.quiz.title'),
    subtitle: t('gameRules.quiz.subtitle'),
    rules: [
      { emoji: '📅', text: t('gameRules.quiz.rule1') },
      { emoji: '❓', text: t('gameRules.quiz.rule2') },
      { emoji: '⚡', text: t('gameRules.quiz.rule3') },
      { emoji: '🥇', text: t('gameRules.quiz.rule4') },
      { emoji: '🎯', text: t('gameRules.quiz.rule5') },
    ],
    pointsInfo: t('gameRules.quiz.pointsInfo'),
    startButtonText: t('gameRules.quiz.startButton'),
  };
}

export function getSocialMediaRules(t: TFunction): GameRulesData {
  return {
    title: t('gameRules.socialMediaGuess.title'),
    subtitle: t('gameRules.socialMediaGuess.subtitle'),
    rules: [
      { emoji: '📱', text: t('gameRules.socialMediaGuess.rule1') },
      { emoji: '🕵️', text: t('gameRules.socialMediaGuess.rule2') },
      { emoji: '👥', text: t('gameRules.socialMediaGuess.rule3') },
      { emoji: '🤫', text: t('gameRules.socialMediaGuess.rule4') },
      { emoji: '😂', text: t('gameRules.socialMediaGuess.rule5') },
    ],
    pointsInfo: t('gameRules.socialMediaGuess.pointsInfo'),
    startButtonText: t('gameRules.socialMediaGuess.startButton'),
  };
}

export function getWagerRules(t: TFunction): GameRulesData {
  return {
    title: t('gameRules.wager.title'),
    subtitle: t('gameRules.wager.subtitle'),
    rules: [
      { emoji: '💰', text: t('gameRules.wager.rule1') },
      { emoji: '❓', text: t('gameRules.wager.rule2') },
      { emoji: '✅', text: t('gameRules.wager.rule3') },
      { emoji: '❌', text: t('gameRules.wager.rule4') },
      { emoji: '🎯', text: t('gameRules.wager.rule5') },
    ],
    pointsInfo: t('gameRules.wager.pointsInfo'),
    startButtonText: t('gameRules.wager.startButton'),
  };
}

// Helper to get question count text
export function getQuestionCountText(count: number, t: TFunction): string {
  const questionWord = count === 1 ? t('common.question') : t('common.questions');
  return `${count} ${questionWord}`;
}

// Legacy constants for backward compatibility (will be removed after migration)
export const WOULD_I_LIE_RULES: GameRulesData = {
  title: "Would I Lie to You?",
  subtitle: "The classic bluffing game!",
  rules: [],
  pointsInfo: "",
  startButtonText: "🎬 Start Round",
};

export const CONTESTANT_GUESS_RULES: GameRulesData = {
  title: "Ai Morph",
  subtitle: "Can you spot who's hiding in the morph?",
  rules: [],
  pointsInfo: "",
  startButtonText: "🔍 Start Guessing",
};

export const QUIZ_RULES: GameRulesData = {
  title: "Quiz of 2025",
  subtitle: "How well do you remember this year?",
  rules: [],
  pointsInfo: "",
  startButtonText: "🧠 Start Quiz",
};

export const SOCIAL_MEDIA_RULES: GameRulesData = {
  title: "Social Media Deep Dive",
  subtitle: "Who posted THAT?!",
  rules: [],
  pointsInfo: "",
  startButtonText: "📲 Start Scrolling",
};

export const WAGER_RULES: GameRulesData = {
  title: "All-In Wager",
  subtitle: "Double or nothing on the host!",
  rules: [],
  pointsInfo: "",
  startButtonText: "🎲 Place Your Bets",
};
