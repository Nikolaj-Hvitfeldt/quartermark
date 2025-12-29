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
    public GameSession? GameSession { get; set; }
}

