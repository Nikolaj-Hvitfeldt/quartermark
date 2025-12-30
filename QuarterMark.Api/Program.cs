using QuarterMark.Api.Application.Interfaces;
using QuarterMark.Api.Hubs;
using QuarterMark.Api.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        // Try to get from environment variable first (comma-separated)
        var allowedOriginsEnv = Environment.GetEnvironmentVariable("AllowedOrigins");
        string[] allowedOrigins;
        
        if (!string.IsNullOrEmpty(allowedOriginsEnv))
        {
            allowedOrigins = allowedOriginsEnv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }
        else
        {
            // Fall back to configuration or defaults
            allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() 
                ?? new[] { "http://localhost:3000", "http://127.0.0.1:3000" };
        }
        
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Register application services
builder.Services.AddSingleton<IGameRoomService, GameRoomService>();
builder.Services.AddScoped<IWouldILieService, WouldILieService>();
builder.Services.AddScoped<IContestantGuessService, ContestantGuessService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<ISocialMediaGuessService, SocialMediaGuessService>();
builder.Services.AddScoped<IWagerService, WagerService>();
builder.Services.AddScoped<IGameSessionService, GameSessionService>();
builder.Services.AddScoped<ISignalRNotificationService, SignalRNotificationService>();

var app = builder.Build();

// Configure pipeline
app.UseCors("AllowAll");
app.UseRouting();

app.MapHub<GameHub>("/gamehub");

// Get port from environment variable (Render sets PORT)
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    app.Run($"http://0.0.0.0:{port}");
}
else
{
    app.Run();
}

