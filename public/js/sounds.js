// ===== 8-BIT RETRO SOUND SYNTHESIZER =====
class GameAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    try { this.isMuted = localStorage.getItem('skribbl-muted') === 'true'; } catch(e) {}
  }

  _ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  _playTone(freq, duration, type = 'square', volume = 0.12, delay = 0) {
    if (this.isMuted) return;
    const ctx = this._ensureContext();
    const now = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  _playSweep(startFreq, endFreq, duration, type = 'square', volume = 0.12, delay = 0) {
    if (this.isMuted) return;
    const ctx = this._ensureContext();
    const now = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.linearRampToValueAtTime(endFreq, now + duration * 0.6);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Timer tick — soft blip every second when ≤10s
  playTick() {
    this._playTone(440, 0.08, 'sine', 0.08);
  }

  // Warning beep — urgent double-pulse when ≤5s
  playWarningBeep() {
    this._playTone(660, 0.06, 'square', 0.1, 0);
    this._playTone(660, 0.06, 'square', 0.1, 0.1);
  }

  // Correct guess ding — cheerful ascending chime
  playDing() {
    this._playTone(880, 0.15, 'sine', 0.15, 0);
    this._playTone(1100, 0.2, 'sine', 0.12, 0.1);
  }

  // Victory fanfare — 8-bit triumph melody
  playFanfare() {
    // C5 - E5 - G5 - C6 (ascending major chord arpeggio)
    this._playTone(523, 0.2, 'square', 0.12, 0);
    this._playTone(659, 0.2, 'square', 0.12, 0.18);
    this._playTone(784, 0.2, 'square', 0.12, 0.36);
    this._playTone(1047, 0.45, 'square', 0.14, 0.54);
    // Harmony layer
    this._playTone(523, 0.5, 'sine', 0.06, 0.54);
    this._playTone(784, 0.5, 'sine', 0.06, 0.54);
  }

  // Reaction click — tiny blip
  playReactionClick() {
    this._playTone(600, 0.05, 'sine', 0.08);
  }

  // Word select confirm — quick ascending sweep
  playWordSelect() {
    this._playSweep(500, 900, 0.15, 'square', 0.1);
  }

  // Player joined — friendly bloop
  playJoin() {
    this._playSweep(300, 500, 0.12, 'sine', 0.08);
  }

  // Drawing start — game-on beep
  playDrawingStart() {
    this._playTone(600, 0.08, 'square', 0.08, 0);
    this._playTone(800, 0.12, 'square', 0.1, 0.1);
  }

  // Turn end — descending tone
  playTurnEnd() {
    this._playSweep(600, 300, 0.2, 'sine', 0.08);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try { localStorage.setItem('skribbl-muted', this.isMuted.toString()); } catch(e) {}
    return this.isMuted;
  }
}

// Global instance
const gameAudio = new GameAudio();
