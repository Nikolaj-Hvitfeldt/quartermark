# QuarterMark

**QuarterMark** is a Jackbox-style party game you run in the browser. One person hosts on a large screen (TV or projector); everyone else joins on their phones with a short room code. The host advances rounds; answers and scores sync in real time—no installs for players.

The experience is built around a New Year’s Eve theme: fireworks, confetti, and a curated set of mini-games and breaks suited to a group celebration.

---

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [How to play](#how-to-play)
- [Mini-games](#mini-games)
- [Configuration and content](#configuration-and-content)
- [Production builds](#production-builds)
- [Repository layout](#repository-layout)

---

## Features

- **Room codes** — Four-letter codes for quick joins; host creates the session, players enter the code.
- **Dual UI** — Dedicated host (TV) and player (phone) views for the same session.
- **Live sync** — Player list, answers, reveals, and scores via SignalR.
- **Full session flow** — Multiple mini-games in order, standings between rounds, drinking-wheel breaks, and a final podium for the top three.
- **Scoring** — Points per game, leaderboards, blind wagering where the design calls for it.
- **Lobby setup** — Pre-configure rounds for “Would I Lie to You?” before you start.
- **Internationalization** — English and Danish (`i18next` + locale JSON).
- **No database** — Session state lives in memory on the API; ideal for ephemeral party use.

---

## Architecture

| Layer | Technology |
|--------|------------|
| API | ASP.NET Core 8.0, SignalR hub (`/gamehub`) |
| Web | React 18, TypeScript, Vite 5 |
| Real-time | `@microsoft/signalr` client ↔ server hub |
| Client state | Zustand; TanStack React Query where data is fetched |
| Persistence | None (in-memory game rooms on the server) |

In local development, Vite serves the SPA on port **3000** and **proxies** WebSocket and HTTP traffic for `/gamehub` to the API on **5000** (see `QuarterMark.Web/vite.config.ts`).

---

## Requirements

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) 18 or newer and npm

---

## Getting started

### 1. Start the API

```bash
cd QuarterMark.Api
dotnet run
```

The API listens on **http://localhost:5000** (see `Properties/launchSettings.json`).

### 2. Start the web app

In a second terminal:

```bash
cd QuarterMark.Web
npm install
npm run dev
```

The app is served at **http://localhost:3000** with the dev proxy targeting the API for SignalR.

### 3. Open the game

1. Open `http://localhost:3000` in a browser.
2. Choose **Create Game (Host)** on the device that will be shown to the group.
3. Share the room code with players.
4. On each phone, choose **Join Game (Player)** and enter the code.

---

## How to play

- **Host** — Creates the room, sees prompts and results meant for the big screen, and controls progression through the session.
- **Players** — Join with the code, answer on their own devices, and see personal prompts where appropriate.

Because state is in-memory, restarting the API clears active rooms. For a stable party night, keep the API process running for the duration of the event.

---

## Mini-games

Games run in a fixed sequence as part of one session:

1. **Would I Lie to You?** — Bluffing and voting on who is telling the truth.
2. **Contestant Guess** — Guess identities from stylized or morphed celebrity-style images.
3. **Quiz of 2025** — Timed multiple-choice questions about the year, with speed bonuses.
4. **Social Media Deep Dive** — Match posts to the right person in the group.
5. **All-In Wager** — Blind bets on questions tied to the host.

**Drinking Wheel** — Short wheel segment between selected games (e.g. between games 2–3 and 4–5) for optional party rules.

---

## Configuration and content

- **Translations** — `QuarterMark.Web/src/locales/en.json` and `da.json`; i18n wiring in `src/i18n/`.
- **Questions and copy** — Under `QuarterMark.Web/src/data/` (quiz, wager, social media, contestant guess, rules, etc.) and related image assets under `QuarterMark.Web/public/images/`.
- **API settings** — `QuarterMark.Api/appsettings.json` and environment-specific `appsettings.*.json`.

---

## Production builds

**Frontend**

```bash
cd QuarterMark.Web
npm install
npm run build
```

Static output is written to `dist/`. A `vercel.json` is included for SPA-style rewrites on Vercel.

**Backend**

```bash
cd QuarterMark.Api
dotnet publish -c Release -o ./publish
```

**SignalR URL** — When the web app is not served from the same origin as the API (for example static hosting + separate API), set the base URL of the API so the client can reach the hub:

```bash
# Example: build-time env for Vite
set VITE_API_URL=https://your-api.example.com
npm run build
```

The client resolves the hub as `{VITE_API_URL}/gamehub` (see `src/services/signalRService.ts`). If unset, it defaults to `http://localhost:5000` for local use.

Ensure the API allows the browser origin (CORS) and WebSockets for your production host if they differ from development defaults.

---

## Repository layout

```
QuarterMark/
├── QuarterMark.Api/          # ASP.NET Core host, SignalR, in-memory session logic
│   ├── Application/
│   ├── Domain/
│   ├── Hubs/
│   ├── Infrastructure/
│   └── Properties/
├── QuarterMark.Web/          # React + Vite SPA
│   ├── public/
│   └── src/
│       ├── components/
│       ├── data/
│       ├── hooks/
│       ├── i18n/
│       ├── locales/
│       ├── services/
│       ├── stores/
│       ├── types/
│       └── utils/
└── README.md
```

---

## License

This repository does not include a license file. If you plan to distribute or reuse the project, add a `LICENSE` that matches your intent.
