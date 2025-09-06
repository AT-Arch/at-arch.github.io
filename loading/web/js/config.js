// Arch Loading Screen configuration
// Adjust these values; no build step required.
window.ARCH_CONFIG = {
  serverName: "Arch Sandbox Network",
  subtitle: "Preparing your session...",
  favicon: "assets/logo.svg",
  logo: "assets/logo.svg",
  primaryColor: "#6366f1",
  accentColor: "#06b6d4",
  showHostnameFromQuery: true, // if false use serverName always
  progress: {
    simulated: true,
    minTotalTimeMs: 14000, // ensures bar isn't instant
    maxTotalTimeMs: 26000,
    stallChance: 0.18, // occasionally pause for realism
    stallMaxMs: 1800,
    preferReal: true, // switch to real callbacks if GMod supplies them
    // Minimum percentage floors when certain statuses appear (makes bar feel accurate)
    statusFloors: {
      'workshop complete': 0.70,
      'sending client info': 0.85,
      'starting lua': 0.92
    }
  },
  tips: [
    "Press F1 for server help if enabled by the gamemode.",
    "Be respectful; admins can see logs.",
    "Bind useful keys via the console: bind g \'+menu\' ",
    "Need better FPS? Try lowering your shadows in video settings.",
    "Some addons download on first join only; subsequent joins are faster.",
    "Use voice chat responsibly to avoid mutes.",
    "Report bugs on our Discord server (link in MOTD)."
  ],
  tipIntervalMs: 5000,
  rules: [
    "No exploiting or cheating.",
    "No targeted harassment or hate speech.",
    "Keep mic spam & loud sounds to a minimum.",
    "Follow staff directions.",
    "English only in main chat unless otherwise allowed." 
  ],
  music: {
    enabled: true,
    autoplay: true,
    shuffle: true,
    volume: 0.4,
    playlist: [
      { title: "Voyage", artist: "Arch", url: "https://cdn.pixabay.com/download/audio/2024/09/29/audio_5c67567261.mp3" },
      { title: "Nebula Drift", artist: "Arch", url: "https://cdn.pixabay.com/download/audio/2024/09/29/audio_5c67567261.mp3" }
    ]
  },
  footerText: "Arch Loading Screen — github.com/AT-Arch/archloadingscreen",
  background: {
    // Provide image (jpg/png/webp) or leave null for gradient
    image: null,
    // Optional overlay color
    overlay: "rgba(15,17,21,0.55)"
  }
};