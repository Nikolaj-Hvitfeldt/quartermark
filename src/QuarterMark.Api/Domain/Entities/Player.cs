namespace QuarterMark.Api.Domain.Entities;

public class Player
{
    public string ConnectionId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsHost { get; set; }
    public int Score { get; set; }
}

