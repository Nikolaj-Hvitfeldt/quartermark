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
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Register application services
builder.Services.AddSingleton<IGameRoomService, GameRoomService>();
builder.Services.AddScoped<IWouldILieService, WouldILieService>();
builder.Services.AddScoped<IContestantGuessService, ContestantGuessService>();
builder.Services.AddScoped<ISignalRNotificationService, SignalRNotificationService>();

var app = builder.Build();

// Configure pipeline
app.UseCors("AllowAll");
app.UseRouting();

app.MapHub<GameHub>("/gamehub");

app.Run();

