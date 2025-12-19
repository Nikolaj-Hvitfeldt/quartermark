# QuarterMark

A Jackbox-style party game for New Year's Eve 2025. Players join via their phones while the host displays the game on a TV screen.

## Tech Stack

- **Backend**: ASP.NET Core 8.0 with SignalR
- **Frontend**: React with Vite
- **Real-time**: SignalR for WebSocket communication
- **State**: In-memory (no database required)

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- Node.js 18+ and npm

### Running the Application

1. **Start the Backend**:

   ```bash
   cd src/QuarterMark.Api
   dotnet run
   ```

   The API will run on `http://localhost:5000`

2. **Start the Frontend** (in a new terminal):

   ```bash
   cd src/QuarterMark.Web
   npm install
   npm run dev
   ```

   The web app will run on `http://localhost:3000`

3. **Open the app**:
   - Open `http://localhost:3000` in your browser
   - Click "Create Game (Host)" to create a room
   - Share the room code with players
   - Players click "Join Game (Player)" and enter the code

## Current Features

✅ Room creation with unique 4-letter codes  
✅ Player join via room code  
✅ Real-time player list syncing  
✅ Host screen (TV view)  
✅ Player screen (phone view)

## Planned Features

- Game rounds (Who Said That?, Buzz Quiz, etc.)
- Scoring system
- Leaderboard
- Timer functionality

## Project Structure

```
QuarterMark/
├── src/
│   ├── QuarterMark.Api/     # ASP.NET Core backend with SignalR
│   └── QuarterMark.Web/      # React frontend
└── README.md
```
