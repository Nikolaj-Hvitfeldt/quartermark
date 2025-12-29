import { useState, useEffect } from 'react';
import signalRService from '../services/signalRService';

interface UseDrinkingWheelResult {
  isSpinning: boolean;
  selectedPlayer: string | null;
}

export function useDrinkingWheel(): UseDrinkingWheelResult {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

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
  };
}

