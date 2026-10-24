import { useTranslation } from 'react-i18next';

interface WheelHeaderProps {
  selectedPlayer: string | null;
  isSpinning: boolean;
  subtitle?: string;
}

export function WheelHeader({ selectedPlayer, isSpinning, subtitle }: WheelHeaderProps) {
  const { t } = useTranslation();
  const showCongratulations = selectedPlayer !== null && !isSpinning;

  return (
    <>
      {showCongratulations ? (
        <div className="congratulations-container">
          <h2 className="congratulations-title">{t('drinkingWheel.congratulations')}</h2>
          <p className="wheel-subtitle congratulations-subtitle">
            {t('drinkingWheel.enjoyYour')}{' '}
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
            <span className="emoji">🍺</span> {t('drinkingWheel.title')} <span className="emoji">🍺</span>
          </h2>
          <p className="wheel-subtitle">
            {subtitle || (isSpinning ? t('drinkingWheel.spinningTheWheel') : t('drinkingWheel.waitingForSpin'))}
          </p>
        </>
      )}
    </>
  );
}

