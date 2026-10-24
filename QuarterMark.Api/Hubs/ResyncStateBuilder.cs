using QuarterMark.Api.Application.DTOs;
using QuarterMark.Api.Domain.Entities;
using QuarterMark.Api.Domain.Enums;

namespace QuarterMark.Api.Hubs;

/// <summary>
/// Builds a snapshot of where the room is right now, so a device that was away (screen lock,
/// tab switch, reload) can put itself back on the right screen instead of the lobby.
/// Collections are copied because the result is serialized after the room lock is released.
/// </summary>
public static class ResyncStateBuilder
{
    public const string WouldILie = "WouldILie";
    public const string ContestantGuess = "ContestantGuess";
    public const string Quiz = "Quiz";
    public const string SocialMediaGuess = "SocialMediaGuess";
    public const string Wager = "Wager";

    public static object Build(GameRoom room, Player me, List<PlayerDto> players)
    {
        var session = room.GameSession;
        var activeGame = GetActiveGame(room);

        // Between games the players sit on the completion screen of the last finished game
        object? completedGame = null;
        if (activeGame == null && session is { IsActive: true } && session.CompletedGames.Count > 0)
        {
            completedGame = new
            {
                gameType = session.CompletedGames[^1],
                gameNumber = session.CurrentGameNumber
            };
        }

        return new
        {
            roomCode = room.RoomCode,
            isHost = me.IsHost,
            playerName = me.Name,
            players,
            session = session == null ? null : new
            {
                isActive = session.IsActive,
                currentGameNumber = session.CurrentGameNumber,
                accumulatedScores = new Dictionary<string, int>(session.AccumulatedScores)
            },
            activeGame,
            completedGame,
            game = activeGame switch
            {
                WouldILie => BuildWouldILie(room.WouldILieRound!, me),
                ContestantGuess => BuildImageGuess(
                    room.ContestantGuessRound!.Questions.LastOrDefault(), room.ContestantGuessRound.RoundScores, me,
                    q => (q.ImageUrl, q.PossibleAnswers, q.Guesses, q.CorrectAnswer, q.IsRevealed, (string?)null)),
                SocialMediaGuess => BuildImageGuess(
                    room.SocialMediaGuessRound!.Questions.LastOrDefault(), room.SocialMediaGuessRound.RoundScores, me,
                    q => (q.ImageUrl, q.PossibleAnswers, q.Guesses, q.CorrectAnswer, q.IsRevealed, q.RevealImageUrl)),
                Quiz => BuildQuiz(room.QuizRound!, me),
                Wager => BuildWager(room.WagerRound!, me),
                _ => null
            }
        };
    }

    /// <summary>The game whose round is running, or null in the lobby / between games.</summary>
    public static string? GetActiveGame(GameRoom room) => room.CurrentGame switch
    {
        WouldILie when room.WouldILieRound?.IsActive == true => WouldILie,
        ContestantGuess when room.ContestantGuessRound?.IsActive == true => ContestantGuess,
        Quiz when room.QuizRound?.IsActive == true => Quiz,
        SocialMediaGuess when room.SocialMediaGuessRound?.IsActive == true => SocialMediaGuess,
        Wager when room.WagerRound?.IsActive == true => Wager,
        _ => null
    };

    private static object BuildWouldILie(WouldILieRound round, Player me)
    {
        var q = round.Questions.LastOrDefault();
        if (q == null)
            return new { hasQuestion = false };

        var claimers = q.Claims.Select(c => c.PlayerName).ToList();
        return new
        {
            hasQuestion = true,
            imageUrl = q.ImageUrl,
            assignedPlayers = q.LiarNames.Append(q.TruthTellerName).ToList(),
            claims = claimers.Select(name => new ClaimDto { PlayerName = name }).ToList(),
            claimers,
            truthTellerName = q.TruthTellerName,
            votingStarted = q.State is QuestionState.Voting or QuestionState.Revealed,
            myVote = q.Votes.GetValueOrDefault(me.Name),
            revealed = q.IsRevealed
                ? new
                {
                    correctPlayer = q.TruthTellerName,
                    votes = new Dictionary<string, string>(q.Votes),
                    roundScores = new Dictionary<string, int>(round.RoundScores)
                }
                : null
        };
    }

    private static object BuildImageGuess<TQuestion>(
        TQuestion? q,
        Dictionary<string, int> roundScores,
        Player me,
        Func<TQuestion, (string ImageUrl, List<string> PossibleAnswers, Dictionary<string, string> Guesses, string CorrectAnswer, bool IsRevealed, string? RevealImageUrl)> fields)
        where TQuestion : class
    {
        if (q == null)
            return new { hasQuestion = false };

        var f = fields(q);
        return new
        {
            hasQuestion = true,
            imageUrl = f.ImageUrl,
            possibleAnswers = f.PossibleAnswers.ToList(),
            myAnswer = f.Guesses.GetValueOrDefault(me.Name),
            revealed = f.IsRevealed
                ? new
                {
                    correctAnswer = f.CorrectAnswer,
                    guesses = new Dictionary<string, string>(f.Guesses),
                    revealImageUrl = f.RevealImageUrl,
                    roundScores = new Dictionary<string, int>(roundScores)
                }
                : null
        };
    }

    private static object BuildQuiz(QuizRound round, Player me)
    {
        var q = round.Questions.LastOrDefault();
        if (q == null)
            return new { hasQuestion = false };

        return new
        {
            hasQuestion = true,
            questionText = q.QuestionText,
            imageUrl = q.ImageUrl,
            possibleAnswers = q.PossibleAnswers.ToList(),
            myAnswer = q.Guesses.GetValueOrDefault(me.Name),
            revealed = q.IsRevealed
                ? new
                {
                    correctAnswer = q.CorrectAnswer,
                    guesses = new Dictionary<string, string>(q.Guesses),
                    roundScores = new Dictionary<string, int>(round.RoundScores)
                }
                : null
        };
    }

    private static object BuildWager(WagerRound round, Player me)
    {
        var q = round.Questions.LastOrDefault();
        if (q == null)
            return new { hasQuestion = false };

        return new
        {
            hasQuestion = true,
            questionId = q.QuestionId,
            questionText = q.QuestionText,
            possibleAnswers = q.PossibleAnswers.ToList(),
            wagersClosed = q.WagersClosed,
            myWager = q.Wagers.TryGetValue(me.Name, out var wager) ? wager : (int?)null,
            myAnswer = q.Guesses.GetValueOrDefault(me.Name),
            revealed = q.IsRevealed
                ? new
                {
                    correctAnswer = q.CorrectAnswer,
                    guesses = new Dictionary<string, string>(q.Guesses),
                    wagers = new Dictionary<string, int>(q.Wagers),
                    roundScores = new Dictionary<string, int>(round.RoundScores)
                }
                : null
        };
    }
}
