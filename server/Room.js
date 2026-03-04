const { getRandomWords, generateHint } = require('./words');

// Avatar options matching skribbl.io style
const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F1948A', '#82E0AA', '#F8C471', '#AED6F1', '#D2B4DE',
  '#A3E4D7', '#FAD7A0', '#FADBD8', '#D5F5E3', '#D6EAF8'
];

const AVATAR_EYES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const AVATAR_MOUTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const GAME_STATES = {
  LOBBY: 'lobby',
  CHOOSING: 'choosing',
  DRAWING: 'drawing',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over'
};

class Player {
  constructor(id, name, avatar) {
    this.id = id;
    this.name = name;
    this.avatar = avatar || {
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      eyes: AVATAR_EYES[Math.floor(Math.random() * AVATAR_EYES.length)],
      mouth: AVATAR_MOUTHS[Math.floor(Math.random() * AVATAR_MOUTHS.length)]
    };
    this.score = 0;
    this.roundScore = 0;
    this.hasGuessed = false;
    this.isDrawing = false;
    this.isReady = false;
    this.disconnected = false;
    this.disconnectTimer = null;
    this.votedToKick = new Set();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      score: this.score,
      roundScore: this.roundScore,
      hasGuessed: this.hasGuessed,
      isDrawing: this.isDrawing,
      isReady: this.isReady,
      disconnected: this.disconnected
    };
  }
}

class Room {
  constructor(id, hostId, settings = {}) {
    this.id = id;
    this.hostId = hostId;
    this.players = new Map();
    this.state = GAME_STATES.LOBBY;
    this.currentRound = 0;
    this.currentTurn = 0;
    this.currentWord = null;
    this.currentDrawer = null;
    this.currentDrawerIndex = -1;
    this.wordChoices = [];
    this.usedWords = [];
    this.drawingData = [];
    this.guessedPlayers = [];
    this.turnStartTime = null;
    this.hintLevel = 0;
    this.hintTimer = null;
    this.turnTimer = null;
    this.chooseTimer = null;
    this.messages = [];
    this.kickVotes = new Map(); // playerId -> Set of voterIds
    this.customWords = [];
    this.useCustomWordsOnly = false;

    // Settings (999 = unlimited players)
    this.settings = {
      maxPlayers: Math.min(settings.maxPlayers || 8, 999),
      rounds: settings.rounds || 3,
      drawTime: settings.drawTime || 80,
      hints: settings.hints !== undefined ? settings.hints : 2,
      wordCount: settings.wordCount || 3,
      customWords: settings.customWords || [],
      useCustomWordsOnly: settings.useCustomWordsOnly || false
    };

    if (this.settings.customWords.length > 0) {
      this.customWords = this.settings.customWords;
      this.useCustomWordsOnly = this.settings.useCustomWordsOnly;
    }

    this.createdAt = Date.now();
  }

  addPlayer(id, name, avatar) {
    if (this.players.size >= this.settings.maxPlayers) {
      return { error: 'Room is full' };
    }
    if (this.state !== GAME_STATES.LOBBY && this.state !== GAME_STATES.DRAWING && this.state !== GAME_STATES.CHOOSING) {
      // Allow joining mid-game
    }

    const player = new Player(id, name, avatar);
    this.players.set(id, player);

    if (this.players.size === 1) {
      this.hostId = id;
    }

    return { player };
  }

  removePlayer(id) {
    const player = this.players.get(id);
    if (!player) return null;

    this.players.delete(id);

    // Transfer host
    if (this.hostId === id && this.players.size > 0) {
      this.hostId = this.players.keys().next().value;
    }

    // Remove kick votes
    this.kickVotes.delete(id);
    this.kickVotes.forEach(voters => voters.delete(id));

    return player;
  }

  getPlayerOrder() {
    return Array.from(this.players.values()).filter(p => !p.disconnected);
  }

  startGame() {
    if (this.players.size < 2) {
      return { error: 'Need at least 2 players to start' };
    }

    this.state = GAME_STATES.CHOOSING;
    this.currentRound = 1;
    this.currentDrawerIndex = -1;
    this.usedWords = [];

    // Reset scores
    this.players.forEach(p => {
      p.score = 0;
      p.roundScore = 0;
    });

    return this.nextTurn();
  }

  nextTurn() {
    // Clear timers
    this.clearTimers();

    // Reset player states
    this.players.forEach(p => {
      p.hasGuessed = false;
      p.roundScore = 0;
      p.isDrawing = false;
    });

    this.drawingData = [];
    this.guessedPlayers = [];
    this.currentWord = null;
    this.hintLevel = 0;

    // Get active players
    const activePlayers = this.getPlayerOrder();
    if (activePlayers.length < 2) {
      return this.endGame();
    }

    // Move to next drawer
    this.currentDrawerIndex++;

    // If we've gone through all players, next round
    if (this.currentDrawerIndex >= activePlayers.length) {
      this.currentDrawerIndex = 0;
      this.currentRound++;

      if (this.currentRound > this.settings.rounds) {
        return this.endGame();
      }
    }

    const drawer = activePlayers[this.currentDrawerIndex];
    drawer.isDrawing = true;
    this.currentDrawer = drawer.id;

    // Generate word choices
    this.wordChoices = getRandomWords(this.settings.wordCount, this.usedWords);

    // Mix in custom words if available
    if (this.customWords.length > 0) {
      if (this.useCustomWordsOnly) {
        const available = this.customWords.filter(w => !this.usedWords.includes(w));
        const shuffled = available.sort(() => Math.random() - 0.5);
        this.wordChoices = shuffled.slice(0, this.settings.wordCount);
      } else {
        // Replace one word with custom
        const available = this.customWords.filter(w => !this.usedWords.includes(w));
        if (available.length > 0) {
          const customWord = available[Math.floor(Math.random() * available.length)];
          this.wordChoices[Math.floor(Math.random() * this.wordChoices.length)] = customWord;
        }
      }
    }

    this.state = GAME_STATES.CHOOSING;

    return {
      state: GAME_STATES.CHOOSING,
      drawer: drawer.toJSON(),
      round: this.currentRound,
      totalRounds: this.settings.rounds,
      wordChoices: this.wordChoices
    };
  }

  selectWord(playerId, word) {
    if (playerId !== this.currentDrawer) return null;
    if (!this.wordChoices.includes(word)) return null;

    this.currentWord = word;
    this.usedWords.push(word);
    this.state = GAME_STATES.DRAWING;
    this.turnStartTime = Date.now();
    this.hintLevel = 0;

    const hint = generateHint(this.currentWord, 0);

    return {
      state: GAME_STATES.DRAWING,
      wordLength: this.currentWord.length,
      hint: hint,
      drawTime: this.settings.drawTime
    };
  }

  autoSelectWord() {
    if (this.wordChoices.length === 0) return null;
    const word = this.wordChoices[Math.floor(Math.random() * this.wordChoices.length)];
    return this.selectWord(this.currentDrawer, word);
  }

  checkGuess(playerId, message) {
    const player = this.players.get(playerId);
    if (!player) return null;

    // Can't guess if drawing or already guessed
    if (player.isDrawing || player.hasGuessed) {
      return { type: 'chat', correct: false };
    }

    if (this.state !== GAME_STATES.DRAWING || !this.currentWord) {
      return { type: 'chat', correct: false };
    }

    const guess = message.trim().toLowerCase();
    const word = this.currentWord.toLowerCase();

    // Exact match
    if (guess === word) {
      player.hasGuessed = true;
      this.guessedPlayers.push(playerId);

      // Calculate score
      const timeElapsed = (Date.now() - this.turnStartTime) / 1000;
      const timeRatio = Math.max(0, 1 - (timeElapsed / this.settings.drawTime));
      const positionBonus = Math.max(0, (this.getPlayerOrder().length - this.guessedPlayers.length) / this.getPlayerOrder().length);

      // Guesser score: base 100 + time bonus up to 400 + position bonus up to 100
      const guesserScore = Math.round(100 + (timeRatio * 400) + (positionBonus * 100));
      player.score += guesserScore;
      player.roundScore = guesserScore;

      // Drawer gets points too
      const drawer = this.players.get(this.currentDrawer);
      if (drawer) {
        const drawerBonus = Math.round(50 + (timeRatio * 50));
        drawer.score += drawerBonus;
        drawer.roundScore += drawerBonus;
      }

      // Check if everyone guessed
      const activePlayers = this.getPlayerOrder().filter(p => !p.isDrawing);
      const allGuessed = activePlayers.every(p => p.hasGuessed);

      return {
        type: 'correct',
        correct: true,
        player: player.toJSON(),
        allGuessed
      };
    }

    // Close guess (off by 1-2 chars)
    if (this.isCloseGuess(guess, word)) {
      return { type: 'close', correct: false };
    }

    // Filter the word from chat
    if (guess.includes(word) || word.includes(guess)) {
      return { type: 'filtered', correct: false };
    }

    return { type: 'chat', correct: false };
  }

  isCloseGuess(guess, word) {
    if (Math.abs(guess.length - word.length) > 2) return false;

    // Simple Levenshtein-like check
    let diff = 0;
    const maxLen = Math.max(guess.length, word.length);
    for (let i = 0; i < maxLen; i++) {
      if (guess[i] !== word[i]) diff++;
    }
    return diff <= 2 && diff > 0;
  }

  getHint() {
    if (!this.currentWord) return null;

    this.hintLevel++;
    const revealPercent = this.hintLevel * (1 / (this.settings.hints + 1));
    return generateHint(this.currentWord, Math.min(revealPercent, 0.7));
  }

  endTurn() {
    this.clearTimers();

    const word = this.currentWord;
    const scores = {};

    this.players.forEach(p => {
      scores[p.id] = { score: p.score, roundScore: p.roundScore };
    });

    this.state = GAME_STATES.ROUND_END;

    return {
      state: GAME_STATES.ROUND_END,
      word: word,
      scores: scores
    };
  }

  endGame() {
    this.clearTimers();
    this.state = GAME_STATES.GAME_OVER;

    const rankings = Array.from(this.players.values())
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({
        rank: i + 1,
        ...p.toJSON()
      }));

    return {
      state: GAME_STATES.GAME_OVER,
      rankings
    };
  }

  voteKick(voterId, targetId) {
    if (voterId === targetId) return null;
    if (!this.players.has(voterId) || !this.players.has(targetId)) return null;

    if (!this.kickVotes.has(targetId)) {
      this.kickVotes.set(targetId, new Set());
    }

    const votes = this.kickVotes.get(targetId);
    votes.add(voterId);

    const activeCount = this.getPlayerOrder().length;
    const needed = Math.ceil(activeCount * 0.6); // 60% to kick

    if (votes.size >= needed) {
      this.kickVotes.delete(targetId);
      return { kicked: true, targetId, votes: votes.size, needed };
    }

    return { kicked: false, targetId, votes: votes.size, needed };
  }

  updateSettings(settings) {
    if (settings.maxPlayers) this.settings.maxPlayers = Math.min(settings.maxPlayers, 999);
    if (settings.rounds) this.settings.rounds = Math.min(Math.max(settings.rounds, 2), 10);
    if (settings.drawTime) this.settings.drawTime = Math.min(Math.max(settings.drawTime, 15), 180);
    if (settings.hints !== undefined) this.settings.hints = Math.min(Math.max(settings.hints, 0), 5);
    if (settings.wordCount) this.settings.wordCount = Math.min(Math.max(settings.wordCount, 1), 5);
    if (settings.customWords) {
      this.customWords = settings.customWords.filter(w => w.trim().length > 0);
      this.settings.customWords = this.customWords;
    }
    if (settings.useCustomWordsOnly !== undefined) {
      this.useCustomWordsOnly = settings.useCustomWordsOnly;
      this.settings.useCustomWordsOnly = settings.useCustomWordsOnly;
    }

    return this.settings;
  }

  clearTimers() {
    if (this.turnTimer) { clearTimeout(this.turnTimer); this.turnTimer = null; }
    if (this.hintTimer) { clearInterval(this.hintTimer); this.hintTimer = null; }
    if (this.chooseTimer) { clearTimeout(this.chooseTimer); this.chooseTimer = null; }
  }

  toJSON() {
    return {
      id: this.id,
      hostId: this.hostId,
      state: this.state,
      currentRound: this.currentRound,
      totalRounds: this.settings.rounds,
      currentDrawer: this.currentDrawer,
      settings: this.settings,
      players: Array.from(this.players.values()).map(p => p.toJSON()),
      playerCount: this.players.size
    };
  }
}

module.exports = { Room, Player, GAME_STATES, AVATAR_COLORS };
