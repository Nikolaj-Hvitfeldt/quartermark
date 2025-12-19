using QuarterMark.Api.Application.DTOs;
using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Infrastructure.Services;

public class GameRoomService : IGameRoomService
{
    private static readonly Dictionary<string, GameRoom> _rooms = new();
    private static readonly Dictionary<string, string> _playerToRoom = new();

    public Task<string> CreateRoomAsync(string hostConnectionId, string hostName)
    {
        var roomCode = GenerateRoomCode();
        var room = new GameRoom
        {
            RoomCode = roomCode,
            HostConnectionId = hostConnectionId,
            Players = new List<Player>
            {
                new Player
                {
                    ConnectionId = hostConnectionId,
                    Name = hostName,
                    IsHost = true
                }
            }
        };

        _rooms[roomCode] = room;
        _playerToRoom[hostConnectionId] = roomCode;

        return Task.FromResult(roomCode);
    }

    public Task<bool> JoinRoomAsync(string roomCode, string connectionId, string playerName)
    {
        if (!_rooms.TryGetValue(roomCode, out var room))
            return Task.FromResult(false);

        var player = new Player
        {
            ConnectionId = connectionId,
            Name = playerName,
            IsHost = false
        };

        room.Players.Add(player);
        _playerToRoom[connectionId] = roomCode;

        return Task.FromResult(true);
    }

    public Task<bool> RemovePlayerAsync(string connectionId)
    {
        if (!_playerToRoom.TryGetValue(connectionId, out var roomCode))
            return Task.FromResult(false);

        if (!_rooms.TryGetValue(roomCode, out var room))
            return Task.FromResult(false);

        room.Players.RemoveAll(p => p.ConnectionId == connectionId);
        _playerToRoom.Remove(connectionId);

        // If host disconnected, remove the room
        if (room.HostConnectionId == connectionId)
        {
            _rooms.Remove(roomCode);
        }

        return Task.FromResult(true);
    }

    public Task<List<PlayerDto>> GetPlayersAsync(string roomCode)
    {
        if (!_rooms.TryGetValue(roomCode, out var room))
            return Task.FromResult(new List<PlayerDto>());

        return Task.FromResult(room.Players.Select(p => new PlayerDto
        {
            Name = p.Name,
            IsHost = p.IsHost,
            Score = p.Score
        }).ToList());
    }

    public Task<bool> IsHostAsync(string roomCode, string connectionId)
    {
        if (!_rooms.TryGetValue(roomCode, out var room))
            return Task.FromResult(false);

        return Task.FromResult(room.HostConnectionId == connectionId);
    }

    public Task<string?> GetRoomCodeAsync(string connectionId)
    {
        _playerToRoom.TryGetValue(connectionId, out var roomCode);
        return Task.FromResult(roomCode);
    }

    public GameRoom? GetRoom(string roomCode)
    {
        _rooms.TryGetValue(roomCode, out var room);
        return room;
    }

    public Task<string> GetHostConnectionIdAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        return Task.FromResult(room?.HostConnectionId ?? string.Empty);
    }

    private static string GenerateRoomCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 4)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}

