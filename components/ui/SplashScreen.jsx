// components/ui/SplashScreen.jsx
import { useState, useEffect } from "react";
import { theme, isDark } from "../../theme/theme";
import { RIMAS_LOGO } from "../../data/assets";

export default function SplashScreen({ onDone }) {
  const t = theme(isDark());
  const [scale, setScale] = useState(0.3);
  const [opacity, setOpacity] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setTimeout(() => { setScale(1); setOpacity(1); }, 50);
    setTimeout(() => setFadeOut(true), 1000);
    setTimeout(() => onDone(), 1300);
  }, []);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background: t.bg,
      display:'flex', alignItems:'center', justifyContent:'center',
      opacity: fadeOut ? 0 : 1,
      transition: fadeOut ? 'opacity 0.5s ease' : 'none',
    }}>
      <img
        src={RIMAS_LOGO}
        alt="Ri+D"
        style={{
          width:'180px',
          height:'180px',
          objectFit:'contain',
          transform: `scale(${scale})`,
          opacity,
          transition:'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
          filter: isDark() ? 'invert(1)' : 'none',
        }}
      />
    </div>
  );
}
