import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import signalRService from "../services/signalRService";
import { DrinkingWheelHostProps } from "../types";
import { BottleSvg } from "./BottleSvg";
import "./DrinkingWheel.css";
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
          <BottleSvg className="bottle-svg" />
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

