/*
  Configuration for Arch Loading Screen
  Edit these values to customize the loading screen without touching the main code.
*/
window.ARCH_CONFIG = {
  serverName: 'Arch Garry\'s Mod',
  serverDesc: 'Welcome — be sure to read the rules in chat',
  logo: 'assets/logo.svg',
  tips: [
    'Join our Discord to participate in events.',
    'Use !help in chat to see available commands.',
    'Press F1 to open the help menu.',
    'Report bugs on the forum so we can fix them quickly.'
  ],
  colors: {
    accent: '#7dd3fc',
    accent2: '#60a5fa'
  },
  particles: {
    count: 48,
    color: 'rgba(125,211,252,0.9)'
  },
  // Simulated load duration in ms (for demo). Set to null to rely on GMod messages if integrated.
  simulatedLoadTime: 6200
};
