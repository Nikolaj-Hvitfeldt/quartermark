using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Application.Interfaces;

public interface IWagerService
{
    Task<bool> StartRoundAsync(string roomCode);
    Task<bool> ShowQuestionAsync(string roomCode, string questionText, string correctAnswer, List<string> possibleAnswers);
    Task<bool> SubmitWagerAsync(string roomCode, string connectionId, int wagerAmount);
    Task<bool> SubmitAnswerAsync(string roomCode, string connectionId, string selectedAnswer);
    Task<Dictionary<string, int>> RevealAnswerAsync(string roomCode);
    Task<Dictionary<string, int>> EndRoundAsync(string roomCode);
    Task<bool> IsRoundActiveAsync(string roomCode);
    WagerQuestion? GetCurrentQuestion(string roomCode);
    Task<bool> ResetWagersAsync(string roomCode);
}

