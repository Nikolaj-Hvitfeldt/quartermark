import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameRoom } from '../hooks/useGameRoom';
import { usePlayerStore } from '../stores/playerStore';
import { useGameSession } from '../hooks/useGameSession';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { GAME_CONSTANTS } from '../utils/gameUtils';
import signalRService from '../services/signalRService';
import { useContestantGuessStore } from '../stores/contestantGuessStore';
import { useQuizStore } from '../stores/quizStore';
import { useWagerStore } from '../stores/wagerStore';
import { usePlayerGameStore } from '../stores/playerGameStore';
import { useSocialMediaGuessStore } from '../stores/socialMediaGuessStore';
import WouldILiePlayer from './WouldILiePlayer';
import ContestantGuessPlayer from './ContestantGuessPlayer';
import QuizPlayer from './QuizPlayer';
import SocialMediaGuessPlayer from './SocialMediaGuessPlayer';
import WagerPlayer from './WagerPlayer';
import DrinkingWheelPlayer from './DrinkingWheelPlayer';
import GameCompletionScreenPlayer from './GameCompletionScreenPlayer';
import { PlayerScreenProps } from '../types';
import './PlayerScreen.css';

function PlayerScreen({ onBack }: PlayerScreenProps) {
  const { t } = useTranslation();
  const { connection, roomCode, players, error, isConnected, joinRoom, playerName: storedPlayerName, roomCode: storedRoomCode, connect } = useGameRoom();
  const { playerName, roomCodeInput, setPlayerName, setRoomCodeInput } = usePlayerStore();
  const { currentGameNumber, accumulatedScores } = useGameSession(connection);
  const [currentGame, setCurrentGame] = useState<string | null>(null); // null, "wouldILie", "contestantGuess", "quiz", "socialMediaGuess", or "drinkingWheel"
  const { completedGame, clearCompletedGame } = useGameCompletion({
    connection,
    // Don't set currentGame to null here - let completedGame state handle the navigation
    // The completion screen will be shown when completedGame is set
  });
  const [hasRestored, setHasRestored] = useState(false);

  // Restore connection and rejoin room on mount if we have stored room state
  useEffect(() => {
    if (hasRestored) return;
    
    const restoreRoom = async () => {
      if (storedRoomCode && storedPlayerName && !isConnected) {
        try {
          setHasRestored(true);
          await connect();
          await joinRoom(storedRoomCode, storedPlayerName);
          // Restore player name and room code input from storage
          setPlayerName(storedPlayerName);
          setRoomCodeInput(storedRoomCode);
        } catch (error) {
          console.error('Failed to restore room connection:', error);
          setHasRestored(true);
        }
      } else {
        setHasRestored(true);
      }
    };
    restoreRoom();
  }, [storedRoomCode, storedPlayerName, isConnected, hasRestored, connect, joinRoom, setPlayerName, setRoomCodeInput]);

  // Handle reconnection when phone unlocks
  useEffect(() => {
    const handleReconnected = async () => {
      if (storedRoomCode && storedPlayerName) {
        try {
          // Reset current game state on reconnection - we'll wait for the next RoundStarted event
          // This prevents getting stuck in a "waiting" state if we missed a RoundStarted event
          setCurrentGame(null);
          clearCompletedGame();
          
          // Reset all game stores to clear any stale state
          useContestantGuessStore.getState().reset();
          useQuizStore.getState().reset();
          useWagerStore.getState().reset();
          usePlayerGameStore.getState().reset();
          useSocialMediaGuessStore.getState().reset();
          
          // Rejoin the room after reconnection
          await joinRoom(storedRoomCode, storedPlayerName);
        } catch (error) {
          console.error('Failed to rejoin room after reconnection:', error);
        }
      }
    };

    window.addEventListener('signalr-reconnected', handleReconnected);
    
    return () => {
      window.removeEventListener('signalr-reconnected', handleReconnected);
    };
  }, [storedRoomCode, storedPlayerName, joinRoom, clearCompletedGame]);

  useEffect(() => {
    if (!connection) return;

    const handleWouldILieRoundStarted = () => {
      clearCompletedGame(); // Clear completion state first
      // Reset store state before switching games to ensure clean state
      usePlayerGameStore.getState().reset();
      setCurrentGame("wouldILie");
    };

    const handleContestantGuessRoundStarted = () => {
      clearCompletedGame(); // Clear completion state first
      // Reset store state before switching games to ensure clean state
      useContestantGuessStore.getState().reset();
      setCurrentGame("contestantGuess");
    };

    const handleQuizRoundStarted = () => {
      clearCompletedGame(); // Clear completion state first
      // Reset store state before switching games to ensure clean state
      useQuizStore.getState().reset();
      setCurrentGame("quiz");
    };

    const handleSocialMediaGuessRoundStarted = () => {
      clearCompletedGame(); // Clear completion state first
      // Reset store state before switching games to ensure clean state
      useSocialMediaGuessStore.getState().reset();
      setCurrentGame("socialMediaGuess");
    };

    const handleWagerRoundStarted = () => {
      clearCompletedGame(); // Clear completion state first
      // Reset store state before switching games to ensure clean state
      useWagerStore.getState().reset();
      setCurrentGame("wager");
    };

    const handleShowDrinkingWheel = () => {
      clearCompletedGame(); // Clear completion state first
      setCurrentGame("drinkingWheel");
    };

    const handleReturnToLobby = () => {
      // Clear all game state and return to lobby
      clearCompletedGame();
      setCurrentGame(null);
    };

    signalRService.on('WouldILieRoundStarted', handleWouldILieRoundStarted);
    signalRService.on('ContestantGuessRoundStarted', handleContestantGuessRoundStarted);
    signalRService.on('QuizRoundStarted', handleQuizRoundStarted);
    signalRService.on('SocialMediaGuessRoundStarted', handleSocialMediaGuessRoundStarted);
    signalRService.on('WagerRoundStarted', handleWagerRoundStarted);
    signalRService.on('ShowDrinkingWheel', handleShowDrinkingWheel);
    signalRService.on('ReturnToLobby', handleReturnToLobby);

    return () => {
      signalRService.off('WouldILieRoundStarted', handleWouldILieRoundStarted);
      signalRService.off('ContestantGuessRoundStarted', handleContestantGuessRoundStarted);
      signalRService.off('QuizRoundStarted', handleQuizRoundStarted);
      signalRService.off('SocialMediaGuessRoundStarted', handleSocialMediaGuessRoundStarted);
      signalRService.off('WagerRoundStarted', handleWagerRoundStarted);
      signalRService.off('ShowDrinkingWheel', handleShowDrinkingWheel);
      signalRService.off('ReturnToLobby', handleReturnToLobby);
    };
  }, [connection, clearCompletedGame]);

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

  // Determine if we're in the lobby (not in any game or completion screen)
  const isInLobby = isConnected && !currentGame && !completedGame;

  return (
    <div className="player-screen">
      {/* Only show back button when in lobby or not connected */}
      {(!isConnected || isInLobby) && (
        <button className="btn btn-back" onClick={onBack}>
          ← {t('common.backToHome')}
        </button>
      )}

      {!isConnected ? (
        <div className="player-join">
          <h2>{t('playerScreen.joinGame')}</h2>
          <input
            type="text"
            placeholder={t('playerScreen.enterRoomCode')}
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
            className="input"
            maxLength={4}
            style={{ textTransform: 'uppercase', letterSpacing: '0.5rem', textAlign: 'center' }}
          />
          <input
            type="text"
            placeholder={t('hostScreen.enterYourName')}
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
            {t('playerScreen.join')}
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
          key={`drinking-wheel-player-${currentGameNumber}`} // Force remount for fresh state
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
          players={players}
          onBack={() => setCurrentGame(null)}
        />
      ) : currentGame === "quiz" ? (
        <QuizPlayer
          connection={connection}
          playerName={playerName}
          players={players}
          onBack={() => setCurrentGame(null)}
        />
      ) : currentGame === "socialMediaGuess" ? (
        <SocialMediaGuessPlayer
          connection={connection}
          playerName={playerName}
          players={players}
          onBack={() => setCurrentGame(null)}
        />
      ) : currentGame === "wager" ? (
        <WagerPlayer
          connection={connection}
          playerName={playerName}
          players={players}
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
            <p>{t('playerScreen.waitingForHost')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerScreen;

