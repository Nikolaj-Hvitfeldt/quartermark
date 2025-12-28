using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Application.Interfaces;

public interface IContestantGuessService
{
    Task<bool> StartRoundAsync(string roomCode);
    Task<bool> ShowQuestionAsync(string roomCode, string imageUrl, string correctAnswer, List<string> possibleAnswers);
    Task<bool> SubmitGuessAsync(string roomCode, string connectionId, string guessedContestantName);
    Task<Dictionary<string, int>> RevealAnswerAsync(string roomCode);
    Task<Dictionary<string, int>> EndRoundAsync(string roomCode);
    Task<bool> IsRoundActiveAsync(string roomCode);
    ContestantGuessQuestion? GetCurrentQuestion(string roomCode);
}

