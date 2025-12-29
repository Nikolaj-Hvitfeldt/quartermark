using QuarterMark.Api.Application.Constants;
using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Infrastructure.Services;

public class QuizService : IQuizService
{
    private readonly IGameRoomService _roomService;

    public QuizService(IGameRoomService roomService)
    {
        _roomService = roomService;
    }

    public Task<bool> StartRoundAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null) return Task.FromResult(false);

        var round = new QuizRound
        {
            IsActive = true,
            RoundScores = room.Players.Where(p => !p.IsHost).ToDictionary(p => p.Name, p => 0)
        };

        room.QuizRound = round;
        return Task.FromResult(true);
    }

    public Task<bool> ShowQuestionAsync(string roomCode, string questionText, string? imageUrl, string correctAnswer, List<string> possibleAnswers)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.QuizRound == null) return Task.FromResult(false);

        // Ensure we have exactly 4 answers
        if (possibleAnswers.Count != 4)
            return Task.FromResult(false);

        // Ensure correct answer is in the list
        if (!possibleAnswers.Contains(correctAnswer))
            return Task.FromResult(false);

        var question = new QuizQuestion
        {
            QuestionText = questionText,
            ImageUrl = imageUrl,
            CorrectAnswer = correctAnswer,
            PossibleAnswers = possibleAnswers,
            IsRevealed = false
        };

        room.CurrentQuizQuestion = question;
        room.QuizRound.Questions.Add(question);

        return Task.FromResult(true);
    }

    public Task<bool> SubmitAnswerAsync(string roomCode, string connectionId, string selectedAnswer)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentQuizQuestion == null) return Task.FromResult(false);

        var player = room.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
        if (player == null || player.IsHost) return Task.FromResult(false);

        // Don't allow duplicate answers
        if (room.CurrentQuizQuestion.Guesses.ContainsKey(player.Name))
            return Task.FromResult(false);

        // Validate answer is in possible answers
        if (!room.CurrentQuizQuestion.PossibleAnswers.Contains(selectedAnswer))
            return Task.FromResult(false);

        room.CurrentQuizQuestion.Guesses[player.Name] = selectedAnswer;
        return Task.FromResult(true);
    }

    public Task<Dictionary<string, int>> RevealAnswerAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentQuizQuestion == null || room.QuizRound == null)
            return Task.FromResult(new Dictionary<string, int>());

        room.CurrentQuizQuestion.IsRevealed = true;

        var correctAnswer = room.CurrentQuizQuestion.CorrectAnswer;

        // Track the order of correct guesses (Dictionary preserves insertion order in .NET Core 3.1+)
        var correctGuessesInOrder = room.CurrentQuizQuestion.Guesses
            .Where(g => g.Value == correctAnswer)
            .Select(g => g.Key)
            .ToList();

        // Award points: base points for correct answer, plus bonuses for first two
        for (int i = 0; i < correctGuessesInOrder.Count; i++)
        {
            var playerName = correctGuessesInOrder[i];
            int points = GameScoringConstants.BasePointsForCorrect;

            // Add bonus points for first two correct answers
            if (i == 0)
            {
                points += GameScoringConstants.QuizFirstPlaceBonus; // First place: +10 bonus (total 20 points)
            }
            else if (i == 1)
            {
                points += GameScoringConstants.QuizSecondPlaceBonus; // Second place: +5 bonus (total 15 points)
            }
            // Third place and beyond: just base points

            if (room.QuizRound.RoundScores.ContainsKey(playerName))
            {
                room.QuizRound.RoundScores[playerName] += points;
            }
        }

        return Task.FromResult(room.QuizRound.RoundScores);
    }

    public Task<Dictionary<string, int>> EndRoundAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.QuizRound == null)
            return Task.FromResult(new Dictionary<string, int>());

        var lowestScore = room.QuizRound.RoundScores.Values.DefaultIfEmpty(0).Min();
        var host = room.Players.FirstOrDefault(p => p.IsHost);

        if (host != null)
        {
            host.Score += lowestScore;
            foreach (var roundScore in room.QuizRound.RoundScores)
            {
                var player = room.Players.FirstOrDefault(p => p.Name == roundScore.Key);
                if (player != null)
                {
                    player.Score += roundScore.Value;
                }
            }
        }

        room.QuizRound.IsActive = false;
        return Task.FromResult(room.QuizRound.RoundScores);
    }

    public Task<bool> IsRoundActiveAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        return Task.FromResult(room?.QuizRound?.IsActive ?? false);
    }

    public QuizQuestion? GetCurrentQuestion(string roomCode)
    {
        var room = GetRoom(roomCode);
        return room?.CurrentQuizQuestion;
    }

    private GameRoom? GetRoom(string roomCode)
    {
        var service = _roomService as GameRoomService;
        return service?.GetRoom(roomCode);
    }
}

