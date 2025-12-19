import { useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import signalRService from '../services/signalRService';
import { useWouldILieStore } from '../stores/wouldILieStore';
import {
  QuestionShownData,
  VoteReceivedData,
  AnswerRevealedData,
  ClaimDto,
} from '../types';

export function useWouldILie(connection: any) {
  const {
    roundActive,
    currentQuestion,
    claims,
    voteProgress,
    roundScores,
    answerRevealed,
    setRoundActive,
    setCurrentQuestion,
    setClaims,
    setVoteProgress,
    setRoundScores,
    setAnswerRevealed,
  } = useWouldILieStore();

  useEffect(() => {
    if (!connection) return;

    const handleRoundStarted = () => {
      setRoundActive(true);
      setRoundScores({});
      setCurrentQuestion(null);
    };

    const handleQuestionShown = (data: QuestionShownData) => {
      setCurrentQuestion({
        imageUrl: data.imageUrl,
        assignedPlayers: data.assignedPlayers,
      });
      setClaims([]);
      setVoteProgress({ total: 0, received: 0 });
      setAnswerRevealed(false);
    };

    const handleClaimsReady = (claimsList: ClaimDto[]) => {
      setClaims(claimsList);
    };

    const handleVoteReceived = (data: VoteReceivedData) => {
      setVoteProgress({ total: data.totalVoters, received: data.totalVotes });
    };

    const handleAnswerRevealed = (data: AnswerRevealedData) => {
      setRoundScores(data.roundScores);
      setAnswerRevealed(true);
    };

    const handleRoundEnded = () => {
      setRoundActive(false);
      setCurrentQuestion(null);
    };

    signalRService.on('WouldILieRoundStarted', handleRoundStarted);
    signalRService.on('QuestionShown', handleQuestionShown);
    signalRService.on('ClaimsReady', handleClaimsReady);
    signalRService.on('VoteReceived', handleVoteReceived);
    signalRService.on('AnswerRevealed', handleAnswerRevealed);
    signalRService.on('WouldILieRoundEnded', handleRoundEnded);

    return () => {
      signalRService.off('WouldILieRoundStarted', handleRoundStarted);
      signalRService.off('QuestionShown', handleQuestionShown);
      signalRService.off('ClaimsReady', handleClaimsReady);
      signalRService.off('VoteReceived', handleVoteReceived);
      signalRService.off('AnswerRevealed', handleAnswerRevealed);
      signalRService.off('WouldILieRoundEnded', handleRoundEnded);
    };
  }, [
    connection,
    setRoundActive,
    setCurrentQuestion,
    setClaims,
    setVoteProgress,
    setRoundScores,
    setAnswerRevealed,
  ]);

  const startRoundMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('StartWouldILieRound');
    },
  });

  const showQuestionMutation = useMutation({
    mutationFn: async ({
      imageUrl,
      truthTeller,
      liars,
    }: {
      imageUrl: string;
      truthTeller: string;
      liars: string[];
    }) => {
      await signalRService.invoke('ShowQuestion', imageUrl, truthTeller, liars);
    },
  });

  const submitClaimMutation = useMutation({
    mutationFn: async (story: string) => {
      await signalRService.invoke('SubmitClaim', story);
    },
  });

  const startVotingMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('StartVoting');
    },
  });

  const submitVoteMutation = useMutation({
    mutationFn: async (claimedPlayerName: string) => {
      await signalRService.invoke('SubmitVote', claimedPlayerName);
    },
  });

  const revealAnswerMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('RevealAnswer');
    },
  });

  const endRoundMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('EndWouldILieRound');
    },
  });

  const startRound = useCallback(async () => {
    await startRoundMutation.mutateAsync();
  }, [startRoundMutation]);

  const showQuestion = useCallback(
    async (imageUrl: string, truthTeller: string, liars: string[]) => {
      await showQuestionMutation.mutateAsync({ imageUrl, truthTeller, liars });
    },
    [showQuestionMutation]
  );

  const submitClaim = useCallback(
    async (story: string) => {
      await submitClaimMutation.mutateAsync(story);
    },
    [submitClaimMutation]
  );

  const startVoting = useCallback(async () => {
    await startVotingMutation.mutateAsync();
  }, [startVotingMutation]);

  const submitVote = useCallback(
    async (claimedPlayerName: string) => {
      await submitVoteMutation.mutateAsync(claimedPlayerName);
    },
    [submitVoteMutation]
  );

  const revealAnswer = useCallback(async () => {
    await revealAnswerMutation.mutateAsync();
  }, [revealAnswerMutation]);

  const endRound = useCallback(async () => {
    await endRoundMutation.mutateAsync();
  }, [endRoundMutation]);

  return {
    roundActive,
    currentQuestion,
    claims,
    voteProgress,
    roundScores,
    answerRevealed,
    startRound,
    showQuestion,
    submitClaim,
    startVoting,
    submitVote,
    revealAnswer,
    endRound,
    isLoading:
      startRoundMutation.isPending ||
      showQuestionMutation.isPending ||
      submitClaimMutation.isPending ||
      startVotingMutation.isPending ||
      submitVoteMutation.isPending ||
      revealAnswerMutation.isPending ||
      endRoundMutation.isPending,
  };
}
