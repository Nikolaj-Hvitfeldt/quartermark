import { create } from 'zustand';
import { WouldILieRoundConfig } from '../data/wouldILieImages';

interface GameSessionState {
  isActive: boolean;
  currentGameNumber: number; // 0 = not started, 1-5 = current game
  accumulatedScores: Record<string, number>;
  showDrinkingWheel: boolean;
  wouldILieConfig: WouldILieRoundConfig[];
  setActive: (active: boolean) => void;
  setCurrentGameNumber: (number: number) => void;
  setAccumulatedScores: (scores: Record<string, number>) => void;
  setShowDrinkingWheel: (show: boolean) => void;
  setWouldILieConfig: (config: WouldILieRoundConfig[]) => void;
  reset: () => void;
}

export const useGameSessionStore = create<GameSessionState>((set) => ({
  isActive: false,
  currentGameNumber: 0,
  accumulatedScores: {},
  showDrinkingWheel: false,
  wouldILieConfig: [],
  setActive: (isActive) => set({ isActive }),
  setCurrentGameNumber: (currentGameNumber) => set({ currentGameNumber }),
  setAccumulatedScores: (accumulatedScores) => set({ accumulatedScores }),
  setShowDrinkingWheel: (showDrinkingWheel) => set({ showDrinkingWheel }),
  setWouldILieConfig: (wouldILieConfig) => set({ wouldILieConfig }),
  reset: () => set({
    isActive: false,
    currentGameNumber: 0,
    accumulatedScores: {},
    showDrinkingWheel: false,
    wouldILieConfig: [],
  }),
}));

