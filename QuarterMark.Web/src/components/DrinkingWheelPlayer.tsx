import { DrinkingWheelPlayerProps } from "../types";
import { PieChartWheel } from "./PieChartWheel";
import { Confetti } from "./Confetti";
import { WheelHeader } from "./WheelHeader";
import { useDrinkingWheel } from "../hooks/useDrinkingWheel";
import "./DrinkingWheel.css";
import "./DrinkingWheelPlayer.css";

function DrinkingWheelPlayer({ players }: DrinkingWheelPlayerProps) {
  const { isSpinning, selectedPlayer } = useDrinkingWheel();
  const nonHostPlayers = players.filter((p) => !p.isHost);
  const showConfetti = selectedPlayer !== null && !isSpinning;

  return (
    <div className="drinking-wheel-player">
      <Confetti active={showConfetti} />
      <div className="wheel-container">
        <WheelHeader selectedPlayer={selectedPlayer} isSpinning={isSpinning} />
        
        {nonHostPlayers.length > 0 ? (
          <PieChartWheel
            players={nonHostPlayers}
            selectedPlayer={selectedPlayer}
            isSpinning={isSpinning}
          />
        ) : (
          <p>No players available</p>
        )}
      </div>
    </div>
  );
}

export default DrinkingWheelPlayer;

