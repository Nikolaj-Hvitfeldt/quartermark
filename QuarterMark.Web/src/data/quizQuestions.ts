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
    questionText: 'What Prominent religious figure died in 2025?',
    answers: ['The Pope', 'The Dalai Lama', 'The Prophet Muhammad', 'Anders'],
    correctAnswer: 'The Pope',
  },
  {
    id: '2',
    questionText: 'How many men did Bonnie Blue take on in her infamous record-breaking fuckfest?',
    answers: ['10 men', '100 men', '1000 men', '10000 men'],
    correctAnswer: '1000 men',
  },
  {
    id: '3',
    questionText: 'According to the Headliner of this years superbowl: Who of these 4 people likes them young, and should never go to cell block 1? (He also likes the a-minor Chord, allegedly)',
    answers: ['Serena Williams', 'Jeffrey Epstein', 'Drake', 'King Frederik the 5th of Denmark'],
    correctAnswer: 'Drake',
  },
  {
    id: '4',
    questionText: 'Which social media platform had the most users in 2025?',
    answers: ['TikTok', 'Instagram', 'Facebook', 'Twitter/X'],
    correctAnswer: 'Facebook',
  },
  {
    id: '5',
    questionText: 'What was the most popular TV show of 2025 according to IMDB?',
    answers: ['The White Lotus', 'Stranger Things', 'The Last of Us', 'Severance'],
    correctAnswer: 'The White Lotus',
  },
  {
    id: '6',
    questionText: 'What happened when Trump and Zelenskyy met in February in front of the world\'s press in the Oval Office?',
    answers: ['Nothing', 'A journalist made Trump burst out laughing', 'The meeting ended in a heated argument', 'Trump gave Zelenskyy a handwritten letter from Putin'],
    correctAnswer: 'The meeting ended in a heated argument',
  },
  {
    id: '7',
    questionText: 'Which popstar traveled to space in 2025?',
    answers: ['Beyonce', 'Katy Perry', 'Ed Sheeran', 'Johnny Deluxe'],
    correctAnswer: 'Katy Perry',
  },
  {
    id: '8',
    questionText: 'Which celebrity had the most Instagram followers in 2025?',
    answers: ['Cristiano Ronaldo', 'Lionel Messi', 'Selena Gomez', 'Kylie Jenner'],
    correctAnswer: 'Cristiano Ronaldo',
  },
  {
    id: '9',
    questionText: 'Why was all air traffic grounded in Kastrup Airport on the 22nd of September?',
    answers: ['The workers went on a strike', 'Sightings of illegal drones', 'A bird was blocking the runway', 'The pilots had coronavirus'],
    correctAnswer: 'Sightings of illegal drones',
  },
  {
    id: '10',
    questionText: 'In October, what was stolen from the famoust art musseum Louvre in Paris?',
    answers: ['Mona Lisa', 'A 3000 year old mummy', 'The Starry Night', 'Jewels'],
    correctAnswer: 'Jewels',
  },
  {
    id: '11',
    questionText: 'Objectively, which Artist has the most bangers?',
    answers: ['The Weeknd', 'Post Malone', 'Bruno Mars', 'LDLD x SLSH'],
    correctAnswer: 'LDLD x SLSH',
  },
];

