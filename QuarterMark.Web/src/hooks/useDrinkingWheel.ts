import { useState, useEffect, useCallback } from 'react';
import signalRService from '../services/signalRService';

interface UseDrinkingWheelResult {
  isSpinning: boolean;
  selectedPlayer: string | null;
  reset: () => void;
}

export function useDrinkingWheel(): UseDrinkingWheelResult {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // Reset function to clear state when component mounts
  const reset = useCallback(() => {
    setIsSpinning(false);
    setSelectedPlayer(null);
  }, []);

  // Reset state on mount to ensure fresh start
  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    const handleWheelSpinning = () => {
      setIsSpinning(true);
    };

    const handleWheelResult = (data: { selectedPlayer: string }) => {
      setSelectedPlayer(data.selectedPlayer);
      setIsSpinning(false);
    };

    signalRService.on('DrinkingWheelSpinning', handleWheelSpinning);
    signalRService.on('DrinkingWheelResult', handleWheelResult);

    return () => {
      signalRService.off('DrinkingWheelSpinning', handleWheelSpinning);
      signalRService.off('DrinkingWheelResult', handleWheelResult);
    };
  }, []);

  return {
    isSpinning,
    selectedPlayer,
    reset,
  };
}

