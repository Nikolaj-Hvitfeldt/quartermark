import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import signalRService from '../services/signalRService';
import { usePlayerGameStore } from '../stores/playerGameStore';
import { useGameRoom } from '../hooks/useGameRoom';
import { GAME_CONSTANTS } from '../utils/gameUtils';
import {
  WOULD_I_LIE_TITLES,
  WOULD_I_LIE_MESSAGES,
  getClaimerResultMessage,
  getVoterResultMessage,
  calculateVotesReceived,
} from '../utils/wouldILieUtils';
import { WouldILiePlayerProps, QuestionShownData, AnswerRevealedData } from '../types';
import { ImageDisplay } from './ImageDisplay';
import { WouldILieAnswerGrid } from './WouldILieAnswerGrid';
import { WouldILieStandings } from './WouldILieStandings';
import './WouldILie.css';
import './WouldILiePlayer.css';

function WouldILiePlayer({ connection, playerName, onBack }: WouldILiePlayerProps) {
  const {
    roundState,
    imageUrl,
    claims,
    canVote,
    hasVoted,
    claimers,
    correctPlayer,
    votes,
    isClaimer,
    setRoundState,
    setImageUrl,
    setClaims,
    setCanVote,
    setHasVoted,
    setClaimers,
    setIsRevealed,
    setCorrectPlayer,
    setVotes,
    setIsClaimer,
    setIsAssigned,
    setRoundScores,
  } = usePlayerGameStore();

  const { players } = useGameRoom();

  useEffect(() => {
    if (!connection) return;

    const handleRoundStarted = () => {
      setRoundState('Waiting');
      setImageUrl('');
      setClaims([]);
      setCanVote(false);
      setHasVoted(false);
      setIsRevealed(false);
      setIsClaimer(false);
      setIsAssigned(false);
      setRoundScores({});
    };

    const handleQuestionShown = (data: QuestionShownData) => {
      setImageUrl(data.imageUrl);
      setClaims(data.claims || []);
      setCanVote(false);
      setHasVoted(false);
      setIsRevealed(false);
      const claimerNames = (data.claims || []).map(c => c.playerName);
      setIsClaimer(claimerNames.includes(playerName));
      setIsAssigned(data.assignedPlayers.includes(playerName));
      setRoundState('ShowingClaims');
    };

    const handleVotingStarted = (claimerNames: string[]) => {
      setClaimers(claimerNames);
      setCanVote(!claimerNames.includes(playerName));
      setRoundState('Voting');
    };

    const handleAnswerRevealed = (data: AnswerRevealedData) => {
      setCorrectPlayer(data.correctPlayer);
      setVotes(data.votes);
      setIsRevealed(true);
      setRoundState('Revealed');
      setRoundScores(data.roundScores || {});
    };

    const handleRoundEnded = () => {
      setRoundState('RoundEnded');
      setTimeout(() => {
        onBack();
      }, GAME_CONSTANTS.PLAYER_ROUND_END_DELAY_WOULD_ILIE);
    };

    signalRService.on('WouldILieRoundStarted', handleRoundStarted);
    signalRService.on('QuestionShown', handleQuestionShown);
    signalRService.on('VotingStarted', handleVotingStarted);
    signalRService.on('AnswerRevealed', handleAnswerRevealed);
    signalRService.on('WouldILieRoundEnded', handleRoundEnded);

    return () => {
      signalRService.off('WouldILieRoundStarted', handleRoundStarted);
      signalRService.off('QuestionShown', handleQuestionShown);
      signalRService.off('VotingStarted', handleVotingStarted);
      signalRService.off('AnswerRevealed', handleAnswerRevealed);
      signalRService.off('WouldILieRoundEnded', handleRoundEnded);
    };
  }, [
    connection,
    playerName,
    setRoundState,
    setImageUrl,
    setClaims,
    setCanVote,
    setHasVoted,
    setClaimers,
    setIsRevealed,
    setCorrectPlayer,
    setVotes,
    setIsClaimer,
    setIsAssigned,
    setRoundScores,
    onBack,
  ]);

  const submitVoteMutation = useMutation({
    mutationFn: async (claimerName: string) => {
      await signalRService.invoke('SubmitVote', claimerName);
    },
    onSuccess: () => {
      setHasVoted(true);
    },
  });

  const handleVote = (claimerName: string) => {
    submitVoteMutation.mutate(claimerName);
  };

  // Waiting state
  if (roundState === 'Waiting') {
    return (
      <div className="would-i-lie-player">
        <div className="wil-waiting-message">
          <h2>{WOULD_I_LIE_MESSAGES.WAITING_FOR_HOST}</h2>
        </div>
      </div>
    );
  }

  // Showing claims
  if (roundState === 'ShowingClaims') {
    const options = claims.map(claim => ({
      playerName: claim.playerName,
    }));

    return (
      <div className="would-i-lie-player">
        <div className="wil-game-container">
          <h2 className="wil-game-title">{WOULD_I_LIE_TITLES.WHO_KNOWS}</h2>
          {imageUrl && <ImageDisplay imageUrl={imageUrl} altText="Mystery Person" />}
          <WouldILieAnswerGrid options={options} />
          <div className="wil-status-message">
            <p>{isClaimer ? WOULD_I_LIE_MESSAGES.CLAIMER_WAITING : WOULD_I_LIE_MESSAGES.WAITING_FOR_VOTING}</p>
          </div>
        </div>
      </div>
    );
  }

  // Voting - can vote
  if (roundState === 'Voting' && canVote && !hasVoted) {
    const options = claimers.map(name => ({
      playerName: name,
      label: WOULD_I_LIE_MESSAGES.VOTE_FOR_THEM,
    }));

    return (
      <div className="would-i-lie-player">
        <div className="wil-game-container">
          <h2 className="wil-game-title">{WOULD_I_LIE_TITLES.WHOS_TELLING_TRUTH}</h2>
          {imageUrl && <ImageDisplay imageUrl={imageUrl} altText="Mystery Person" />}
          <WouldILieAnswerGrid options={options} onOptionClick={handleVote} clickable />
        </div>
      </div>
    );
  }

  // Voting - already voted or is claimer
  if (roundState === 'Voting' && (hasVoted || isClaimer)) {
    const options = claimers.map(name => ({ playerName: name }));

    return (
      <div className="would-i-lie-player">
        <div className="wil-game-container">
          <h2 className="wil-game-title">{WOULD_I_LIE_TITLES.VOTING_IN_PROGRESS}</h2>
          {imageUrl && <ImageDisplay imageUrl={imageUrl} altText="Mystery Person" />}
          <WouldILieAnswerGrid options={options} />
          <div className="wil-answer-submitted">
            <p>{hasVoted ? WOULD_I_LIE_MESSAGES.VOTE_SUBMITTED : WOULD_I_LIE_MESSAGES.WAITING_FOR_VOTES}</p>
          </div>
        </div>
      </div>
    );
  }

  // Revealed state
  if (roundState === 'Revealed') {
    const playerVote = votes[playerName];
    const isPlayerCorrect = playerVote === correctPlayer;
    const votesReceived = isClaimer ? calculateVotesReceived(votes, playerName) : 0;

    const options = claimers.map(name => ({
      playerName: name,
      isCorrect: name === correctPlayer,
      isPlayerChoice: playerVote === name,
      showCorrectBadge: name === correctPlayer,
      showPlayerBadge: playerVote === name && !isClaimer,
    }));

    const resultMessage = isClaimer
      ? getClaimerResultMessage(votesReceived)
      : getVoterResultMessage(isPlayerCorrect);
    const resultClass = isClaimer ? (votesReceived > 0 ? 'correct' : 'incorrect') : (isPlayerCorrect ? 'correct' : 'incorrect');

    return (
      <div className="would-i-lie-player">
        <div className="wil-game-container">
          <h2 className="wil-game-title">{WOULD_I_LIE_TITLES.ANSWER_REVEALED}</h2>
          {imageUrl && <ImageDisplay imageUrl={imageUrl} altText="Mystery Person" />}
          <WouldILieAnswerGrid options={options} revealed />
          <div className="wil-result-message">
            <div className={`wil-result-box ${resultClass}`}>
              <h3>{resultMessage}</h3>
            </div>
          </div>
          <WouldILieStandings players={players} highlightPlayerName={playerName} />
        </div>
      </div>
    );
  }

  // Round ended state
  if (roundState === 'RoundEnded') {
    return (
      <div className="would-i-lie-player">
        <div className="wil-game-container">
          <h2 className="wil-game-title">{WOULD_I_LIE_TITLES.ROUND_COMPLETE}</h2>
          <p className="wil-round-complete-message">{WOULD_I_LIE_MESSAGES.SKAAL}</p>
          <WouldILieStandings
            players={players}
            title="📊 Final Standings"
            highlightPlayerName={playerName}
          />
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="would-i-lie-player">
      <div className="wil-waiting-message">
        <h2>{WOULD_I_LIE_MESSAGES.LOADING}</h2>
      </div>
    </div>
  );
}

export default WouldILiePlayer;
