import { useEffect, useState } from "react";
import signalRService from "../services/signalRService";
import { DrinkingWheelPlayerProps } from "../types";
import "./DrinkingWheelPlayer.css";

function DrinkingWheelPlayer({ playerName, onSpinComplete }: DrinkingWheelPlayerProps) {
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
          <svg viewBox="0 0 100 200" className="bottle-svg">
            {/* Bottle shape */}
            <rect x="30" y="20" width="40" height="150" rx="5" fill="#1a7a3d" stroke="#fff" strokeWidth="2"/>
            <rect x="35" y="25" width="30" height="140" fill="#22c55e" opacity="0.8"/>
            
            {/* Label area */}
            <rect x="38" y="60" width="24" height="80" fill="#dcfce7" opacity="0.9"/>
            <text x="50" y="100" textAnchor="middle" fontSize="8" fill="#1a7a3d" fontWeight="bold">SMIRNOFF</text>
            <text x="50" y="115" textAnchor="middle" fontSize="10" fill="#1a7a3d" fontWeight="bold">ICE</text>
            
            {/* Cap */}
            <circle cx="50" cy="20" r="12" fill="#dc2626" stroke="#fff" strokeWidth="1"/>
            <circle cx="50" cy="20" r="8" fill="#ef4444"/>
            
            {/* Bubbles/decoration */}
            <circle cx="45" y="140" r="2" fill="#fff" opacity="0.6"/>
            <circle cx="55" y="145" r="2" fill="#fff" opacity="0.6"/>
            <circle cx="42" y="150" r="1.5" fill="#fff" opacity="0.5"/>
          </svg>
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

