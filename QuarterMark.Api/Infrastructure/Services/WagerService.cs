using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Infrastructure.Services;

public class WagerService : IWagerService
{
    private readonly IGameRoomService _roomService;

    public WagerService(IGameRoomService roomService)
    {
        _roomService = roomService;
    }

    public Task<bool> StartRoundAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null) return Task.FromResult(false);

        var round = new WagerRound
        {
            IsActive = true,
            RoundScores = room.Players.Where(p => !p.IsHost).ToDictionary(p => p.Name, p => 0)
        };

        room.WagerRound = round;
        return Task.FromResult(true);
    }

    public Task<bool> ShowQuestionAsync(string roomCode, string questionText, string correctAnswer, List<string> possibleAnswers)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.WagerRound == null) return Task.FromResult(false);

        if (possibleAnswers.Count != 4)
            return Task.FromResult(false);

        if (!possibleAnswers.Contains(correctAnswer))
            return Task.FromResult(false);

        var question = new WagerQuestion
        {
            QuestionText = questionText,
            CorrectAnswer = correctAnswer,
            PossibleAnswers = possibleAnswers,
            IsRevealed = false
        };

        room.CurrentWagerQuestion = question;
        room.WagerRound.Questions.Add(question);

        return Task.FromResult(true);
    }

    public Task<bool> SubmitWagerAsync(string roomCode, string connectionId, int wagerAmount)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentWagerQuestion == null) return Task.FromResult(false);

        var player = room.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
        if (player == null || player.IsHost) return Task.FromResult(false);

        // Can't wager if already wagered
        if (room.CurrentWagerQuestion.Wagers.ContainsKey(player.Name))
            return Task.FromResult(false);

        // Can't wager more than player's current score
        if (wagerAmount < 0 || wagerAmount > player.Score)
            return Task.FromResult(false);

        room.CurrentWagerQuestion.Wagers[player.Name] = wagerAmount;
        return Task.FromResult(true);
    }

    public Task<bool> SubmitAnswerAsync(string roomCode, string connectionId, string selectedAnswer)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentWagerQuestion == null) return Task.FromResult(false);

        var player = room.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
        if (player == null || player.IsHost) return Task.FromResult(false);

        // Must have wagered before answering
        if (!room.CurrentWagerQuestion.Wagers.ContainsKey(player.Name))
            return Task.FromResult(false);

        // Don't allow duplicate answers
        if (room.CurrentWagerQuestion.Guesses.ContainsKey(player.Name))
            return Task.FromResult(false);

        // Validate answer is in possible answers
        if (!room.CurrentWagerQuestion.PossibleAnswers.Contains(selectedAnswer))
            return Task.FromResult(false);

        room.CurrentWagerQuestion.Guesses[player.Name] = selectedAnswer;
        return Task.FromResult(true);
    }

    public Task<Dictionary<string, int>> RevealAnswerAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentWagerQuestion == null || room.WagerRound == null)
            return Task.FromResult(new Dictionary<string, int>());

        room.CurrentWagerQuestion.IsRevealed = true;

        var correctAnswer = room.CurrentWagerQuestion.CorrectAnswer;

        // Calculate winnings/losses for each player
        foreach (var guess in room.CurrentWagerQuestion.Guesses)
        {
            var playerName = guess.Key;
            var playerAnswer = guess.Value;
            
            if (!room.CurrentWagerQuestion.Wagers.ContainsKey(playerName))
                continue;

            var wagerAmount = room.CurrentWagerQuestion.Wagers[playerName];
            var isCorrect = playerAnswer == correctAnswer;

            if (isCorrect)
            {
                // Win: get double the wager amount (net gain = 2 * wagerAmount)
                // Player wagers X, wins 2X, so net change is +2X
                if (room.WagerRound.RoundScores.ContainsKey(playerName))
                {
                    room.WagerRound.RoundScores[playerName] += wagerAmount * 2;
                }
            }
            else
            {
                // Lose: lose the wager amount (net loss = -wagerAmount)
                if (room.WagerRound.RoundScores.ContainsKey(playerName))
                {
                    room.WagerRound.RoundScores[playerName] -= wagerAmount;
                }
            }
        }

        return Task.FromResult(room.WagerRound.RoundScores);
    }

    public Task<Dictionary<string, int>> EndRoundAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.WagerRound == null)
            return Task.FromResult(new Dictionary<string, int>());

        // Apply net winnings/losses to player scores
        foreach (var roundScore in room.WagerRound.RoundScores)
        {
            var player = room.Players.FirstOrDefault(p => p.Name == roundScore.Key);
            if (player != null)
            {
                player.Score += roundScore.Value;
                // Ensure score doesn't go below 0
                if (player.Score < 0)
                    player.Score = 0;
            }
        }

        // Host gets points equal to lowest scoring player (after wagers)
        var lowestScore = room.WagerRound.RoundScores.Values.DefaultIfEmpty(0).Min();
        var host = room.Players.FirstOrDefault(p => p.IsHost);
        if (host != null)
        {
            host.Score += lowestScore;
        }

        room.WagerRound.IsActive = false;
        return Task.FromResult(room.WagerRound.RoundScores);
    }

    public Task<bool> IsRoundActiveAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        return Task.FromResult(room?.WagerRound?.IsActive ?? false);
    }

    public WagerQuestion? GetCurrentQuestion(string roomCode)
    {
        var room = GetRoom(roomCode);
        return room?.CurrentWagerQuestion;
    }

    private GameRoom? GetRoom(string roomCode)
    {
        var service = _roomService as GameRoomService;
        return service?.GetRoom(roomCode);
    }
}

