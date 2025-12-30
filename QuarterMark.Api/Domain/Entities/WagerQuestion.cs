namespace QuarterMark.Api.Domain.Entities;

public class WagerQuestion
{
    public string QuestionText { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public List<string> PossibleAnswers { get; set; } = new(); // List of possible answers
    public Dictionary<string, int> Wagers { get; set; } = new(); // playerName -> wagerAmount
    public Dictionary<string, string> Guesses { get; set; } = new(); // playerName -> selectedAnswer
    public bool IsRevealed { get; set; }
}

