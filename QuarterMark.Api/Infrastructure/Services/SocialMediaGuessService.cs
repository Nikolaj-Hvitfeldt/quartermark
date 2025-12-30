using QuarterMark.Api.Application.Constants;
using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Infrastructure.Services;

public class SocialMediaGuessService : ISocialMediaGuessService
{
    private readonly IGameRoomService _roomService;

    public SocialMediaGuessService(IGameRoomService roomService)
    {
        _roomService = roomService;
    }

    public Task<bool> StartRoundAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null) return Task.FromResult(false);

        var round = new SocialMediaGuessRound
        {
            IsActive = true,
            RoundScores = room.Players.Where(p => !p.IsHost).ToDictionary(p => p.Name, p => 0)
        };

        room.SocialMediaGuessRound = round;
        return Task.FromResult(true);
    }

    public Task<bool> ShowQuestionAsync(string roomCode, string imageUrl, string correctAnswer, List<string> possibleAnswers)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.SocialMediaGuessRound == null) return Task.FromResult(false);

        // Ensure we have exactly 4 answers
        if (possibleAnswers.Count != 4)
            return Task.FromResult(false);

        // Ensure correct answer is in the list
        if (!possibleAnswers.Contains(correctAnswer))
            return Task.FromResult(false);

        var question = new SocialMediaGuessQuestion
        {
            ImageUrl = imageUrl,
            CorrectAnswer = correctAnswer,
            PossibleAnswers = possibleAnswers,
            IsRevealed = false
        };

        room.CurrentSocialMediaGuessQuestion = question;
        room.SocialMediaGuessRound.Questions.Add(question);

        return Task.FromResult(true);
    }

    public Task<bool> SubmitGuessAsync(string roomCode, string connectionId, string guessedContestantName)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentSocialMediaGuessQuestion == null) return Task.FromResult(false);

        var player = room.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
        if (player == null || player.IsHost) return Task.FromResult(false);

        // Don't allow duplicate guesses
        if (room.CurrentSocialMediaGuessQuestion.Guesses.ContainsKey(player.Name))
            return Task.FromResult(false);

        room.CurrentSocialMediaGuessQuestion.Guesses[player.Name] = guessedContestantName;
        return Task.FromResult(true);
    }

    public Task<Dictionary<string, int>> RevealAnswerAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentSocialMediaGuessQuestion == null || room.SocialMediaGuessRound == null)
            return Task.FromResult(new Dictionary<string, int>());

        room.CurrentSocialMediaGuessQuestion.IsRevealed = true;

        var correctAnswer = room.CurrentSocialMediaGuessQuestion.CorrectAnswer;

        // Award points: correct guess = 10 points (matches Would I Lie to You? scoring)
        foreach (var guess in room.CurrentSocialMediaGuessQuestion.Guesses)
        {
            if (guess.Value == correctAnswer)
            {
                if (room.SocialMediaGuessRound.RoundScores.ContainsKey(guess.Key))
                {
                    room.SocialMediaGuessRound.RoundScores[guess.Key] += GameScoringConstants.BasePointsForCorrect;
                }
            }
        }

        return Task.FromResult(room.SocialMediaGuessRound.RoundScores);
    }

    public Task<Dictionary<string, int>> EndRoundAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.SocialMediaGuessRound == null)
            return Task.FromResult(new Dictionary<string, int>());

        var lowestScore = room.SocialMediaGuessRound.RoundScores.Values.DefaultIfEmpty(0).Min();
        var host = room.Players.FirstOrDefault(p => p.IsHost);

        if (host != null)
        {
            host.Score += lowestScore;
            foreach (var roundScore in room.SocialMediaGuessRound.RoundScores)
            {
                var player = room.Players.FirstOrDefault(p => p.Name == roundScore.Key);
                if (player != null)
                {
                    player.Score += roundScore.Value;
                }
            }
        }

        room.SocialMediaGuessRound.IsActive = false;
        return Task.FromResult(room.SocialMediaGuessRound.RoundScores);
    }

    public Task<bool> IsRoundActiveAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        return Task.FromResult(room?.SocialMediaGuessRound?.IsActive ?? false);
    }

    public SocialMediaGuessQuestion? GetCurrentQuestion(string roomCode)
    {
        var room = GetRoom(roomCode);
        return room?.CurrentSocialMediaGuessQuestion;
    }

    private GameRoom? GetRoom(string roomCode)
    {
        var service = _roomService as GameRoomService;
        return service?.GetRoom(roomCode);
    }
}

