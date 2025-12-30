import React from 'react';
import { PlayerDto } from '../types';
import { sortPlayersByScore } from '../utils/gameUtils';
import { FINAL_RESULTS_TEXT } from '../utils/finalResultsConstants';
import { Fireworks } from './Fireworks';
import { Confetti } from './Confetti';
import './FinalResultsScreen.css';

interface FinalResultsScreenProps {
  players: PlayerDto[];
  accumulatedScores: Record<string, number>;
  onClose: () => void;
  isHost: boolean;
}

const PODIUM_POSITIONS = {
  FIRST: 0,
  SECOND: 1,
  THIRD: 2,
} as const;

interface PodiumPositionProps {
  player: PlayerDto | undefined;
  position: 1 | 2 | 3;
  score: number;
}

function PodiumPosition({ player, position, score }: PodiumPositionProps) {
  const medalEmoji = position === 1 ? '👑' : position === 2 ? '🥈' : '🥉';
  const medalClass = position === 1 ? 'gold' : position === 2 ? 'silver' : 'bronze';
  const blockClass = position === 1 ? 'first-block' : position === 2 ? 'second-block' : 'third-block';
  const playerClass = position === 1 ? 'podium-first' : position === 2 ? 'podium-second' : 'podium-third';
  const nameClass = position === 1 ? 'winner-name' : '';
  const scoreClass = position === 1 ? 'winner-score' : '';
  const avatarClass = position === 1 ? 'winner-glow' : '';

  return (
    <div className={`podium-position ${playerClass}`}>
      {player && (
        <>
          <div className={`player-avatar ${medalClass} ${avatarClass}`}>
            <span className={`medal ${position === 1 ? 'crown' : ''}`}>{medalEmoji}</span>
          </div>
          <div className={`player-name ${nameClass}`}>{player.name}</div>
          <div className={`player-score ${scoreClass}`}>{score} pts</div>
        </>
      )}
      <div className={`podium-block ${blockClass}`}>
        <span className="podium-number">{position}</span>
      </div>
    </div>
  );
}

export function FinalResultsScreen({
  players,
  accumulatedScores,
  onClose,
  isHost,
}: FinalResultsScreenProps) {
  const sortedPlayers = sortPlayersByScore(players, accumulatedScores);
  
  const first = sortedPlayers[PODIUM_POSITIONS.FIRST];
  const second = sortedPlayers[PODIUM_POSITIONS.SECOND];
  const third = sortedPlayers[PODIUM_POSITIONS.THIRD];

  return (
    <div className="final-results-screen">
      <Fireworks active={true} />
      <Confetti active={true} />
      
      <div className="final-results-content">
        <h1 className="final-results-title">
          <span className="sparkle">✨</span>
          <span className="title-text">{FINAL_RESULTS_TEXT.TITLE}</span>
          <span className="sparkle">✨</span>
        </h1>
        <p className="final-results-subtitle">🎆 {FINAL_RESULTS_TEXT.SUBTITLE} 🎆</p>

        <div className="podium-container">
          <PodiumPosition 
            player={second} 
            position={2} 
            score={second ? (accumulatedScores[second.name] || 0) : 0} 
          />
          <PodiumPosition 
            player={first} 
            position={1} 
            score={first ? (accumulatedScores[first.name] || 0) : 0} 
          />
          <PodiumPosition 
            player={third} 
            position={3} 
            score={third ? (accumulatedScores[third.name] || 0) : 0} 
          />
        </div>

        {first && (
          <div className="winner-announcement">
            <span className="trophy">🏆</span>
            <span className="winner-text">
              Congratulations, <strong>{first.name}</strong>!
            </span>
            <span className="trophy">🏆</span>
            <p className="prize-text">{FINAL_RESULTS_TEXT.PRIZE_MESSAGE}</p>
          </div>
        )}

        {isHost && (
          <button className="btn btn-primary btn-large return-btn" onClick={onClose}>
            Return to Main Menu
          </button>
        )}
        
        {!isHost && (
          <p className="waiting-text">{FINAL_RESULTS_TEXT.WAITING_MESSAGE}</p>
        )}
      </div>
    </div>
  );
}

