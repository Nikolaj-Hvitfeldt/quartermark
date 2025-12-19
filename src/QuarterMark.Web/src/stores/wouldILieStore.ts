import { create } from 'zustand';
import { CurrentQuestion, ClaimDto, VoteProgress } from '../types';

interface WouldILieState {
  roundActive: boolean;
  currentQuestion: CurrentQuestion | null;
  claims: ClaimDto[];
  voteProgress: VoteProgress;
  roundScores: Record<string, number>;
  answerRevealed: boolean;
  setRoundActive: (active: boolean) => void;
  setCurrentQuestion: (question: CurrentQuestion | null) => void;
  setClaims: (claims: ClaimDto[]) => void;
  setVoteProgress: (progress: VoteProgress) => void;
  setRoundScores: (scores: Record<string, number>) => void;
  setAnswerRevealed: (revealed: boolean) => void;
  reset: () => void;
}

export const useWouldILieStore = create<WouldILieState>((set) => ({
  roundActive: false,
  currentQuestion: null,
  claims: [],
  voteProgress: { total: 0, received: 0 },
  roundScores: {},
  answerRevealed: false,
  setRoundActive: (roundActive) => set({ roundActive }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setClaims: (claims) => set({ claims }),
  setVoteProgress: (voteProgress) => set({ voteProgress }),
  setRoundScores: (roundScores) => set({ roundScores }),
  setAnswerRevealed: (answerRevealed) => set({ answerRevealed }),
  reset: () => set({
    roundActive: false,
    currentQuestion: null,
    claims: [],
    voteProgress: { total: 0, received: 0 },
    roundScores: {},
    answerRevealed: false,
  }),
}));

