import { create } from 'zustand';

type RoundState = 'Waiting' | 'ShowingImage' | 'Revealed';

interface SocialMediaGuessState {
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
  revealImageUrl: string | null; // Uncensored image shown after the reveal, if the question has one
  
  // Player state
  roundState: RoundState;
  hasGuessed: boolean;

  // Host setters
  setRoundActive: (active: boolean) => void;
  setCurrentQuestion: (question: { imageUrl: string; possibleAnswers: string[] } | null) => void;
  setGuesses: (guesses: Record<string, string>) => void;
  setRoundScores: (scores: Record<string, number>) => void;
  setAnswerRevealed: (revealed: boolean) => void;
  setCorrectAnswer: (answer: string) => void;
  setRevealImageUrl: (url: string | null) => void;
  
  // Player setters
  setRoundState: (state: RoundState) => void;
  setHasGuessed: (hasGuessed: boolean) => void;
  
  reset: () => void;
}

export const useSocialMediaGuessStore = create<SocialMediaGuessState>((set) => ({
  // Host state
  roundActive: false,
  currentQuestion: null,
  guesses: {},
  roundScores: {},
  answerRevealed: false,
  correctAnswer: '',
  revealImageUrl: null,
  
  // Player state
  roundState: 'Waiting',
  hasGuessed: false,

  // Host setters
  setRoundActive: (roundActive) => set({ roundActive }),
  // A new question always starts on its censored image
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion, revealImageUrl: null }),
  setGuesses: (guesses) => set({ guesses }),
  setRoundScores: (roundScores) => set({ roundScores }),
  setAnswerRevealed: (answerRevealed) => set({ answerRevealed }),
  setCorrectAnswer: (correctAnswer) => set({ correctAnswer }),
  setRevealImageUrl: (revealImageUrl) => set({ revealImageUrl }),
  
  // Player setters
  setRoundState: (roundState) => set({ roundState }),
  setHasGuessed: (hasGuessed) => set({ hasGuessed }),
  
  reset: () => set({
    roundActive: false,
    currentQuestion: null,
    guesses: {},
    roundScores: {},
    answerRevealed: false,
    correctAnswer: '',
    revealImageUrl: null,
    roundState: 'Waiting',
    hasGuessed: false,
  }),
}));

