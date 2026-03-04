// Comprehensive word list categorized like skribbl.io
const WORD_LIST = [
  // Animals
  "dog", "cat", "elephant", "giraffe", "lion", "tiger", "bear", "monkey", "penguin", "dolphin",
  "whale", "shark", "eagle", "owl", "parrot", "snake", "turtle", "frog", "butterfly", "spider",
  "ant", "bee", "horse", "cow", "pig", "sheep", "chicken", "duck", "rabbit", "deer",
  "wolf", "fox", "zebra", "hippo", "crocodile", "kangaroo", "koala", "panda", "octopus", "jellyfish",
  "lobster", "crab", "snail", "bat", "hamster", "squirrel", "raccoon", "skunk", "hedgehog", "flamingo",

  // Food & Drinks
  "pizza", "hamburger", "hotdog", "taco", "sushi", "pasta", "sandwich", "salad", "soup", "steak",
  "chicken", "rice", "bread", "cheese", "egg", "bacon", "pancake", "waffle", "donut", "cake",
  "cookie", "ice cream", "chocolate", "candy", "popcorn", "french fries", "burrito", "noodles",
  "pie", "cupcake", "muffin", "croissant", "pretzel", "bagel", "toast", "cereal", "yogurt",
  "apple", "banana", "orange", "strawberry", "grape", "watermelon", "pineapple", "lemon", "cherry",
  "peach", "mango", "coconut", "avocado", "tomato", "potato", "carrot", "broccoli", "corn", "mushroom",
  "coffee", "tea", "juice", "milk", "soda", "smoothie", "lemonade", "wine", "beer", "cocktail",

  // Objects & Things
  "chair", "table", "lamp", "clock", "mirror", "pillow", "blanket", "carpet", "curtain", "door",
  "window", "stairs", "elevator", "toilet", "shower", "bathtub", "sink", "faucet", "towel", "soap",
  "toothbrush", "comb", "scissors", "knife", "fork", "spoon", "plate", "cup", "bottle", "jar",
  "box", "bag", "wallet", "key", "lock", "bell", "candle", "lighter", "match", "flashlight",
  "umbrella", "glasses", "hat", "shoe", "boot", "glove", "scarf", "belt", "tie", "button",
  "zipper", "needle", "thread", "rope", "chain", "wheel", "tire", "engine", "battery", "plug",
  "remote", "keyboard", "mouse", "monitor", "speaker", "headphones", "microphone", "camera",
  "phone", "laptop", "tablet", "television", "radio", "antenna", "satellite", "telescope",

  // Nature
  "sun", "moon", "star", "cloud", "rain", "snow", "lightning", "thunder", "rainbow", "tornado",
  "volcano", "earthquake", "mountain", "hill", "valley", "river", "lake", "ocean", "waterfall", "island",
  "beach", "desert", "forest", "jungle", "swamp", "cave", "cliff", "glacier", "iceberg",
  "tree", "flower", "grass", "leaf", "branch", "root", "seed", "mushroom", "cactus", "rose",
  "sunflower", "tulip", "daisy", "palm tree",

  // Transportation
  "car", "bus", "truck", "motorcycle", "bicycle", "scooter", "train", "subway", "airplane", "helicopter",
  "boat", "ship", "submarine", "rocket", "spaceship", "ambulance", "fire truck", "taxi", "van",
  "skateboard", "surfboard", "sailboat", "canoe", "hot air balloon", "parachute", "sled",

  // Buildings & Places
  "house", "apartment", "castle", "church", "hospital", "school", "library", "museum", "restaurant",
  "hotel", "airport", "train station", "bridge", "tower", "skyscraper", "lighthouse", "barn",
  "garage", "prison", "stadium", "theater", "cinema", "mall", "supermarket", "bank", "pharmacy",
  "police station", "fire station", "gas station", "playground", "park", "zoo", "aquarium", "gym",

  // People & Body
  "baby", "doctor", "nurse", "teacher", "firefighter", "police officer", "chef", "pilot", "astronaut",
  "pirate", "ninja", "knight", "king", "queen", "princess", "wizard", "witch", "vampire", "zombie",
  "ghost", "angel", "devil", "clown", "cowboy", "robot", "alien", "mermaid", "fairy", "elf",
  "hand", "foot", "eye", "ear", "nose", "mouth", "tongue", "tooth", "hair", "beard",
  "brain", "heart", "bone", "muscle", "blood", "skull", "skeleton",

  // Sports & Activities
  "soccer", "basketball", "baseball", "football", "tennis", "golf", "hockey", "boxing", "wrestling",
  "swimming", "surfing", "skiing", "snowboarding", "skateboarding", "bowling", "archery", "fencing",
  "karate", "yoga", "dancing", "running", "jumping", "climbing", "fishing", "hunting", "camping",
  "hiking", "diving", "gymnastics", "volleyball", "ping pong", "badminton", "cricket",

  // Music & Entertainment
  "guitar", "piano", "drums", "violin", "trumpet", "flute", "harmonica", "saxophone", "microphone",
  "concert", "orchestra", "band", "song", "dance", "ballet", "opera", "movie", "circus",
  "magic", "juggling", "painting", "sculpture", "photography",

  // Actions & Concepts
  "sleeping", "eating", "drinking", "cooking", "reading", "writing", "singing", "crying", "laughing",
  "running", "jumping", "flying", "swimming", "climbing", "falling", "throwing", "catching", "kicking",
  "pushing", "pulling", "digging", "building", "painting", "drawing", "fighting", "hugging", "kissing",
  "waving", "pointing", "thinking", "dreaming", "sneezing", "yawning", "whistling", "clapping",

  // Misc Fun Words
  "treasure", "map", "compass", "anchor", "sword", "shield", "bow", "arrow", "wand", "crown",
  "trophy", "medal", "diamond", "gold", "silver", "crystal", "magnet", "bubble", "balloon", "kite",
  "fireworks", "confetti", "present", "birthday cake", "christmas tree", "snowman", "scarecrow",
  "jack-o-lantern", "mask", "costume", "flag", "puzzle", "dice", "chess", "cards", "domino",
  "yo-yo", "frisbee", "boomerang", "trampoline", "swing", "slide", "seesaw", "sandbox",
  "notebook", "pencil", "eraser", "ruler", "calculator", "globe", "backpack", "lunchbox",
  "stethoscope", "thermometer", "bandage", "syringe", "wheelchair", "crutch",
  "handcuffs", "magnifying glass", "binoculars", "compass", "hourglass", "stopwatch"
];

function getRandomWords(count = 3, exclude = []) {
  const available = WORD_LIST.filter(w => !exclude.includes(w));
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateHint(word, revealPercent) {
  const chars = word.split('');
  const letterIndices = chars.reduce((acc, c, i) => {
    if (c !== ' ' && c !== '-') acc.push(i);
    return acc;
  }, []);

  const numToReveal = Math.floor(letterIndices.length * revealPercent);
  const shuffledIndices = letterIndices.sort(() => Math.random() - 0.5);
  const revealSet = new Set(shuffledIndices.slice(0, numToReveal));

  return chars.map((c, i) => {
    if (c === ' ') return '  ';
    if (c === '-') return '-';
    if (revealSet.has(i)) return c;
    return '_';
  }).join(' ');
}

module.exports = { WORD_LIST, getRandomWords, generateHint };
