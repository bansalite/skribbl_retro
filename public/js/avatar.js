// Pixel Art Avatar System - Retro Arcade Style
const AVATAR_COLORS = [
  '#00fff2', '#39ff14', '#ff2cf1', '#ffe600', '#ff6600',
  '#ff1744', '#4488ff', '#b44aff', '#00ff88', '#ff8844',
  '#44ffcc', '#ff44aa', '#88ff44', '#ffaa00', '#44aaff',
  '#ff4466', '#66ff44', '#ff6644', '#44ff66', '#aa44ff'
];

// Pixel-art eyes (grid-based)
const EYES_VARIANTS = [
  // Standard dots
  (s) => `<rect x="${s*0.3}" y="${s*0.32}" width="${s*0.1}" height="${s*0.1}" fill="#111" rx="1"/>
          <rect x="${s*0.6}" y="${s*0.32}" width="${s*0.1}" height="${s*0.1}" fill="#111" rx="1"/>`,
  // Wide eyes
  (s) => `<rect x="${s*0.26}" y="${s*0.3}" width="${s*0.14}" height="${s*0.12}" fill="#fff" rx="1" stroke="#111" stroke-width="1.5"/>
          <rect x="${s*0.6}" y="${s*0.3}" width="${s*0.14}" height="${s*0.12}" fill="#fff" rx="1" stroke="#111" stroke-width="1.5"/>
          <rect x="${s*0.32}" y="${s*0.33}" width="${s*0.06}" height="${s*0.06}" fill="#111" rx="1"/>
          <rect x="${s*0.64}" y="${s*0.33}" width="${s*0.06}" height="${s*0.06}" fill="#111" rx="1"/>`,
  // Angry
  (s) => `<line x1="${s*0.25}" y1="${s*0.3}" x2="${s*0.4}" y2="${s*0.35}" stroke="#111" stroke-width="2.5" stroke-linecap="square"/>
          <line x1="${s*0.75}" y1="${s*0.3}" x2="${s*0.6}" y2="${s*0.35}" stroke="#111" stroke-width="2.5" stroke-linecap="square"/>
          <rect x="${s*0.3}" y="${s*0.36}" width="${s*0.08}" height="${s*0.06}" fill="#111" rx="1"/>
          <rect x="${s*0.62}" y="${s*0.36}" width="${s*0.08}" height="${s*0.06}" fill="#111" rx="1"/>`,
  // Happy closed
  (s) => `<path d="M${s*0.26},${s*0.36} L${s*0.33},${s*0.32} L${s*0.4},${s*0.36}" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="square"/>
          <path d="M${s*0.6},${s*0.36} L${s*0.67},${s*0.32} L${s*0.74},${s*0.36}" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="square"/>`,
  // Sunglasses
  (s) => `<rect x="${s*0.22}" y="${s*0.3}" width="${s*0.2}" height="${s*0.12}" fill="#111" rx="1"/>
          <rect x="${s*0.58}" y="${s*0.3}" width="${s*0.2}" height="${s*0.12}" fill="#111" rx="1"/>
          <line x1="${s*0.42}" y1="${s*0.36}" x2="${s*0.58}" y2="${s*0.36}" stroke="#111" stroke-width="2"/>
          <rect x="${s*0.25}" y="${s*0.33}" width="${s*0.05}" height="${s*0.04}" fill="#00fff2" rx="0.5"/>
          <rect x="${s*0.61}" y="${s*0.33}" width="${s*0.05}" height="${s*0.04}" fill="#00fff2" rx="0.5"/>`,
  // Star eyes
  (s) => `<text x="${s*0.33}" y="${s*0.41}" text-anchor="middle" font-size="${s*0.16}" fill="#ffe600">*</text>
          <text x="${s*0.67}" y="${s*0.41}" text-anchor="middle" font-size="${s*0.16}" fill="#ffe600">*</text>`,
  // Dot eyes
  (s) => `<circle cx="${s*0.33}" cy="${s*0.36}" r="${s*0.04}" fill="#111"/>
          <circle cx="${s*0.67}" cy="${s*0.36}" r="${s*0.04}" fill="#111"/>`,
  // Wink
  (s) => `<rect x="${s*0.3}" y="${s*0.33}" width="${s*0.08}" height="${s*0.08}" fill="#111" rx="1"/>
          <path d="M${s*0.6},${s*0.37} L${s*0.67},${s*0.33} L${s*0.74},${s*0.37}" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="square"/>`,
  // X eyes
  (s) => `<line x1="${s*0.28}" y1="${s*0.3}" x2="${s*0.4}" y2="${s*0.42}" stroke="#111" stroke-width="2" stroke-linecap="square"/>
          <line x1="${s*0.4}" y1="${s*0.3}" x2="${s*0.28}" y2="${s*0.42}" stroke="#111" stroke-width="2" stroke-linecap="square"/>
          <line x1="${s*0.6}" y1="${s*0.3}" x2="${s*0.72}" y2="${s*0.42}" stroke="#111" stroke-width="2" stroke-linecap="square"/>
          <line x1="${s*0.72}" y1="${s*0.3}" x2="${s*0.6}" y2="${s*0.42}" stroke="#111" stroke-width="2" stroke-linecap="square"/>`,
  // Glowing
  (s) => `<rect x="${s*0.29}" y="${s*0.32}" width="${s*0.1}" height="${s*0.1}" fill="#39ff14" rx="1"/>
          <rect x="${s*0.61}" y="${s*0.32}" width="${s*0.1}" height="${s*0.1}" fill="#39ff14" rx="1"/>`
];

const MOUTH_VARIANTS = [
  // Pixel smile
  (s) => `<path d="M${s*0.36},${s*0.56} L${s*0.4},${s*0.6} L${s*0.5},${s*0.62} L${s*0.6},${s*0.6} L${s*0.64},${s*0.56}" fill="none" stroke="#111" stroke-width="2" stroke-linecap="square"/>`,
  // Open rect
  (s) => `<rect x="${s*0.4}" y="${s*0.55}" rx="1" width="${s*0.2}" height="${s*0.1}" fill="#111"/>`,
  // Flat line
  (s) => `<line x1="${s*0.38}" y1="${s*0.58}" x2="${s*0.62}" y2="${s*0.58}" stroke="#111" stroke-width="2.5" stroke-linecap="square"/>`,
  // Frown
  (s) => `<path d="M${s*0.36},${s*0.62} L${s*0.4},${s*0.58} L${s*0.6},${s*0.58} L${s*0.64},${s*0.62}" fill="none" stroke="#111" stroke-width="2" stroke-linecap="square"/>`,
  // Zigzag
  (s) => `<path d="M${s*0.34},${s*0.58} L${s*0.42},${s*0.54} L${s*0.5},${s*0.58} L${s*0.58},${s*0.54} L${s*0.66},${s*0.58}" fill="none" stroke="#111" stroke-width="2" stroke-linecap="square"/>`,
  // Tongue
  (s) => `<rect x="${s*0.38}" y="${s*0.55}" width="${s*0.24}" height="${s*0.08}" fill="#111" rx="1"/>
          <rect x="${s*0.44}" y="${s*0.59}" width="${s*0.12}" height="${s*0.06}" fill="#ff4466" rx="1"/>`,
  // Big grin
  (s) => `<path d="M${s*0.32},${s*0.55} L${s*0.5},${s*0.65} L${s*0.68},${s*0.55}" fill="#111" stroke="#111" stroke-width="1"/>`,
  // Small dot
  (s) => `<rect x="${s*0.46}" y="${s*0.56}" width="${s*0.08}" height="${s*0.06}" fill="#111" rx="1"/>`,
  // Fangs
  (s) => `<line x1="${s*0.36}" y1="${s*0.56}" x2="${s*0.64}" y2="${s*0.56}" stroke="#111" stroke-width="2" stroke-linecap="square"/>
          <rect x="${s*0.4}" y="${s*0.56}" width="${s*0.04}" height="${s*0.05}" fill="#fff" rx="0.5"/>
          <rect x="${s*0.56}" y="${s*0.56}" width="${s*0.04}" height="${s*0.05}" fill="#fff" rx="0.5"/>`,
  // Cat mouth
  (s) => `<path d="M${s*0.5},${s*0.56} L${s*0.38},${s*0.62}" fill="none" stroke="#111" stroke-width="2" stroke-linecap="square"/>
          <path d="M${s*0.5},${s*0.56} L${s*0.62},${s*0.62}" fill="none" stroke="#111" stroke-width="2" stroke-linecap="square"/>`
];

function generateAvatarSVG(avatar, size = 68) {
  const s = size;
  const color = avatar.color || AVATAR_COLORS[0];
  const eyeIdx = Math.min(avatar.eyes || 0, EYES_VARIANTS.length - 1);
  const mouthIdx = Math.min(avatar.mouth || 0, MOUTH_VARIANTS.length - 1);
  const darker = darkenColor(color, 30);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" style="image-rendering: auto;">
    <rect x="${s*0.1}" y="${s*0.08}" width="${s*0.8}" height="${s*0.84}" rx="${s*0.08}" fill="${color}"/>
    <rect x="${s*0.15}" y="${s*0.14}" width="${s*0.7}" height="${s*0.72}" rx="${s*0.06}" fill="${lighter(color, 25)}"/>
    <rect x="${s*0.15}" y="${s*0.5}" width="${s*0.7}" height="${s*0.36}" rx="${s*0.06}" fill="${color}"/>
    ${EYES_VARIANTS[eyeIdx](s)}
    ${MOUTH_VARIANTS[mouthIdx](s)}
  </svg>`;
}

function lighter(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function darkenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function renderAvatar(container, avatar, size = 68) {
  container.innerHTML = generateAvatarSVG(avatar, size);
  container.style.backgroundColor = 'transparent';
}

function getRandomAvatar() {
  return {
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    eyes: Math.floor(Math.random() * EYES_VARIANTS.length),
    mouth: Math.floor(Math.random() * MOUTH_VARIANTS.length)
  };
}
