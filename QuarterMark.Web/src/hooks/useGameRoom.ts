import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import signalRService from '../services/signalRService';
import { playerId, useGameRoomStore } from '../stores/gameRoomStore';
import { PlayerDto } from '../types';

export interface JoinRoomResult {
  success: boolean;
  error: string | null;
  isHost: boolean;
  rejoined: boolean;
}

// Room listeners are attached once per connection object; joining again (e.g. after a
// reconnect) must not stack duplicate handlers.
let roomListenersAttachedTo: unknown = null;

function ensureRoomListeners() {
  const connection = signalRService.getConnection();
  if (!connection || roomListenersAttachedTo === connection) return;
  roomListenersAttachedTo = connection;

  const store = useGameRoomStore.getState;
  signalRService.on('RoomCreated', (code: string) => {
    store().setRoomCode(code);
    store().setIsConnected(true);
  });
  signalRService.on('JoinedRoom', (code: string) => {
    store().setRoomCode(code);
    store().setIsConnected(true);
  });
  signalRService.on('Error', (errorMessage: string) => {
    store().setError(errorMessage);
  });
  signalRService.on('PlayerListUpdated', (playerList: PlayerDto[]) => {
    store().setPlayers(playerList);
  });
}

export function useGameRoom() {
  const {
    connection,
    roomCode,
    players,
    error,
    isConnected,
    playerName,
    isHost,
    setConnection,
    setError,
    setIsConnected,
    setPlayerName,
    setIsHost,
    reset,
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

      setPlayerName(playerName);
      setIsHost(true);
      ensureRoomListeners();

      await signalRService.invoke('CreateRoom', playerName, playerId);
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

      setError('');
      setPlayerName(playerName);
      ensureRoomListeners();

      const result: JoinRoomResult = await signalRService.invoke('JoinRoom', code.toUpperCase(), playerName, playerId);
      if (!result?.success) {
        // Back to the join form, which shows the error sent by the server
        setIsConnected(false);
        return result;
      }
      setIsHost(result.isHost);
      return result;
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
    async (code: string, playerName: string): Promise<JoinRoomResult | undefined> => {
      return await joinRoomMutation.mutateAsync({ code, playerName });
    },
    [joinRoomMutation]
  );

  /**
   * Takes this device's seat back after the connection dropped (screen lock, tab switch).
   * Works for both players and the host; the server matches on the stored player id.
   */
  const rejoinRoom = useCallback(async (): Promise<JoinRoomResult | null> => {
    const { roomCode: code, playerName: name } = useGameRoomStore.getState();
    if (!code || !name) return null;
    ensureRoomListeners();
    const result: JoinRoomResult = await signalRService.invoke('JoinRoom', code, name, playerId);
    if (result && !result.success) {
      // Room gone (server restarted) or seat taken: back to the join/create form, which
      // shows the error the server sent, instead of staying on a dead game screen
      useGameRoomStore.getState().setIsConnected(false);
    }
    return result;
  }, []);

  const connect = useCallback(async () => {
    await connectMutation.mutateAsync();
  }, [connectMutation]);

  const leaveRoom = useCallback(async () => {
    if (connection) {
      // Tell the server this is on purpose; a plain disconnect keeps the seat for a rejoin
      try {
        await signalRService.invoke('LeaveRoom');
      } catch (error) {
        console.error('Error leaving room:', error);
      }
      await signalRService.disconnect();
      setConnection(null);
    }
    reset();
  }, [connection, setConnection, reset]);

  return {
    connection,
    roomCode,
    players,
    error,
    isConnected,
    playerName,
    isHost,
    createRoom,
    joinRoom,
    rejoinRoom,
    connect,
    leaveRoom,
    isLoading: createRoomMutation.isPending || joinRoomMutation.isPending || connectMutation.isPending,
  };
}
