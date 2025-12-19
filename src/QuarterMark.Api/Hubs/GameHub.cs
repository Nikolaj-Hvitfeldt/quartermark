using Microsoft.AspNetCore.SignalR;
using QuarterMark.Api.Application.DTOs;
using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Domain.Entities;
using QuarterMark.Api.Domain.Enums;

namespace QuarterMark.Api.Hubs;

public class GameHub : Hub
{
    private readonly IGameRoomService _roomService;
    private readonly IWouldILieService _wouldILieService;
    private readonly ISignalRNotificationService _notificationService;

    public GameHub(
        IGameRoomService roomService,
        IWouldILieService wouldILieService,
        ISignalRNotificationService notificationService)
    {
        _roomService = roomService;
        _wouldILieService = wouldILieService;
        _notificationService = notificationService;
    }

    public async Task CreateRoom(string playerName)
    {
        var roomCode = await _roomService.CreateRoomAsync(Context.ConnectionId, playerName);
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
        
        await _notificationService.NotifyClientAsync(Context.ConnectionId, "RoomCreated", roomCode);
        
        var players = await _roomService.GetPlayersAsync(roomCode);
        await _notificationService.NotifyClientAsync(Context.ConnectionId, "PlayerListUpdated", players);
    }

    public async Task JoinRoom(string roomCode, string playerName)
    {
        var success = await _roomService.JoinRoomAsync(roomCode, Context.ConnectionId, playerName);
        
        if (!success)
        {
            await _notificationService.NotifyClientAsync(Context.ConnectionId, "Error", "Room not found");
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
        await _notificationService.NotifyClientAsync(Context.ConnectionId, "JoinedRoom", roomCode);
        
        var players = await _roomService.GetPlayersAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", players);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode != null)
        {
            await _roomService.RemovePlayerAsync(Context.ConnectionId);
            
            var players = await _roomService.GetPlayersAsync(roomCode);
            await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", players);
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task StartWouldILieRound()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _wouldILieService.StartRoundAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "WouldILieRoundStarted");
    }

    public async Task ShowQuestion(string imageUrl, string truthTellerName, List<string> liarNames)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _wouldILieService.ShowQuestionAsync(roomCode, imageUrl, truthTellerName, liarNames);
        
        var assignedPlayers = liarNames.Concat(new[] { truthTellerName }).ToList();
        await _notificationService.NotifyRoomAsync(roomCode, "QuestionShown", new
        {
            imageUrl,
            assignedPlayers
        });
    }

    public async Task SubmitClaim(string story)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var success = await _wouldILieService.SubmitClaimAsync(roomCode, Context.ConnectionId, story);
        if (!success) return;

        var question = GetCurrentQuestion(roomCode);
        if (question == null) return;

        var totalNeeded = question.LiarNames.Count + 1;
        
        if (question.Claims.Count >= totalNeeded)
        {
            var claims = question.Claims.Select(c => new ClaimDto { PlayerName = c.PlayerName, Story = c.Story }).ToList();
            await _notificationService.NotifyRoomAsync(roomCode, "ClaimsReady", claims);
        }
        else
        {
            var players = await _roomService.GetPlayersAsync(roomCode);
            var player = players.FirstOrDefault(p => p.Name == question.Claims.Last().PlayerName);
            
            await _notificationService.NotifyClientAsync(
                await GetHostConnectionId(roomCode),
                "ClaimSubmitted",
                new { playerName = player?.Name, claimsCount = question.Claims.Count, totalNeeded });
        }
    }

    public async Task StartVoting()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        await _wouldILieService.StartVotingAsync(roomCode);
        
        var question = GetCurrentQuestion(roomCode);
        if (question != null)
        {
            var claimerNames = question.Claims.Select(c => c.PlayerName).ToList();
            await _notificationService.NotifyRoomAsync(roomCode, "VotingStarted", claimerNames);
        }
    }

    public async Task SubmitVote(string claimedPlayerName)
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        await _wouldILieService.SubmitVoteAsync(roomCode, Context.ConnectionId, claimedPlayerName);
        
        var question = GetCurrentQuestion(roomCode);
        if (question == null) return;

        var players = await _roomService.GetPlayersAsync(roomCode);
        var assignedPlayers = question.LiarNames.Concat(new[] { question.TruthTellerName }).ToList();
        var totalVoters = players.Count(p => !p.IsHost && !assignedPlayers.Contains(p.Name));
        
        var player = players.FirstOrDefault(p => p.Name == question.Votes.LastOrDefault().Key);
        
        await _notificationService.NotifyClientAsync(
            await GetHostConnectionId(roomCode),
            "VoteReceived",
            new
            {
                voterName = player?.Name,
                votedFor = claimedPlayerName,
                totalVotes = question.Votes.Count,
                totalVoters
            });
    }

    public async Task RevealAnswer()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var roundScores = await _wouldILieService.RevealAnswerAsync(roomCode);
        
        var question = GetCurrentQuestion(roomCode);
        if (question != null)
        {
            await _notificationService.NotifyRoomAsync(roomCode, "AnswerRevealed", new
            {
                correctPlayer = question.TruthTellerName,
                votes = question.Votes,
                roundScores
            });
        }
    }

    public async Task EndWouldILieRound()
    {
        var roomCode = await _roomService.GetRoomCodeAsync(Context.ConnectionId);
        if (roomCode == null) return;

        var isHost = await _roomService.IsHostAsync(roomCode, Context.ConnectionId);
        if (!isHost) return;

        var roundScores = await _wouldILieService.EndRoundAsync(roomCode);
        
        var players = await _roomService.GetPlayersAsync(roomCode);
        await _notificationService.NotifyRoomAsync(roomCode, "WouldILieRoundEnded", new
        {
            finalScores = players,
            roundScores
        });
        
        await _notificationService.NotifyRoomAsync(roomCode, "PlayerListUpdated", players);
    }

    private Question? GetCurrentQuestion(string roomCode)
    {
        return _wouldILieService.GetCurrentQuestion(roomCode);
    }

    private async Task<string> GetHostConnectionId(string roomCode)
    {
        return await _roomService.GetHostConnectionIdAsync(roomCode);
    }
}
