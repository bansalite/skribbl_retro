// ===== RETRO ARCADE BACKGROUND EFFECTS v3 =====
// Dense, alive animated canvas background

(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'bgCanvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  const NEON = ['#00fff2','#39ff14','#ff2cf1','#ffe600','#ff6600','#4488ff','#b44aff','#ff003c','#00ff88','#ffaa00','#ff69b4','#7df9ff'];
  const GRID_SIZE = 60;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const rng = (a, b) => a + Math.random() * (b - a);

  // =====================================================
  // DOODLE DRAWERS — 24 icon types
  // =====================================================
  const DD = [
    // 0: Pencil
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.moveTo(-s*.4,s*.4);c.lineTo(s*.2,-s*.2);c.lineTo(s*.4,-s*.4);c.stroke();c.beginPath();c.moveTo(s*.15,-s*.15);c.lineTo(s*.35,-s*.35);c.lineTo(s*.4,-s*.2);c.closePath();c.stroke();},
    // 1: Star
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();for(let i=0;i<5;i++){const a=(i*4*Math.PI)/5-Math.PI/2;c[i===0?'moveTo':'lineTo'](Math.cos(a)*s*.4,Math.sin(a)*s*.4);const b=a+Math.PI/5;c.lineTo(Math.cos(b)*s*.18,Math.sin(b)*s*.18);}c.closePath();c.stroke();},
    // 2: Heart
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.moveTo(0,s*.3);c.bezierCurveTo(-s*.4,s*.05,-s*.4,-s*.25,0,-s*.1);c.bezierCurveTo(s*.4,-s*.25,s*.4,s*.05,0,s*.3);c.stroke();},
    // 3: Lightning
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.moveTo(s*.05,-s*.4);c.lineTo(-s*.15,0);c.lineTo(s*.1,-s*.02);c.lineTo(-s*.05,s*.4);c.stroke();},
    // 4: Question mark
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.8;c.beginPath();c.arc(0,-s*.12,s*.16,Math.PI,0,false);c.quadraticCurveTo(s*.16,s*.06,0,s*.12);c.stroke();c.fillStyle=c._c;c.beginPath();c.arc(0,s*.26,s*.03,0,Math.PI*2);c.fill();},
    // 5: Palette
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.arc(0,0,s*.3,0,Math.PI*2);c.stroke();['#ff2cf1','#39ff14','#ffe600','#4488ff'].forEach((col,i)=>{const a=(i/4)*Math.PI*2-Math.PI/4;c.fillStyle=col;c.globalAlpha=.6;c.beginPath();c.arc(Math.cos(a)*s*.16,Math.sin(a)*s*.16,s*.06,0,Math.PI*2);c.fill();});c.globalAlpha=1;},
    // 6: Trophy
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.moveTo(-s*.2,-s*.3);c.lineTo(-s*.15,s*.05);c.quadraticCurveTo(0,s*.2,s*.15,s*.05);c.lineTo(s*.2,-s*.3);c.stroke();c.beginPath();c.moveTo(-s*.12,s*.25);c.lineTo(s*.12,s*.25);c.stroke();c.beginPath();c.moveTo(0,s*.08);c.lineTo(0,s*.25);c.stroke();},
    // 7: Gamepad
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;try{c.beginPath();c.roundRect(-s*.3,-s*.15,s*.6,s*.3,s*.1);c.stroke();}catch(e){c.beginPath();c.rect(-s*.3,-s*.15,s*.6,s*.3);c.stroke();}c.beginPath();c.moveTo(-s*.15,-s*.04);c.lineTo(-s*.15,s*.04);c.moveTo(-s*.19,0);c.lineTo(-s*.11,0);c.stroke();c.beginPath();c.arc(s*.12,-s*.04,s*.03,0,Math.PI*2);c.stroke();c.beginPath();c.arc(s*.18,s*.02,s*.03,0,Math.PI*2);c.stroke();},
    // 8: Eye
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.moveTo(-s*.35,0);c.quadraticCurveTo(0,-s*.3,s*.35,0);c.quadraticCurveTo(0,s*.3,-s*.35,0);c.stroke();c.fillStyle=c._c;c.beginPath();c.arc(0,0,s*.1,0,Math.PI*2);c.fill();},
    // 9: Music note
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.8;c.beginPath();c.moveTo(0,-s*.35);c.lineTo(0,s*.2);c.stroke();c.fillStyle=c._c;c.beginPath();c.ellipse(-s*.08,s*.22,s*.12,s*.08,0,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(0,-s*.35);c.lineTo(s*.2,-s*.25);c.stroke();},
    // 10: Clock
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.arc(0,0,s*.3,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(0,0);c.lineTo(0,-s*.2);c.moveTo(0,0);c.lineTo(s*.14,s*.06);c.stroke();},
    // 11: Crown
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.moveTo(-s*.3,s*.2);c.lineTo(-s*.3,-s*.1);c.lineTo(-s*.15,-s*.02);c.lineTo(0,-s*.25);c.lineTo(s*.15,-s*.02);c.lineTo(s*.3,-s*.1);c.lineTo(s*.3,s*.2);c.closePath();c.stroke();},
    // 12: Diamond
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.moveTo(0,-s*.35);c.lineTo(s*.25,0);c.lineTo(0,s*.35);c.lineTo(-s*.25,0);c.closePath();c.stroke();c.beginPath();c.moveTo(-s*.25,0);c.lineTo(0,-s*.1);c.lineTo(s*.25,0);c.stroke();},
    // 13: Smiley
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.arc(0,0,s*.3,0,Math.PI*2);c.stroke();c.fillStyle=c._c;c.beginPath();c.arc(-s*.1,-s*.08,s*.04,0,Math.PI*2);c.fill();c.beginPath();c.arc(s*.1,-s*.08,s*.04,0,Math.PI*2);c.fill();c.strokeStyle=c._c;c.beginPath();c.arc(0,s*.04,s*.12,.1*Math.PI,.9*Math.PI);c.stroke();},
    // 14: Paintbrush
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.moveTo(-s*.35,s*.35);c.lineTo(s*.05,-s*.05);c.stroke();c.beginPath();c.moveTo(s*.05,-s*.05);c.quadraticCurveTo(s*.25,-s*.35,s*.35,-s*.15);c.quadraticCurveTo(s*.15,-s*.05,s*.05,-s*.05);c.stroke();},
    // 15: Exclamation
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=2.5;c.beginPath();c.moveTo(0,-s*.35);c.lineTo(0,s*.12);c.stroke();c.fillStyle=c._c;c.beginPath();c.arc(0,s*.28,s*.04,0,Math.PI*2);c.fill();},
    // 16: Spiral
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.3;c.beginPath();for(let a=0;a<Math.PI*6;a+=.15){const r=s*.05+a*s*.04;c[a===0?'moveTo':'lineTo'](Math.cos(a)*r,Math.sin(a)*r);}c.stroke();},
    // 17: Arrow up
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.8;c.beginPath();c.moveTo(0,-s*.35);c.lineTo(0,s*.35);c.stroke();c.beginPath();c.moveTo(-s*.2,-s*.1);c.lineTo(0,-s*.35);c.lineTo(s*.2,-s*.1);c.stroke();},
    // 18: Crosshair / target
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.3;c.beginPath();c.arc(0,0,s*.3,0,Math.PI*2);c.stroke();c.beginPath();c.arc(0,0,s*.15,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(-s*.38,0);c.lineTo(s*.38,0);c.moveTo(0,-s*.38);c.lineTo(0,s*.38);c.stroke();},
    // 19: Infinity
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(s*.2,-s*.3,s*.4,-s*.3,s*.4,0);c.bezierCurveTo(s*.4,s*.3,s*.2,s*.3,0,0);c.bezierCurveTo(-s*.2,-s*.3,-s*.4,-s*.3,-s*.4,0);c.bezierCurveTo(-s*.4,s*.3,-s*.2,s*.3,0,0);c.stroke();},
    // 20: Pixel ghost (pac-man style)
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();c.arc(0,-s*.05,s*.25,Math.PI,0,false);c.lineTo(s*.25,s*.25);c.lineTo(s*.12,s*.15);c.lineTo(0,s*.25);c.lineTo(-s*.12,s*.15);c.lineTo(-s*.25,s*.25);c.closePath();c.stroke();c.fillStyle=c._c;c.beginPath();c.arc(-s*.08,-s*.1,s*.04,0,Math.PI*2);c.arc(s*.08,-s*.1,s*.04,0,Math.PI*2);c.fill();},
    // 21: Cube (3D)
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.3;const o=s*.1;c.beginPath();c.rect(-s*.2,-s*.2,s*.3,s*.3);c.stroke();c.beginPath();c.rect(-s*.2+o,-s*.2-o,s*.3,s*.3);c.stroke();c.beginPath();c.moveTo(-s*.2,-s*.2);c.lineTo(-s*.2+o,-s*.2-o);c.moveTo(s*.1,-s*.2);c.lineTo(s*.1+o,-s*.2-o);c.moveTo(s*.1,s*.1);c.lineTo(s*.1+o,s*.1-o);c.moveTo(-s*.2,s*.1);c.lineTo(-s*.2+o,s*.1-o);c.stroke();},
    // 22: Waveform
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=1.5;c.beginPath();for(let x=-s*.4;x<=s*.4;x+=2){const y=Math.sin(x*0.15)*s*.2;c[x===-s*.4?'moveTo':'lineTo'](x,y);}c.stroke();},
    // 23: Hashtag
    (c,s)=>{c.strokeStyle=c._c;c.lineWidth=2;const g=s*.12;c.beginPath();c.moveTo(-g,-s*.3);c.lineTo(-g,s*.3);c.moveTo(g,-s*.3);c.lineTo(g,s*.3);c.moveTo(-s*.3,-g);c.lineTo(s*.3,-g);c.moveTo(-s*.3,g);c.lineTo(s*.3,g);c.stroke();}
  ];

  // =====================================================
  // DOODLES — 40 floating icons
  // =====================================================
  const doodles = [];
  const DOODLE_COUNT = 40;
  const MOVES = ['float','drift','orbit','zigzag','sine-wave','bounce','pendulum','lemniscate'];

  function spawnDoodle(randomY) {
    const pattern = pick(MOVES);
    let x, y;
    if (randomY) { x = Math.random() * W; y = Math.random() * H; }
    else {
      const s = Math.random();
      if (s < .35) { x = rng(0,W); y = H + 50; }
      else if (s < .55) { x = -50; y = rng(0,H); }
      else if (s < .75) { x = W + 50; y = rng(0,H); }
      else { x = rng(0,W); y = -50; }
    }
    return {
      x, y, baseX: x, baseY: y,
      vx: rng(-.5,.5), vy: -rng(.08,.45),
      size: rng(16,32), rotation: rng(0,Math.PI*2),
      rotSpeed: rng(-.015,.015),
      color: pick(NEON), type: Math.floor(Math.random() * DD.length),
      alpha: rng(.04,.13),
      pulseAlpha: Math.random() > .5,
      scaleBreath: Math.random() > .6,   // some breathe in size
      pattern, phase: rng(0,Math.PI*2),
      speed: rng(.004,.018),
      orbitRadius: rng(30,120),
      bounceDir: 1, born: 0
    };
  }
  for (let i = 0; i < DOODLE_COUNT; i++) doodles.push(spawnDoodle(true));

  // =====================================================
  // PARTICLES — 90
  // =====================================================
  const particles = [];
  const P_COUNT = 90;
  function spawnP(ry) {
    const t = Math.random();
    return {
      x: rng(0,W), y: ry ? rng(0,H) : H + 10,
      vy: -rng(.12,.55), vx: rng(-.3,.3),
      size: rng(1,3), color: pick(NEON),
      alpha: rng(.06,.25),
      tPhase: rng(0,Math.PI*2), tSpeed: rng(.025,.07),
      kind: t > .85 ? 'trail' : t > .65 ? 'cross' : t > .5 ? 'ring' : t > .38 ? 'diamond' : 'dot'
    };
  }
  for (let i = 0; i < P_COUNT; i++) particles.push(spawnP(true));

  // =====================================================
  // SHOOTING STARS
  // =====================================================
  const stars = [];
  function maybeShoot() {
    if (Math.random() > .004) return;
    const left = Math.random() > .5;
    stars.push({
      x: left ? -20 : W + 20, y: rng(0,H*.5),
      vx: left ? rng(5,12) : -rng(5,12), vy: rng(1.5,4),
      len: rng(50,90), color: pick(NEON),
      alpha: rng(.2,.4), life: 1, decay: rng(.006,.012)
    });
  }

  // =====================================================
  // FLOATING TEXT — words + emoji
  // =====================================================
  const words = [];
  const WORD_POOL = ['DRAW','GUESS','WIN','PIXEL','NEON','PLAY','ART','INK','SKETCH','FUN','GG','67','BOOM','NICE','WOW','PRO','LOL','EZ','HYPE','FIRE','VIBE','DOODLE','CLUTCH'];
  const EMOJI_POOL = ['✏️','🎨','🏆','⭐','🎮','🔥','💀','🎯','👑','💎','⚡','🎵','👁️','🌀','❤️','✨','🚀','💥','🪄','🫨'];

  function maybeWord() {
    if (words.length > 10) return;
    if (Math.random() > .008) return;
    const isEmoji = Math.random() > .55;
    words.push({
      x: rng(0,W), y: H + 30,
      vy: -rng(.15,.35), vx: rng(-.25,.25),
      text: isEmoji ? pick(EMOJI_POOL) : pick(WORD_POOL),
      color: pick(NEON), alpha: rng(.03,.08),
      size: isEmoji ? rng(16,28) : rng(7,13),
      rotation: rng(-.3,.3), isEmoji
    });
  }

  // =====================================================
  // NEON RINGS
  // =====================================================
  const rings = [];
  function maybeRing() {
    if (rings.length > 5) return;
    if (Math.random() > .003) return;
    const isDouble = Math.random() > .6;
    rings.push({
      x: rng(0,W), y: rng(0,H),
      radius: 0, maxR: rng(50,160),
      speed: rng(.4,1.2), color: pick(NEON),
      alpha: rng(.08,.16), double: isDouble
    });
  }

  // =====================================================
  // CONSTELLATION LINES — connect nearby particles briefly
  // =====================================================
  function drawConstellations() {
    const maxDist = 100;
    ctx.lineWidth = 0.4;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = dx * dx + dy * dy;
        if (d < maxDist * maxDist) {
          const a = .04 * (1 - Math.sqrt(d) / maxDist);
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
      if (i > 25) break; // only check first 25 to keep perf reasonable
    }
    ctx.globalAlpha = 1;
  }

  // =====================================================
  // FLOATING BLOBS — large soft neon glows drifting
  // =====================================================
  const blobs = [];
  const BLOB_COUNT = 5;
  function spawnBlob(ry) {
    return {
      x: rng(0,W), y: ry ? rng(0,H) : H + 100,
      vx: rng(-.2,.2), vy: -rng(.05,.2),
      radius: rng(80,200), color: pick(NEON),
      alpha: rng(.015,.035),
      phase: rng(0,Math.PI*2), breathSpeed: rng(.005,.015)
    };
  }
  for (let i = 0; i < BLOB_COUNT; i++) blobs.push(spawnBlob(true));

  // =====================================================
  // MAIN LOOP
  // =====================================================
  let gridOff = 0, frame = 0;

  function draw() {
    const home = document.getElementById('homeScreen')?.classList.contains('active');
    const lobby = document.getElementById('lobbyScreen')?.classList.contains('active');
    if (!home && !lobby) { canvas.style.display = 'none'; requestAnimationFrame(draw); return; }
    canvas.style.display = '';
    frame++;
    ctx.clearRect(0, 0, W, H);

    // ===== LAYER 0: BLOBS (soft glow) =====
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      b.x += b.vx; b.y += b.vy;
      if (b.y < -250) { blobs[i] = spawnBlob(false); continue; }
      const breathe = 1 + Math.sin(b.phase + frame * b.breathSpeed) * .2;
      const r = b.radius * breathe;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      g.addColorStop(0, b.color);
      g.addColorStop(1, 'transparent');
      ctx.globalAlpha = b.alpha;
      ctx.fillStyle = g;
      ctx.fillRect(b.x - r, b.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;

    // ===== LAYER 1: GRID =====
    gridOff = (gridOff + .15) % GRID_SIZE;
    ctx.lineWidth = .5;
    for (let x = -GRID_SIZE + gridOff * .5; x < W + GRID_SIZE; x += GRID_SIZE) {
      ctx.strokeStyle = 'rgba(42,42,64,.18)';
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    for (let y = -GRID_SIZE + gridOff; y < H + GRID_SIZE; y += GRID_SIZE) {
      ctx.strokeStyle = `rgba(42,42,64,${.1 + .1*(y/H)})`;
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }
    const gp = .035 + Math.sin(frame * .01) * .02;
    ctx.lineWidth = 1;
    for (let x = -GRID_SIZE + gridOff * .5; x < W + GRID_SIZE; x += GRID_SIZE * 3) {
      ctx.strokeStyle = `rgba(0,255,242,${gp})`;
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    for (let y = -GRID_SIZE + gridOff; y < H + GRID_SIZE; y += GRID_SIZE * 3) {
      ctx.strokeStyle = `rgba(255,44,241,${gp*.6})`;
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }

    // ===== LAYER 2: RINGS =====
    maybeRing();
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.radius += r.speed;
      const prog = r.radius / r.maxR;
      const a = r.alpha * (1 - prog);
      if (a <= .003) { rings.splice(i,1); continue; }
      ctx.save(); ctx.strokeStyle = r.color; ctx.lineWidth = 1.5;
      ctx.globalAlpha = a; ctx.shadowColor = r.color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.radius, 0, Math.PI*2); ctx.stroke();
      if (r.double) {
        ctx.globalAlpha = a * .5;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.radius * .6, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }

    // ===== LAYER 3: CONSTELLATIONS =====
    drawConstellations();

    // ===== LAYER 4: WORDS + EMOJI =====
    maybeWord();
    for (let i = words.length - 1; i >= 0; i--) {
      const w = words[i];
      w.y += w.vy; w.x += w.vx;
      if (w.y < -60) { words.splice(i,1); continue; }
      ctx.save(); ctx.translate(w.x, w.y); ctx.rotate(w.rotation);
      ctx.globalAlpha = w.alpha;
      if (w.isEmoji) {
        ctx.font = `${w.size}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(w.text, 0, 0);
      } else {
        ctx.font = `${w.size}px 'Press Start 2P',monospace`;
        ctx.fillStyle = w.color; ctx.shadowColor = w.color; ctx.shadowBlur = 6;
        ctx.textAlign = 'center'; ctx.fillText(w.text, 0, 0);
      }
      ctx.restore();
    }

    // ===== LAYER 5: DOODLES =====
    for (let i = 0; i < doodles.length; i++) {
      const d = doodles[i]; d.born++;
      switch (d.pattern) {
        case 'float': d.x += d.vx + Math.sin(d.phase + frame*d.speed)*.4; d.y += d.vy; break;
        case 'drift': d.x += d.vx*1.5; d.y += d.vy*.5; break;
        case 'orbit': d.x = d.baseX + Math.cos(d.phase+frame*d.speed)*d.orbitRadius*.3; d.y += d.vy*.3; d.baseY += d.vy*.3; d.baseX += d.vx*.1; break;
        case 'zigzag': d.x += Math.sin(frame*d.speed*3)*1.3; d.y += d.vy; break;
        case 'sine-wave': d.x += d.vx + Math.sin(d.phase+frame*d.speed*2)*1.8; d.y += d.vy*.7; break;
        case 'bounce': d.x += d.vx; d.y += d.vy*d.bounceDir*.5; if(d.born%120<2) d.bounceDir*=-1; break;
        case 'pendulum': d.x += Math.sin(d.phase+frame*d.speed)*2; d.y += d.vy*.4; break;
        case 'lemniscate': {const t=d.phase+frame*d.speed; d.x+=Math.sin(t)*Math.cos(t)*.8; d.y+=d.vy*.35;} break;
      }
      d.rotation += d.rotSpeed;
      if (d.y<-80||d.y>H+80||d.x<-80||d.x>W+80) { doodles[i]=spawnDoodle(false); continue; }

      let a = d.alpha;
      if (d.pulseAlpha) a *= .5 + Math.sin(frame*.02+d.phase)*.5;

      let sc = 1;
      if (d.scaleBreath) sc = .85 + Math.sin(frame*.015+d.phase)*.15;

      ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rotation); ctx.scale(sc, sc);
      ctx.globalAlpha = Math.max(0,a);
      ctx._c = d.color; ctx.fillStyle = d.color; ctx.shadowColor = d.color; ctx.shadowBlur = 4;
      try { DD[d.type](ctx, d.size); } catch(e) {}
      ctx.restore();
    }

    // ===== LAYER 6: PARTICLES =====
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { particles[i] = spawnP(false); continue; }
      const tw = Math.sin(p.tPhase + frame * p.tSpeed) * .5 + .5;
      ctx.save(); ctx.globalAlpha = p.alpha * tw;
      ctx.fillStyle = p.color; ctx.strokeStyle = p.color;
      ctx.shadowColor = p.color; ctx.shadowBlur = 4;

      switch(p.kind) {
        case 'dot': ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill(); break;
        case 'cross': ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(p.x-p.size,p.y); ctx.lineTo(p.x+p.size,p.y); ctx.moveTo(p.x,p.y-p.size); ctx.lineTo(p.x,p.y+p.size); ctx.stroke(); break;
        case 'ring': ctx.lineWidth=.8; ctx.beginPath(); ctx.arc(p.x,p.y,p.size*1.5,0,Math.PI*2); ctx.stroke(); break;
        case 'diamond': ctx.beginPath(); ctx.moveTo(p.x,p.y-p.size); ctx.lineTo(p.x+p.size,p.y); ctx.lineTo(p.x,p.y+p.size); ctx.lineTo(p.x-p.size,p.y); ctx.closePath(); ctx.stroke(); break;
        case 'trail':
          ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
          ctx.globalAlpha=p.alpha*tw*.3; ctx.beginPath(); ctx.arc(p.x-p.vx*4,p.y-p.vy*4,p.size*.7,0,Math.PI*2); ctx.fill();
          ctx.globalAlpha=p.alpha*tw*.1; ctx.beginPath(); ctx.arc(p.x-p.vx*8,p.y-p.vy*8,p.size*.4,0,Math.PI*2); ctx.fill();
          break;
      }
      ctx.restore();
    }

    // ===== LAYER 7: SHOOTING STARS =====
    maybeShoot();
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i]; s.x += s.vx; s.y += s.vy; s.life -= s.decay;
      if (s.life <= 0) { stars.splice(i,1); continue; }
      ctx.save(); ctx.globalAlpha = s.alpha * s.life;
      const ang = Math.atan2(s.vy, s.vx);
      ctx.fillStyle = s.color; ctx.shadowColor = s.color; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(s.x,s.y,3,0,Math.PI*2); ctx.fill();
      const g = ctx.createLinearGradient(s.x,s.y,s.x-Math.cos(ang)*s.len,s.y-Math.sin(ang)*s.len);
      g.addColorStop(0, s.color); g.addColorStop(1,'transparent');
      ctx.strokeStyle = g; ctx.lineWidth = 2.5; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(s.x,s.y);
      ctx.lineTo(s.x-Math.cos(ang)*s.len*s.life, s.y-Math.sin(ang)*s.len*s.life);
      ctx.stroke();
      ctx.restore();
    }

    // ===== POST: VIGNETTE + EDGES =====
    const vg = ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.7);
    vg.addColorStop(0,'transparent'); vg.addColorStop(1,'rgba(10,10,15,.4)');
    ctx.fillStyle = vg; ctx.fillRect(0,0,W,H);

    const ep = .02 + Math.sin(frame*.01)*.015;
    // Top
    const tg = ctx.createLinearGradient(0,0,0,110);
    tg.addColorStop(0,`rgba(0,255,242,${ep*2.5})`); tg.addColorStop(1,'transparent');
    ctx.fillStyle=tg; ctx.fillRect(0,0,W,110);
    // Bottom
    const bg2 = ctx.createLinearGradient(0,H,0,H-110);
    bg2.addColorStop(0,`rgba(255,44,241,${ep*2.5})`); bg2.addColorStop(1,'transparent');
    ctx.fillStyle=bg2; ctx.fillRect(0,H-110,W,110);
    // Left
    const lg2 = ctx.createLinearGradient(0,0,90,0);
    lg2.addColorStop(0,`rgba(57,255,20,${ep*1.5})`); lg2.addColorStop(1,'transparent');
    ctx.fillStyle=lg2; ctx.fillRect(0,0,90,H);
    // Right
    const rg2 = ctx.createLinearGradient(W,0,W-90,0);
    rg2.addColorStop(0,`rgba(180,74,255,${ep*1.5})`); rg2.addColorStop(1,'transparent');
    ctx.fillStyle=rg2; ctx.fillRect(W-90,0,90,H);

    requestAnimationFrame(draw);
  }

  draw();
})();
