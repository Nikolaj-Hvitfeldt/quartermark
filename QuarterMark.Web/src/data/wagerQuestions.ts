export interface WagerQuestion {
  id: string;
  questionText: string;
  answers: [string, string, string, string]; // Exactly 4 answers
  correctAnswer: string; // Must match one of the answers
}

export const WAGER_QUESTIONS: WagerQuestion[] = [
  {
    id: 'wager1',
    questionText: 'What is the host\'s favorite color?',
    answers: ['Blue', 'Red', 'Green', 'Purple'],
    correctAnswer: 'Blue', // TODO: Replace with actual host answer
  },
  {
    id: 'wager2',
    questionText: 'What is the host\'s favorite food?',
    answers: ['Pizza', 'Sushi', 'Tacos', 'Pasta'],
    correctAnswer: 'Pizza', // TODO: Replace with actual host answer
  },
  {
    id: 'wager3',
    questionText: 'What is the host\'s favorite hobby?',
    answers: ['Gaming', 'Reading', 'Sports', 'Music'],
    correctAnswer: 'Gaming', // TODO: Replace with actual host answer
  },
];

