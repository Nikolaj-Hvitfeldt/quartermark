import { useEffect, useState } from 'react';
import { useGameRoom } from '../hooks/useGameRoom';
import { usePlayerStore } from '../stores/playerStore';
import { useGameSession } from '../hooks/useGameSession';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { GAME_CONSTANTS } from '../utils/gameUtils';
import signalRService from '../services/signalRService';
import WouldILiePlayer from './WouldILiePlayer';
import ContestantGuessPlayer from './ContestantGuessPlayer';
import DrinkingWheelPlayer from './DrinkingWheelPlayer';
import GameCompletionScreenPlayer from './GameCompletionScreenPlayer';
import { PlayerScreenProps } from '../types';
import './PlayerScreen.css';

function PlayerScreen({ onBack }: PlayerScreenProps) {
  const { connection, roomCode, players, error, isConnected, joinRoom } = useGameRoom();
  const { playerName, roomCodeInput, setPlayerName, setRoomCodeInput } = usePlayerStore();
  const { currentGameNumber, accumulatedScores } = useGameSession(connection);
  const { completedGame, clearCompletedGame } = useGameCompletion({
    connection,
    onGameCompleted: () => {
      setCurrentGame(null);
    },
  });
  const [currentGame, setCurrentGame] = useState<string | null>(null); // null, "wouldILie", "contestantGuess", or "drinkingWheel"

  useEffect(() => {
    if (!connection) return;

    const handleWouldILieRoundStarted = () => {
      setCurrentGame("wouldILie");
      clearCompletedGame();
    };

    const handleContestantGuessRoundStarted = () => {
      setCurrentGame("contestantGuess");
      clearCompletedGame();
    };

    const handleShowDrinkingWheel = () => {
      setCurrentGame("drinkingWheel");
      clearCompletedGame();
    };

    signalRService.on('WouldILieRoundStarted', handleWouldILieRoundStarted);
    signalRService.on('ContestantGuessRoundStarted', handleContestantGuessRoundStarted);
    signalRService.on('ShowDrinkingWheel', handleShowDrinkingWheel);

    return () => {
      signalRService.off('WouldILieRoundStarted', handleWouldILieRoundStarted);
      signalRService.off('ContestantGuessRoundStarted', handleContestantGuessRoundStarted);
      signalRService.off('ShowDrinkingWheel', handleShowDrinkingWheel);
    };
  }, [connection]);

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim() || !playerName.trim()) {
      return;
    }

    try {
      await joinRoom(roomCodeInput, playerName);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="player-screen">
      <button className="btn btn-back" onClick={onBack}>
        ← Back
      </button>

      {!isConnected ? (
        <div className="player-join">
          <h2>Join Game</h2>
          <input
            type="text"
            placeholder="Enter room code"
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
            className="input"
            maxLength={4}
            style={{ textTransform: 'uppercase', letterSpacing: '0.5rem', textAlign: 'center' }}
          />
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input"
            maxLength={20}
          />
          {error && <div className="error-message">{error}</div>}
          <button 
            className="btn btn-primary btn-large"
            onClick={handleJoinRoom}
          >
            Join Room
          </button>
        </div>
      ) : completedGame ? (
        <GameCompletionScreenPlayer
          gameType={completedGame.gameType}
          gameNumber={completedGame.gameNumber}
          totalGames={GAME_CONSTANTS.TOTAL_GAMES}
          players={players}
          accumulatedScores={accumulatedScores}
          playerName={playerName}
        />
      ) : currentGame === "drinkingWheel" ? (
        <DrinkingWheelPlayer
          players={players}
        />
      ) : currentGame === "wouldILie" ? (
        <WouldILiePlayer
          connection={connection}
          playerName={playerName}
          onBack={() => setCurrentGame(null)}
        />
      ) : currentGame === "contestantGuess" ? (
        <ContestantGuessPlayer
          connection={connection}
          playerName={playerName}
          onBack={() => setCurrentGame(null)}
        />
      ) : (
        <div className="player-game">
          <div className="player-info">
            <h3>Room: {roomCode}</h3>
            <p className="player-name-display">You: {playerName}</p>
          </div>

          <div className="players-section">
            <h3>Players ({players.length})</h3>
            <div className="players-list">
              {players.map((player, index) => (
                <div key={index} className="player-card">
                  <span className="player-name">{player.name}</span>
                  {player.isHost && <span className="host-badge">Host</span>}
                  <span className="player-score">{player.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="waiting-message">
            <p>Waiting for host to start the game...</p>
          </div>
          
          {/* TEST BUTTONS - Remove these after testing */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #374151' }}>
            <h4 style={{ marginBottom: '1rem', color: '#9ca3af' }}>🧪 Test Mode</h4>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentGame("drinkingWheel")}
            >
              Test Drinking Wheel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerScreen;

