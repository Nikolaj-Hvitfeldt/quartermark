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
    private readonly IQuizService _quizService;
    private readonly ISocialMediaGuessService _socialMediaGuessService;
    private readonly IWagerService _wagerService;
    private readonly IGameSessionService _gameSessionService;
    private readonly ISignalRNotificationService _notificationService;

    public GameHub(
        IGameRoomService roomService,
        IWouldILieService wouldILieService,
        IContestantGuessService contestantGuessService,
        IQuizService quizService,
        ISocialMediaGuessService socialMediaGuessService,
        IWagerService wagerService,
        IGameSessionService gameSessionService,
        ISignalRNotificationService notificationService)
    {
        _roomService = roomService;
        _wouldILieService = wouldILieService;
        _contestantGuessService = contestantGuessService;
        _quizService = quizService;
        _socialMediaGuessService = socialMediaGuessService;
        _wagerService = wagerService;
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

    // Quiz Game Methods
    public async Task StartQuizRound()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _quizService.StartRoundAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "QuizRoundStarted");
    }

    public async Task ShowQuizQuestion(string questionText, string? imageUrl, string correctAnswer, List<string> possibleAnswers)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _quizService.ShowQuestionAsync(roomCode, questionText, imageUrl, correctAnswer, possibleAnswers);
        
        await _notificationService.NotifyRoomAsync(roomCode, "QuizQuestionShown", new
        {
            questionText,
            imageUrl,
            possibleAnswers
        });
    }

    public async Task SubmitQuizAnswer(string selectedAnswer)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var success = await _quizService.SubmitAnswerAsync(roomCode, Context.ConnectionId, selectedAnswer);
        if (!success) return;

        var question = GetCurrentQuizQuestion(roomCode);
        if (question == null) return;

        var players = await _roomService.GetPlayersAsync(roomCode);
        var nonHostPlayers = players.Where(p => !p.IsHost).ToList();
        var totalPlayers = nonHostPlayers.Count;
        var answeredCount = question.Guesses.Count;

        // Notify host about answer progress
        await _notificationService.NotifyClientAsync(
            await GetHostConnectionId(roomCode),
            "QuizAnswerReceived",
            new
            {
                answeredCount,
                totalPlayers
            });
    }

    public async Task RevealQuizAnswer()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var roundScores = await _quizService.RevealAnswerAsync(roomCode);
        
        var question = GetCurrentQuizQuestion(roomCode);
        if (question != null)
        {
            await _notificationService.NotifyRoomAsync(roomCode, "QuizAnswerRevealed", new
            {
                correctAnswer = question.CorrectAnswer,
                guesses = question.Guesses,
                roundScores
            });
        }
    }

    public async Task EndQuizRound()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var roundScores = await _quizService.EndRoundAsync(roomCode);
        
        var players = await _roomService.GetPlayersAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "QuizRoundEnded", new
        {
            finalScores = players,
            roundScores
        });
        
        await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", players);

        await CompleteGameAndCheckDrinkingWheelAsync(roomCode, "Quiz", roundScores);
    }

    // Social Media Guess Game Methods
    public async Task StartSocialMediaGuessRound()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _socialMediaGuessService.StartRoundAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "SocialMediaGuessRoundStarted");
    }

    public async Task ShowSocialMediaGuessQuestion(string imageUrl, string correctAnswer, List<string> possibleAnswers)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _socialMediaGuessService.ShowQuestionAsync(roomCode, imageUrl, correctAnswer, possibleAnswers);
        
        await _notificationService.NotifyRoomAsync(roomCode, "SocialMediaGuessQuestionShown", new
        {
            imageUrl,
            possibleAnswers
        });
    }

    public async Task SubmitSocialMediaGuess(string guessedContestantName)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var success = await _socialMediaGuessService.SubmitGuessAsync(roomCode, Context.ConnectionId, guessedContestantName);
        if (!success) return;

        var question = GetCurrentSocialMediaGuessQuestion(roomCode);
        if (question == null) return;

        var players = await _roomService.GetPlayersAsync(roomCode);
        var nonHostPlayers = players.Where(p => !p.IsHost).ToList();
        var totalPlayers = nonHostPlayers.Count;
        var totalGuesses = question.Guesses.Count;

        var player = players.FirstOrDefault(p => p.Name == question.Guesses.LastOrDefault().Key);
        
        await _notificationService.NotifyClientAsync(
            await GetHostConnectionId(roomCode),
            "SocialMediaGuessReceived",
            new
            {
                playerName = player?.Name,
                guessedContestantName,
                totalGuesses,
                totalPlayers
            });
    }

    public async Task RevealSocialMediaGuessAnswer()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var roundScores = await _socialMediaGuessService.RevealAnswerAsync(roomCode);
        
        var question = GetCurrentSocialMediaGuessQuestion(roomCode);
        if (question != null)
        {
            await _notificationService.NotifyRoomAsync(roomCode, "SocialMediaGuessAnswerRevealed", new
            {
                correctAnswer = question.CorrectAnswer,
                guesses = question.Guesses,
                roundScores
            });
        }
    }

    public async Task EndSocialMediaGuessRound()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var roundScores = await _socialMediaGuessService.EndRoundAsync(roomCode);
        
        var players = await _roomService.GetPlayersAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "SocialMediaGuessRoundEnded", new
        {
            finalScores = players,
            roundScores
        });
        
        await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", players);

        await CompleteGameAndCheckDrinkingWheelAsync(roomCode, "SocialMediaGuess", roundScores);
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

    private QuizQuestion? GetCurrentQuizQuestion(string roomCode)
    {
        return _quizService.GetCurrentQuestion(roomCode);
    }

    private SocialMediaGuessQuestion? GetCurrentSocialMediaGuessQuestion(string roomCode)
    {
        return _socialMediaGuessService.GetCurrentQuestion(roomCode);
    }

    // Wager Game Methods
    public async Task StartWagerRound()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _wagerService.StartRoundAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "WagerRoundStarted");
    }

    public async Task ShowWagerQuestion(string questionText, string correctAnswer, List<string> possibleAnswers)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _wagerService.ShowQuestionAsync(roomCode, questionText, correctAnswer, possibleAnswers);
        
        await _notificationService.NotifyRoomAsync(roomCode, "WagerQuestionShown", new
        {
            questionText,
            possibleAnswers
        });
    }

    public async Task SubmitWager(int wagerAmount)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var success = await _wagerService.SubmitWagerAsync(roomCode, Context.ConnectionId, wagerAmount);
        if (!success) return;

        var question = GetCurrentWagerQuestion(roomCode);
        if (question == null) return;

        var players = await _roomService.GetPlayersAsync(roomCode);
        var totalPlayers = players.Where(p => !p.IsHost).Count();
        var totalWagers = question.Wagers.Count;

        await _notificationService.NotifyClientAsync(
            await GetHostConnectionId(roomCode),
            "WagerReceived",
            new
            {
                totalWagers,
                totalPlayers
            });
    }

    public async Task SubmitWagerAnswer(string selectedAnswer)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var success = await _wagerService.SubmitAnswerAsync(roomCode, Context.ConnectionId, selectedAnswer);
        if (!success) return;

        var question = GetCurrentWagerQuestion(roomCode);
        if (question == null) return;

        var players = await _roomService.GetPlayersAsync(roomCode);
        var totalPlayers = players.Where(p => !p.IsHost).Count();
        var totalAnswers = question.Guesses.Count;

        await _notificationService.NotifyClientAsync(
            await GetHostConnectionId(roomCode),
            "WagerAnswerReceived",
            new
            {
                totalAnswers,
                totalPlayers
            });
    }

    public async Task RevealWagerAnswer()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var roundScores = await _wagerService.RevealAnswerAsync(roomCode);
        
        var question = GetCurrentWagerQuestion(roomCode);
        if (question != null)
        {
            await _notificationService.NotifyRoomAsync(roomCode, "WagerAnswerRevealed", new
            {
                correctAnswer = question.CorrectAnswer,
                guesses = question.Guesses,
                wagers = question.Wagers,
                roundScores
            });
        }
    }

    public async Task EndWagerRound()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var roundScores = await _wagerService.EndRoundAsync(roomCode);
        
        var players = await _roomService.GetPlayersAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "WagerRoundEnded", new
        {
            finalScores = players,
            roundScores
        });
        
        await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", players);

        await CompleteGameAndCheckDrinkingWheelAsync(roomCode, "Wager", roundScores);
    }

    private WagerQuestion? GetCurrentWagerQuestion(string roomCode)
    {
        return _wagerService.GetCurrentQuestion(roomCode);
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
