using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Application.DTOs;

public enum JoinRoomStatus
{
    Joined,
    Rejoined,
    RoomNotFound,
    NameTaken
}

public class JoinRoomResult
{
    public JoinRoomStatus Status { get; init; }
    public Player? Player { get; init; }

    /// <summary>Connection the player used before rejoining, if it was still mapped.</summary>
    public string? PreviousConnectionId { get; init; }
}
