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
          <h1>QuarterMark</h1>
          <div className="home-buttons">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => setScreen('host')}
            >
              Create Game (Host)
            </button>
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => setScreen('player')}
            >
              Join Game (Player)
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

