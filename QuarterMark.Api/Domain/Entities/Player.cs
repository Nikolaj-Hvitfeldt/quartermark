namespace QuarterMark.Api.Domain.Entities;

public class Player
{
    public string ConnectionId { get; set; } = string.Empty;
    public string PlayerId { get; set; } = string.Empty; // Client-generated, stable across reconnects
    public string Name { get; set; } = string.Empty;
    public bool IsHost { get; set; }
    public int Score { get; set; }
    public bool IsDummy { get; set; }
    public bool IsConnected { get; set; } = true; // False while the device is away (screen locked, tab switched)
}
