import { create } from 'zustand';

interface QuizStore {
  roundActive: boolean;
  currentQuestion: {
    questionText: string;
    imageUrl?: string;
    possibleAnswers: string[];
  } | null;
  guesses: Record<string, string>; // playerName -> selectedAnswer
  roundScores: Record<string, number>;
  answerRevealed: boolean;
  correctAnswer: string;
  hasAnswered: boolean;
  roundState: 'Waiting' | 'ShowingQuestion' | 'Revealed' | 'RoundEnded';
  
  setRoundActive: (active: boolean) => void;
  setCurrentQuestion: (question: { questionText: string; imageUrl?: string; possibleAnswers: string[] } | null) => void;
  setGuesses: (guesses: Record<string, string>) => void;
  setRoundScores: (scores: Record<string, number>) => void;
  setAnswerRevealed: (revealed: boolean) => void;
  setCorrectAnswer: (answer: string) => void;
  setHasAnswered: (answered: boolean) => void;
  setRoundState: (state: 'Waiting' | 'ShowingQuestion' | 'Revealed' | 'RoundEnded') => void;
}

export const useQuizStore = create<QuizStore>((set) => ({
  roundActive: false,
  currentQuestion: null,
  guesses: {},
  roundScores: {},
  answerRevealed: false,
  correctAnswer: '',
  hasAnswered: false,
  roundState: 'Waiting',
  
  setRoundActive: (active) => set({ roundActive: active }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setGuesses: (guesses) => set({ guesses }),
  setRoundScores: (scores) => set({ roundScores: scores }),
  setAnswerRevealed: (revealed) => set({ answerRevealed: revealed }),
  setCorrectAnswer: (answer) => set({ correctAnswer: answer }),
  setHasAnswered: (answered) => set({ hasAnswered: answered }),
  setRoundState: (state) => set({ roundState: state }),
}));

