export interface ContestantGuessQuestion {
  id: string;
  imageUrl: string;
  answers: [string, string, string, string]; // Exactly 4 answers
  correctAnswer: string; // Must match one of the answers
}

export const CONTESTANT_GUESS_QUESTIONS: ContestantGuessQuestion[] = [
  {
    id: '1',
    imageUrl: '/images/placeholder-contestant1.jpg', // Will be replaced with actual images
    answers: ['Contestant A', 'Contestant B', 'Contestant C', 'Contestant D'],
    correctAnswer: 'Contestant A',
  },
  {
    id: '2',
    imageUrl: '/images/placeholder-contestant2.jpg',
    answers: ['Contestant E', 'Contestant F', 'Contestant G', 'Contestant H'],
    correctAnswer: 'Contestant F',
  },
  {
    id: '3',
    imageUrl: '/images/placeholder-contestant3.jpg',
    answers: ['Contestant I', 'Contestant J', 'Contestant K', 'Contestant L'],
    correctAnswer: 'Contestant K',
  },
  {
    id: '4',
    imageUrl: '/images/placeholder-contestant4.jpg',
    answers: ['Contestant M', 'Contestant N', 'Contestant O', 'Contestant P'],
    correctAnswer: 'Contestant N',
  },
  {
    id: '5',
    imageUrl: '/images/placeholder-contestant5.jpg',
    answers: ['Contestant Q', 'Contestant R', 'Contestant S', 'Contestant T'],
    correctAnswer: 'Contestant S',
  },
];

