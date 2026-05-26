import { C } from "../lib/constants.js";

export default function KPI({ label, value, sub, color, trend }) {
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderLeft:`3px solid ${color}`, borderRadius:12, padding:"18px 20px" }}>
      <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:4 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
        <div style={{ fontSize:38, fontWeight:800, color, lineHeight:1, fontFamily:"'Bebas Neue',Impact,sans-serif", letterSpacing:"0.02em" }}>{value}</div>
        {trend!=null && <div style={{ fontSize:11, color:trend>=0?C.green:C.pink, marginBottom:5, fontWeight:700 }}>{trend>=0?"▲":"▼"}{Math.abs(trend)}%</div>}
      </div>
      {sub && <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{sub}</div>}
    </div>
  );
}
