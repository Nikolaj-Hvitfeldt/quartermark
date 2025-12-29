import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import signalRService from '../services/signalRService';
import { usePlayerGameStore } from '../stores/playerGameStore';
import { useGameRoom } from '../hooks/useGameRoom';
import { WouldILiePlayerProps, QuestionShownData, AnswerRevealedData, ClaimDto } from '../types';
import './WouldILiePlayer.css';

function WouldILiePlayer({ connection, playerName, onBack }: WouldILiePlayerProps) {
  const {
    roundState,
    imageUrl,
    claims,
    canVote,
    hasVoted,
    claimers,
    isRevealed,
    correctPlayer,
    votes,
    isClaimer,
    isAssigned,
    roundScores,
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
      // Go straight to claims screen since claims are automatically created
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
      // Keep roundScores to show final standings
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
  ]);

  const submitVoteMutation = useMutation({
    mutationFn: async (claimerName: string) => {
      await signalRService.invoke('SubmitVote', claimerName);
    },
    onSuccess: () => {
      setHasVoted(true);
    },
  });

  const handleVote = async (claimerName: string) => {
    submitVoteMutation.mutate(claimerName);
  };

  return (
    <div className="would-i-lie-player">

      {roundState === 'Waiting' && (
        <div className="waiting-screen">
          <h2>Waiting for host to start the round...</h2>
        </div>
      )}

      {roundState === 'ShowingClaims' && (
        <div className="round-screen">
          <h2>Players who claim to know this person:</h2>
          {imageUrl && (
            <div className="person-image">
              <img src={imageUrl} alt="Person" />
            </div>
          )}
          <div className="claims-list">
            {claims.map((claim, index) => (
              <div key={index} className="claim-card">
                <h3>{claim.playerName}</h3>
              </div>
            ))}
          </div>
          {isClaimer && (
            <p className="claimer-note">You claimed to know them. Waiting for others to vote...</p>
          )}
        </div>
      )}

      {roundState === 'Voting' && canVote && !hasVoted && (
        <div className="round-screen">
          <h2>Who do you think is telling the truth?</h2>
          <div className="voting-options">
            {claimers.map((claimerName, index) => (
              <button
                key={index}
                className="btn btn-vote btn-large"
                onClick={() => handleVote(claimerName)}
              >
                {claimerName}
              </button>
            ))}
          </div>
        </div>
      )}

      {roundState === 'Voting' && (hasVoted || isClaimer) && (
        <div className="round-screen">
          <h2>Waiting for other players to vote...</h2>
        </div>
      )}

      {roundState === 'Revealed' && (
        <div className="round-screen">
          <h2>Answer Revealed!</h2>
          <div className="reveal-section">
            <p className="correct-answer">
              The correct answer is: <strong>{correctPlayer}</strong>
            </p>
            {isClaimer && (() => {
              const votesReceived = Object.values(votes).filter(v => v === playerName).length;
              return (
                <p className={`result ${votesReceived > 0 ? 'correct' : 'incorrect'}`}>
                  {votesReceived > 0 
                    ? `🎉 You received ${votesReceived} vote(s)! +${votesReceived * 10} points`
                    : '😅 No one voted for you. 0 points'}
                </p>
              );
            })()}
            {!isClaimer && (
              <p className={`result ${votes[playerName] === correctPlayer ? 'correct' : 'incorrect'}`}>
                {votes[playerName] === correctPlayer 
                  ? '🎉 You guessed correctly! +10 points' 
                  : '❌ You guessed wrong! 0 points'}
              </p>
            )}
          </div>
          
          <div className="score-screen">
            <h3>Current Standings</h3>
            <div className="standings-list">
              {players
                .filter(p => !p.isHost)
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div key={player.name} className="standing-item">
                    <span className="standing-rank">#{index + 1}</span>
                    <span className="standing-name">{player.name}</span>
                    <span className="standing-score">{player.score} pts</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {roundState === 'RoundEnded' && (
        <div className="round-screen">
          <h2>Final Standings</h2>
          <p className="round-complete-message">Round complete - SKÅL!</p>
          <div className="standings-list">
            {players
              .filter(p => !p.isHost)
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div key={player.name} className="standing-item">
                  <span className="standing-rank">#{index + 1}</span>
                  <span className="standing-name">{player.name}</span>
                  <span className="standing-score">{player.score} pts</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WouldILiePlayer;

