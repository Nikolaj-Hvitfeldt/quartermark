namespace QuarterMark.Api.Domain.Entities;

public class WouldILieRound
{
    public List<Question> Questions { get; set; } = new();
    public Dictionary<string, int> RoundScores { get; set; } = new(); // playerName -> roundScore
    public bool IsActive { get; set; }
    public List<string> UsedImageUrls { get; set; } = new(); // Track which images have been used
}

