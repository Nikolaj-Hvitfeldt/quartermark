// Game rules data for pre-game screens

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

export const WOULD_I_LIE_RULES: GameRulesData = {
  title: "Would I Lie to You?",
  subtitle: "The classic bluffing game!",
  rules: [
    { emoji: '🖼️', text: 'A photo will be shown to all players' },
    { emoji: '🎭', text: 'The host secretly assigns one player as the "truth teller" who actually knows the person, and one as the "liar"' },
    { emoji: '🗣️', text: 'Both players must convince others that THEY are the one who knows the person' },
    { emoji: '🗳️', text: 'Other players vote on who they think is telling the truth' },
    { emoji: '✅', text: 'Correct votes earn points! Wrong votes give points to the liar' },
  ],
  pointsInfo: "10 points for correct guesses • Liar earns points for each fooled player",
  startButtonText: "🎬 Start Round",
};

export const CONTESTANT_GUESS_RULES: GameRulesData = {
  title: "Ai Morph",
  subtitle: "Can you spot who's hiding in the morph?",
  rules: [
    { emoji: '🖼️', text: 'A morphed photo combining a contestant with a celebrity will appear' },
    { emoji: '🤔', text: 'Study the image carefully - who is hiding in there?' },
    { emoji: '👆', text: 'Choose from 4 possible contestants' },
    { emoji: '⏱️', text: 'All players must answer before the reveal' },
    { emoji: '🎯', text: 'Only correct guesses earn points!' },
  ],
  pointsInfo: "10 points per correct answer",
  startButtonText: "🔍 Start Guessing",
};

export const QUIZ_RULES: GameRulesData = {
  title: "Quiz of 2025",
  subtitle: "How well do you remember this year?",
  rules: [
    { emoji: '📅', text: 'Test your knowledge of what happened in 2025!' },
    { emoji: '❓', text: 'Each question has 4 possible answers - pick wisely' },
    { emoji: '⚡', text: 'Speed matters! First 2 correct answers get bonus points' },
    { emoji: '🥇', text: '1st place: +10 bonus points • 2nd place: +5 bonus points' },
    { emoji: '🎯', text: 'Everyone who answers correctly gets base points' },
  ],
  pointsInfo: "10 base points + speed bonuses",
  startButtonText: "🧠 Start Quiz",
};

export const SOCIAL_MEDIA_RULES: GameRulesData = {
  title: "Social Media Deep Dive",
  subtitle: "Who posted THAT?!",
  rules: [
    { emoji: '📱', text: 'A social media post will be shown - but who posted it?' },
    { emoji: '🕵️', text: 'Look for clues in the writing style, content, and context' },
    { emoji: '👥', text: 'Choose from 4 possible contestants' },
    { emoji: '🤫', text: 'These are REAL posts from the contestants!' },
    { emoji: '😂', text: 'Prepare for some embarrassing throwbacks...' },
  ],
  pointsInfo: "10 points per correct guess",
  startButtonText: "📲 Start Scrolling",
};

export const WAGER_RULES: GameRulesData = {
  title: "All-In Wager",
  subtitle: "Double or nothing on the host!",
  rules: [
    { emoji: '💰', text: 'Wager any amount of your points before each question' },
    { emoji: '❓', text: 'Answer fun facts about the host' },
    { emoji: '✅', text: 'Correct answer: Win double your wager!' },
    { emoji: '❌', text: 'Wrong answer: Lose your wager' },
    { emoji: '🎯', text: 'Risk it all or play it safe - your choice!' },
  ],
  pointsInfo: "Double your wager or lose it all",
  startButtonText: "🎲 Place Your Bets",
};

// Helper to get question count text
export function getQuestionCountText(count: number): string {
  return `${count} question${count !== 1 ? 's' : ''}`;
}

