// DTOs matching backend
export interface PlayerDto {
  name: string;
  isHost: boolean;
  score: number;
}

export interface ClaimDto {
  playerName: string;
  story: string;
}

// SignalR Events
export interface QuestionShownData {
  imageUrl: string;
  assignedPlayers: string[];
}

export interface ClaimSubmittedData {
  playerName: string;
  claimsCount: number;
  totalNeeded: number;
}

export interface VoteReceivedData {
  voterName: string;
  votedFor: string;
  totalVotes: number;
  totalVoters: number;
}

export interface AnswerRevealedData {
  correctPlayer: string;
  votes: Record<string, string>;
  roundScores: Record<string, number>;
}

export interface RoundEndedData {
  finalScores: PlayerDto[];
  roundScores: Record<string, number>;
}

// Component Props
export interface HostScreenProps {
  onBack: () => void;
}

export interface PlayerScreenProps {
  onBack: () => void;
}

export interface WouldILieHostProps {
  connection: any; // HubConnection from SignalR
  players: PlayerDto[];
  onBack: () => void;
}

export interface WouldILiePlayerProps {
  connection: any; // HubConnection from SignalR
  playerName: string;
  onBack: () => void;
}

export interface ContestantGuessHostProps {
  connection: any; // HubConnection from SignalR
  players: PlayerDto[];
  onBack: () => void;
}

export interface ContestantGuessPlayerProps {
  connection: any; // HubConnection from SignalR
  playerName: string;
  onBack: () => void;
}

export interface ContestantGuessQuestionShownData {
  imageUrl: string;
  possibleAnswers: string[];
}

export interface ContestantGuessAnswerRevealedData {
  correctAnswer: string;
  guesses: Record<string, string>;
  roundScores: Record<string, number>;
}

export interface DrinkingWheelHostProps {
  players: PlayerDto[];
  onSpinComplete: () => void;
}

export interface DrinkingWheelPlayerProps {
  playerName: string;
  onSpinComplete?: () => void;
}

// Game State
export interface CurrentQuestion {
  imageUrl: string;
  assignedPlayers: string[];
}

export interface VoteProgress {
  total: number;
  received: number;
}

