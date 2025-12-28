import { create } from 'zustand';

interface GameSessionState {
  isActive: boolean;
  currentGameNumber: number; // 0 = not started, 1-5 = current game
  accumulatedScores: Record<string, number>;
  showDrinkingWheel: boolean;
  setActive: (active: boolean) => void;
  setCurrentGameNumber: (number: number) => void;
  setAccumulatedScores: (scores: Record<string, number>) => void;
  setShowDrinkingWheel: (show: boolean) => void;
  reset: () => void;
}

export const useGameSessionStore = create<GameSessionState>((set) => ({
  isActive: false,
  currentGameNumber: 0,
  accumulatedScores: {},
  showDrinkingWheel: false,
  setActive: (isActive) => set({ isActive }),
  setCurrentGameNumber: (currentGameNumber) => set({ currentGameNumber }),
  setAccumulatedScores: (accumulatedScores) => set({ accumulatedScores }),
  setShowDrinkingWheel: (showDrinkingWheel) => set({ showDrinkingWheel }),
  reset: () => set({
    isActive: false,
    currentGameNumber: 0,
    accumulatedScores: {},
    showDrinkingWheel: false,
  }),
}));

