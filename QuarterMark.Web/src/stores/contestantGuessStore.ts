import { create } from 'zustand';

type RoundState = 'Waiting' | 'ShowingImage' | 'Revealed';

interface ContestantGuessState {
  // Host state
  roundActive: boolean;
  currentQuestion: {
    imageUrl: string;
    possibleAnswers: string[];
  } | null;
  guesses: Record<string, string>; // playerName -> guessedContestantName
  roundScores: Record<string, number>;
  answerRevealed: boolean;
  correctAnswer: string;
  
  // Player state
  roundState: RoundState;
  imageUrl: string;
  possibleAnswers: string[];
  hasGuessed: boolean;

  // Host setters
  setRoundActive: (active: boolean) => void;
  setCurrentQuestion: (question: { imageUrl: string; possibleAnswers: string[] } | null) => void;
  setGuesses: (guesses: Record<string, string>) => void;
  setRoundScores: (scores: Record<string, number>) => void;
  setAnswerRevealed: (revealed: boolean) => void;
  setCorrectAnswer: (answer: string) => void;
  
  // Player setters
  setRoundState: (state: RoundState) => void;
  setImageUrl: (url: string) => void;
  setPossibleAnswers: (answers: string[]) => void;
  setHasGuessed: (hasGuessed: boolean) => void;
  
  reset: () => void;
}

export const useContestantGuessStore = create<ContestantGuessState>((set) => ({
  // Host state
  roundActive: false,
  currentQuestion: null,
  guesses: {},
  roundScores: {},
  answerRevealed: false,
  correctAnswer: '',
  
  // Player state
  roundState: 'Waiting',
  imageUrl: '',
  possibleAnswers: [],
  hasGuessed: false,

  // Host setters
  setRoundActive: (roundActive) => set({ roundActive }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setGuesses: (guesses) => set({ guesses }),
  setRoundScores: (roundScores) => set({ roundScores }),
  setAnswerRevealed: (answerRevealed) => set({ answerRevealed }),
  setCorrectAnswer: (correctAnswer) => set({ correctAnswer }),
  
  // Player setters
  setRoundState: (roundState) => set({ roundState }),
  setImageUrl: (imageUrl) => set({ imageUrl }),
  setPossibleAnswers: (possibleAnswers) => set({ possibleAnswers }),
  setHasGuessed: (hasGuessed) => set({ hasGuessed }),
  
  reset: () => set({
    roundActive: false,
    currentQuestion: null,
    guesses: {},
    roundScores: {},
    answerRevealed: false,
    correctAnswer: '',
    roundState: 'Waiting',
    imageUrl: '',
    possibleAnswers: [],
    hasGuessed: false,
  }),
}));

