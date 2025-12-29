import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import signalRService from '../services/signalRService';
import { useGameRoomStore } from '../stores/gameRoomStore';
import { PlayerDto } from '../types';

export function useGameRoom() {
  const {
    connection,
    roomCode,
    players,
    error,
    isConnected,
    setConnection,
    setRoomCode,
    setPlayers,
    setError,
    setIsConnected,
  } = useGameRoomStore();

  const connectMutation = useMutation({
    mutationFn: async () => {
      const conn = await signalRService.connect();
      setConnection(conn);
      setIsConnected(true);
      return conn;
    },
    onError: (error) => {
      console.error('Failed to connect:', error);
      setError('Failed to connect to server');
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async (playerName: string) => {
      if (!connection) {
        await connectMutation.mutateAsync();
      }

      // Set up listeners
      signalRService.on('RoomCreated', (code: string) => {
        setRoomCode(code);
      });

      signalRService.on('PlayerListUpdated', (playerList: PlayerDto[]) => {
        setPlayers(playerList);
      });

      await signalRService.invoke('CreateRoom', playerName);
    },
    onError: (error) => {
      console.error('Error creating room:', error);
      setError('Failed to create room');
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async ({ code, playerName }: { code: string; playerName: string }) => {
      if (!connection) {
        await connectMutation.mutateAsync();
      }

      // Set up listeners
      signalRService.on('JoinedRoom', (code: string) => {
        setRoomCode(code);
        setIsConnected(true);
      });

      signalRService.on('Error', (errorMessage: string) => {
        setError(errorMessage);
      });

      signalRService.on('PlayerListUpdated', (playerList: PlayerDto[]) => {
        setPlayers(playerList);
      });

      await signalRService.invoke('JoinRoom', code.toUpperCase(), playerName);
    },
    onError: (error) => {
      console.error('Error joining room:', error);
      setError('Failed to join room');
    },
  });

  const createRoom = useCallback(
    async (playerName: string) => {
      await createRoomMutation.mutateAsync(playerName);
    },
    [createRoomMutation]
  );

  const joinRoom = useCallback(
    async (code: string, playerName: string) => {
      await joinRoomMutation.mutateAsync({ code, playerName });
    },
    [joinRoomMutation]
  );

  const connect = useCallback(async () => {
    await connectMutation.mutateAsync();
  }, [connectMutation]);

  return {
    connection,
    roomCode,
    players,
    error,
    isConnected,
    createRoom,
    joinRoom,
    connect,
    isLoading: createRoomMutation.isPending || joinRoomMutation.isPending || connectMutation.isPending,
  };
}
