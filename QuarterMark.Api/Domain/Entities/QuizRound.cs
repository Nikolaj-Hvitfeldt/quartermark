namespace QuarterMark.Api.Domain.Entities;

public class QuizRound
{
    public List<QuizQuestion> Questions { get; set; } = new();
    public Dictionary<string, int> RoundScores { get; set; } = new(); // playerName -> roundScore
    public bool IsActive { get; set; }
}

