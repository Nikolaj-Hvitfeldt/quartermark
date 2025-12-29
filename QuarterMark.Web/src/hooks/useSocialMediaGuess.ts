import { useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import signalRService from '../services/signalRService';
import { useSocialMediaGuessStore } from '../stores/socialMediaGuessStore';
import type { SocialMediaGuessQuestionShownData, SocialMediaGuessAnswerRevealedData, SocialMediaGuessReceivedData } from '../types';

export function useSocialMediaGuess(connection: any) {
  const {
    roundActive,
    currentQuestion,
    guesses,
    roundScores,
    answerRevealed,
    correctAnswer,
    roundState,
    hasGuessed,
    setRoundActive,
    setCurrentQuestion,
    setGuesses,
    setRoundScores,
    setAnswerRevealed,
    setCorrectAnswer,
    setRoundState,
    setHasGuessed,
  } = useSocialMediaGuessStore();

  useEffect(() => {
    if (!connection) return;

    const handleRoundStarted = () => {
      setRoundActive(true);
      setRoundScores({});
      setCurrentQuestion(null);
      setAnswerRevealed(false);
      setRoundState('Waiting');
      setHasGuessed(false);
    };

    const handleQuestionShown = (data: SocialMediaGuessQuestionShownData) => {
      setCurrentQuestion({
        imageUrl: data.imageUrl,
        possibleAnswers: data.possibleAnswers,
      });
      setGuesses({});
      setAnswerRevealed(false);
      setCorrectAnswer('');
      setRoundState('ShowingImage');
      setHasGuessed(false);
    };

    const handleGuessReceived = (data: SocialMediaGuessReceivedData) => {
      // This is mainly for host to track progress
      // Actual guesses will be sent in the reveal event
    };

    const handleAnswerRevealed = (data: SocialMediaGuessAnswerRevealedData) => {
      setRoundScores(data.roundScores);
      setAnswerRevealed(true);
      setCorrectAnswer(data.correctAnswer);
      setGuesses(data.guesses);
      setRoundState('Revealed');
    };

    signalRService.on('SocialMediaGuessRoundStarted', handleRoundStarted);
    signalRService.on('SocialMediaGuessQuestionShown', handleQuestionShown);
    signalRService.on('SocialMediaGuessReceived', handleGuessReceived);
    signalRService.on('SocialMediaGuessAnswerRevealed', handleAnswerRevealed);

    return () => {
      signalRService.off('SocialMediaGuessRoundStarted', handleRoundStarted);
      signalRService.off('SocialMediaGuessQuestionShown', handleQuestionShown);
      signalRService.off('SocialMediaGuessReceived', handleGuessReceived);
      signalRService.off('SocialMediaGuessAnswerRevealed', handleAnswerRevealed);
    };
  }, [
    connection,
    setRoundActive,
    setCurrentQuestion,
    setGuesses,
    setRoundScores,
    setAnswerRevealed,
    setCorrectAnswer,
    setRoundState,
    setHasGuessed,
  ]);

  const startRoundMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('StartSocialMediaGuessRound');
    },
  });

  const showQuestionMutation = useMutation({
    mutationFn: async ({
      imageUrl,
      correctAnswer,
      possibleAnswers,
    }: {
      imageUrl: string;
      correctAnswer: string;
      possibleAnswers: string[];
    }) => {
      await signalRService.invoke('ShowSocialMediaGuessQuestion', imageUrl, correctAnswer, possibleAnswers);
    },
  });

  const submitGuessMutation = useMutation({
    mutationFn: async (guessedContestantName: string) => {
      await signalRService.invoke('SubmitSocialMediaGuess', guessedContestantName);
    },
    onSuccess: () => {
      setHasGuessed(true); // Optimistic update for player
    },
  });

  const revealAnswerMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('RevealSocialMediaGuessAnswer');
    },
  });

  const endRoundMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('EndSocialMediaGuessRound');
    },
  });

  const startRound = useCallback(async () => {
    await startRoundMutation.mutateAsync();
  }, [startRoundMutation]);

  const showQuestion = useCallback(
    async (imageUrl: string, correctAnswer: string, possibleAnswers: string[]) => {
      await showQuestionMutation.mutateAsync({ imageUrl, correctAnswer, possibleAnswers });
    },
    [showQuestionMutation]
  );

  const submitGuess = useCallback(
    async (guessedContestantName: string) => {
      await submitGuessMutation.mutateAsync(guessedContestantName);
    },
    [submitGuessMutation]
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
    guesses,
    roundScores,
    answerRevealed,
    correctAnswer,
    roundState,
    hasGuessed,
    startRound,
    showQuestion,
    submitGuess,
    revealAnswer,
    endRound,
    isLoading:
      startRoundMutation.isPending ||
      showQuestionMutation.isPending ||
      submitGuessMutation.isPending ||
      revealAnswerMutation.isPending ||
      endRoundMutation.isPending,
  };
}

