import { TFunction } from 'i18next';

export interface QuizQuestion {
  id: string;
  questionText: string;
  imageUrl?: string;
  answers: [string, string, string, string]; // Exactly 4 answers
  correctAnswer: string; // Must match one of the answers
}

export function getQuizQuestions(t: TFunction): QuizQuestion[] {
  return [
  {
    id: '1',
    questionText: t('quiz.questions.q1.question'),
    answers: [
      t('quiz.questions.q1.answer1'),
      t('quiz.questions.q1.answer2'),
      t('quiz.questions.q1.answer3'),
      t('quiz.questions.q1.answer4'),
    ],
    correctAnswer: t('quiz.questions.q1.answer1'),
  },
  {
    id: '2',
    questionText: t('quiz.questions.q2.question'),
    answers: [
      t('quiz.questions.q2.answer1'),
      t('quiz.questions.q2.answer2'),
      t('quiz.questions.q2.answer3'),
      t('quiz.questions.q2.answer4'),
    ],
    correctAnswer: t('quiz.questions.q2.answer3'),
  },
  {
    id: '3',
    questionText: t('quiz.questions.q3.question'),
    answers: [
      t('quiz.questions.q3.answer1'),
      t('quiz.questions.q3.answer2'),
      t('quiz.questions.q3.answer3'),
      t('quiz.questions.q3.answer4'),
    ],
    correctAnswer: t('quiz.questions.q3.answer3'),
  },
  {
    id: '4',
    questionText: t('quiz.questions.q4.question'),
    answers: [
      t('quiz.questions.q4.answer1'),
      t('quiz.questions.q4.answer2'),
      t('quiz.questions.q4.answer3'),
      t('quiz.questions.q4.answer4'),
    ],
    correctAnswer: t('quiz.questions.q4.answer3'),
  },
  {
    id: '5',
    questionText: t('quiz.questions.q5.question'),
    answers: [
      t('quiz.questions.q5.answer1'),
      t('quiz.questions.q5.answer2'),
      t('quiz.questions.q5.answer3'),
      t('quiz.questions.q5.answer4'),
    ],
    correctAnswer: t('quiz.questions.q5.answer1'),
  },
  {
    id: '6',
    questionText: t('quiz.questions.q6.question'),
    answers: [
      t('quiz.questions.q6.answer1'),
      t('quiz.questions.q6.answer2'),
      t('quiz.questions.q6.answer3'),
      t('quiz.questions.q6.answer4'),
    ],
    correctAnswer: t('quiz.questions.q6.answer3'),
  },
  {
    id: '7',
    questionText: t('quiz.questions.q7.question'),
    answers: [
      t('quiz.questions.q7.answer1'),
      t('quiz.questions.q7.answer2'),
      t('quiz.questions.q7.answer3'),
      t('quiz.questions.q7.answer4'),
    ],
    correctAnswer: t('quiz.questions.q7.answer2'),
  },
  {
    id: '8',
    questionText: t('quiz.questions.q8.question'),
    answers: [
      t('quiz.questions.q8.answer1'),
      t('quiz.questions.q8.answer2'),
      t('quiz.questions.q8.answer3'),
      t('quiz.questions.q8.answer4'),
    ],
    correctAnswer: t('quiz.questions.q8.answer1'),
  },
  {
    id: '9',
    questionText: t('quiz.questions.q9.question'),
    answers: [
      t('quiz.questions.q9.answer1'),
      t('quiz.questions.q9.answer2'),
      t('quiz.questions.q9.answer3'),
      t('quiz.questions.q9.answer4'),
    ],
    correctAnswer: t('quiz.questions.q9.answer2'),
  },
  {
    id: '10',
    questionText: t('quiz.questions.q10.question'),
    answers: [
      t('quiz.questions.q10.answer1'),
      t('quiz.questions.q10.answer2'),
      t('quiz.questions.q10.answer3'),
      t('quiz.questions.q10.answer4'),
    ],
    correctAnswer: t('quiz.questions.q10.answer4'),
  },
  {
    id: '11',
    questionText: t('quiz.questions.q11.question'),
    answers: [
      t('quiz.questions.q11.answer1'),
      t('quiz.questions.q11.answer2'),
      t('quiz.questions.q11.answer3'),
      t('quiz.questions.q11.answer4'),
    ],
    correctAnswer: t('quiz.questions.q11.answer4'),
  },
];
}

// Legacy constant removed - all components now use getQuizQuestions(t)
