import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameRoom } from './hooks/useGameRoom'
import HostScreen from './components/HostScreen'
import PlayerScreen from './components/PlayerScreen'
import LanguageSwitcher from './components/LanguageSwitcher'
import DevHarness from './dev/DevHarness'
import { isDevHarness, devHostName, devRoomCode } from './dev/devMode'
import './App.css'

function App() {
  // Dev-only: /?dev renders host + players side by side in one window
  if (isDevHarness) {
    return <DevHarness />
  }
  return <GameApp />
}

function GameApp() {
  const { t } = useTranslation()
  const [screen, setScreen] = useState<'home' | 'host' | 'player'>(
    devHostName ? 'host' : devRoomCode ? 'player' : 'home'
  )
  const { leaveRoom, roomCode, isHost } = useGameRoom()

  // Restore screen from localStorage on mount
  useEffect(() => {
    if (roomCode) {
      setScreen(isHost ? 'host' : 'player')
    }
  }, [roomCode, isHost])

  const handleBackToHome = async () => {
    await leaveRoom()
    setScreen('home')
  }

  return (
    <div className="app">
      <LanguageSwitcher />
      {screen === 'home' && (
        <div className="home-screen">
          {/* Floating decorations */}
          <span className="floating-decoration">🥂</span>
          <span className="floating-decoration">✨</span>
          <span className="floating-decoration">🎆</span>
          <span className="floating-decoration">🍾</span>
          <span className="floating-decoration">⭐</span>
          <span className="floating-decoration">🎉</span>
          
          {/* Confetti pieces */}
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          
          <p className="home-subtitle">{t('app.welcome', 'Welcome to')}</p>
          <h1>QuarterMark</h1>
          <p className="home-year">2025</p>
          
          <div className="home-buttons">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => setScreen('host')}
            >
              🎮 {t('app.createGame', 'Create Game')}
            </button>
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => setScreen('player')}
            >
              🎯 {t('app.joinGame', 'Join Game')}
            </button>
          </div>
        </div>
      )}
      
      {screen === 'host' && (
        <HostScreen 
          onBack={handleBackToHome}
        />
      )}
      
      {screen === 'player' && (
        <PlayerScreen 
          onBack={handleBackToHome}
        />
      )}
    </div>
  )
}

export default App

