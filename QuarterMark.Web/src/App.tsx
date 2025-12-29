import { useState } from 'react'
import HostScreen from './components/HostScreen'
import PlayerScreen from './components/PlayerScreen'
import './App.css'

function App() {
  const [screen, setScreen] = useState<'home' | 'host' | 'player'>('home')

  return (
    <div className="app">
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
          
          <p className="home-subtitle">Welcome to</p>
          <h1>QuarterMark</h1>
          <p className="home-year">2025</p>
          
          <div className="home-buttons">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => setScreen('host')}
            >
              🎮 Create Game
            </button>
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => setScreen('player')}
            >
              🎯 Join Game
            </button>
          </div>
        </div>
      )}
      
      {screen === 'host' && (
        <HostScreen 
          onBack={() => setScreen('home')}
        />
      )}
      
      {screen === 'player' && (
        <PlayerScreen 
          onBack={() => setScreen('home')}
        />
      )}
    </div>
  )
}

export default App

