using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using QuarterMark.Api.Application.Interfaces;

namespace QuarterMark.Api.Hubs;

/// <summary>
/// Runs hub invocations for the same room one at a time.
/// Room state (players, guesses, votes, scores) lives in plain collections that are not
/// thread-safe, and players often answer within milliseconds of each other. Without this,
/// concurrent writes can corrupt a dictionary, which then fails JSON serialization and
/// makes SignalR abort every connection in the room.
/// </summary>
public class RoomLockHubFilter : IHubFilter
{
    private const string NoRoomKey = "__no-room";

    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();
    private readonly IGameRoomService _roomService;

    public RoomLockHubFilter(IGameRoomService roomService)
    {
        _roomService = roomService;
    }

    public async ValueTask<object?> InvokeMethodAsync(
        HubInvocationContext invocationContext,
        Func<HubInvocationContext, ValueTask<object?>> next)
    {
        // JoinRoom changes the room it names (the connection may not be mapped yet, or be
        // mapped to another room), so lock that one; everything else locks the caller's room
        var roomCode = invocationContext.HubMethodName == nameof(GameHub.JoinRoom)
            && invocationContext.HubMethodArguments.Count > 0
                ? invocationContext.HubMethodArguments[0] as string
                : await _roomService.GetRoomCodeAsync(invocationContext.Context.ConnectionId);

        var gate = GetLock(roomCode);
        await gate.WaitAsync();
        try
        {
            return await next(invocationContext);
        }
        finally
        {
            gate.Release();
        }
    }

    public async Task OnDisconnectedAsync(
        HubLifetimeContext context,
        Exception? exception,
        Func<HubLifetimeContext, Exception?, Task> next)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(context.Context.ConnectionId);

        var gate = GetLock(roomCode);
        await gate.WaitAsync();
        try
        {
            await next(context, exception);
        }
        finally
        {
            gate.Release();
        }
    }

    private SemaphoreSlim GetLock(string? roomCode) =>
        _locks.GetOrAdd(roomCode?.ToUpperInvariant() ?? NoRoomKey, _ => new SemaphoreSlim(1, 1));
}
