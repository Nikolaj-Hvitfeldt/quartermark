namespace QuarterMark.Api.Application.Interfaces;

public interface IGameSessionService
{
    Task<bool> StartGameSessionAsync(string roomCode);
    Task<bool> CompleteGameAsync(string roomCode, string gameType, Dictionary<string, int> gameScores);
    Task<bool> ShowDrinkingWheelAsync(string roomCode);
    Task<string> SpinDrinkingWheelAsync(string roomCode);
    Task<Dictionary<string, int>> GetAccumulatedScoresAsync(string roomCode);
    Task<bool> IsGameSessionActiveAsync(string roomCode);
    Task<int> GetCurrentGameNumberAsync(string roomCode);
    Task ResetSessionAsync(string roomCode);
}

