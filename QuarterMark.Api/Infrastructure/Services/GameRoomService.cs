using System.Collections.Concurrent;
using QuarterMark.Api.Application.DTOs;
using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Infrastructure.Services;

public class GameRoomService : IGameRoomService
{
    // Shared across rooms, and RoomLockHubFilter only serializes calls within one room
    private static readonly ConcurrentDictionary<string, GameRoom> _rooms = new();
    private static readonly ConcurrentDictionary<string, string> _playerToRoom = new();

    public Task<string> CreateRoomAsync(string hostConnectionId, string hostName, string playerId)
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
                    PlayerId = playerId,
                    Name = hostName,
                    IsHost = true
                }
            }
        };

        _rooms[roomCode] = room;
        _playerToRoom[hostConnectionId] = roomCode;

        return Task.FromResult(roomCode);
    }

    public Task<JoinRoomResult> JoinRoomAsync(string roomCode, string connectionId, string playerName, string playerId)
    {
        if (!_rooms.TryGetValue(roomCode, out var room))
            return Task.FromResult(new JoinRoomResult { Status = JoinRoomStatus.RoomNotFound });

        // A returning device (screen lock, tab switch, reload) takes its old seat back so score
        // and answers keyed by name are kept. Match on the device's player id; fall back to the
        // name when that seat is offline, e.g. if the browser lost its stored id.
        var existing =
            (string.IsNullOrEmpty(playerId) ? null : room.Players.FirstOrDefault(p => p.PlayerId == playerId))
            ?? room.Players.FirstOrDefault(p =>
                !p.IsConnected && !p.IsDummy && p.Name.Equals(playerName, StringComparison.OrdinalIgnoreCase));

        if (existing != null)
        {
            var previousConnectionId = existing.ConnectionId;
            _playerToRoom.TryRemove(previousConnectionId, out _);

            existing.ConnectionId = connectionId;
            existing.IsConnected = true;
            if (!string.IsNullOrEmpty(playerId))
                existing.PlayerId = playerId;
            if (existing.IsHost)
                room.HostConnectionId = connectionId;

            _playerToRoom[connectionId] = roomCode;
            return Task.FromResult(new JoinRoomResult
            {
                Status = JoinRoomStatus.Rejoined,
                Player = existing,
                PreviousConnectionId = previousConnectionId
            });
        }

        // Scores, guesses and votes are keyed by name, so names must be unique in a room
        if (room.Players.Any(p => p.Name.Equals(playerName, StringComparison.OrdinalIgnoreCase)))
            return Task.FromResult(new JoinRoomResult { Status = JoinRoomStatus.NameTaken });

        var player = new Player
        {
            ConnectionId = connectionId,
            PlayerId = playerId,
            Name = playerName,
            IsHost = false
        };

        room.Players.Add(player);
        _playerToRoom[connectionId] = roomCode;

        return Task.FromResult(new JoinRoomResult { Status = JoinRoomStatus.Joined, Player = player });
    }

    public Task<string?> MarkDisconnectedAsync(string connectionId)
    {
        if (!_playerToRoom.TryRemove(connectionId, out var roomCode))
            return Task.FromResult<string?>(null);

        if (!_rooms.TryGetValue(roomCode, out var room))
            return Task.FromResult<string?>(null);

        // Keep the seat (and the room, if this is the host) so the device can rejoin
        var player = room.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
        if (player != null)
            player.IsConnected = false;

        return Task.FromResult<string?>(roomCode);
    }

    public Task<bool> RemoveOfflinePlayerAsync(string roomCode, string playerName)
    {
        if (!_rooms.TryGetValue(roomCode, out var room))
            return Task.FromResult(false);

        var removed = room.Players.RemoveAll(p =>
            !p.IsHost && !p.IsConnected && p.Name.Equals(playerName, StringComparison.OrdinalIgnoreCase));

        return Task.FromResult(removed > 0);
    }

    public Task<bool> RemovePlayerAsync(string connectionId)
    {
        if (!_playerToRoom.TryGetValue(connectionId, out var roomCode))
            return Task.FromResult(false);

        if (!_rooms.TryGetValue(roomCode, out var room))
            return Task.FromResult(false);

        room.Players.RemoveAll(p => p.ConnectionId == connectionId);
        _playerToRoom.TryRemove(connectionId, out _);

        // If host disconnected, remove the room
        if (room.HostConnectionId == connectionId)
        {
            _rooms.TryRemove(roomCode, out _);
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
            Score = p.Score,
            IsDummy = p.IsDummy,
            IsConnected = p.IsConnected
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

    public Task<bool> CreateDummyPlayerAsync(string roomCode, string playerName)
    {
        if (!_rooms.TryGetValue(roomCode, out var room))
            return Task.FromResult(false);

        // Check if player already exists
        if (room.Players.Any(p => p.Name.Equals(playerName, StringComparison.OrdinalIgnoreCase)))
            return Task.FromResult(false);

        var dummyConnectionId = $"DUMMY_{playerName}_{Guid.NewGuid()}";
        var player = new Player
        {
            ConnectionId = dummyConnectionId,
            Name = playerName,
            IsHost = false,
            IsDummy = true
        };

        room.Players.Add(player);
        _playerToRoom[dummyConnectionId] = roomCode;

        return Task.FromResult(true);
    }

    public Task<bool> RemoveDummyPlayerAsync(string roomCode, string playerName)
    {
        if (!_rooms.TryGetValue(roomCode, out var room))
            return Task.FromResult(false);

        var player = room.Players.FirstOrDefault(p => 
            p.Name.Equals(playerName, StringComparison.OrdinalIgnoreCase) && 
            p.IsDummy);

        if (player == null)
            return Task.FromResult(false);

        room.Players.Remove(player);
        _playerToRoom.TryRemove(player.ConnectionId, out _);

        return Task.FromResult(true);
    }

    private static string GenerateRoomCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 4)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}

