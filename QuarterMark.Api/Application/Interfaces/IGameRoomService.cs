using QuarterMark.Api.Application.DTOs;
using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Application.Interfaces;

public interface IGameRoomService
{
    Task<string> CreateRoomAsync(string hostConnectionId, string hostName);
    Task<bool> JoinRoomAsync(string roomCode, string connectionId, string playerName);
    Task<bool> RemovePlayerAsync(string connectionId);
    Task<List<PlayerDto>> GetPlayersAsync(string roomCode);
    Task<bool> IsHostAsync(string roomCode, string connectionId);
    Task<string?> GetRoomCodeAsync(string connectionId);
    GameRoom? GetRoom(string roomCode);
    Task<string> GetHostConnectionIdAsync(string roomCode);
    Task<bool> CreateDummyPlayerAsync(string roomCode, string playerName);
    Task<bool> RemoveDummyPlayerAsync(string roomCode, string playerName);
}

