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
        <>
          <h2>Congratulations!</h2>
          <p className="wheel-subtitle">
            Enjoy your{' '}
            <img
              src="/images/smirnoff-logo.png"
              alt="Smirnoff Ice"
              className="smirnoff-logo-inline"
            />
          </p>
        </>
      ) : (
        <>
          <h2>🍺 Smirnoff Ice Wheel 🍺</h2>
          <p className="wheel-subtitle">
            {subtitle || (isSpinning ? 'Spinning the wheel...' : 'Waiting for host to spin...')}
          </p>
        </>
      )}
    </>
  );
}

