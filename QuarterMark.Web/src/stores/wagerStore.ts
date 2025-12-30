import { create } from 'zustand';

type RoundState = 'Waiting' | 'Wagering' | 'Answering' | 'Revealed';

interface WagerState {
  // Host state
  roundActive: boolean;
  currentQuestion: {
    questionText: string;
    possibleAnswers: string[];
  } | null;
  wagers: Record<string, number>; // playerName -> wagerAmount
  guesses: Record<string, string>; // playerName -> selectedAnswer
  roundScores: Record<string, number>; // playerName -> net winnings/losses
  answerRevealed: boolean;
  correctAnswer: string;
  
  // Player state
  roundState: RoundState;
  hasWagered: boolean;
  hasAnswered: boolean;
  playerWager: number;
  
  // Host setters
  setRoundActive: (active: boolean) => void;
  setCurrentQuestion: (question: { questionText: string; possibleAnswers: string[] } | null) => void;
  setWagers: (wagers: Record<string, number>) => void;
  setGuesses: (guesses: Record<string, string>) => void;
  setRoundScores: (scores: Record<string, number>) => void;
  setAnswerRevealed: (revealed: boolean) => void;
  setCorrectAnswer: (answer: string) => void;
  
  // Player setters
  setRoundState: (state: RoundState) => void;
  setHasWagered: (hasWagered: boolean) => void;
  setHasAnswered: (hasAnswered: boolean) => void;
  setPlayerWager: (wager: number) => void;
  
  reset: () => void;
}

export const useWagerStore = create<WagerState>((set) => ({
  // Host state
  roundActive: false,
  currentQuestion: null,
  wagers: {},
  guesses: {},
  roundScores: {},
  answerRevealed: false,
  correctAnswer: '',
  
  // Player state
  roundState: 'Waiting',
  hasWagered: false,
  hasAnswered: false,
  playerWager: 0,

  // Host setters
  setRoundActive: (roundActive) => set({ roundActive }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setWagers: (wagers) => set({ wagers }),
  setGuesses: (guesses) => set({ guesses }),
  setRoundScores: (roundScores) => set({ roundScores }),
  setAnswerRevealed: (answerRevealed) => set({ answerRevealed }),
  setCorrectAnswer: (correctAnswer) => set({ correctAnswer }),
  
  // Player setters
  setRoundState: (roundState) => set({ roundState }),
  setHasWagered: (hasWagered) => set({ hasWagered }),
  setHasAnswered: (hasAnswered) => set({ hasAnswered }),
  setPlayerWager: (playerWager) => set({ playerWager }),
  
  reset: () => set({
    roundActive: false,
    currentQuestion: null,
    wagers: {},
    guesses: {},
    roundScores: {},
    answerRevealed: false,
    correctAnswer: '',
    roundState: 'Waiting',
    hasWagered: false,
    hasAnswered: false,
    playerWager: 0,
  }),
}));

