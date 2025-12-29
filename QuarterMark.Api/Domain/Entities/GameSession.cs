namespace QuarterMark.Api.Domain.Entities;

public class GameSession
{
    public int CurrentGameNumber { get; set; } = 0; // 0 = not started, 1-5 = current game
    public string? CurrentGameType { get; set; } // "WouldILie", "ContestantGuess", etc.
    public Dictionary<string, int> AccumulatedScores { get; set; } = new(); // playerName -> totalScore
    public bool IsActive { get; set; }
    public List<string> CompletedGames { get; set; } = new(); // Track which games have been completed
}

