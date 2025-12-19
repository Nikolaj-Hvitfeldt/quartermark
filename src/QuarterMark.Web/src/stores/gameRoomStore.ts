import { create } from 'zustand';
import { PlayerDto } from '../types';

interface GameRoomState {
  connection: any | null;
  roomCode: string;
  players: PlayerDto[];
  error: string;
  isConnected: boolean;
  setConnection: (connection: any | null) => void;
  setRoomCode: (code: string) => void;
  setPlayers: (players: PlayerDto[]) => void;
  setError: (error: string) => void;
  setIsConnected: (connected: boolean) => void;
  reset: () => void;
}

export const useGameRoomStore = create<GameRoomState>((set) => ({
  connection: null,
  roomCode: '',
  players: [],
  error: '',
  isConnected: false,
  setConnection: (connection) => set({ connection }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setPlayers: (players) => set({ players }),
  setError: (error) => set({ error }),
  setIsConnected: (isConnected) => set({ isConnected }),
  reset: () => set({
    connection: null,
    roomCode: '',
    players: [],
    error: '',
    isConnected: false,
  }),
}));

