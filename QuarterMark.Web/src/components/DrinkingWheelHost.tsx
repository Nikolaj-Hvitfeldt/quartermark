import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import signalRService from "../services/signalRService";
import { DrinkingWheelHostProps } from "../types";
import { PieChartWheel } from "./PieChartWheel";
import { Confetti } from "./Confetti";
import { WheelHeader } from "./WheelHeader";
import { FloatingBottles } from "./FloatingBottles";
import { useDrinkingWheel } from "../hooks/useDrinkingWheel";
import "./DrinkingWheel.css";
import "./DrinkingWheelHost.css";

function DrinkingWheelHost({ players, onSpinComplete, onBack }: DrinkingWheelHostProps) {
  const { t } = useTranslation();
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
      {onBack && (
        <button className="btn btn-back wheel-back-button" onClick={onBack}>
          ← {t("common.back", "Back")}
        </button>
      )}
      <FloatingBottles />
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
          <div className="wheel-result-actions">
            {/* In case the bottle stops somewhere the room disagrees about */}
            <button
              className="btn btn-secondary btn-large spin-again-button"
              onClick={handleSpin}
              disabled={spinMutation.isPending}
            >
              ↻ {t("drinkingWheel.spinAgain", "Spin again")}
            </button>
            <button
              className="btn btn-primary btn-large continue-button"
              onClick={() => onSpinComplete?.()}
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DrinkingWheelHost;
