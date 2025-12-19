import { create } from 'zustand';
import { ClaimDto } from '../types';

type RoundState = 'Waiting' | 'ShowingImage' | 'ShowingClaims' | 'Voting' | 'Revealed';

interface PlayerGameState {
  roundState: RoundState;
  imageUrl: string;
  story: string;
  claims: ClaimDto[];
  canVote: boolean;
  hasVoted: boolean;
  claimers: string[];
  isRevealed: boolean;
  correctPlayer: string;
  votes: Record<string, string>;
  isClaimer: boolean;
  isAssigned: boolean;
  roundScores: Record<string, number>;
  setRoundState: (state: RoundState) => void;
  setImageUrl: (url: string) => void;
  setStory: (story: string) => void;
  setClaims: (claims: ClaimDto[]) => void;
  setCanVote: (canVote: boolean) => void;
  setHasVoted: (hasVoted: boolean) => void;
  setClaimers: (claimers: string[]) => void;
  setIsRevealed: (revealed: boolean) => void;
  setCorrectPlayer: (player: string) => void;
  setVotes: (votes: Record<string, string>) => void;
  setIsClaimer: (isClaimer: boolean) => void;
  setIsAssigned: (isAssigned: boolean) => void;
  setRoundScores: (scores: Record<string, number>) => void;
  reset: () => void;
}

export const usePlayerGameStore = create<PlayerGameState>((set) => ({
  roundState: 'Waiting',
  imageUrl: '',
  story: '',
  claims: [],
  canVote: false,
  hasVoted: false,
  claimers: [],
  isRevealed: false,
  correctPlayer: '',
  votes: {},
  isClaimer: false,
  isAssigned: false,
  roundScores: {},
  setRoundState: (roundState) => set({ roundState }),
  setImageUrl: (imageUrl) => set({ imageUrl }),
  setStory: (story) => set({ story }),
  setClaims: (claims) => set({ claims }),
  setCanVote: (canVote) => set({ canVote }),
  setHasVoted: (hasVoted) => set({ hasVoted }),
  setIsRevealed: (isRevealed) => set({ isRevealed }),
  setCorrectPlayer: (correctPlayer) => set({ correctPlayer }),
  setVotes: (votes) => set({ votes }),
  setIsClaimer: (isClaimer) => set({ isClaimer }),
  setIsAssigned: (isAssigned) => set({ isAssigned }),
  setRoundScores: (roundScores) => set({ roundScores }),
  setClaimers: (claimers) => set({ claimers }),
  reset: () => set({
    roundState: 'Waiting',
    imageUrl: '',
    story: '',
    claims: [],
    canVote: false,
    hasVoted: false,
    claimers: [],
    isRevealed: false,
    correctPlayer: '',
    votes: {},
    isClaimer: false,
    isAssigned: false,
    roundScores: {},
  }),
}));

