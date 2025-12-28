import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import signalRService from "../services/signalRService";
import { DrinkingWheelHostProps } from "../types";
import "./DrinkingWheelHost.css";

function DrinkingWheelHost({ players, onSpinComplete }: DrinkingWheelHostProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const spinMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke("SpinDrinkingWheel");
    },
  });

  useEffect(() => {
    const handleWheelResult = (data: { selectedPlayer: string }) => {
      setSelectedPlayer(data.selectedPlayer);
      setIsSpinning(false);
      
      // Notify parent after a delay
      setTimeout(() => {
        if (onSpinComplete) {
          onSpinComplete();
        }
      }, 3000);
    };

    signalRService.on("DrinkingWheelResult", handleWheelResult);

    return () => {
      signalRService.off("DrinkingWheelResult", handleWheelResult);
    };
  }, [onSpinComplete]);

  const handleSpin = async () => {
    setIsSpinning(true);
    setSelectedPlayer(null);
    await spinMutation.mutateAsync();
  };

  const nonHostPlayers = players.filter((p) => !p.isHost);

  return (
    <div className="drinking-wheel-host">
      <div className="wheel-container">
        <h2>🍺 Smirnoff Ice Wheel 🍺</h2>
        <p className="wheel-subtitle">Time to spin the wheel!</p>
        
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
            <h3>🎉 {selectedPlayer} must drink! 🎉</h3>
            <p className="drink-message">Cheers! 🍻</p>
          </div>
        )}

        <button
          className="btn btn-primary btn-large spin-button"
          onClick={handleSpin}
          disabled={isSpinning}
        >
          {isSpinning ? "Spinning..." : "Spin the Wheel!"}
        </button>

        <div className="player-list-wheel">
          <h4>Players in the running:</h4>
          <div className="players-grid">
            {nonHostPlayers.map((player, index) => (
              <div
                key={index}
                className={`player-chip ${selectedPlayer === player.name ? "selected" : ""}`}
              >
                {player.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrinkingWheelHost;

