import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { C, DSP_COLORS, PRIORITY_COLORS, GENRE_COLORS, DRIVER_COLORS, HISTORY_TIMEFRAMES, TooltipStyle } from "../lib/constants.js";
import { T, fmtDate, fmtN } from "../lib/utils.js";
import { symphonicScore, scoreColor } from "../lib/scoreEngine.js";
import DRIVER_DATA_JSON from "../data/driverData.json";
import PICKUPS_JSON from "../data/pickups.json";
import ORGANIC_EDITORIAL from "../data/organicEditorial.json";
import UGC_PLAYLISTS from "../data/ugcPlaylists.json";
import SIMILAR_ARTIST_PICKUPS from "../data/similarArtistPickups.json";
import Pill from "./Pill.jsx";

export default function ArtistPanel({ r, onClose, onViewProfile, driverData: driverDataProp, pickups: pickupsProp }) {
  const [activeTab,        setActiveTab]        = useState("overview");
  const [historyTimeframe, setHistoryTimeframe] = useState("1Y");
  const DRIVER_DATA = driverDataProp || DRIVER_DATA_JSON;
  const PICKUPS     = pickupsProp    || PICKUPS_JSON;
  const d = DRIVER_DATA[r.artist] || DRIVER_DATA[r.upc] || {};
  const artistPickups = PICKUPS.filter(p => p.artist === r.artist)
    .sort((a, b) => new Date(b.dateSent) - new Date(a.dateSent));

  const tfDays   = HISTORY_TIMEFRAMES.find(t => t.label === historyTimeframe)?.days ?? null;
  const cutoff   = tfDays ? new Date(T.getTime() - tfDays * 86400000) : null;
  const inWindow = dateStr => !cutoff || new Date(dateStr) >= cutoff;
  const sc = symphonicScore(r, DRIVER_DATA, PICKUPS);
  const scCol = scoreColor(sc.total);
  const organicEditorial = ORGANIC_EDITORIAL[r.artist] || [];
  const ugcPlaylists     = UGC_PLAYLISTS[r.artist] || [];
  const similarPickups   = SIMILAR_ARTIST_PICKUPS[r.artist] || [];

  const storyScore = Math.min(100,
    (d.story ? 25 : 0) + (d.similarArtists ? 20 : 0) +
    (d.mood?.length > 0 ? 15 : 0) + (d.songStyles?.length > 0 ? 15 : 0) +
    (d.drivers?.length > 0 ? 25 : 0)
  );
  const activityScore = Math.min(100,
    (d.upcomingShows ? 35 : 0) +
    (d.socialActivity ? 35 : 0) +
    (d.dspTools?.length > 0 ? Math.min(30, d.dspTools.length * 10) : 0)
  );
  const momentumScore = Math.min(100,
    (d.confirmedPress ? 50 : 0) + (d.adDetails ? 50 : 0)
  );
  const rd = [
    { metric:"Audience",     value: Math.min(100, Math.round(r.spotifyML / 60000)) },
    { metric:"Activity",     value: activityScore },
    { metric:"History",      value: Math.min(100, artistPickups.length * 12) },
    { metric:"Story",        value: storyScore },
    { metric:"Momentum",     value: momentumScore },
    { metric:"Consistency",  value: d.releaseConsistency || 0 },
  ];

  const panelTabs = [
    { id:"overview", label:"Overview" },
    { id:"pitch",    label:"Pitch" },
    { id:"history",  label:"History" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* ── Persistent header ─────────────────────────────────────── */}
      <div style={{ flexShrink:0, paddingBottom:16 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:6 }}>
          {/* Title — takes remaining space, won't push into buttons */}
          <div style={{ flex:1, minWidth:0, fontSize:20, fontWeight:800, paddingTop:4 }}>
            {r.artist} <span style={{ color:C.muted, fontWeight:400 }}>—</span> <span style={{ color:C.cyan }}>{r.release}</span>
          </div>
          {/* Symphonic Score badge */}
          <div style={{ flexShrink:0, textAlign:"center", background:`${scCol}14`, border:`1px solid ${scCol}44`, borderRadius:10, padding:"6px 12px" }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:scCol, fontFamily:"'DM Mono',monospace", marginBottom:2 }}>SYM SCORE</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, fontWeight:800, color:scCol, lineHeight:1, letterSpacing:"0.04em" }}>{sc.total}</div>
          </div>
          {/* Action buttons */}
          {onViewProfile && (
            <button onClick={onViewProfile} style={{ flexShrink:0, background:"rgba(0,217,255,0.1)", border:`1px solid rgba(0,217,255,0.3)`, color:C.cyan, borderRadius:6, fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", padding:"0 10px", height:28, cursor:"pointer", fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap", marginTop:4 }}>Full Profile →</button>
          )}
          <button onClick={onClose} style={{ flexShrink:0, background:"rgba(255,255,255,0.06)", border:"none", color:C.muted, width:28, height:28, borderRadius:6, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", marginTop:4 }}>✕</button>
        </div>
        {/* Score breakdown chips */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
          {[
            { label:"Pickups",  value: sc.breakdown.pickups,     max:25, color: C.green },
            { label:"Audience", value: sc.breakdown.audience,    max:20, color: C.cyan },
            { label:"Social",   value: sc.breakdown.social,      max:15, color: "#E1306C" },
            { label:"Story",    value: sc.breakdown.story,       max:15, color: C.purple },
            { label:"Drive",    value: sc.breakdown.drive,       max:15, color: C.orange },
            { label:"Consist.", value: sc.breakdown.consistency, max:10, color: C.gold },
          ].map(({ label, value, max, color }) => (
            <div key={label} style={{ background:`${color}10`, border:`1px solid ${color}30`, borderRadius:7, padding:"3px 8px", display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:9, color, fontWeight:700, fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em", textTransform:"uppercase" }}>{label}</span>
              <span style={{ fontSize:11, fontWeight:800, color, fontFamily:"'DM Mono',monospace" }}>{value}</span>
              <span style={{ fontSize:9, color:"rgba(255,255,255,0.2)", fontFamily:"'DM Mono',monospace" }}>/{max}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
          <Pill label={r.priority} color={PRIORITY_COLORS[r.priority]||C.cyan} />
          <Pill label={r.genre}    color={GENRE_COLORS[r.genre]||C.cyan} />
          <Pill label={r.format}   color={C.dim} />
          <Pill label={fmtDate(r.date)} color={C.gold} />
          {r.ei && <Pill label="EI" color={C.green} />}
          {r.override?.map(o=><Pill key={o} label={o} color={C.purple} />)}
        </div>

        {/* Tab nav */}
        <div style={{ display:"flex", gap:2, background:"rgba(255,255,255,0.04)", borderRadius:8, padding:3 }}>
          {panelTabs.map(t => (
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
              flex:1, padding:"6px 0", fontSize:11, fontWeight:700, letterSpacing:"0.06em",
              textTransform:"uppercase", border:"none", borderRadius:6, cursor:"pointer",
              background: activeTab===t.id ? C.surface : "transparent",
              color: activeTab===t.id ? "#fff" : C.muted,
              boxShadow: activeTab===t.id ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
              transition:"all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Scrollable tab content ─────────────────────────────────── */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:24 }}>

        {/* ── OVERVIEW ───────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div>
            {/* 3-stat grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                { label:"Spotify ML",    value: fmtN(r.spotifyML),       color:DSP_COLORS.Spotify },
                { label:"Total Pickups", value: artistPickups.length || "—", color:C.green },
                { label:"EI",            value: r.ei ? "Yes" : "No",     color: r.ei ? C.green : C.dim },
              ].map(s=>(
                <div key={s.label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>{s.label}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:"'Bebas Neue',sans-serif" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Social Following */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:8 }}>Social Following</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[
                  { label:"Instagram",  value:r.igFollowers, color:"#E1306C" },
                  { label:"TikTok",     value:d.tiktok,      color:"#69C9D0" },
                  { label:"YouTube",    value:d.youtube,     color:"#FF0000" },
                  { label:"Twitter/X",  value:d.twitter,     color:"#1DA1F2" },
                  { label:"SoundCloud", value:d.soundcloud,  color:"#ff5500" },
                ].filter(p=>p.value).map(p=>(
                  <div key={p.label} style={{ background:`${p.color}12`, border:`1px solid ${p.color}30`, borderRadius:8, padding:"6px 10px", minWidth:72 }}>
                    <div style={{ fontSize:9, color:C.muted, marginBottom:2 }}>{p.label}</div>
                    <div style={{ fontSize:13, fontWeight:800, color:p.color, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.03em" }}>{fmtN(p.value)}</div>
                  </div>
                ))}
              </div>
              {d.socialActivity && (
                <div style={{ marginTop:8, fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.5, fontStyle:"italic" }}>{d.socialActivity}</div>
              )}
            </div>

            {/* Strength Profile radar + breakdown */}
            <div>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:6 }}>Strength Profile</div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={rd} cx="50%" cy="50%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill:C.muted, fontSize:9 }} />
                  <Radar name={r.artist} dataKey="value" stroke={C.cyan} fill={C.cyan} fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip contentStyle={TooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>

              {/* Score breakdown */}
              <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  {
                    metric: "Audience", value: rd.find(x=>x.metric==="Audience").value,
                    signals: [
                      { label:`${fmtN(r.spotifyML)} Spotify Monthly Listeners`, active: true, note: r.spotifyML >= 1000000 ? "strong" : r.spotifyML >= 200000 ? "mid" : "emerging" },
                    ],
                  },
                  {
                    metric: "Activity", value: rd.find(x=>x.metric==="Activity").value,
                    signals: [
                      { label:"Upcoming Shows",    active: !!d.upcomingShows,          detail: d.upcomingShows },
                      { label:"Social Activity",   active: !!d.socialActivity,          detail: d.socialActivity },
                      { label:"DSP Tools in Use",  active: d.dspTools?.length > 0,      detail: d.dspTools?.join(", ") },
                    ],
                  },
                  {
                    metric: "History", value: rd.find(x=>x.metric==="History").value,
                    signals: [
                      { label:`${artistPickups.length} Symphonic pickup${artistPickups.length !== 1 ? "s" : ""} on record`, active: artistPickups.length > 0,
                        detail: artistPickups.length > 0 ? artistPickups.slice(0,2).map(p=>p.playlist).join(", ") + (artistPickups.length > 2 ? ` +${artistPickups.length-2} more` : "") : null },
                    ],
                  },
                  {
                    metric: "Story", value: rd.find(x=>x.metric==="Story").value,
                    signals: [
                      { label:"What's the Story",       active: !!d.story },
                      { label:"Similar Artists / FFO",  active: !!d.similarArtists,  detail: d.similarArtists },
                      { label:"Mood tags",              active: d.mood?.length > 0,   detail: d.mood?.join(", ") },
                      { label:"Song style tags",        active: d.songStyles?.length > 0, detail: d.songStyles?.join(", ") },
                      { label:"Marketing drivers",      active: d.drivers?.length > 0, detail: d.drivers?.join(", ") },
                    ],
                  },
                  {
                    metric: "Momentum", value: rd.find(x=>x.metric==="Momentum").value,
                    signals: [
                      { label:"Confirmed Press",  active: !!d.confirmedPress,  detail: d.confirmedPress },
                      { label:"Ad Campaign",      active: !!d.adDetails,       detail: d.adDetails },
                    ],
                  },
                  {
                    metric: "Consistency", value: rd.find(x=>x.metric==="Consistency").value,
                    signals: [
                      { label:`${d.releaseConsistency||0}% release consistency score`, active: (d.releaseConsistency||0) > 0,
                        detail: (d.releaseConsistency||0) >= 70 ? "Regular release cadence" : (d.releaseConsistency||0) >= 40 ? "Moderate release cadence" : "Infrequent releases" },
                    ],
                  },
                ].map(({ metric, value, signals }) => (
                  <div key={metric} style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"8px 10px" }}>
                    {/* Header row */}
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.7)", width:80, flexShrink:0 }}>{metric}</div>
                      <div style={{ flex:1, height:4, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                        <div style={{ width:`${value}%`, height:"100%", borderRadius:99, background: value >= 70 ? C.green : value >= 40 ? C.gold : C.pink, transition:"width 0.4s" }} />
                      </div>
                      <div style={{ fontSize:10, fontWeight:800, color: value >= 70 ? C.green : value >= 40 ? C.gold : C.pink, fontFamily:"'DM Mono',monospace", width:28, textAlign:"right", flexShrink:0 }}>{value}</div>
                    </div>
                    {/* Signal rows */}
                    <div style={{ display:"flex", flexDirection:"column", gap:3, paddingLeft:88 }}>
                      {signals.map((s, si) => (
                        <div key={si} style={{ display:"flex", alignItems:"baseline", gap:5 }}>
                          <span style={{ fontSize:10, color: s.active ? C.green : "rgba(255,255,255,0.18)", flexShrink:0 }}>{s.active ? "✓" : "○"}</span>
                          <span style={{ fontSize:10, color: s.active ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)" }}>{s.label}</span>
                          {s.active && s.detail && (
                            <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontStyle:"italic", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>— {s.detail}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PITCH ─────────────────────────────────────────────── */}
        {activeTab === "pitch" && (
          <div>
            {d.story && (
              <div style={{ borderLeft:`3px solid ${C.cyan}`, background:"rgba(0,217,255,0.04)", borderRadius:"0 8px 8px 0", padding:"10px 12px 10px 14px", marginBottom:16 }}>
                <div style={{ fontSize:11, color:C.muted, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5, fontFamily:"'DM Mono',monospace" }}>What's the Story</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", lineHeight:1.6 }}>{d.story}</div>
              </div>
            )}

            {d.drivers?.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:7 }}>Marketing Drivers</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {d.drivers.map(dr => (
                    <span key={dr} style={{ background:`${DRIVER_COLORS[dr]||C.cyan}18`, color:DRIVER_COLORS[dr]||C.cyan, border:`1px solid ${DRIVER_COLORS[dr]||C.cyan}44`, borderRadius:99, padding:"3px 10px", fontSize:10, fontWeight:700 }}>{dr}</span>
                  ))}
                </div>
              </div>
            )}

            {d.dspTools?.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:7 }}>DSP Tools In Use</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {d.dspTools.map(t => (
                    <span key={t} style={{ background:"rgba(57,217,138,0.08)", color:C.green, border:`1px solid rgba(57,217,138,0.25)`, borderRadius:99, padding:"3px 10px", fontSize:10, fontWeight:700 }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {d.similarArtists && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:5 }}>Similar Artists / For Fans Of</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{d.similarArtists}</div>
              </div>
            )}

            {(d.mood?.length > 0 || d.songStyles?.length > 0) && (
              <div style={{ marginBottom:16, display:"flex", gap:16, flexWrap:"wrap" }}>
                {d.mood?.length > 0 && (
                  <div>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:6 }}>Mood</div>
                    <div style={{ display:"flex", gap:5 }}>
                      {d.mood.map(m => <span key={m} style={{ background:"rgba(180,92,255,0.12)", color:C.purple, border:`1px solid rgba(180,92,255,0.3)`, borderRadius:99, padding:"2px 9px", fontSize:10, fontWeight:600 }}>{m}</span>)}
                    </div>
                  </div>
                )}
                {d.songStyles?.length > 0 && (
                  <div>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:6 }}>Song Style</div>
                    <div style={{ display:"flex", gap:5 }}>
                      {d.songStyles.map(s => <span key={s} style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.6)", border:`1px solid rgba(255,255,255,0.1)`, borderRadius:99, padding:"2px 9px", fontSize:10 }}>{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {d.upcomingShows && (
                <div style={{ background:"rgba(57,217,138,0.06)", border:`1px solid rgba(57,217,138,0.18)`, borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.green, fontFamily:"'DM Mono',monospace", marginBottom:5 }}>Upcoming Shows</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>{d.upcomingShows}</div>
                </div>
              )}
              {d.confirmedPress && (
                <div style={{ background:"rgba(0,217,255,0.05)", border:`1px solid rgba(0,217,255,0.18)`, borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.cyan, fontFamily:"'DM Mono',monospace", marginBottom:5 }}>Confirmed Press</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>{d.confirmedPress}</div>
                </div>
              )}
              {d.adDetails && (
                <div style={{ background:"rgba(255,112,67,0.06)", border:`1px solid rgba(255,112,67,0.18)`, borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.orange, fontFamily:"'DM Mono',monospace", marginBottom:5 }}>Ad Campaign</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>{d.adDetails}</div>
                </div>
              )}
              {d.focusTrack && (
                <div style={{ background:"rgba(255,184,0,0.05)", border:`1px solid rgba(255,184,0,0.18)`, borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.gold, fontFamily:"'DM Mono',monospace", marginBottom:5 }}>Focus Track</div>
                  <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.85)" }}>"{d.focusTrack}"</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY ───────────────────────────────────────────── */}
        {activeTab === "history" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* ── Timeframe filter ── */}
            <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.04)", borderRadius:8, padding:3, alignSelf:"flex-start" }}>
              {HISTORY_TIMEFRAMES.map(tf => (
                <button key={tf.label} onClick={() => setHistoryTimeframe(tf.label)} style={{
                  padding:"4px 12px", fontSize:10, fontWeight:700, letterSpacing:"0.08em",
                  textTransform:"uppercase", border:"none", borderRadius:6, cursor:"pointer",
                  background: historyTimeframe === tf.label ? C.surface : "transparent",
                  color:       historyTimeframe === tf.label ? "#fff"    : C.muted,
                  boxShadow:   historyTimeframe === tf.label ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                  transition:"all 0.15s", fontFamily:"'DM Mono',monospace",
                }}>{tf.label}</button>
              ))}
            </div>

            {/* 1 ── SYMPHONIC PITCHED EDITORIAL */}
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.green, fontFamily:"'DM Mono',monospace" }}>Symphonic Pitched Editorial</div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.green, background:"rgba(57,217,138,0.08)", border:`1px solid rgba(57,217,138,0.2)`, borderRadius:99, padding:"2px 10px", letterSpacing:"0.1em" }}>AIRTABLE</span>
                  <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:C.muted, background:"rgba(255,255,255,0.05)", borderRadius:99, padding:"2px 10px" }}>{artistPickups.filter(p => inWindow(p.dateSent)).length} of {artistPickups.length} total</span>
                </div>
              </div>
              {artistPickups.filter(p => inWindow(p.dateSent)).length === 0 ? (
                <div style={{ fontSize:12, color:C.dim, padding:"10px 0" }}>{artistPickups.length > 0 ? "No pickups in this time window." : "No Symphonic pitched placements on record."}</div>
              ) : (
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                      {["Playlist","DSP","Date","Type","Cover"].map(h => (
                        <th key={h} style={{ textAlign:"left", padding:"6px 10px", fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {artistPickups.filter(p => inWindow(p.dateSent)).map((p, i) => (
                      <tr key={i} style={{ borderBottom:`1px solid rgba(255,255,255,0.03)` }}>
                        <td style={{ padding:"8px 10px", fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{p.playlist}</td>
                        <td style={{ padding:"8px 10px" }}>
                          <span style={{ background:`${DSP_COLORS[p.dsp]||C.cyan}18`, color:DSP_COLORS[p.dsp]||C.cyan, border:`1px solid ${DSP_COLORS[p.dsp]||C.cyan}33`, borderRadius:99, padding:"2px 8px", fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>{p.dsp}</span>
                        </td>
                        <td style={{ padding:"8px 10px", fontSize:11, color:C.muted, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{fmtDate(p.dateSent)}</td>
                        <td style={{ padding:"8px 10px" }}>
                          <span style={{ color: p.type==="1st Party" ? C.green : C.gold, fontSize:11, fontWeight:700 }}>{p.type}</span>
                        </td>
                        <td style={{ padding:"8px 10px", textAlign:"center" }}>
                          {p.cover ? <span style={{ color:C.green, fontWeight:700 }}>✓</span> : <span style={{ color:C.dim }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 2 ── EXTERNAL EDITORIAL (Chartmetric) */}
            <div style={{ paddingTop:16, borderTop:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.cyan, fontFamily:"'DM Mono',monospace" }}>External Editorial — Organic</div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.cyan, background:"rgba(0,217,255,0.07)", border:`1px solid rgba(0,217,255,0.2)`, borderRadius:99, padding:"2px 10px", letterSpacing:"0.1em" }}>CHARTMETRIC</span>
                  <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:C.muted, background:"rgba(255,255,255,0.05)", borderRadius:99, padding:"2px 10px" }}>{organicEditorial.filter(p => inWindow(p.date)).length} of {organicEditorial.length} placements</span>
                </div>
              </div>
              {organicEditorial.filter(p => inWindow(p.date)).length === 0 ? (
                <div style={{ fontSize:12, color:C.dim, padding:"10px 0" }}>{organicEditorial.length > 0 ? "No placements in this time window." : "No external editorial placements detected."}</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {organicEditorial.filter(p => inWindow(p.date)).map((p, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 10px", background:"rgba(255,255,255,0.02)", borderRadius:8, border:`1px solid rgba(255,255,255,0.05)` }}>
                      <div style={{ flex:1, fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{p.playlist}</div>
                      <span style={{ background:`${DSP_COLORS[p.dsp]||C.cyan}18`, color:DSP_COLORS[p.dsp]||C.cyan, border:`1px solid ${DSP_COLORS[p.dsp]||C.cyan}33`, borderRadius:99, padding:"2px 8px", fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>{p.dsp}</span>
                      <div style={{ fontSize:10, color:C.muted, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{fmtN(p.followers)} followers</div>
                      <div style={{ fontSize:10, color:C.dim, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{fmtDate(p.date)}</div>
                      {p.note && <span style={{ fontSize:9, color:C.gold, background:"rgba(255,184,0,0.08)", border:`1px solid rgba(255,184,0,0.2)`, borderRadius:99, padding:"1px 7px", whiteSpace:"nowrap" }}>{p.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3 ── USER GENERATED PLAYLISTS (Chartmetric) */}
            <div style={{ paddingTop:16, borderTop:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.purple, fontFamily:"'DM Mono',monospace" }}>User Generated Playlists</div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.cyan, background:"rgba(0,217,255,0.07)", border:`1px solid rgba(0,217,255,0.2)`, borderRadius:99, padding:"2px 10px", letterSpacing:"0.1em" }}>CHARTMETRIC</span>
                  <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:C.muted, background:"rgba(255,255,255,0.05)", borderRadius:99, padding:"2px 10px" }}>{ugcPlaylists.filter(p => inWindow(p.date)).length} of {ugcPlaylists.length} playlists</span>
                </div>
              </div>
              {ugcPlaylists.filter(p => inWindow(p.date)).length === 0 ? (
                <div style={{ fontSize:12, color:C.dim, padding:"10px 0" }}>{ugcPlaylists.length > 0 ? "No UGC playlists in this time window." : "No UGC playlist data available."}</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {ugcPlaylists.filter(p => inWindow(p.date)).map((p, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 10px", background:"rgba(255,255,255,0.02)", borderRadius:8, border:`1px solid rgba(255,255,255,0.05)` }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{p.playlist}</div>
                        <div style={{ fontSize:10, color:C.dim, marginTop:1 }}>by {p.curator}</div>
                      </div>
                      <span style={{ background:`${DSP_COLORS[p.dsp]||C.cyan}18`, color:DSP_COLORS[p.dsp]||C.cyan, border:`1px solid ${DSP_COLORS[p.dsp]||C.cyan}33`, borderRadius:99, padding:"2px 8px", fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>{p.dsp}</span>
                      <div style={{ fontSize:10, color:C.muted, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{fmtN(p.followers)} followers</div>
                      <div style={{ fontSize:10, color:C.dim, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{fmtDate(p.date)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4 ── SIMILAR ARTIST PITCH INTEL (Chartmetric) */}
            <div style={{ paddingTop:16, borderTop:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.gold, fontFamily:"'DM Mono',monospace" }}>Similar Artist Pitch Intel</div>
                <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.cyan, background:"rgba(0,217,255,0.07)", border:`1px solid rgba(0,217,255,0.2)`, borderRadius:99, padding:"2px 10px", letterSpacing:"0.1em" }}>CHARTMETRIC</span>
              </div>
              <div style={{ fontSize:11, color:C.dim, marginBottom:10, lineHeight:1.5 }}>
                Playlists that similar artists have landed on — use as direct pitch targets.
              </div>
              {similarPickups.length === 0 ? (
                <div style={{ fontSize:12, color:C.dim, padding:"10px 0" }}>No similar artist data available.</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {similarPickups.map((p, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 10px", background:"rgba(255,184,0,0.03)", borderRadius:8, border:`1px solid rgba(255,184,0,0.1)` }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{p.playlist}</div>
                        <div style={{ fontSize:10, color:C.gold, marginTop:1 }}>via {p.artist}</div>
                      </div>
                      <span style={{ background:`${DSP_COLORS[p.dsp]||C.cyan}18`, color:DSP_COLORS[p.dsp]||C.cyan, border:`1px solid ${DSP_COLORS[p.dsp]||C.cyan}33`, borderRadius:99, padding:"2px 8px", fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>{p.dsp}</span>
                      <div style={{ fontSize:10, color:C.muted, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{fmtN(p.followers)} followers</div>
                      <span style={{ fontSize:9, fontWeight:700, color:C.gold, background:"rgba(255,184,0,0.08)", border:`1px solid rgba(255,184,0,0.2)`, borderRadius:99, padding:"1px 7px", whiteSpace:"nowrap" }}>Pitch Target</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
