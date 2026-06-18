// src/theme/theme.js
// Dark mode removed — always light theme.

export const useDarkMode = () => false;
export const isDark = () => false;

export const theme = (_dark) => ({
  bg: '#ffffff',
  bg2: '#f5f5f5',
  bg3: '#ebebeb',
  card: '#ffffff',
  border: '#e0e0e0',
  text: '#0a0a0a',
  text2: '#555555',
  text3: '#aaaaaa',
  accent: '#E8151B',
  accentBg: 'rgba(232,21,27,0.08)',
  btnText: '#ffffff',
  shadow: 'rgba(0,0,0,0.1)',
});
