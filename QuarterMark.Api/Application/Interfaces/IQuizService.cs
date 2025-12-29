using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Application.Interfaces;

public interface IQuizService
{
    Task<bool> StartRoundAsync(string roomCode);
    Task<bool> ShowQuestionAsync(string roomCode, string questionText, string? imageUrl, string correctAnswer, List<string> possibleAnswers);
    Task<bool> SubmitAnswerAsync(string roomCode, string connectionId, string selectedAnswer);
    Task<Dictionary<string, int>> RevealAnswerAsync(string roomCode);
    Task<Dictionary<string, int>> EndRoundAsync(string roomCode);
    Task<bool> IsRoundActiveAsync(string roomCode);
    QuizQuestion? GetCurrentQuestion(string roomCode);
}

