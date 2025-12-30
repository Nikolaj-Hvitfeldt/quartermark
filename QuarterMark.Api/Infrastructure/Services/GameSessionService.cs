using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Domain.Entities;

namespace QuarterMark.Api.Infrastructure.Services;

public class GameSessionService : IGameSessionService
{
    private readonly IGameRoomService _roomService;

    public GameSessionService(IGameRoomService roomService)
    {
        _roomService = roomService;
    }

    public Task<bool> StartGameSessionAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null) return Task.FromResult(false);

        var session = new GameSession
        {
            IsActive = true,
            CurrentGameNumber = 0,
            AccumulatedScores = room.Players.Where(p => !p.IsHost).ToDictionary(p => p.Name, p => 0)
        };

        room.GameSession = session;
        return Task.FromResult(true);
    }

    public Task<bool> CompleteGameAsync(string roomCode, string gameType, Dictionary<string, int> gameScores)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.GameSession == null) return Task.FromResult(false);

        // Add game scores to accumulated scores
        foreach (var score in gameScores)
        {
            if (room.GameSession.AccumulatedScores.ContainsKey(score.Key))
            {
                room.GameSession.AccumulatedScores[score.Key] += score.Value;
            }
            else
            {
                room.GameSession.AccumulatedScores[score.Key] = score.Value;
            }
        }

        // Also update player scores for display
        foreach (var score in gameScores)
        {
            var player = room.Players.FirstOrDefault(p => p.Name == score.Key);
            if (player != null)
            {
                player.Score = room.GameSession.AccumulatedScores[score.Key];
            }
        }

        // Update host score (lowest score player's score)
        if (room.GameSession.AccumulatedScores.Count > 0)
        {
            var lowestScore = room.GameSession.AccumulatedScores.Values.Min();
            var host = room.Players.FirstOrDefault(p => p.IsHost);
            if (host != null)
            {
                host.Score = lowestScore;
            }
        }

        room.GameSession.CompletedGames.Add(gameType);
        room.GameSession.CurrentGameNumber++;
        room.GameSession.CurrentGameType = null;

        return Task.FromResult(true);
    }

    public Task<bool> ShowDrinkingWheelAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.GameSession == null) return Task.FromResult(false);

        // Mark that we're showing the wheel
        room.GameSession.CurrentGameType = "DrinkingWheel";
        return Task.FromResult(true);
    }

    public Task<string> SpinDrinkingWheelAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.GameSession == null) 
            return Task.FromResult<string>(string.Empty);

        var nonHostPlayers = room.Players.Where(p => !p.IsHost).ToList();
        if (nonHostPlayers.Count == 0)
            return Task.FromResult<string>(string.Empty);

        var random = new Random();
        var selectedPlayer = nonHostPlayers[random.Next(nonHostPlayers.Count)];
        
        return Task.FromResult(selectedPlayer.Name);
    }

    public Task<Dictionary<string, int>> GetAccumulatedScoresAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room?.GameSession == null)
            return Task.FromResult(new Dictionary<string, int>());

        return Task.FromResult(room.GameSession.AccumulatedScores);
    }

    public Task<bool> IsGameSessionActiveAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        return Task.FromResult(room?.GameSession?.IsActive ?? false);
    }

    public Task<int> GetCurrentGameNumberAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        return Task.FromResult(room?.GameSession?.CurrentGameNumber ?? 0);
    }

    public Task ResetSessionAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null) return Task.CompletedTask;

        // Reset the game session
        room.GameSession = null;
        
        // Reset player scores
        foreach (var player in room.Players)
        {
            player.Score = 0;
        }

        return Task.CompletedTask;
    }

    private GameRoom? GetRoom(string roomCode)
    {
        var service = _roomService as GameRoomService;
        return service?.GetRoom(roomCode);
    }
}

