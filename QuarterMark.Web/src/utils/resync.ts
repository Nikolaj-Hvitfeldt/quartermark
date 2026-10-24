/**
 * Puts a player back on the right screen after their device was away (screen lock,
 * tab switch, reload). The server's GetResyncState snapshot is written straight into
 * the same stores the live events update, so the game components render as if the
 * player had never left.
 */
import { PlayerDto } from '../types';
import { useGameRoomStore } from '../stores/gameRoomStore';
import { useGameSessionStore } from '../stores/gameSessionStore';
import { usePlayerGameStore } from '../stores/playerGameStore';
import { useContestantGuessStore } from '../stores/contestantGuessStore';
import { useQuizStore } from '../stores/quizStore';
import { useSocialMediaGuessStore } from '../stores/socialMediaGuessStore';
import { useWagerStore } from '../stores/wagerStore';

type ServerGameType = 'WouldILie' | 'ContestantGuess' | 'Quiz' | 'SocialMediaGuess' | 'Wager';
export type PlayerGameScreen = 'wouldILie' | 'contestantGuess' | 'quiz' | 'socialMediaGuess' | 'wager';

interface Revealed {
  correctAnswer: string;
  guesses: Record<string, string>;
  roundScores: Record<string, number>;
}

export interface ResyncState {
  roomCode: string;
  isHost: boolean;
  playerName: string;
  players: PlayerDto[];
  session: { isActive: boolean; currentGameNumber: number; accumulatedScores: Record<string, number> } | null;
  activeGame: ServerGameType | null;
  completedGame: { gameType: string; gameNumber: number } | null;
  game: any;
}

const SCREEN_BY_GAME: Record<ServerGameType, PlayerGameScreen> = {
  WouldILie: 'wouldILie',
  ContestantGuess: 'contestantGuess',
  Quiz: 'quiz',
  SocialMediaGuess: 'socialMediaGuess',
  Wager: 'wager',
};

/** Applies room, session and current-game state. Returns the game screen to show, or null. */
export function applyResyncState(state: ResyncState): PlayerGameScreen | null {
  useGameRoomStore.getState().setPlayers(state.players);

  const session = useGameSessionStore.getState();
  session.setActive(state.session?.isActive ?? false);
  session.setCurrentGameNumber(state.session?.currentGameNumber ?? 0);
  session.setAccumulatedScores(state.session?.accumulatedScores ?? {});

  switch (state.activeGame) {
    case 'WouldILie':
      applyWouldILie(state.game, state.playerName);
      break;
    case 'ContestantGuess':
      applyImageGuess(useContestantGuessStore.getState(), state.game);
      break;
    case 'SocialMediaGuess':
      applyImageGuess(useSocialMediaGuessStore.getState(), state.game);
      break;
    case 'Quiz':
      applyQuiz(state.game);
      break;
    case 'Wager':
      applyWager(state.game);
      break;
  }

  return state.activeGame ? SCREEN_BY_GAME[state.activeGame] : null;
}

function applyWouldILie(game: any, playerName: string) {
  const store = usePlayerGameStore.getState();
  store.reset();
  if (!game?.hasQuestion) return;

  store.setImageUrl(game.imageUrl);
  store.setClaims(game.claims || []);
  store.setIsClaimer(game.claimers.includes(playerName));
  store.setIsAssigned(game.assignedPlayers.includes(playerName));
  store.setRoundState('ShowingClaims');

  if (game.votingStarted) {
    store.setClaimers(game.claimers);
    store.setCanVote(!game.claimers.includes(playerName));
    store.setHasVoted(!!game.myVote);
    store.setRoundState('Voting');
  }

  if (game.revealed) {
    store.setCorrectPlayer(game.revealed.correctPlayer);
    store.setVotes(game.revealed.votes);
    store.setIsRevealed(true);
    store.setRoundScores(game.revealed.roundScores || {});
    store.setRoundState('Revealed');
  }
}

// Contestant Guess and Social Media Guess share the same store shape
type ImageGuessStore = ReturnType<typeof useContestantGuessStore.getState> | ReturnType<typeof useSocialMediaGuessStore.getState>;

function applyImageGuess(store: ImageGuessStore, game: any) {
  store.reset();
  store.setRoundActive(true);
  if (!game?.hasQuestion) return;

  store.setCurrentQuestion({ imageUrl: game.imageUrl, possibleAnswers: game.possibleAnswers });
  store.setHasGuessed(!!game.myAnswer);
  store.setRoundState('ShowingImage');
  applyRevealed(store, game.revealed);
}

function applyQuiz(game: any) {
  const store = useQuizStore.getState();
  store.reset();
  store.setRoundActive(true);
  if (!game?.hasQuestion) return;

  store.setCurrentQuestion({
    questionText: game.questionText,
    imageUrl: game.imageUrl ?? undefined,
    possibleAnswers: game.possibleAnswers,
  });
  store.setHasAnswered(!!game.myAnswer);
  store.setRoundState('ShowingQuestion');
  applyRevealed(store, game.revealed);
}

function applyWager(game: any) {
  const store = useWagerStore.getState();
  store.reset();
  store.setRoundActive(true);
  if (!game?.hasQuestion) return;

  store.setCurrentQuestion({
    questionText: game.questionText,
    possibleAnswers: game.possibleAnswers,
    questionId: game.questionId,
    originalAnswers: game.possibleAnswers,
  });
  store.setHasWagered(game.myWager != null);
  store.setPlayerWager(game.myWager ?? 0);
  store.setHasAnswered(!!game.myAnswer);
  store.setRoundState(game.wagersClosed ? 'Answering' : 'Wagering');

  if (game.revealed) {
    store.setWagers(game.revealed.wagers);
    applyRevealed(store, game.revealed);
  }
}

function applyRevealed(
  store: {
    setRoundScores: (s: Record<string, number>) => void;
    setAnswerRevealed: (r: boolean) => void;
    setCorrectAnswer: (a: string) => void;
    setGuesses: (g: Record<string, string>) => void;
    setRoundState: (s: 'Revealed') => void;
  },
  revealed: Revealed | null
) {
  if (!revealed) return;
  store.setRoundScores(revealed.roundScores);
  store.setAnswerRevealed(true);
  store.setCorrectAnswer(revealed.correctAnswer);
  store.setGuesses(revealed.guesses);
  store.setRoundState('Revealed');
}
