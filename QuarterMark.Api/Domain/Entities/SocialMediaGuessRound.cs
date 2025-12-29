namespace QuarterMark.Api.Domain.Entities;

public class SocialMediaGuessRound
{
    public List<SocialMediaGuessQuestion> Questions { get; set; } = new();
    public Dictionary<string, int> RoundScores { get; set; } = new(); // playerName -> roundScore
    public bool IsActive { get; set; }
}

