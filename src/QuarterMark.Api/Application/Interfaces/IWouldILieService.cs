using QuarterMark.Api.Application.DTOs;
using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Application.Interfaces;

public interface IWouldILieService
{
    Task<bool> StartRoundAsync(string roomCode);
    Task<bool> ShowQuestionAsync(string roomCode, string imageUrl, string truthTellerName, List<string> liarNames);
    Task<string?> GetRandomImageAsync(string roomCode);
    Task<bool> AutoCreateClaimsAsync(string roomCode, List<string> assignedPlayers);
    Task<List<ClaimDto>> GetClaimsAsync(string roomCode);
    Task<bool> StartVotingAsync(string roomCode);
    Task<bool> SubmitVoteAsync(string roomCode, string connectionId, string claimedPlayerName);
    Task<Dictionary<string, int>> RevealAnswerAsync(string roomCode);
    Task<Dictionary<string, int>> EndRoundAsync(string roomCode);
    Task<bool> IsRoundActiveAsync(string roomCode);
    Question? GetCurrentQuestion(string roomCode);
}

