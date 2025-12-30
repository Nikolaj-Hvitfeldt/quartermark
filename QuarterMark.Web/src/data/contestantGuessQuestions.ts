export interface ContestantGuessQuestion {
  id: string;
  imageUrl: string;
  answers: [string, string, string, string]; // Exactly 4 answers
  correctAnswer: string; // Must match one of the answers
}

export const CONTESTANT_GUESS_QUESTIONS: ContestantGuessQuestion[] = [
  {
    id: '1',
    imageUrl: '/images/AI-morph-images/Seb-MetteF.jpg',
    answers: ['Frederikke', 'Martin', 'Eline', 'Sebastian'],
    correctAnswer: 'Sebastian',
  },
  {
    id: '2',
    imageUrl: '/images/AI-morph-images/Frederikke-kongen.jpg',
    answers: ['Anders', 'Martin', 'Eline', 'Frederikke'],
    correctAnswer: 'Frederikke',
  },
  {
    id: '3',
    imageUrl: '/images/AI-morph-images/Eline-Brad-Pitt.jpg',
    answers: ['Martin', 'Eline', 'Sebastian', 'Anders'],
    correctAnswer: 'Eline',
  },
  {
    id: '4',
    imageUrl: '/images/AI-morph-images/Martin-Loc.jpg',
    answers: ['Frederikke', 'Sebastian', 'Anders', 'Martin'],
    correctAnswer: 'Martin',
  },
  {
    id: '5',
    imageUrl: '/images/AI-morph-images/Anders-putin.jpg',
    answers: ['Anders', 'Martin', 'Sebastian', 'Eline'],
    correctAnswer: 'Anders',
  },
  {
    id: '6',
    imageUrl: '/images/AI-morph-images/Seb-Casper-Kristensen.jpg',
    answers: ['Sebastian', 'Frederikke', 'Martin', 'Anders'],
    correctAnswer: 'Sebastian',
  },
  {
    id: '7',
    imageUrl: '/images/AI-morph-images/Frederikke-trump.jpg',
    answers: ['Martin', 'Frederikke', 'Eline', 'Anders'],
    correctAnswer: 'Frederikke',
  },
  {
    id: '8',
    imageUrl: '/images/AI-morph-images/Eline-musk.jpg',
    answers: ['Anders', 'Frederikke', 'Sebastian', 'Eline'],
    correctAnswer: 'Eline',
  },
  {
    id: '9',
    imageUrl: '/images/AI-morph-images/Martin-Epstein.jpg',
    answers: ['Martin', 'Sebastian', 'Anders', 'Frederikke'],
    correctAnswer: 'Martin',
  },
  {
    id: '10',
    imageUrl: '/images/AI-morph-images/Anders-Johnny-Sins.jpg',
    answers: ['Anders', 'Anders', 'Anders', 'Anders'],
    correctAnswer: 'Anders',
  },
  
];

