export interface QuizQuestion {
  id: string;
  questionText: string;
  imageUrl?: string;
  answers: [string, string, string, string]; // Exactly 4 answers
  correctAnswer: string; // Must match one of the answers
}

export const QUIZ_QUESTIONS_2025: QuizQuestion[] = [
  {
    id: '1',
    questionText: 'What was the most streamed song on Spotify in 2025?',
    answers: ['Flowers by Miley Cyrus', 'As It Was by Harry Styles', 'Blinding Lights by The Weeknd', 'Watermelon Sugar by Harry Styles'],
    correctAnswer: 'Flowers by Miley Cyrus',
  },
  {
    id: '2',
    questionText: 'Which movie won Best Picture at the 2025 Oscars?',
    answers: ['Oppenheimer', 'Everything Everywhere All at Once', 'The Fabelmans', 'Top Gun: Maverick'],
    correctAnswer: 'Oppenheimer',
  },
  {
    id: '3',
    questionText: 'What was the biggest tech trend of 2025?',
    answers: ['AI Chatbots', 'Virtual Reality', 'Cryptocurrency', '5G Networks'],
    correctAnswer: 'AI Chatbots',
  },
  {
    id: '4',
    questionText: 'Which social media platform had the most users in 2025?',
    answers: ['TikTok', 'Instagram', 'Facebook', 'Twitter/X'],
    correctAnswer: 'TikTok',
  },
  {
    id: '5',
    questionText: 'What was the most popular TV show of 2025?',
    answers: ['The Last of Us', 'Stranger Things', 'Wednesday', 'House of the Dragon'],
    correctAnswer: 'The Last of Us',
  },
  {
    id: '6',
    questionText: 'Which country hosted the 2024 Summer Olympics?',
    answers: ['Japan', 'France', 'China', 'Brazil'],
    correctAnswer: 'France',
  },
  {
    id: '7',
    questionText: 'What was the best-selling video game of 2025?',
    answers: ['Hogwarts Legacy', 'Call of Duty: Modern Warfare II', 'Elden Ring', 'FIFA 23'],
    correctAnswer: 'Hogwarts Legacy',
  },
  {
    id: '8',
    questionText: 'Which celebrity had the most Instagram followers in 2025?',
    answers: ['Cristiano Ronaldo', 'Lionel Messi', 'Selena Gomez', 'Kylie Jenner'],
    correctAnswer: 'Cristiano Ronaldo',
  },
  {
    id: '9',
    questionText: 'What was the most popular food trend of 2025?',
    answers: ['Plant-based meat', 'Bubble tea', 'Sourdough bread', 'Dalgon coffee'],
    correctAnswer: 'Plant-based meat',
  },
  {
    id: '10',
    questionText: 'Which streaming service had the most subscribers in 2025?',
    answers: ['Netflix', 'Disney+', 'Amazon Prime Video', 'HBO Max'],
    correctAnswer: 'Netflix',
  },
];

