namespace QuarterMark.Api.Domain.Entities;

public class WagerRound
{
    public List<WagerQuestion> Questions { get; set; } = new();
    public Dictionary<string, int> RoundScores { get; set; } = new(); // playerName -> roundScore (net winnings/losses)
    public bool IsActive { get; set; }
}

