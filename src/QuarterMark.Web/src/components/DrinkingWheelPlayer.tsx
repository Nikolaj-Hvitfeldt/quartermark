import { useEffect, useState } from "react";
import signalRService from "../services/signalRService";
import { DrinkingWheelPlayerProps } from "../types";
import { BottleSvg } from "./BottleSvg";
import "./DrinkingWheel.css";
import "./DrinkingWheelPlayer.css";

function DrinkingWheelPlayer({ playerName }: DrinkingWheelPlayerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    const handleWheelResult = (data: { selectedPlayer: string }) => {
      setSelectedPlayer(data.selectedPlayer);
      setIsSpinning(false);
    };

    signalRService.on("DrinkingWheelResult", handleWheelResult);

    return () => {
      signalRService.off("DrinkingWheelResult", handleWheelResult);
    };
  }, []);

  useEffect(() => {
    // Start spinning when component mounts
    setIsSpinning(true);
  }, []);

  return (
    <div className="drinking-wheel-player">
      <div className="wheel-container">
        <h2>🍺 Smirnoff Ice Wheel 🍺</h2>
        <p className="wheel-subtitle">Spinning the wheel...</p>
        
        <div className={`bottle-wheel ${isSpinning ? "spinning" : ""}`}>
          <BottleSvg className="bottle-svg" />
        </div>

        {selectedPlayer && !isSpinning && (
          <div className="selected-player">
            <h3>
              {selectedPlayer === playerName 
                ? "🎉 You must drink! 🎉" 
                : `🎉 ${selectedPlayer} must drink! 🎉`}
            </h3>
            <p className="drink-message">Cheers! 🍻</p>
          </div>
        )}

        {!selectedPlayer && (
          <p className="waiting-message">Waiting for host to spin...</p>
        )}
      </div>
    </div>
  );
}

export default DrinkingWheelPlayer;

