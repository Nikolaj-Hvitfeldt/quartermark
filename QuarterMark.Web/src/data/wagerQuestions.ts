export interface WagerQuestion {
  id: string;
  questionText: string;
  answers: [string, string, string, string]; // Exactly 4 answers
  correctAnswer: string; // Must match one of the answers
}

export const WAGER_QUESTIONS: WagerQuestion[] = [
  {
    id: 'wager1',
    questionText: 'What does Niko\'s artist name SLSH stand for?',
    answers: ['Store Lår Sexet Hår', 'Spastisk Lam? Sikkert Ham', 'Stort Lem Sent Hjem', 'SLum SHeik'],
    correctAnswer: 'Stort Lem Sent Hjem',
  },
  {
    id: 'wager2',
    questionText: 'In what video game is Niko in the top 1% of the world leaderboard?',
    answers: ['CounterStrike: Global Offensive', 'CounterStrike 1.6', 'CounterStrike Source', 'CounterStrike 2'],
    correctAnswer: 'CounterStrike 2',
  },
  {
    id: 'wager3',
    questionText: 'Against popular belief, what is Niko\'s favorite drink?',
    answers: ['Gin Hass', 'Vodka Redbull', 'Strawberry Daiquiri', 'Pink Pussy'],
    correctAnswer: 'Strawberry Daiquiri',
  },
];

