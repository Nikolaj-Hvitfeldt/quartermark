import { create } from 'zustand';
import { PlayerDto } from '../types';

interface GameRoomState {
  connection: any | null;
  roomCode: string;
  players: PlayerDto[];
  error: string;
  isConnected: boolean;
  playerName: string;
  isHost: boolean;
  setConnection: (connection: any | null) => void;
  setRoomCode: (code: string) => void;
  setPlayers: (players: PlayerDto[]) => void;
  setError: (error: string) => void;
  setIsConnected: (connected: boolean) => void;
  setPlayerName: (name: string) => void;
  setIsHost: (isHost: boolean) => void;
  reset: () => void;
}

const STORAGE_KEY = 'quartermark-room-state';

// Load from localStorage on initialization
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        roomCode: parsed.roomCode || '',
        playerName: parsed.playerName || '',
        isHost: parsed.isHost || false,
      };
    }
  } catch (e) {
    console.error('Failed to load room state from localStorage', e);
  }
  return {
    roomCode: '',
    playerName: '',
    isHost: false,
  };
};

const saveToStorage = (roomCode: string, playerName: string, isHost: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ roomCode, playerName, isHost }));
  } catch (e) {
    console.error('Failed to save room state to localStorage', e);
  }
};

const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear room state from localStorage', e);
  }
};

const initialState = loadFromStorage();

export const useGameRoomStore = create<GameRoomState>((set) => ({
  connection: null,
  roomCode: initialState.roomCode,
  players: [],
  error: '',
  isConnected: false,
  playerName: initialState.playerName,
  isHost: initialState.isHost,
  setConnection: (connection) => set({ connection }),
  setRoomCode: (roomCode) => {
    set({ roomCode });
    const state = useGameRoomStore.getState();
    saveToStorage(roomCode, state.playerName, state.isHost);
  },
  setPlayers: (players) => set({ players }),
  setError: (error) => set({ error }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setPlayerName: (playerName) => {
    set({ playerName });
    const state = useGameRoomStore.getState();
    saveToStorage(state.roomCode, playerName, state.isHost);
  },
  setIsHost: (isHost) => {
    set({ isHost });
    const state = useGameRoomStore.getState();
    saveToStorage(state.roomCode, state.playerName, isHost);
  },
  reset: () => {
    clearStorage();
    set({
      connection: null,
      roomCode: '',
      players: [],
      error: '',
      isConnected: false,
      playerName: '',
      isHost: false,
    });
  },
}));

