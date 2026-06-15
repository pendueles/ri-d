// components/ui/HexRadarTotal.jsx
import { calcBlockScore, calcTotalScore } from "../../utils/scoring";

export default function HexRadarTotal({ blocks, answers }) {
  const S = 320, cx = S/2, cy = S/2 + 10, maxR = S * 0.30;
  const ang = (i) => Math.PI * 2 * i / 6 - Math.PI / 2;
  const ptXY = (i, pct) => [
    cx + (Math.max(0,pct)/100) * maxR * Math.cos(ang(i)),
    cy + (Math.max(0,pct)/100) * maxR * Math.sin(ang(i))
  ];
  const outerXY = (i) => [cx + maxR*Math.cos(ang(i)), cy + maxR*Math.sin(ang(i))];

  const bs = {};
  blocks.forEach(b => { bs[b.id] = Math.round(calcBlockScore(b,answers)*10)/10; });
  const total = Math.round(calcTotalScore(blocks,answers)*10)/10;

  const vals   = [total, bs.dsps||0, bs.ytvideo||0, bs.authority||0, bs.rights||0, bs.social||0];
  const labels = ["TOTAL","DSPs","YT&VIDEO","AUTHORITY","RIGHTS","SOCIAL"];

  const rings = [100,75,50,25];
  const ringFills = ["#252525","#2c2c2c","#333","#3a3a3a"];

  const hexPath = (pct) => rings && Array.from({length:6},(_,i)=>ptXY(i,pct))
    .map(([x,y],i)=>`${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")+" Z";

  const dataPath = vals.map((v,i)=>{
    const [x,y]=ptXY(i,Math.max(1,v));
    return `${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ")+" Z";

  const labelR = maxR + 34;

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%"}}>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{overflow:"visible",maxWidth:"100%"}}>
        {rings.map((pct,ri)=>(
          <path key={pct} d={hexPath(pct)} fill={ringFills[ri]} stroke="#555" strokeWidth="0.8"/>
        ))}
        {Array.from({length:6},(_,i)=>{
          const [x2,y2]=outerXY(i);
          return <line key={i} x1={cx.toFixed(1)} y1={cy.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke="#666" strokeWidth="0.8"/>;
        })}
        <path d={dataPath} fill="rgba(255,102,120,0.20)" stroke="#ff6678" strokeWidth="2.5" strokeLinejoin="round"/>
        {vals.map((v,i)=>{
          const [x,y]=ptXY(i,Math.max(1,v));
          return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={i===0?"5":"4"} fill="#ff6678" stroke={i===0?"#fff":"none"} strokeWidth="1.5"/>;
        })}
        {labels.map((lbl,i)=>{
          const lx=cx+labelR*Math.cos(ang(i));
          const ly=cy+labelR*Math.sin(ang(i));
          const anchor=lx<cx-8?"end":lx>cx+8?"start":"middle";
          return (
            <g key={i}>
              <text x={lx.toFixed(1)} y={(ly-7).toFixed(1)} textAnchor={anchor} dominantBaseline="middle"
                fontSize={i===0?"11":"9"} fontWeight="700" fontFamily="Arial,sans-serif"
                fill={i===0?"#ffffff":"#cccccc"}>
                {lbl}
              </text>
              <text x={lx.toFixed(1)} y={(ly+7).toFixed(1)} textAnchor={anchor} dominantBaseline="middle"
                fontSize={i===0?"13":"11"} fontWeight="700" fontFamily="Arial,sans-serif"
                fill="#ff6678">
                {vals[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
