namespace QuarterMark.Api.Domain.Entities;

public class GameRoom
{
    public string RoomCode { get; set; } = string.Empty;
    public string HostConnectionId { get; set; } = string.Empty;
    public List<Player> Players { get; set; } = new();
    public WouldILieRound? WouldILieRound { get; set; }
    public Question? CurrentQuestion { get; set; }
    public ContestantGuessRound? ContestantGuessRound { get; set; }
    public ContestantGuessQuestion? CurrentContestantGuessQuestion { get; set; }
    public QuizRound? QuizRound { get; set; }
    public QuizQuestion? CurrentQuizQuestion { get; set; }
    public SocialMediaGuessRound? SocialMediaGuessRound { get; set; }
    public SocialMediaGuessQuestion? CurrentSocialMediaGuessQuestion { get; set; }
    public WagerRound? WagerRound { get; set; }
    public WagerQuestion? CurrentWagerQuestion { get; set; }
    public GameSession? GameSession { get; set; }
    public string? CurrentGame { get; set; } // Game type whose round was started last; null between games

    /// <summary>
    /// Sets each player's live score to their total from finished games plus what they have won
    /// in the running game so far. Called on every reveal, so standings between questions (and
    /// the Wager limit) are current. CompleteGameAsync later stores the same total.
    /// </summary>
    public void ApplyRoundScores(Dictionary<string, int> roundScores, bool floorAtZero = false)
    {
        foreach (var (name, roundScore) in roundScores)
        {
            var player = Players.FirstOrDefault(p => p.Name == name);
            if (player == null) continue;

            var previousGames = GameSession?.AccumulatedScores.GetValueOrDefault(name) ?? 0;
            var score = previousGames + roundScore;
            player.Score = floorAtZero ? Math.Max(0, score) : score;
        }
    }
}

