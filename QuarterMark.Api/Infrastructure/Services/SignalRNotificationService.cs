using Microsoft.AspNetCore.SignalR;
using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Hubs;

namespace QuarterMark.Api.Infrastructure.Services;

public class SignalRNotificationService : ISignalRNotificationService
{
    private readonly IHubContext<GameHub> _hubContext;

    public SignalRNotificationService(IHubContext<GameHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyRoomAsync(string roomCode, string method, object? arg1 = null, object? arg2 = null)
    {
        if (arg2 != null)
            await _hubContext.Clients.Group(roomCode).SendAsync(method, arg1, arg2);
        else if (arg1 != null)
            await _hubContext.Clients.Group(roomCode).SendAsync(method, arg1);
        else
            await _hubContext.Clients.Group(roomCode).SendAsync(method);
    }

    public async Task NotifyClientAsync(string connectionId, string method, object? arg1 = null, object? arg2 = null)
    {
        if (arg2 != null)
            await _hubContext.Clients.Client(connectionId).SendAsync(method, arg1, arg2);
        else if (arg1 != null)
            await _hubContext.Clients.Client(connectionId).SendAsync(method, arg1);
        else
            await _hubContext.Clients.Client(connectionId).SendAsync(method);
    }
}

