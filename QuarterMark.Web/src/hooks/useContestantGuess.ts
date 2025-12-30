import { useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import signalRService from '../services/signalRService';
import { useContestantGuessStore } from '../stores/contestantGuessStore';

interface ContestantGuessQuestionShownData {
  imageUrl: string;
  possibleAnswers: string[];
}

interface ContestantGuessAnswerRevealedData {
  correctAnswer: string;
  guesses: Record<string, string>;
  roundScores: Record<string, number>;
}

interface ContestantGuessReceivedData {
  playerName: string;
  guessedContestantName: string;
  totalGuesses: number;
  totalPlayers: number;
}

export function useContestantGuess(connection: any) {
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
  } = useContestantGuessStore();

  useEffect(() => {
    if (!connection) return;

    const handleRoundStarted = () => {
      setRoundActive(true);
      setRoundScores({});
      setCurrentQuestion(null);
      setAnswerRevealed(false);
      setRoundState('Waiting');
      setHasGuessed(false);
      setIsRevealed(false);
    };

    const handleQuestionShown = (data: ContestantGuessQuestionShownData) => {
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

    const handleGuessReceived = (data: ContestantGuessReceivedData) => {
      // This is mainly for host to track progress
      // Actual guesses will be sent in the reveal event
    };

    const handleAnswerRevealed = (data: ContestantGuessAnswerRevealedData) => {
      setRoundScores(data.roundScores);
      setAnswerRevealed(true);
      setCorrectAnswer(data.correctAnswer);
      setGuesses(data.guesses);
      setRoundState('Revealed');
    };

    // Note: RoundEnded is handled by the component for navigation
    // The hook doesn't need to reset state here since the component will navigate away

    signalRService.on('ContestantGuessRoundStarted', handleRoundStarted);
    signalRService.on('ContestantGuessQuestionShown', handleQuestionShown);
    signalRService.on('ContestantGuessReceived', handleGuessReceived);
    signalRService.on('ContestantGuessAnswerRevealed', handleAnswerRevealed);

    return () => {
      signalRService.off('ContestantGuessRoundStarted', handleRoundStarted);
      signalRService.off('ContestantGuessQuestionShown', handleQuestionShown);
      signalRService.off('ContestantGuessReceived', handleGuessReceived);
      signalRService.off('ContestantGuessAnswerRevealed', handleAnswerRevealed);
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
    setIsRevealed,
  ]);

  const startRoundMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('StartContestantGuessRound');
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
      await signalRService.invoke('ShowContestantGuessQuestion', imageUrl, correctAnswer, possibleAnswers);
    },
  });

  const submitGuessMutation = useMutation({
    mutationFn: async (guessedContestantName: string) => {
      await signalRService.invoke('SubmitContestantGuess', guessedContestantName);
      setHasGuessed(true);
    },
  });

  const revealAnswerMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('RevealContestantGuessAnswer');
    },
  });

  const endRoundMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('EndContestantGuessRound');
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

