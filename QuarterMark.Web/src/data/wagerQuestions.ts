import { TFunction } from 'i18next';

export interface WagerQuestion {
  id: string;
  questionText: string;
  answers: [string, string, string, string]; // Exactly 4 answers
  correctAnswer: string; // Must match one of the answers
}

export function getWagerQuestions(t: TFunction): WagerQuestion[] {
  return [
    {
      id: 'wager1',
      questionText: t('wager.questions.q1.question'),
      answers: [
        t('wager.questions.q1.answer1'),
        t('wager.questions.q1.answer2'),
        t('wager.questions.q1.answer3'),
        t('wager.questions.q1.answer4'),
      ],
      correctAnswer: t('wager.questions.q1.answer3'),
    },
    {
      id: 'wager2',
      questionText: t('wager.questions.q2.question'),
      answers: [
        t('wager.questions.q2.answer1'),
        t('wager.questions.q2.answer2'),
        t('wager.questions.q2.answer3'),
        t('wager.questions.q2.answer4'),
      ],
      correctAnswer: t('wager.questions.q2.answer4'),
    },
    {
      id: 'wager3',
      questionText: t('wager.questions.q3.question'),
      answers: [
        t('wager.questions.q3.answer1'),
        t('wager.questions.q3.answer2'),
        t('wager.questions.q3.answer3'),
        t('wager.questions.q3.answer4'),
      ],
      correctAnswer: t('wager.questions.q3.answer3'),
    },
  ];
}

// Legacy constant removed - all components now use getWagerQuestions(t)

