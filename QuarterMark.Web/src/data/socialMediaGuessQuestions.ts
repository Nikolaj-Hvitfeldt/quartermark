export interface SocialMediaGuessQuestion {
  id: string;
  imageUrl: string;
  answers: [string, string, string, string]; // Exactly 4 answers
  correctAnswer: string; // Must match one of the answers
}

export const SOCIAL_MEDIA_GUESS_QUESTIONS: SocialMediaGuessQuestion[] = [
  {
    id: 'smg1',
    imageUrl: '/images/mock-social-media-1.jpg', // Placeholder image
    answers: ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Williams'],
    correctAnswer: 'John Doe',
  },
  {
    id: 'smg2',
    imageUrl: '/images/mock-social-media-2.jpg',
    answers: ['Emily White', 'David Green', 'Sarah Brown', 'Michael Black'],
    correctAnswer: 'Sarah Brown',
  },
  {
    id: 'smg3',
    imageUrl: '/images/mock-social-media-3.jpg',
    answers: ['Olivia Davis', 'Liam Wilson', 'Sophia Martinez', 'Noah Taylor'],
    correctAnswer: 'Noah Taylor',
  },
  {
    id: 'smg4',
    imageUrl: '/images/mock-social-media-4.jpg',
    answers: ['Ava Anderson', 'William Thomas', 'Isabella Jackson', 'James White'],
    correctAnswer: 'Ava Anderson',
  },
  {
    id: 'smg5',
    imageUrl: '/images/mock-social-media-5.jpg',
    answers: ['Mia Harris', 'Benjamin Clark', 'Charlotte Lewis', 'Henry King'],
    correctAnswer: 'Henry King',
  },
];

