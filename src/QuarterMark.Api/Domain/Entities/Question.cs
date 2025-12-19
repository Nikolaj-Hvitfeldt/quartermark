namespace QuarterMark.Api.Domain.Entities;

public class Question
{
    public string ImageUrl { get; set; } = string.Empty;
    public string TruthTellerName { get; set; } = string.Empty; // Who actually knows them
    public List<string> LiarNames { get; set; } = new(); // Who will lie
    public List<Claim> Claims { get; set; } = new();
    public Dictionary<string, string> Votes { get; set; } = new(); // playerName -> claimedPlayerName
    public bool IsRevealed { get; set; }
    public QuestionState State { get; set; } = QuestionState.Waiting;
}

