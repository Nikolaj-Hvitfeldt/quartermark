# QuarterMark Architecture

This document describes the clean architecture structure of the QuarterMark application.

## Backend Structure (ASP.NET Core)

### Domain Layer (`Domain/`)
Contains core business entities and enums with no dependencies on other layers.

- **Entities/**
  - `Player.cs` - Player entity
  - `GameRoom.cs` - Game room entity
  - `WouldILieRound.cs` - Round entity
  - `Question.cs` - Question entity
  - `Claim.cs` - Claim entity

- **Enums/**
  - `QuestionState.cs` - Question state enumeration

### Application Layer (`Application/`)
Contains business logic interfaces, DTOs, and use cases. This layer depends only on the Domain layer.

- **Interfaces/**
  - `IGameRoomService.cs` - Room management interface
  - `IWouldILieService.cs` - Game round logic interface
  - `ISignalRNotificationService.cs` - Notification service interface

- **DTOs/**
  - `PlayerDto.cs` - Player data transfer object
  - `ClaimDto.cs` - Claim data transfer object

### Infrastructure Layer (`Infrastructure/`)
Contains implementations of application interfaces and external concerns (SignalR, persistence, etc.).

- **Services/**
  - `GameRoomService.cs` - Room management implementation
  - `WouldILieService.cs` - Game round logic implementation
  - `SignalRNotificationService.cs` - SignalR notification implementation

### API Layer (`Hubs/`, `Program.cs`)
Contains SignalR hubs and application configuration. This is the entry point.

- **Hubs/**
  - `GameHub.cs` - SignalR hub (thin layer that delegates to services)

- **Program.cs** - Application startup and dependency injection

## Frontend Structure (React)

### Services (`services/`)
Contains external service integrations and API communication.

- `signalRService.js` - SignalR connection management singleton

### Hooks (`hooks/`)
Contains custom React hooks for state management and business logic.

- `useGameRoom.js` - Game room state and operations
- `useWouldILie.js` - "Would I Lie to You?" game state and operations

### Components (`components/`)
Contains React UI components focused on presentation.

- `HostScreen.jsx` - Host view component
- `PlayerScreen.jsx` - Player view component
- `WouldILieHost.jsx` - Host game view
- `WouldILiePlayer.jsx` - Player game view

## Architecture Principles

1. **Separation of Concerns**: Each layer has a clear responsibility
2. **Dependency Inversion**: High-level modules depend on abstractions (interfaces)
3. **Single Responsibility**: Each class/component has one reason to change
4. **Dependency Flow**: 
   - Domain ← Application ← Infrastructure ← API
   - Components ← Hooks ← Services

## Data Flow

### Backend Flow
1. Client sends SignalR message → `GameHub`
2. `GameHub` validates and delegates to → `IGameRoomService` / `IWouldILieService`
3. Services perform business logic using → Domain entities
4. Services use → `ISignalRNotificationService` to send responses
5. `SignalRNotificationService` sends messages back through → `GameHub`

### Frontend Flow
1. User interaction → Component
2. Component calls → Custom Hook
3. Hook uses → SignalR Service
4. SignalR Service sends/receives messages
5. Hook updates state → Component re-renders

## Benefits

- **Testability**: Business logic is separated from infrastructure
- **Maintainability**: Clear structure makes it easy to find and modify code
- **Scalability**: Easy to add new features or swap implementations
- **Reusability**: Services and hooks can be reused across components

