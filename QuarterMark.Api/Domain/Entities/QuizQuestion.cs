namespace QuarterMark.Api.Domain.Entities;

public class QuizQuestion
{
    public string QuestionText { get; set; } = string.Empty;
    public string? ImageUrl { get; set; } // Optional image for the question
    public string CorrectAnswer { get; set; } = string.Empty;
    public List<string> PossibleAnswers { get; set; } = new(); // Should have exactly 4 answers
    public Dictionary<string, string> Guesses { get; set; } = new(); // playerName -> selectedAnswer
    public bool IsRevealed { get; set; }
}

