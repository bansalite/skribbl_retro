const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { io: ioClient } = require('socket.io-client');
const { v4: uuidv4 } = require('uuid');

// Start the server programmatically
const app = express();
const server = http.createServer(app);
const PORT = 3001; // Use a different port to avoid conflicts

// Import room and word generation
const { Room, GAME_STATES } = require('./server/Room');
const { generateHint } = require('./server/words');

const ioServer = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 5e6,
  pingTimeout: 30000,
  pingInterval: 10000
});

// Room storage
const rooms = new Map();
const playerRooms = new Map();
const playerReactionTimes = new Map();
const player67Used = new Map();

// Socket.IO event handlers
ioServer.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('createRoom', ({ name, avatar, settings }, callback) => {
    const roomId = generateRoomId();
    const room = new Room(roomId, socket.id, settings);
    const result = room.addPlayer(socket.id, name, avatar);

    if (result.error) {
      return callback({ error: result.error });
    }

    rooms.set(roomId, room);
    playerRooms.set(socket.id, roomId);
    socket.join(roomId);

    callback({ roomId, room: room.toJSON(), player: result.player.toJSON() });
  });

  socket.on('joinRoom', ({ roomId, name, avatar }, callback) => {
    const room = rooms.get(roomId);
    if (!room) {
      return callback({ error: 'Room not found' });
    }

    if (room.players.size >= room.settings.maxPlayers) {
      return callback({ error: 'Room is full' });
    }

    const result = room.addPlayer(socket.id, name, avatar);
    if (result.error) {
      return callback({ error: result.error });
    }

    playerRooms.set(socket.id, roomId);
    socket.join(roomId);

    socket.to(roomId).emit('playerJoined', {
      player: result.player.toJSON(),
      playerCount: room.players.size
    });

    callback({ roomId, room: room.toJSON(), player: result.player.toJSON() });
  });

  socket.on('startGame', (data, callback) => {
    const roomId = playerRooms.get(socket.id);
    const room = rooms.get(roomId);

    if (!room) {
      return callback({ error: 'Room not found' });
    }

    if (room.hostId !== socket.id) {
      return callback({ error: 'Only host can start game' });
    }

    if (room.players.size < 2) {
      return callback({ error: 'Need at least 2 players' });
    }

    room.startGame();

    // Send word choices to drawer
    const drawer = Array.from(room.players.values()).find(p => p.isDrawing);
    if (drawer) {
      ioServer.to(drawer.socketId).emit('wordChoices', {
        words: ['apple', 'banana', 'cherry']
      });
    }

    ioServer.to(roomId).emit('gameStarted', { state: room.toJSON().state });
    callback({ ok: true });
  });

  socket.on('selectWord', ({ word }, callback) => {
    const roomId = playerRooms.get(socket.id);
    const room = rooms.get(roomId);

    if (!room) {
      return callback({ error: 'Room not found' });
    }

    const player = room.players.get(socket.id);
    if (!player || !player.isDrawing) {
      return callback({ error: 'Player is not the drawer' });
    }

    room.currentWord = word;
    ioServer.to(socket.id).emit('yourWord', { word: word });
    ioServer.to(roomId).emit('drawingStart', { hint: generateHint(word) });

    callback({ ok: true });
  });

  socket.on('sendChat', ({ message }, callback) => {
    const roomId = playerRooms.get(socket.id);
    const room = rooms.get(roomId);

    if (!room) {
      return callback({ error: 'Room not found' });
    }

    const player = room.players.get(socket.id);
    if (!player) {
      return callback({ error: 'Player not found' });
    }

    // 67 meme — screen shake (once per user per round)
    if (message.includes('67')) {
      const roundKey = `${socket.id}-${room.currentRound}`;
      if (!player67Used.has(roundKey)) {
        player67Used.set(roundKey, true);
        ioServer.to(roomId).emit('screenShake', { playerName: player.name, type: '67' });
      }
    }

    // Send chat message to all
    ioServer.to(roomId).emit('chatMessage', {
      playerId: socket.id,
      playerName: player.name,
      message: message
    });

    callback({ ok: true });
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    const roomId = playerRooms.get(socket.id);
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.removePlayer(socket.id);
        if (room.players.size === 0) {
          rooms.delete(roomId);
        } else {
          ioServer.to(roomId).emit('playerLeft', { playerCount: room.players.size });
        }
      }
      playerRooms.delete(socket.id);
    }
  });
});

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

let testCompleted = false;

// Start the test
server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);

  // Give the server a moment to start
  setTimeout(() => {
    runTests();
  }, 100);
});

function runTests() {
  const client1 = ioClient(`http://localhost:${PORT}`, { transports: ['websocket'] });
  const client2 = ioClient(`http://localhost:${PORT}`, { transports: ['websocket'] });

  let roomId;
  let passed = 0;
  let screenShakeCount = 0;
  let screenShakeEvents = [];

  function check(name, ok) {
    if (ok) {
      passed++;
      console.log('✓ ' + name);
    } else {
      console.log('✗ ' + name);
    }
  }

  function finish() {
    if (testCompleted) return;
    testCompleted = true;

    console.log('\n' + passed + ' tests passed!');
    console.log(`Total screenShake events: ${screenShakeCount}`);
    console.log(`screenShake events received:`, screenShakeEvents);

    client1.disconnect();
    client2.disconnect();
    server.close(() => {
      process.exit(passed === 8 ? 0 : 1);
    });
  }

  // Listen for screenShake on both clients
  client1.on('screenShake', (data) => {
    screenShakeCount++;
    screenShakeEvents.push({ from: 'client1', data: data, count: screenShakeCount });
    console.log(`  screenShake #${screenShakeCount} received on client1:`, data);
  });

  client2.on('screenShake', (data) => {
    screenShakeCount++;
    screenShakeEvents.push({ from: 'client2', data: data, count: screenShakeCount });
    console.log(`  screenShake #${screenShakeCount} received on client2:`, data);
  });

  // Client1 creates room
  client1.emit('createRoom', { name: 'Host', avatar: { color: '#ff0000', eyes: 0, mouth: 0 } }, (res) => {
    check('Room created', res && !res.error);
    roomId = res.roomId;

    // Client2 joins room
    client2.emit('joinRoom', { roomId, name: 'Player2', avatar: { color: '#00ff00', eyes: 1, mouth: 1 } }, (res) => {
      check('Player2 joined', res && !res.error);

      // Start game
      client1.emit('startGame', null, (res) => {
        check('Game started', !res || !res.error);

        // Wait a moment for wordChoices to arrive
        setTimeout(() => {
          client1.emit('selectWord', { word: 'test' }, (res) => {
            check('Word selected', !res || !res.error);

            // Wait for drawingStart to be received
            setTimeout(() => {
              // First "67" message from client2 (should trigger screenShake)
              console.log('\n[TEST] Sending first "67" message from Player2...');
              client2.emit('sendChat', { message: 'This is a 67 message' }, (res) => {
                check('First chat message sent', res && res.ok);

                // Wait a moment for screenShake event
                setTimeout(() => {
                  const shakeCountAfterFirst = screenShakeCount;
                  check('First "67" triggers screenShake', shakeCountAfterFirst > 0);

                  // Second "67" message from client2 in same round (should NOT trigger another screenShake)
                  console.log('\n[TEST] Sending second "67" message from Player2 (same round)...');
                  client2.emit('sendChat', { message: 'Another 67 here' }, (res) => {
                    check('Second chat message sent', res && res.ok);

                    // Wait a moment to confirm no additional screenShake is emitted
                    setTimeout(() => {
                      const shakeCountAfterSecond = screenShakeCount;
                      check('Second "67" does NOT trigger screenShake', shakeCountAfterSecond === shakeCountAfterFirst);

                      finish();
                    }, 500);
                  });
                }, 500);
              });
            }, 500);
          });
        }, 500);
      });
    });
  });

  setTimeout(() => {
    console.log('Timeout - ' + passed + ' tests passed');
    finish();
  }, 10000);
}
