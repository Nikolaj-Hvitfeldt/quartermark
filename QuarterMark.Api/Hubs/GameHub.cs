using Microsoft.AspNetCore.SignalR;
using QuarterMark.Api.Application.DTOs;
using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Domain.Entities;
using QuarterMark.Api.Domain.Enums;

namespace QuarterMark.Api.Hubs;

public class GameHub : Hub
{
    private readonly IGameRoomService _roomService;
    private readonly IWouldILieService _wouldILieService;
    private readonly IContestantGuessService _contestantGuessService;
    private readonly IGameSessionService _gameSessionService;
    private readonly ISignalRNotificationService _notificationService;

    public GameHub(
        IGameRoomService roomService,
        IWouldILieService wouldILieService,
        IContestantGuessService contestantGuessService,
        IGameSessionService gameSessionService,
        ISignalRNotificationService notificationService)
    {
        _roomService = roomService;
        _wouldILieService = wouldILieService;
        _contestantGuessService = contestantGuessService;
        _gameSessionService = gameSessionService;
        _notificationService = notificationService;
    }

    public async Task CreateRoom(string playerName)
    {
        var roomCode = await _roomService.CreateRoomAsync(Context.ConnectionId, playerName);
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
        
        await _notificationService.NotifyClientAsync(Context.ConnectionId, "RoomCreated", roomCode);
        
        var players = await _roomService.GetPlayersAsync(roomCode);
        await _notificationService.NotifyClientAsync(Context.ConnectionId, "PlayerListUpdated", players);
    }

    public async Task JoinRoom(string roomCode, string playerName)
    {
        var success = await _roomService.JoinRoomAsync(roomCode, Context.ConnectionId, playerName);
        
        if (!success)
        {
            await _notificationService.NotifyClientAsync(Context.ConnectionId, "Error", "Room not found");
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
        await _notificationService.NotifyClientAsync(Context.ConnectionId, "JoinedRoom", roomCode);
        
        var players = await _roomService.GetPlayersAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", players);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode != null)
        {
            await _roomService.RemovePlayerAsync(Context.ConnectionId);
            
            var players = await _roomService.GetPlayersAsync(roomCode);
            await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", players);
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task StartWouldILieRound()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _wouldILieService.StartRoundAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "WouldILieRoundStarted");
    }

    public async Task<string?> GetRandomImage()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return null;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return null;

        return await _wouldILieService.GetRandomImageAsync(roomCode);
    }

    public async Task ShowQuestion(string imageUrl, string truthTellerName, List<string> liarNames)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _wouldILieService.ShowQuestionAsync(roomCode, imageUrl, truthTellerName, liarNames);
        
        // Automatically create claims for all assigned players (they'll speak in person)
        var assignedPlayers = liarNames.Concat(new[] { truthTellerName }).ToList();
        await _wouldILieService.AutoCreateClaimsAsync(roomCode, assignedPlayers);
        
        var claims = await _wouldILieService.GetClaimsAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "QuestionShown", new
        {
            imageUrl,
            assignedPlayers,
            claims,
            truthTellerName
        });
    }


    public async Task StartVoting()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _wouldILieService.StartVotingAsync(roomCode);
        
        var question = GetCurrentQuestion(roomCode);
        if (question != null)
        {
            var claimerNames = question.Claims.Select(c => c.PlayerName).ToList();
            await _notificationService.NotifyRoomAsync(roomCode, "VotingStarted", claimerNames);
        }
    }

    public async Task SubmitVote(string claimedPlayerName)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        await _wouldILieService.SubmitVoteAsync(roomCode, Context.ConnectionId, claimedPlayerName);
        
        var question = GetCurrentQuestion(roomCode);
        if (question == null) return;

        var players = await _roomService.GetPlayersAsync(roomCode);
        var assignedPlayers = question.LiarNames.Concat(new[] { question.TruthTellerName }).ToList();
        var totalVoters = players.Count(p => !p.IsHost && !assignedPlayers.Contains(p.Name));
        
        var player = players.FirstOrDefault(p => p.Name == question.Votes.LastOrDefault().Key);
        
        await _notificationService.NotifyClientAsync(
            await GetHostConnectionId(roomCode),
            "VoteReceived",
            new
            {
                voterName = player?.Name,
                votedFor = claimedPlayerName,
                totalVotes = question.Votes.Count,
                totalVoters
            });

        // Check if everyone has voted - if so, automatically reveal answer
        if (question.Votes.Count >= totalVoters)
        {
            var roundScores = await _wouldILieService.RevealAnswerAsync(roomCode);
            
            await _notificationService.NotifyRoomAsync(roomCode, "AnswerRevealed", new
            {
                correctPlayer = question.TruthTellerName,
                votes = question.Votes,
                roundScores
            });

            // Update overall player scores
            var updatedPlayers = await _roomService.GetPlayersAsync(roomCode);
            await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", updatedPlayers);
        }
    }

    public async Task RevealAnswer()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var roundScores = await _wouldILieService.RevealAnswerAsync(roomCode);
        
        var question = GetCurrentQuestion(roomCode);
        if (question != null)
        {
            await _notificationService.NotifyRoomAsync(roomCode, "AnswerRevealed", new
            {
                correctPlayer = question.TruthTellerName,
                votes = question.Votes,
                roundScores
            });
        }
    }

    public async Task EndWouldILieRound()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var roundScores = await _wouldILieService.EndRoundAsync(roomCode);
        
        var players = await _roomService.GetPlayersAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "WouldILieRoundEnded", new
        {
            finalScores = players,
            roundScores
        });
        
        await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", players);

        await CompleteGameAndCheckDrinkingWheelAsync(roomCode, "WouldILie", roundScores);
    }

    // Contestant Guess Game Methods
    public async Task StartContestantGuessRound()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _contestantGuessService.StartRoundAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "ContestantGuessRoundStarted");
    }

    public async Task ShowContestantGuessQuestion(string imageUrl, string correctAnswer, List<string> possibleAnswers)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _contestantGuessService.ShowQuestionAsync(roomCode, imageUrl, correctAnswer, possibleAnswers);
        
        await _notificationService.NotifyRoomAsync(roomCode, "ContestantGuessQuestionShown", new
        {
            imageUrl,
            possibleAnswers
        });
    }

    public async Task SubmitContestantGuess(string guessedContestantName)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var success = await _contestantGuessService.SubmitGuessAsync(roomCode, Context.ConnectionId, guessedContestantName);
        if (!success) return;

        var question = GetCurrentContestantGuessQuestion(roomCode);
        if (question == null) return;

        var players = await _roomService.GetPlayersAsync(roomCode);
        var nonHostPlayers = players.Where(p => !p.IsHost).ToList();
        var totalPlayers = nonHostPlayers.Count;
        var totalGuesses = question.Guesses.Count;

        var player = players.FirstOrDefault(p => p.Name == question.Guesses.LastOrDefault().Key);
        
        await _notificationService.NotifyClientAsync(
            await GetHostConnectionId(roomCode),
            "ContestantGuessReceived",
            new
            {
                playerName = player?.Name,
                guessedContestantName,
                totalGuesses,
                totalPlayers
            });
    }

    public async Task RevealContestantGuessAnswer()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var roundScores = await _contestantGuessService.RevealAnswerAsync(roomCode);
        
        var question = GetCurrentContestantGuessQuestion(roomCode);
        if (question != null)
        {
            await _notificationService.NotifyRoomAsync(roomCode, "ContestantGuessAnswerRevealed", new
            {
                correctAnswer = question.CorrectAnswer,
                guesses = question.Guesses,
                roundScores
            });
        }
    }

    public async Task EndContestantGuessRound()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var roundScores = await _contestantGuessService.EndRoundAsync(roomCode);
        
        var players = await _roomService.GetPlayersAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "ContestantGuessRoundEnded", new
        {
            finalScores = players,
            roundScores
        });
        
        await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", players);

        await CompleteGameAndCheckDrinkingWheelAsync(roomCode, "ContestantGuess", roundScores);
    }

    public async Task CreateDummyPlayer(string playerName)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var success = await _roomService.CreateDummyPlayerAsync(roomCode, playerName);
        if (success)
        {
            var players = await _roomService.GetPlayersAsync(roomCode);
            await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", players);
        }
    }

    public async Task RemoveDummyPlayer(string playerName)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var success = await _roomService.RemoveDummyPlayerAsync(roomCode, playerName);
        if (success)
        {
            var players = await _roomService.GetPlayersAsync(roomCode);
            await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", players);
        }
    }


    public async Task SubmitDummyPlayerVote(string dummyPlayerName, string claimedPlayerName)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var room = _roomService.GetRoom(roomCode);
        if (room == null) return;

        var dummyPlayer = room.Players.FirstOrDefault(p => 
            p.Name == dummyPlayerName && p.IsDummy);
        
        if (dummyPlayer == null) return;

        await _wouldILieService.SubmitVoteAsync(roomCode, dummyPlayer.ConnectionId, claimedPlayerName);
        
        var question = GetCurrentQuestion(roomCode);
        if (question == null) return;

        var players = await _roomService.GetPlayersAsync(roomCode);
        var assignedPlayers = question.LiarNames.Concat(new[] { question.TruthTellerName }).ToList();
        var totalVoters = players.Count(p => !p.IsHost && !assignedPlayers.Contains(p.Name));
        
        var player = players.FirstOrDefault(p => p.Name == question.Votes.LastOrDefault().Key);
        
        await _notificationService.NotifyClientAsync(
            Context.ConnectionId,
            "VoteReceived",
            new
            {
                voterName = player?.Name,
                votedFor = claimedPlayerName,
                totalVotes = question.Votes.Count,
                totalVoters
            });

        // Check if everyone has voted - if so, automatically reveal answer
        if (question.Votes.Count >= totalVoters)
        {
            var roundScores = await _wouldILieService.RevealAnswerAsync(roomCode);
            
            await _notificationService.NotifyRoomAsync(roomCode, "AnswerRevealed", new
            {
                correctPlayer = question.TruthTellerName,
                votes = question.Votes,
                roundScores
            });

            // Update overall player scores
            var updatedPlayers = await _roomService.GetPlayersAsync(roomCode);
            await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", updatedPlayers);
        }
    }

    private Question? GetCurrentQuestion(string roomCode)
    {
        return _wouldILieService.GetCurrentQuestion(roomCode);
    }

    private ContestantGuessQuestion? GetCurrentContestantGuessQuestion(string roomCode)
    {
        return _contestantGuessService.GetCurrentQuestion(roomCode);
    }

    private async Task CompleteGameAndCheckDrinkingWheelAsync(string roomCode, string gameType, Dictionary<string, int> roundScores)
    {
        var sessionActive = await _gameSessionService.IsGameSessionActiveAsync(roomCode);
        if (!sessionActive) return;

        await _gameSessionService.CompleteGameAsync(roomCode, gameType, roundScores);

        var currentGameNumber = await _gameSessionService.GetCurrentGameNumberAsync(roomCode);
        var accumulatedScores = await _gameSessionService.GetAccumulatedScoresAsync(roomCode);
        var updatedPlayers = await _roomService.GetPlayersAsync(roomCode);

        await _notificationService.NotifyRoomAsync(roomCode, "GameCompleted", new
        {
            gameType,
            currentGameNumber,
            accumulatedScores,
            players = updatedPlayers
        });

        // Don't automatically show drinking wheel - let the frontend decide when to show it
        // The frontend will show completion screen first, then drinking wheel after "Continue to Next Game"
    }

    // Game Session Methods
    public async Task StartGameSession()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _gameSessionService.StartGameSessionAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "GameSessionStarted");
    }

    // Note: CompleteGame hub method is not currently used as games complete automatically
    // when they end. Kept for potential future use or manual game completion.
    public async Task CompleteGame(string gameType, Dictionary<string, int> gameScores)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await CompleteGameAndCheckDrinkingWheelAsync(roomCode, gameType, gameScores);
    }

    public async Task SpinDrinkingWheel()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        // Notify all players that the wheel is starting to spin
        await _notificationService.NotifyRoomAsync(roomCode, "DrinkingWheelSpinning");
        
        // Wait a bit for the animation to start, then get the result
        await Task.Delay(2000);
        
        var selectedPlayer = await _gameSessionService.SpinDrinkingWheelAsync(roomCode);
        
        await _notificationService.NotifyRoomAsync(roomCode, "DrinkingWheelResult", new
        {
            selectedPlayer
        });
    }

    private async Task<string> GetHostConnectionId(string roomCode)
    {
        return await _roomService.GetHostConnectionIdAsync(roomCode);
    }
}
