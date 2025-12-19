import { create } from 'zustand';

interface PlayerState {
  playerName: string;
  roomCodeInput: string;
  inGame: boolean;
  setPlayerName: (name: string) => void;
  setRoomCodeInput: (code: string) => void;
  setInGame: (inGame: boolean) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  playerName: '',
  roomCodeInput: '',
  inGame: false,
  setPlayerName: (playerName) => set({ playerName }),
  setRoomCodeInput: (roomCodeInput) => set({ roomCodeInput }),
  setInGame: (inGame) => set({ inGame }),
  reset: () => set({
    playerName: '',
    roomCodeInput: '',
    inGame: false,
  }),
}));

