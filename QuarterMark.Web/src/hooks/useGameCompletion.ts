import { useEffect, useState, useCallback, useRef } from 'react';
import signalRService from '../services/signalRService';
import { GAME_CONSTANTS, shouldShowDrinkingWheel } from '../utils/gameUtils';

interface GameCompletedData {
  gameType: string;
  currentGameNumber: number;
  accumulatedScores: Record<string, number>;
  players: any[];
}

interface UseGameCompletionOptions {
  connection: any;
  onGameCompleted?: (data: GameCompletedData) => void;
}

export function useGameCompletion({ connection, onGameCompleted }: UseGameCompletionOptions) {
  const [completedGame, setCompletedGame] = useState<{
    gameType: string;
    gameNumber: number;
  } | null>(null);
  
  // Use ref to track if we've explicitly cleared, to ignore stale events
  const isClearedRef = useRef(false);

  useEffect(() => {
    if (!connection) return;

    const handleGameCompleted = (data: GameCompletedData) => {
      // Ignore GameCompleted events if we've cleared the completed game
      // This prevents stale events from being processed after a new game starts
      if (isClearedRef.current) {
        return;
      }

      // Call optional callback first
      if (onGameCompleted) {
        onGameCompleted(data);
      }

      // Always show completion screen first
      // The drinking wheel will be shown after the host clicks "Continue to Next Game"
      setCompletedGame({
        gameType: data.gameType,
        gameNumber: data.currentGameNumber,
      });
    };

    signalRService.on('GameCompleted', handleGameCompleted);

    return () => {
      signalRService.off('GameCompleted', handleGameCompleted);
    };
  }, [connection, onGameCompleted]);

  const clearCompletedGame = useCallback(() => {
    setCompletedGame(null);
    // Set flag to ignore any stale GameCompleted events that might arrive
    isClearedRef.current = true;
    // Reset the flag after a short delay to allow new events
    setTimeout(() => {
      isClearedRef.current = false;
    }, 100);
  }, []);

  return {
    completedGame,
    clearCompletedGame,
  };
}


