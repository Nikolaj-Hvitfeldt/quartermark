import React from 'react';

interface WheelHeaderProps {
  selectedPlayer: string | null;
  isSpinning: boolean;
  subtitle?: string;
}

export function WheelHeader({ selectedPlayer, isSpinning, subtitle }: WheelHeaderProps) {
  const showCongratulations = selectedPlayer !== null && !isSpinning;

  return (
    <>
      {showCongratulations ? (
        <div className="congratulations-container">
          <h2 className="congratulations-title">Congratulations!</h2>
          <p className="wheel-subtitle congratulations-subtitle">
            Enjoy your{' '}
            <img
              src="/images/smirnoff-images/smirnoff-logo.png"
              alt="Smirnoff Ice"
              className="smirnoff-logo-inline"
            />
          </p>
        </div>
      ) : (
        <>
          <h2>
            <span className="emoji">🍺</span> Smirnoff Ice Wheel <span className="emoji">🍺</span>
          </h2>
          <p className="wheel-subtitle">
            {subtitle || (isSpinning ? 'Spinning the wheel...' : 'Waiting for host to spin...')}
          </p>
        </>
      )}
    </>
  );
}

