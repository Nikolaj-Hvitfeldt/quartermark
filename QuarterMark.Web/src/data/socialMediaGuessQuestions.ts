export interface SocialMediaGuessQuestion {
  id: string;
  imageUrl: string;
  answers: [string, string, string, string]; // Exactly 4 answers
  correctAnswer: string; // Must match one of the answers
}

export const SOCIAL_MEDIA_GUESS_QUESTIONS: SocialMediaGuessQuestion[] = [
  {
    id: 'smg1',
    imageUrl: '/images/deep-dive-images/SebDeepDive2.jpg',
    answers: ['Frederikke', 'Martin', 'Eline', 'Sebastian'],
    correctAnswer: 'Sebastian',
  },
  {
    id: 'smg2',
    imageUrl: '/images/deep-dive-images/AnderDeepDive4.jpg',
    answers: ['Anders', 'Martin', 'Eline', 'Frederikke'],
    correctAnswer: 'Anders',
  },
  {
    id: 'smg3',
    imageUrl: '/images/deep-dive-images/ElineDeepDive3.jpg',
    answers: ['Sebastian', 'Eline','Anders', 'Martin'],
    correctAnswer: 'Eline',
  },
  {
    id: 'smg4',
    imageUrl: '/images/deep-dive-images/MartinDeepDive1.jpg',
    answers: ['Martin', 'Frederikke', 'Sebastian', 'Anders'],
    correctAnswer: 'Martin',
  },
  {
    id: 'smg5',
    imageUrl: '/images/deep-dive-images/SebDeepDive1.jpg',
    answers: [ 'Niko', 'Anders', 'Martin', 'Sebastian'],
    correctAnswer: 'Sebastian',
  },
  {
    id: 'smg6',
    imageUrl: '/images/deep-dive-images/AnderDeepDive1.jpg',
    answers: [ 'Frederikke', 'Anders','Eline', 'Sebastian'],
    correctAnswer: 'Anders',
  },
  {
    id: 'smg7',
    imageUrl: '/images/deep-dive-images/ElineDeepDive6.jpg',
    answers: [ 'Martin', 'Anders', 'Eline', 'Frederikke'],
    correctAnswer: 'Eline',
  },
  {
    id: 'smg8',
    imageUrl: '/images/deep-dive-images/AnderDeepDive5.jpg',
    answers: ['Anders', 'Sebastian', 'Martin', 'Eline'],
    correctAnswer: 'Anders',
  },
  {
    id: 'smg9',
    imageUrl: '/images/deep-dive-images/SebDeepDive4.jpg',
    answers: ['Frederikke', 'Martin', 'Sebastian', 'Anders'],
    correctAnswer: 'Sebastian',
  },
  {
    id: 'smg10',
    imageUrl: '/images/deep-dive-images/ElineDeepDive2.jpg',
    answers: ['Eline', 'Anders', 'Sebastian', 'Frederikke'],
    correctAnswer: 'Eline',
  },
  {
    id: 'smg11',
    imageUrl: '/images/deep-dive-images/MartinDeepDive3.jpg',
    answers: ['Martin', 'Eline', 'Frederikke', 'Sebastian'],
    correctAnswer: 'Martin',
  },
  {
    id: 'smg12',
    imageUrl: '/images/deep-dive-images/AnderDeepDive3.jpg',
    answers: [ 'Frederikke', 'Sebastian', 'Eline', 'Anders'],
    correctAnswer: 'Anders',
  },
  {
    id: 'smg13',
    imageUrl: '/images/deep-dive-images/ElineDeepDive1.jpg',
    answers: [ 'Martin', 'Eline', 'Anders', 'Sebastian'],
    correctAnswer: 'Eline',
  },
  {
    id: 'smg14',
    imageUrl: '/images/deep-dive-images/SebDeepDive3.jpg',
    answers: [ 'Martin', 'Frederikke', 'Anders', 'Sebastian'],
    correctAnswer: 'Sebastian',
  },
  {
    id: 'smg15',
    imageUrl: '/images/deep-dive-images/AnderDeepDive6.jpg',
    answers: ['Eline', 'Sebastian', 'Anders',  'Frederikke'],
    correctAnswer: 'Anders',
  },
  {
    id: 'smg16',
    imageUrl: '/images/deep-dive-images/ElineDeepDive4.jpg',
    answers: [ 'Frederikke', 'Martin', 'Eline', 'Sebastian'],
    correctAnswer: 'Eline',
  },
  {
    id: 'smg17',
    imageUrl: '/images/deep-dive-images/MartinDeepDive2.jpg',
    answers: ['Sebastian', 'Anders', 'Eline', 'Martin'],
    correctAnswer: 'Martin',
  },
  {
    id: 'smg18',
    imageUrl: '/images/deep-dive-images/AnderDeepDive2.jpg',
    answers: ['Anders', 'Martin', 'Frederikke', 'Sebastian'],
    correctAnswer: 'Anders',
  },
  {
    id: 'smg19',
    imageUrl: '/images/deep-dive-images/ElineDeepDive5.jpg',
    answers: ['Frederikke','Eline', 'Sebastian',  'Martin'],
    correctAnswer: 'Eline',
  },
];

