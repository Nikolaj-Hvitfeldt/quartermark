namespace QuarterMark.Api.Application.DTOs;

public class PlayerDto
{
    public string Name { get; set; } = string.Empty;
    public bool IsHost { get; set; }
    public int Score { get; set; }
    public bool IsDummy { get; set; }
}

