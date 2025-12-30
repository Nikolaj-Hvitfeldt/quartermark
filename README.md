# QuarterMark

A Jackbox-style party game for New Year's Eve 2025. Players join via their phones while the host displays the game on a TV screen.

## Tech Stack

- **Backend**: ASP.NET Core 8.0 with SignalR
- **Frontend**: React with Vite, TypeScript
- **Real-time**: SignalR for WebSocket communication
- **State Management**: Zustand stores, React Query for data fetching
- **Internationalization**: i18next with English and Danish support
- **State**: In-memory (no database required)

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- Node.js 18+ and npm

### Running the Application

1. **Start the Backend**:

   ```bash
   cd QuarterMark.Api
   dotnet run
   ```

   The API will run on `http://localhost:5000`

2. **Start the Frontend** (in a new terminal):

   ```bash
   cd QuarterMark.Web
   npm install
   npm run dev
   ```

   The web app will run on `http://localhost:3000`

3. **Open the app**:
   - Open `http://localhost:3000` in your browser
   - Click "Create Game (Host)" to create a room
   - Share the room code with players
   - Players click "Join Game (Player)" and enter the code

## Games

The application includes 5 mini-games played in sequence:

1. **Would I Lie to You?** - Bluffing game where players vote on who's telling the truth
2. **Contestant Guess** - Identify contestants hidden in AI-morphed celebrity photos
3. **Quiz of 2025** - Multiple choice quiz about events from 2025 with speed bonuses
4. **Social Media Deep Dive** - Guess who posted various social media posts
5. **All-In Wager** - Double-or-nothing betting game with questions about the host

A **Drinking Wheel** minigame appears between games 2-3 and 4-5.

## Features

✅ Room creation with unique 4-letter codes  
✅ Player join via room code  
✅ Real-time player list syncing  
✅ Host screen (TV view) and Player screen (phone view)  
✅ 5-game session system  
✅ Scoring system with points tracking  
✅ Leaderboards and standings screens between questions  
✅ Final results screen with podium for top 3 players  
✅ Game configuration (pre-configure "Would I Lie" rounds in lobby)  
✅ Internationalization: English and Danish language support  
✅ Blind wagering system (wager before seeing questions)  
✅ Real-time answer submission and reveal  
✅ New Year's Eve themed UI with animations and effects

## Project Structure

```
QuarterMark/
├── QuarterMark.Api/           # ASP.NET Core backend with SignalR
│   ├── Domain/                # Domain entities and enums
│   ├── Application/           # Business logic interfaces
│   ├── Infrastructure/        # Service implementations
│   └── Hubs/                  # SignalR hubs
├── QuarterMark.Web/          # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand state stores
│   │   ├── services/          # API and SignalR services
│   │   ├── data/              # Game questions and configuration
│   │   ├── utils/             # Utility functions
│   │   ├── locales/           # Translation files (en.json, da.json)
│   │   └── i18n/              # i18n configuration
│   └── public/images/         # Game images
└── README.md
```
