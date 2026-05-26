import { DSP_COLORS } from "../lib/constants.js";

export default function PlatformDots({ r }) {
  const platforms = [
    { key:"spReady", label:"SP", color:DSP_COLORS.Spotify },
    { key:"apReady", label:"AP", color:DSP_COLORS["Apple Music"] },
    { key:"amReady", label:"AM", color:DSP_COLORS["Amazon Music"] },
    { key:"tiReady", label:"TI", color:DSP_COLORS.Tidal },
  ];
  return (
    <div style={{ display:"flex", gap:4 }}>
      {platforms.map(p => (
        <div key={p.key} title={p.label} style={{
          width:20, height:20, borderRadius:4, fontSize:9, fontWeight:800,
          background: r[p.key] ? `${p.color}22` : "rgba(255,255,255,0.04)",
          color: r[p.key] ? p.color : "rgba(255,255,255,0.15)",
          border: `1px solid ${r[p.key] ? p.color+"55" : "rgba(255,255,255,0.08)"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>{p.label}</div>
      ))}
    </div>
  );
}
