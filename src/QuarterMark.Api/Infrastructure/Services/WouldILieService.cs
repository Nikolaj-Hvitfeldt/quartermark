using QuarterMark.Api.Application.DTOs;
using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Domain.Entities;
using QuarterMark.Api.Domain.Enums;
using QuarterMark.Api.Infrastructure.Data;

namespace QuarterMark.Api.Infrastructure.Services;

public class WouldILieService : IWouldILieService
{
    private readonly IGameRoomService _roomService;

    public WouldILieService(IGameRoomService roomService)
    {
        _roomService = roomService;
    }

    public Task<bool> StartRoundAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null) return Task.FromResult(false);

        var round = new WouldILieRound
        {
            IsActive = true,
            RoundScores = room.Players.Where(p => !p.IsHost).ToDictionary(p => p.Name, p => 0)
        };

        room.WouldILieRound = round;
        return Task.FromResult(true);
    }

    public Task<bool> ShowQuestionAsync(string roomCode, string imageUrl, string truthTellerName, List<string> liarNames)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.WouldILieRound == null) return Task.FromResult(false);

        var question = new Question
        {
            ImageUrl = imageUrl,
            TruthTellerName = truthTellerName,
            LiarNames = liarNames,
            State = QuestionState.ShowingImage
        };

        room.CurrentQuestion = question;
        room.WouldILieRound.Questions.Add(question);
        
        // Track that this image has been used
        if (!room.WouldILieRound.UsedImageUrls.Contains(imageUrl))
        {
            room.WouldILieRound.UsedImageUrls.Add(imageUrl);
        }

        return Task.FromResult(true);
    }

    public Task<string?> GetRandomImageAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.WouldILieRound == null) 
            return Task.FromResult<string?>(null);

        var usedImages = room.WouldILieRound.UsedImageUrls;
        var randomImage = ImagePool.GetRandomUnusedImage(usedImages);
        
        return Task.FromResult(randomImage);
    }

    public Task<bool> AutoCreateClaimsAsync(string roomCode, List<string> assignedPlayers)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentQuestion == null) return Task.FromResult(false);

        // Automatically create claims for all assigned players
        foreach (var playerName in assignedPlayers)
        {
            if (!room.CurrentQuestion.Claims.Any(c => c.PlayerName == playerName))
            {
                room.CurrentQuestion.Claims.Add(new Claim
                {
                    PlayerName = playerName
                });
            }
        }

        room.CurrentQuestion.State = QuestionState.ShowingClaims;
        return Task.FromResult(true);
    }

    public Task<List<ClaimDto>> GetClaimsAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentQuestion == null)
            return Task.FromResult(new List<ClaimDto>());

        var claims = room.CurrentQuestion.Claims
            .Select(c => new ClaimDto { PlayerName = c.PlayerName })
            .ToList();

        return Task.FromResult(claims);
    }

    public Task<bool> StartVotingAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentQuestion == null) return Task.FromResult(false);

        room.CurrentQuestion.State = QuestionState.Voting;
        return Task.FromResult(true);
    }

    public Task<bool> SubmitVoteAsync(string roomCode, string connectionId, string claimedPlayerName)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentQuestion == null) return Task.FromResult(false);

        if (room.CurrentQuestion.State != QuestionState.Voting) return Task.FromResult(false);

        var player = room.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
        if (player == null) return Task.FromResult(false);

        if (room.CurrentQuestion.Claims.Any(c => c.PlayerName == player.Name))
            return Task.FromResult(false);

        room.CurrentQuestion.Votes[player.Name] = claimedPlayerName;
        return Task.FromResult(true);
    }

    public Task<Dictionary<string, int>> RevealAnswerAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentQuestion == null || room.WouldILieRound == null)
            return Task.FromResult(new Dictionary<string, int>());

        room.CurrentQuestion.State = QuestionState.Revealed;
        room.CurrentQuestion.IsRevealed = true;

        var correctPlayer = room.CurrentQuestion.TruthTellerName;
        const int pointsForCorrectGuess = 10;

        // Award points to voters who guessed correctly
        foreach (var vote in room.CurrentQuestion.Votes)
        {
            if (vote.Value == correctPlayer)
            {
                // Voter guessed correctly - give them points
                if (room.WouldILieRound.RoundScores.ContainsKey(vote.Key))
                {
                    room.WouldILieRound.RoundScores[vote.Key] += pointsForCorrectGuess;
                }
                else
                {
                    room.WouldILieRound.RoundScores[vote.Key] = pointsForCorrectGuess;
                }
            }
            // If they guessed wrong, they get 0 points (no action needed)
        }

        // Award points to truth teller based on how many people guessed correctly
        var votesForCorrect = room.CurrentQuestion.Votes.Count(v => v.Value == correctPlayer);
        if (room.WouldILieRound.RoundScores.ContainsKey(correctPlayer))
        {
            room.WouldILieRound.RoundScores[correctPlayer] += votesForCorrect * 10;
        }
        else
        {
            room.WouldILieRound.RoundScores[correctPlayer] = votesForCorrect * 10;
        }

        // Update overall player scores immediately so standings are current
        // RoundScores is cumulative for the current round, so we set Player.Score to match
        foreach (var roundScore in room.WouldILieRound.RoundScores)
        {
            var player = room.Players.FirstOrDefault(p => p.Name == roundScore.Key);
            if (player != null)
            {
                // Set player's score to their current round total
                // (RoundScores accumulates points as questions are answered)
                player.Score = roundScore.Value;
            }
        }

        return Task.FromResult(room.WouldILieRound.RoundScores);
    }

    public Task<Dictionary<string, int>> EndRoundAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.WouldILieRound == null)
            return Task.FromResult(new Dictionary<string, int>());

        // Update player scores from round scores
        foreach (var roundScore in room.WouldILieRound.RoundScores)
        {
            var player = room.Players.FirstOrDefault(p => p.Name == roundScore.Key);
            if (player != null)
            {
                player.Score += roundScore.Value;
            }
        }

        // Host gets points equal to lowest scoring player
        var lowestScore = room.WouldILieRound.RoundScores.Values.DefaultIfEmpty(0).Min();
        var host = room.Players.FirstOrDefault(p => p.IsHost);
        if (host != null)
        {
            host.Score += lowestScore;
        }

        room.WouldILieRound.IsActive = false;
        return Task.FromResult(room.WouldILieRound.RoundScores);
    }

    public Task<bool> IsRoundActiveAsync(string roomCode)
    {
        var room = GetRoom(roomCode);
        return Task.FromResult(room?.WouldILieRound?.IsActive ?? false);
    }

    public Question? GetCurrentQuestion(string roomCode)
    {
        var room = GetRoom(roomCode);
        return room?.CurrentQuestion;
    }

    private GameRoom? GetRoom(string roomCode)
    {
        var service = _roomService as GameRoomService;
        return service?.GetRoom(roomCode);
    }
}

