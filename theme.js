// src/theme/theme.js
import { useState, useEffect } from "react";

export const useDarkMode = () => {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return dark;
};

export const isDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const theme = (dark) => ({
  bg: dark ? '#0a0a0a' : '#ffffff',
  bg2: dark ? '#141414' : '#f5f5f5',
  bg3: dark ? '#1e1e1e' : '#ebebeb',
  card: dark ? '#1a1a1a' : '#ffffff',
  border: dark ? '#2a2a2a' : '#e0e0e0',
  text: dark ? '#ffffff' : '#0a0a0a',
  text2: dark ? '#888888' : '#555555',
  text3: dark ? '#444444' : '#aaaaaa',
  accent: '#E8151B',
  accentBg: dark ? 'rgba(232,21,27,0.12)' : 'rgba(232,21,27,0.08)',
  btnText: '#ffffff',
  shadow: dark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)',
});
