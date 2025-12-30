import { useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import signalRService from '../services/signalRService';
import { useWagerStore } from '../stores/wagerStore';

interface WagerQuestionShownData {
  questionText: string;
  possibleAnswers: string[];
}

interface WagerAnswerRevealedData {
  correctAnswer: string;
  guesses: Record<string, string>;
  wagers: Record<string, number>;
  roundScores: Record<string, number>;
}

export function useWager(connection: any) {
  const {
    roundActive,
    currentQuestion,
    wagers,
    guesses,
    roundScores,
    answerRevealed,
    correctAnswer,
    roundState,
    hasWagered,
    hasAnswered,
    playerWager,
    setRoundActive,
    setCurrentQuestion,
    setWagers,
    setGuesses,
    setRoundScores,
    setAnswerRevealed,
    setCorrectAnswer,
    setRoundState,
    setHasWagered,
    setHasAnswered,
    setPlayerWager,
  } = useWagerStore();

  useEffect(() => {
    if (!connection) return;

    const handleRoundStarted = () => {
      setRoundActive(true);
      setRoundScores({});
      setCurrentQuestion(null);
      setAnswerRevealed(false);
      setCorrectAnswer('');
      setWagers({});
      setGuesses({});
      setRoundState('Waiting');
      setHasWagered(false);
      setHasAnswered(false);
      setPlayerWager(0);
    };

    const handleQuestionShown = (data: WagerQuestionShownData) => {
      setCurrentQuestion({
        questionText: data.questionText,
        possibleAnswers: data.possibleAnswers,
      });
      setWagers({});
      setGuesses({});
      setAnswerRevealed(false);
      setCorrectAnswer('');
      setRoundState('Wagering');
      setHasWagered(false);
      setHasAnswered(false);
      setPlayerWager(0);
    };

    const handleAnswerRevealed = (data: WagerAnswerRevealedData) => {
      setRoundScores(data.roundScores);
      setAnswerRevealed(true);
      setCorrectAnswer(data.correctAnswer);
      setGuesses(data.guesses);
      setWagers(data.wagers);
      setRoundState('Revealed');
    };

    signalRService.on('WagerRoundStarted', handleRoundStarted);
    signalRService.on('WagerQuestionShown', handleQuestionShown);
    signalRService.on('WagerAnswerRevealed', handleAnswerRevealed);

    return () => {
      signalRService.off('WagerRoundStarted', handleRoundStarted);
      signalRService.off('WagerQuestionShown', handleQuestionShown);
      signalRService.off('WagerAnswerRevealed', handleAnswerRevealed);
    };
  }, [
    connection,
    setRoundActive,
    setCurrentQuestion,
    setWagers,
    setGuesses,
    setRoundScores,
    setAnswerRevealed,
    setCorrectAnswer,
    setRoundState,
    setHasWagered,
    setHasAnswered,
    setPlayerWager,
  ]);

  const startRoundMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('StartWagerRound');
    },
  });

  const showQuestionMutation = useMutation({
    mutationFn: async ({
      questionText,
      correctAnswer,
      possibleAnswers,
    }: {
      questionText: string;
      correctAnswer: string;
      possibleAnswers: string[];
    }) => {
      await signalRService.invoke('ShowWagerQuestion', questionText, correctAnswer, possibleAnswers);
    },
  });

  const submitWagerMutation = useMutation({
    mutationFn: async (wagerAmount: number) => {
      await signalRService.invoke('SubmitWager', wagerAmount);
      setPlayerWager(wagerAmount);
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (selectedAnswer: string) => {
      await signalRService.invoke('SubmitWagerAnswer', selectedAnswer);
      setHasAnswered(true);
    },
  });

  const revealAnswerMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('RevealWagerAnswer');
    },
  });

  const endRoundMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('EndWagerRound');
    },
  });

  const startRound = useCallback(async () => {
    await startRoundMutation.mutateAsync();
  }, [startRoundMutation]);

  const showQuestion = useCallback(
    async (questionText: string, correctAnswer: string, possibleAnswers: string[]) => {
      await showQuestionMutation.mutateAsync({ questionText, correctAnswer, possibleAnswers });
    },
    [showQuestionMutation]
  );

  const submitWager = useCallback(
    async (wagerAmount: number) => {
      await submitWagerMutation.mutateAsync(wagerAmount);
      setHasWagered(true);
    },
    [submitWagerMutation, setHasWagered]
  );

  const submitAnswer = useCallback(
    async (selectedAnswer: string) => {
      await submitAnswerMutation.mutateAsync(selectedAnswer);
    },
    [submitAnswerMutation]
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
    wagers,
    guesses,
    roundScores,
    answerRevealed,
    correctAnswer,
    roundState,
    hasWagered,
    hasAnswered,
    playerWager,
    startRound,
    showQuestion,
    submitWager,
    submitAnswer,
    revealAnswer,
    endRound,
    isLoading:
      startRoundMutation.isPending ||
      showQuestionMutation.isPending ||
      submitWagerMutation.isPending ||
      submitAnswerMutation.isPending ||
      revealAnswerMutation.isPending ||
      endRoundMutation.isPending,
  };
}

