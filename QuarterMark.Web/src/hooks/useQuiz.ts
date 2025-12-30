import { useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import signalRService from '../services/signalRService';
import { useQuizStore } from '../stores/quizStore';

interface QuizQuestionShownData {
  questionText: string;
  imageUrl?: string;
  possibleAnswers: string[];
}

interface QuizAnswerRevealedData {
  correctAnswer: string;
  guesses: Record<string, string>;
  roundScores: Record<string, number>;
}

interface QuizAnswerReceivedData {
  answeredCount: number;
  totalPlayers: number;
}

export function useQuiz(connection: any) {
  const {
    roundActive,
    currentQuestion,
    guesses,
    roundScores,
    answerRevealed,
    correctAnswer,
    hasAnswered,
    roundState,
    setRoundActive,
    setCurrentQuestion,
    setGuesses,
    setRoundScores,
    setAnswerRevealed,
    setCorrectAnswer,
    setHasAnswered,
    setRoundState,
  } = useQuizStore();

  useEffect(() => {
    if (!connection) return;

    const handleRoundStarted = () => {
      setRoundActive(true);
      setRoundScores({});
      setCurrentQuestion(null);
      setAnswerRevealed(false);
      setRoundState('Waiting');
    };

    const handleQuestionShown = (data: QuizQuestionShownData) => {
      setCurrentQuestion({
        questionText: data.questionText,
        imageUrl: data.imageUrl,
        possibleAnswers: data.possibleAnswers,
      });
      setGuesses({});
      setAnswerRevealed(false);
      setCorrectAnswer('');
      setHasAnswered(false);
      setRoundState('ShowingQuestion');
    };

    const handleAnswerReceived = (data: QuizAnswerReceivedData) => {
      // Host can track progress
    };

    const handleAnswerRevealed = (data: QuizAnswerRevealedData) => {
      setRoundScores(data.roundScores);
      setAnswerRevealed(true);
      setCorrectAnswer(data.correctAnswer);
      setGuesses(data.guesses);
      setRoundState('Revealed');
    };

    const handleRoundEnded = () => {
      setRoundActive(false);
      setCurrentQuestion(null);
      setRoundState('RoundEnded');
    };

    signalRService.on('QuizRoundStarted', handleRoundStarted);
    signalRService.on('QuizQuestionShown', handleQuestionShown);
    signalRService.on('QuizAnswerReceived', handleAnswerReceived);
    signalRService.on('QuizAnswerRevealed', handleAnswerRevealed);
    signalRService.on('QuizRoundEnded', handleRoundEnded);

    return () => {
      signalRService.off('QuizRoundStarted', handleRoundStarted);
      signalRService.off('QuizQuestionShown', handleQuestionShown);
      signalRService.off('QuizAnswerReceived', handleAnswerReceived);
      signalRService.off('QuizAnswerRevealed', handleAnswerRevealed);
      signalRService.off('QuizRoundEnded', handleRoundEnded);
    };
  }, [
    connection,
    setRoundActive,
    setCurrentQuestion,
    setGuesses,
    setRoundScores,
    setAnswerRevealed,
    setCorrectAnswer,
    setHasAnswered,
    setRoundState,
  ]);

  const startRoundMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('StartQuizRound');
    },
  });

  const showQuestionMutation = useMutation({
    mutationFn: async (data: {
      questionText: string;
      imageUrl?: string;
      correctAnswer: string;
      possibleAnswers: string[];
    }) => {
      await signalRService.invoke('ShowQuizQuestion', data.questionText, data.imageUrl, data.correctAnswer, data.possibleAnswers);
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (selectedAnswer: string) => {
      await signalRService.invoke('SubmitQuizAnswer', selectedAnswer);
    },
  });

  const revealAnswerMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('RevealQuizAnswer');
    },
  });

  const endRoundMutation = useMutation({
    mutationFn: async () => {
      await signalRService.invoke('EndQuizRound');
    },
  });

  const startRound = useCallback(async () => {
    await startRoundMutation.mutateAsync();
  }, [startRoundMutation]);

  const showQuestion = useCallback(
    async (questionText: string, imageUrl: string | undefined, correctAnswer: string, possibleAnswers: string[]) => {
      await showQuestionMutation.mutateAsync({ questionText, imageUrl, correctAnswer, possibleAnswers });
    },
    [showQuestionMutation]
  );

  const submitAnswer = useCallback(
    async (selectedAnswer: string) => {
      await submitAnswerMutation.mutateAsync(selectedAnswer);
      setHasAnswered(true);
    },
    [submitAnswerMutation, setHasAnswered]
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
    hasAnswered,
    roundState,
    startRound,
    showQuestion,
    submitAnswer,
    revealAnswer,
    endRound,
    isLoading:
      startRoundMutation.isPending ||
      showQuestionMutation.isPending ||
      submitAnswerMutation.isPending ||
      revealAnswerMutation.isPending ||
      endRoundMutation.isPending,
  };
}

