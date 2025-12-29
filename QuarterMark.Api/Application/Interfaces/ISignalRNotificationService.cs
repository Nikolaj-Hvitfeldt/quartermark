namespace QuarterMark.Api.Application.Interfaces;

public interface ISignalRNotificationService
{
    Task NotifyRoomAsync(string roomCode, string method, object? arg1 = null, object? arg2 = null);
    Task NotifyClientAsync(string connectionId, string method, object? arg1 = null, object? arg2 = null);
}

