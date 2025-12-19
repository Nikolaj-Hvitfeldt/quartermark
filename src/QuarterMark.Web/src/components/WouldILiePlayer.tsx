import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import signalRService from '../services/signalRService';
import { usePlayerGameStore } from '../stores/playerGameStore';
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
      setRoundState('Waiting');
      setRoundScores({});
    };

    signalRService.on('WouldILieRoundStarted', handleRoundStarted);
    signalRService.on('QuestionShown', handleQuestionShown);
    signalRService.on('ClaimsReady', handleClaimsReady);
    signalRService.on('VotingStarted', handleVotingStarted);
    signalRService.on('AnswerRevealed', handleAnswerRevealed);
    signalRService.on('WouldILieRoundEnded', handleRoundEnded);

    return () => {
      signalRService.off('WouldILieRoundStarted', handleRoundStarted);
      signalRService.off('QuestionShown', handleQuestionShown);
      signalRService.off('ClaimsReady', handleClaimsReady);
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
      <button className="btn btn-back" onClick={onBack}>
        ← Back to Lobby
      </button>

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
            {isClaimer && (
              <p className={`result ${correctPlayer === playerName ? 'correct' : 'incorrect'}`}>
                {correctPlayer === playerName 
                  ? '🎉 You were telling the truth!' 
                  : '😅 You were bluffing!'}
              </p>
            )}
            {!isClaimer && (
              <p className={`result ${votes[playerName] === correctPlayer ? 'correct' : 'incorrect'}`}>
                {votes[playerName] === correctPlayer 
                  ? '🎉 You guessed correctly!' 
                  : '❌ You guessed wrong!'}
              </p>
            )}
            <div className="votes-summary">
              <h3>Votes:</h3>
              {Object.entries(votes).map(([voter, votedFor]) => (
                <div key={voter} className="vote-item">
                  {voter} voted for {votedFor}
                </div>
              ))}
            </div>
            {Object.keys(roundScores).length > 0 && (
              <div className="round-scores">
                <h3>Round Scores:</h3>
                {Object.entries(roundScores)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, score]) => (
                    <div key={name} className="score-item">
                      {name}: {score} pts
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WouldILiePlayer;

