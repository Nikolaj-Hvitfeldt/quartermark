using Microsoft.AspNetCore.SignalR;
using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Hubs;

namespace QuarterMark.Api.Infrastructure.Services;

public class SignalRNotificationService : ISignalRNotificationService
{
    public IHubContext<GameHub> HubContext { get; }

    public SignalRNotificationService(IHubContext<GameHub> hubContext)
    {
        HubContext = hubContext;
    }

    public async Task NotifyRoomAsync(string roomCode, string method, object? arg1 = null, object? arg2 = null)
    {
        if (arg2 != null)
            await HubContext.Clients.Group(roomCode).SendAsync(method, arg1, arg2);
        else if (arg1 != null)
            await HubContext.Clients.Group(roomCode).SendAsync(method, arg1);
        else
            await HubContext.Clients.Group(roomCode).SendAsync(method);
    }

    public async Task NotifyClientAsync(string connectionId, string method, object? arg1 = null, object? arg2 = null)
    {
        if (arg2 != null)
            await HubContext.Clients.Client(connectionId).SendAsync(method, arg1, arg2);
        else if (arg1 != null)
            await HubContext.Clients.Client(connectionId).SendAsync(method, arg1);
        else
            await HubContext.Clients.Client(connectionId).SendAsync(method);
    }
}

