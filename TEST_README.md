# Scribble Clone Integration Tests

This directory contains integration tests for the Scribble Clone game server.

## Test Files

### 1. test_reactions.js - Existing Integration Tests
**Status**: All 9 tests passing

Tests the reaction system and rate limiting functionality.

**To run:**
```bash
# Start the server in one terminal
node server.js

# In another terminal, run the tests
node test_reactions.js
```

**What it tests:**
- Room creation and player joining
- Word choices delivery to the drawer
- Game state transitions
- Drawing start event with hint
- Reaction emoji sending and receiving
- Rate limiting (max 1 reaction per player per second)

### 2. test_shake.js - ScreenShake Feature Tests
**Status**: All 8 tests passing

Tests the "67 meme" screenShake feature that triggers visual feedback when a player mentions "67" in chat.

**To run:**
```bash
# This test starts its own server on port 3001
node test_shake.js
```

**What it tests:**
- Room creation with 2 players
- Game start and word selection
- First "67" message triggers screenShake event to all players
- Second "67" message from same player in same round does NOT trigger another screenShake
- Rate limiting per player per round

## How the 67 Meme Works

When a player sends a chat message containing "67":
1. The server checks if this is the first "67" from this player in this round
2. If yes, it broadcasts a `screenShake` event to the entire room
3. If no, the message is sent normally but no screenShake is emitted
4. Rate limiting is tracked using: `${socket.id}-${room.currentRound}`

## Server Details

- **Main file**: `server.js`
- **Default port**: 3000
- **Room storage**: In-memory Map
- **Player tracking**: Managed per room with socket IDs
- **Event handling**: Socket.IO for real-time communication

## Dependencies

- express (web server)
- socket.io (WebSocket server)
- socket.io-client (for tests)
- uuid (room ID generation)

## Test Execution Time

- test_reactions.js: ~4 seconds
- test_shake.js: ~5 seconds

Both tests clean up gracefully by closing connections and processes.
