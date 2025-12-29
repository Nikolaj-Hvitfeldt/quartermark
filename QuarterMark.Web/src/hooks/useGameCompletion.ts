import { useEffect, useState, useCallback } from 'react';
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

  useEffect(() => {
    if (!connection) return;

    const handleGameCompleted = (data: GameCompletedData) => {
      // Call optional callback first
      if (onGameCompleted) {
        onGameCompleted(data);
      }

      // Handle completion screen display timing
      if (shouldShowDrinkingWheel(data.currentGameNumber)) {
        // Drinking wheel will be shown, store completion data for later
        setTimeout(() => {
          setCompletedGame({
            gameType: data.gameType,
            gameNumber: data.currentGameNumber,
          });
        }, GAME_CONSTANTS.COMPLETION_SCREEN_DELAY_AFTER_WHEEL);
      } else {
        // Show completion screen immediately
        setCompletedGame({
          gameType: data.gameType,
          gameNumber: data.currentGameNumber,
        });
      }
    };

    signalRService.on('GameCompleted', handleGameCompleted);

    return () => {
      signalRService.off('GameCompleted', handleGameCompleted);
    };
  }, [connection, onGameCompleted]);

  const clearCompletedGame = useCallback(() => {
    setCompletedGame(null);
  }, []);

  return {
    completedGame,
    clearCompletedGame,
  };
}


