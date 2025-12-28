using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Infrastructure.Services;

public class ContestantGuessService : IContestantGuessService
{
    private readonly IGameRoomService _roomService;

    public ContestantGuessService(IGameRoomService roomService)
    {
        _roomService = roomService;
    }

    public Task<bool> StartRoundAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null) return Task.FromResult(false);

        var round = new ContestantGuessRound
        {
            IsActive = true,
            RoundScores = room.Players.Where(p => !p.IsHost).ToDictionary(p => p.Name, p => 0)
        };

        room.ContestantGuessRound = round;
        return Task.FromResult(true);
    }

    public Task<bool> ShowQuestionAsync(string roomCode, string imageUrl, string correctAnswer, List<string> possibleAnswers)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.ContestantGuessRound == null) return Task.FromResult(false);

        var question = new ContestantGuessQuestion
        {
            ImageUrl = imageUrl,
            CorrectAnswer = correctAnswer,
            PossibleAnswers = possibleAnswers,
            IsRevealed = false
        };

        room.CurrentContestantGuessQuestion = question;
        room.ContestantGuessRound.Questions.Add(question);

        return Task.FromResult(true);
    }

    public Task<bool> SubmitGuessAsync(string roomCode, string connectionId, string guessedContestantName)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentContestantGuessQuestion == null) return Task.FromResult(false);

        var player = room.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
        if (player == null || player.IsHost) return Task.FromResult(false);

        // Don't allow duplicate guesses
        if (room.CurrentContestantGuessQuestion.Guesses.ContainsKey(player.Name))
            return Task.FromResult(false);

        room.CurrentContestantGuessQuestion.Guesses[player.Name] = guessedContestantName;
        return Task.FromResult(true);
    }

    public Task<Dictionary<string, int>> RevealAnswerAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentContestantGuessQuestion == null || room.ContestantGuessRound == null)
            return Task.FromResult(new Dictionary<string, int>());

        room.CurrentContestantGuessQuestion.IsRevealed = true;

        var correctAnswer = room.CurrentContestantGuessQuestion.CorrectAnswer;

        // Award points: correct guess = 10 points
        foreach (var guess in room.CurrentContestantGuessQuestion.Guesses)
        {
            if (guess.Value == correctAnswer)
            {
                if (room.ContestantGuessRound.RoundScores.ContainsKey(guess.Key))
                {
                    room.ContestantGuessRound.RoundScores[guess.Key] += 10;
                }
            }
        }

        return Task.FromResult(room.ContestantGuessRound.RoundScores);
    }

    public Task<Dictionary<string, int>> EndRoundAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.ContestantGuessRound == null)
            return Task.FromResult(new Dictionary<string, int>());

        var lowestScore = room.ContestantGuessRound.RoundScores.Values.DefaultIfEmpty(0).Min();
        var host = room.Players.FirstOrDefault(p => p.IsHost);

        if (host != null)
        {
            host.Score += lowestScore;
            foreach (var roundScore in room.ContestantGuessRound.RoundScores)
            {
                var player = room.Players.FirstOrDefault(p => p.Name == roundScore.Key);
                if (player != null)
                {
                    player.Score += roundScore.Value;
                }
            }
        }

        room.ContestantGuessRound.IsActive = false;
        return Task.FromResult(room.ContestantGuessRound.RoundScores);
    }

    public Task<bool> IsRoundActiveAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        return Task.FromResult(room?.ContestantGuessRound?.IsActive ?? false);
    }

    public ContestantGuessQuestion? GetCurrentQuestion(string roomCode)
    {
        var room = GetRoom(roomCode);
        return room?.CurrentContestantGuessQuestion;
    }

    private GameRoom? GetRoom(string roomCode)
    {
        var service = _roomService as GameRoomService;
        return service?.GetRoom(roomCode);
    }
}

