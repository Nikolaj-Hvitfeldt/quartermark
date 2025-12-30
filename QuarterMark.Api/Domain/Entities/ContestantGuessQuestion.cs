namespace QuarterMark.Api.Domain.Entities;

public class ContestantGuessQuestion
{
    public string ImageUrl { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty; // The contestant name (answer)
    public List<string> PossibleAnswers { get; set; } = new(); // List of possible contestant names
    public Dictionary<string, string> Guesses { get; set; } = new(); // playerName -> guessedContestantName
    public bool IsRevealed { get; set; }
}

