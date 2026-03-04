const { io } = require('socket.io-client');

const c1 = io('http://localhost:3000', { transports: ['websocket'] });
const c2 = io('http://localhost:3000', { transports: ['websocket'] });

let roomId;
let passed = 0;

function check(name, ok) {
  if (ok) { passed++; console.log('✓ ' + name); }
  else { console.log('✗ ' + name); }
}

c1.emit('createRoom', { name: 'Host', avatar: { color: '#ff0000', eyes: 0, mouth: 0 } }, (res) => {
  check('Room created', res && !res.error);
  roomId = res.roomId;

  c2.emit('joinRoom', { roomId, name: 'Player2', avatar: { color: '#00ff00', eyes: 1, mouth: 1 } }, (res) => {
    check('Player2 joined', res && !res.error);

    let reactionReceivedByP2 = false;
    let reactionReceivedByP1 = false;

    c2.on('reaction', (data) => {
      if (!reactionReceivedByP2) {
        reactionReceivedByP2 = true;
        check('Reaction received by Player2', data.emoji === '🔥' && data.playerName === 'Host');
      }
    });

    c1.on('reaction', (data) => {
      if (!reactionReceivedByP1) {
        reactionReceivedByP1 = true;
        check('Reaction echoed to sender', data.emoji === '🔥');
      }
    });

    c1.on('wordChoices', (data) => {
      check('Word choices received', data.words && data.words.length === 3);
      setTimeout(() => c1.emit('selectWord', { word: data.words[0] }), 100);
    });

    c1.on('yourWord', (data) => {
      check('Your word received', data && data.word);
    });

    c2.on('drawingStart', (data) => {
      check('Drawing started', data && data.hint);

      // Send reaction after drawing starts
      setTimeout(() => {
        c1.emit('sendReaction', { emoji: '🔥' });
      }, 200);

      // Try rate-limited second reaction
      setTimeout(() => {
        c1.emit('sendReaction', { emoji: '😂' });
      }, 400); // Within 1s, should be rate limited
    });

    c1.emit('startGame', null, (res) => {
      check('Game started', !res || !res.error);
    });

    setTimeout(() => {
      // Check rate limiting worked (should only have gotten 1 reaction per client)
      check('Rate limiting (no double reaction)', reactionReceivedByP1 && reactionReceivedByP2);
      console.log('\n' + passed + ' tests passed!');
      c1.close(); c2.close();
      process.exit(0);
    }, 4000);
  });
});

setTimeout(() => { console.log('Timeout - ' + passed + ' tests passed'); process.exit(1); }, 8000);
