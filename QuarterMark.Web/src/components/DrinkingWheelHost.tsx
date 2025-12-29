import { useMutation } from "@tanstack/react-query";
import signalRService from "../services/signalRService";
import { DrinkingWheelHostProps } from "../types";
import { PieChartWheel } from "./PieChartWheel";
import { Confetti } from "./Confetti";
import { WheelHeader } from "./WheelHeader";
import { useDrinkingWheel } from "../hooks/useDrinkingWheel";
import "./DrinkingWheel.css";
import "./DrinkingWheelHost.css";

function DrinkingWheelHost({ players, onSpinComplete }: DrinkingWheelHostProps) {
  const { isSpinning, selectedPlayer } = useDrinkingWheel();

  const spinMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke("SpinDrinkingWheel");
    },
  });

  const handleSpin = async () => {
    await spinMutation.mutateAsync();
  };

  const nonHostPlayers = players.filter((p) => !p.isHost);
  const showConfetti = selectedPlayer !== null && !isSpinning;

  return (
    <div className="drinking-wheel-host">
      <Confetti active={showConfetti} />
      <div className="wheel-container">
        <WheelHeader selectedPlayer={selectedPlayer} isSpinning={isSpinning} subtitle="Time to spin the wheel!" />
        
        {nonHostPlayers.length > 0 ? (
          <PieChartWheel
            players={nonHostPlayers}
            selectedPlayer={selectedPlayer}
            isSpinning={isSpinning}
          />
        ) : (
          <p>No players available to spin for</p>
        )}

        {!selectedPlayer && (
          <button
            className="btn btn-primary btn-large spin-button"
            onClick={handleSpin}
            disabled={isSpinning}
          >
            {isSpinning ? "Spinning..." : "Spin the Wheel!"}
          </button>
        )}

        {selectedPlayer && !isSpinning && (
          <button
            className="btn btn-primary btn-large continue-button"
            onClick={() => onSpinComplete?.()}
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}

export default DrinkingWheelHost;

