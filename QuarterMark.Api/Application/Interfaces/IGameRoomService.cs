using QuarterMark.Api.Application.DTOs;
using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Application.Interfaces;

public interface IGameRoomService
{
    Task<string> CreateRoomAsync(string hostConnectionId, string hostName, string playerId);
    Task<JoinRoomResult> JoinRoomAsync(string roomCode, string connectionId, string playerName, string playerId);
    /// <summary>Marks the player behind a dropped connection as offline. Returns their room code.</summary>
    Task<string?> MarkDisconnectedAsync(string connectionId);
    Task<bool> RemoveOfflinePlayerAsync(string roomCode, string playerName);
    /// <summary>Removes a player who left on purpose. Removes the room when the host leaves.</summary>
    Task<bool> RemovePlayerAsync(string connectionId);
    Task<List<PlayerDto>> GetPlayersAsync(string roomCode);
    Task<bool> IsHostAsync(string roomCode, string connectionId);
    Task<string?> GetRoomCodeAsync(string connectionId);
    GameRoom? GetRoom(string roomCode);
    Task<string> GetHostConnectionIdAsync(string roomCode);
    Task<bool> CreateDummyPlayerAsync(string roomCode, string playerName);
    Task<bool> RemoveDummyPlayerAsync(string roomCode, string playerName);
}

