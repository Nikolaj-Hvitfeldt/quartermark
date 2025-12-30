import { useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import signalRService from '../services/signalRService';
import { useGameSessionStore } from '../stores/gameSessionStore';
import { WouldILieRoundConfig } from '../data/wouldILieImages';

interface GameCompletedData {
  gameType: string;
  currentGameNumber: number;
  accumulatedScores: Record<string, number>;
  players: any[];
}

export function useGameSession(connection: any) {
  const {
    isActive,
    currentGameNumber,
    accumulatedScores,
    showDrinkingWheel,
    wouldILieConfig,
    setActive,
    setCurrentGameNumber,
    setAccumulatedScores,
    setShowDrinkingWheel,
    setWouldILieConfig,
  } = useGameSessionStore();

  useEffect(() => {
    if (!connection) return;

    const handleSessionStarted = () => {
      setActive(true);
      setCurrentGameNumber(0);
      setAccumulatedScores({});
    };

    const handleGameCompleted = (data: GameCompletedData) => {
      setCurrentGameNumber(data.currentGameNumber);
      setAccumulatedScores(data.accumulatedScores);
    };

    const handleShowDrinkingWheel = () => {
      setShowDrinkingWheel(true);
    };

    signalRService.on('GameSessionStarted', handleSessionStarted);
    signalRService.on('GameCompleted', handleGameCompleted);
    signalRService.on('ShowDrinkingWheel', handleShowDrinkingWheel);

    return () => {
      signalRService.off('GameSessionStarted', handleSessionStarted);
      signalRService.off('GameCompleted', handleGameCompleted);
      signalRService.off('ShowDrinkingWheel', handleShowDrinkingWheel);
    };
  }, [connection, setActive, setCurrentGameNumber, setAccumulatedScores, setShowDrinkingWheel]);

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('StartGameSession');
    },
  });

  const completeGameMutation = useMutation({
    mutationFn: async ({ gameType, gameScores }: { gameType: string; gameScores: Record<string, number> }) => {
      await signalRService.invoke('CompleteGame', gameType, gameScores);
    },
  });

  const startSession = useCallback(async () => {
    await startSessionMutation.mutateAsync();
  }, [startSessionMutation]);

  const completeGame = useCallback(
    async (gameType: string, gameScores: Record<string, number>) => {
      await completeGameMutation.mutateAsync({ gameType, gameScores });
    },
    [completeGameMutation]
  );

  return {
    isActive,
    currentGameNumber,
    accumulatedScores,
    showDrinkingWheel,
    wouldILieConfig,
    setShowDrinkingWheel,
    setWouldILieConfig,
    startSession,
    completeGame,
    isLoading: startSessionMutation.isPending || completeGameMutation.isPending,
  };
}

