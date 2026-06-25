import { useState, useEffect } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { C, DSP_COLORS, PRIORITY_COLORS, GENRE_COLORS, DRIVER_COLORS, HISTORY_TIMEFRAMES, TooltipStyle } from "../lib/constants.js";
import { T, daysUntil, fmtDate, fmtN } from "../lib/utils.js";
import { symphonicScore, scoreColor } from "../lib/scoreEngine.js";
import DRIVER_DATA_JSON from "../data/driverData.json";
import PICKUPS_JSON from "../data/pickups.json";
import PAST_RELEASES from "../data/pastReleases.json";
import ORGANIC_EDITORIAL from "../data/organicEditorial.json";
import UGC_PLAYLISTS from "../data/ugcPlaylists.json";
import SIMILAR_ARTIST_PICKUPS from "../data/similarArtistPickups.json";
import Pill from "./Pill.jsx";
import SectionLabel from "./SectionLabel.jsx";

export default function ArtistProfilePage({ release, onBack, driverData: driverDataProp, pickups: pickupsProp, isLive }) {
  const [historyTimeframe, setHistoryTimeframe] = useState("1Y");
  const [expandedRelease,  setExpandedRelease]  = useState(null);
  const [historyOpen,      setHistoryOpen]      = useState(false);
  const [releasesOpen,     setReleasesOpen]     = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, [release.id]);

  const DRIVER_DATA    = driverDataProp || DRIVER_DATA_JSON;
  const PICKUPS        = pickupsProp    || PICKUPS_JSON;
  const hasDriverEntry = !!(DRIVER_DATA[release.id] || DRIVER_DATA[release.artist] || DRIVER_DATA[release.upc]);
  const d              = DRIVER_DATA[release.id] || DRIVER_DATA[release.artist] || DRIVER_DATA[release.upc] || {};
  const artistPickups  = PICKUPS
    .filter(p => (p.releaseId && p.releaseId === release.id) || p.artist === release.artist)
    .sort((a,b) => new Date(b.dateSent)-new Date(a.dateSent));
  const pastReleases   = PAST_RELEASES[release.artist] || [];
  const organicEd      = ORGANIC_EDITORIAL[release.artist] || [];
  const ugcPlaylists   = UGC_PLAYLISTS[release.artist] || [];
  const similarPickups = SIMILAR_ARTIST_PICKUPS[release.artist] || [];

  // ── Feature #6: Performance history ────────────────────────────────────────
  const sortedPast     = [...pastReleases].sort((a,b) => new Date(b.date)-new Date(a.date));
  const maxPickups     = Math.max(1, artistPickups.length, ...sortedPast.map(pr => pr.pickups?.length||0));
  const lastPickups    = sortedPast[0]?.pickups?.length ?? null;
  const pickupDelta    = lastPickups !== null ? artistPickups.length - lastPickups : null;

  // ── Feature #7: Playlist targets from similar artist pickups ───────────────
  const playlistTargets = Object.values(
    similarPickups.reduce((acc, p) => {
      const key = p.playlist;
      if (!acc[key]) acc[key] = { playlist:p.playlist, dsp:p.dsp, followers:p.followers, artists:[] };
      if (!acc[key].artists.includes(p.artist)) acc[key].artists.push(p.artist);
      return acc;
    }, {})
  ).sort((a,b) => b.artists.length - a.artists.length).slice(0, 12);
  const sc             = symphonicScore(release, DRIVER_DATA, PICKUPS);
  const scCol          = scoreColor(sc.total);
  const tfDays         = HISTORY_TIMEFRAMES.find(t=>t.label===historyTimeframe)?.days ?? null;
  const cutoff         = tfDays ? new Date(T.getTime() - tfDays*86400000) : null;
  const inWindow       = dateStr => !cutoff || new Date(dateStr) >= cutoff;

  // ── Radar scores ───────────────────────────────────────────────────────────
  const profileStoryScore = Math.min(100,
    (d.story ? 25 : 0) + (d.similarArtists ? 20 : 0) +
    (d.mood?.length > 0 ? 15 : 0) + (d.songStyles?.length > 0 ? 15 : 0) +
    (d.drivers?.length > 0 ? 25 : 0)
  );
  const profileActivityScore = Math.min(100,
    (d.upcomingShows ? 35 : 0) + (d.socialActivity ? 35 : 0) +
    (d.dspTools?.length > 0 ? Math.min(30, d.dspTools.length * 10) : 0)
  );
  const profileMomentumScore = Math.min(100,
    (d.confirmedPress ? 50 : 0) + (d.adDetails ? 50 : 0)
  );

  const profileRd = [
    { metric:"Audience",    value: Math.min(100, Math.round((sc.breakdown.audience/20)*100)), color: C.cyan,    pos:{ top:"2%",  left:"50%" } },
    { metric:"Activity",    value: profileActivityScore,                                color: C.green,   pos:{ top:"25%", left:"93%" } },
    { metric:"History",     value: Math.min(100, artistPickups.length * 12),           color: C.orange,  pos:{ top:"75%", left:"93%" } },
    { metric:"Story",       value: profileStoryScore,                                  color: C.purple,  pos:{ top:"97%", left:"50%" } },
    { metric:"Momentum",    value: profileMomentumScore,                               color: "#E1306C", pos:{ top:"75%", left:"7%"  } },
    { metric:"Consistency", value: d.releaseConsistency || 0,                          color: C.gold,    pos:{ top:"25%", left:"7%"  } },
  ];

  // ── Signal breakdown rows per metric ──────────────────────────────────────
  const profileSignals = [
    { metric:"Audience", value: profileRd.find(x=>x.metric==="Audience").value, color: C.cyan,
      signals:[{ label:`${fmtN(release.spotifyML)} Spotify Monthly Listeners`, active:true,
        detail: release.spotifyML>=1000000 ? "strong" : release.spotifyML>=200000 ? "growing" : "early" }] },
    { metric:"Activity", value: profileActivityScore, color: C.green,
      signals:[
        { label:"Upcoming Shows",    active:!!d.upcomingShows,    detail:d.upcomingShows },
        { label:"Social Activity",   active:!!d.socialActivity,   detail:d.socialActivity },
        { label:"DSP Tools in Use",  active:d.dspTools?.length>0, detail:d.dspTools?.join(", ") },
      ] },
    { metric:"History", value: profileRd.find(x=>x.metric==="History").value, color: C.orange,
      signals:[{ label:`${artistPickups.length} Symphonic pickup${artistPickups.length!==1?"s":""} on record`, active:artistPickups.length>0,
        detail: artistPickups.length>0 ? `Last: ${fmtDate(artistPickups[0].dateSent)} · ${artistPickups[0].playlist}` : null }] },
    { metric:"Story", value: profileStoryScore, color: C.purple,
      signals:[
        { label:"What's the Story",        active:!!d.story },
        { label:"Similar Artists / FFO",   active:!!d.similarArtists,    detail:d.similarArtists },
        { label:"Mood tags",               active:d.mood?.length>0,      detail:d.mood?.join(", ") },
        { label:"Song style tags",         active:d.songStyles?.length>0,detail:d.songStyles?.join(", ") },
        { label:"Marketing drivers",       active:d.drivers?.length>0,   detail:d.drivers?.join(", ") },
      ] },
    { metric:"Momentum", value: profileMomentumScore, color: "#E1306C",
      signals:[
        { label:"Confirmed Press",  active:!!d.confirmedPress, detail:d.confirmedPress },
        { label:"Ad Campaign",      active:!!d.adDetails,      detail:d.adDetails },
      ] },
    { metric:"Consistency", value: d.releaseConsistency||0, color: C.gold,
      signals:[{ label:`${d.releaseConsistency||0}% release consistency score`, active:(d.releaseConsistency||0)>0,
        detail:(d.releaseConsistency||0)>=70?"consistent release cadence":(d.releaseConsistency||0)>0?"sporadic release pattern":"no history" }] },
  ];

  // ── Sub-components ────────────────────────────────────────────────────────
  const PlRow = ({ playlist, dsp, type, cover, dateSent, note, followers, curator, artist: simArtist }) => (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:`1px solid rgba(255,255,255,0.03)` }}>
      <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background:DSP_COLORS[dsp]||C.muted }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{playlist}</div>
        <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>
          {dsp}{type && ` · ${type}`}{dateSent && ` · ${fmtDate(dateSent)}`}
          {followers && ` · ${fmtN(followers)} followers`}
          {curator && ` · @${curator}`}
          {simArtist && ` · via ${simArtist}`}
          {note && <span style={{ color:C.purple }}> · {note}</span>}
        </div>
      </div>
      {cover && <span style={{ fontSize:9, fontWeight:700, color:C.gold, background:"rgba(255,184,0,0.12)", border:`1px solid rgba(255,184,0,0.3)`, borderRadius:4, padding:"1px 6px", flexShrink:0 }}>COVER</span>}
    </div>
  );

  const HistSection = ({ label, source, sourceColor, count, total, children }) => (
    <div style={{ paddingTop:16, borderTop:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:sourceColor, fontFamily:"'DM Mono',monospace" }}>{label}</div>
        <div style={{ display:"flex", gap:6 }}>
          <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.cyan, background:"rgba(0,217,255,0.07)", border:`1px solid rgba(0,217,255,0.2)`, borderRadius:99, padding:"2px 10px" }}>{source}</span>
          <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:C.muted, background:"rgba(255,255,255,0.05)", borderRadius:99, padding:"2px 10px" }}>{count}{total!=null&&` of ${total}`}</span>
        </div>
      </div>
      {children}
    </div>
  );

  const EmptyRow = ({ msg }) => (
    <div style={{ padding:"14px 0", fontSize:11, color:C.dim, textAlign:"center" }}>{msg}</div>
  );

  const CollapsibleToggle = ({ label, isOpen, onToggle, count }) => (
    <button onClick={onToggle} style={{
      width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"14px 20px", background:C.surface, cursor:"pointer",
      border:`1px solid ${isOpen ? "rgba(0,217,255,0.3)" : C.border}`,
      borderRadius: isOpen ? "12px 12px 0 0" : "12px",
      borderBottom: isOpen ? "none" : undefined,
      transition:"all 0.15s",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:"0.08em", color: isOpen ? C.cyan : "rgba(255,255,255,0.85)" }}>{label}</span>
        {count != null && <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.muted, background:"rgba(255,255,255,0.05)", borderRadius:99, padding:"1px 8px" }}>{count}</span>}
      </div>
      <span style={{ fontSize:11, color: isOpen ? C.cyan : C.dim }}>{isOpen ? "▲" : "▼"}</span>
    </button>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

      {/* ── Hero ── */}
      <div style={{ background:`linear-gradient(135deg, ${scCol}0a 0%, transparent 60%)`, borderBottom:`1px solid ${C.border}`, padding:"28px 32px 24px" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'DM Mono',monospace", marginBottom:14, padding:0, display:"flex", alignItems:"center", gap:6 }}>
          ← Back
        </button>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:24 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:54, lineHeight:1, letterSpacing:"0.03em", marginBottom:4 }}>{release.artist}</div>
            <div style={{ fontSize:16, color:C.cyan, fontWeight:700, marginBottom:12 }}>{release.release}</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              <Pill label={release.priority}      color={PRIORITY_COLORS[release.priority]||C.cyan} />
              <Pill label={release.genre}         color={GENRE_COLORS[release.genre]||C.cyan} />
              <Pill label={release.format}        color={C.dim} />
              <Pill label={fmtDate(release.date)} color={C.gold} />
              {release.ei && <Pill label="EI" color={C.green} />}
              {release.override?.map(o => <Pill key={o} label={o} color={C.purple} />)}
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
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
          </div>
          <div style={{ flexShrink:0, textAlign:"center", background:`${scCol}14`, border:`2px solid ${scCol}44`, borderRadius:16, padding:"14px 20px", position:"relative" }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:scCol, fontFamily:"'DM Mono',monospace", marginBottom:4 }}>SYM SCORE</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:88, color:scCol, lineHeight:1, letterSpacing:"0.04em" }}>{sc.total}</div>
            {!isLive && (
              <div style={{ fontSize:8, color:C.muted, fontFamily:"'DM Mono',monospace", marginTop:4, animation:"pulse 1.5s ease infinite" }}>⟳ loading…</div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2-col body ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, minHeight:0 }}>

        {/* ── LEFT — Radar + Signal Breakdown ── */}
        <div style={{ borderRight:`1px solid ${C.border}`, padding:"28px 28px 32px", display:"flex", flexDirection:"column", gap:0 }}>

          <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:16 }}>Strength Profile</div>

          {/* Radar with orbit bubbles */}
          <div style={{ position:"relative", height:360, marginBottom:24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={profileRd} cx="50%" cy="50%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" tick={false} />
                <Radar name={release.artist} dataKey="value"
                  stroke={C.cyan} fill={C.cyan} fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={TooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
            {profileRd.map(({ metric, value, color, pos }) => (
              <div key={metric} style={{
                position:"absolute", top:pos.top, left:pos.left,
                transform:"translate(-50%,-50%)",
                background:`${color}14`, border:`1px solid ${color}40`,
                borderRadius:8, padding:"5px 10px", textAlign:"center",
                backdropFilter:"blur(4px)", pointerEvents:"none",
              }}>
                <div style={{ fontSize:7, color:`${color}cc`, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:1 }}>{metric}</div>
                <div style={{ fontSize:22, color, fontFamily:"'Bebas Neue',sans-serif", lineHeight:1, letterSpacing:"0.03em" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Score breakdown — signal rows */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {profileSignals.map(({ metric, value, color, signals }) => (
              <div key={metric}>
                {/* Metric header */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:color, flexShrink:0 }} />
                  <div style={{ flex:1, fontSize:10, fontWeight:700, color, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace" }}>{metric}</div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color, lineHeight:1 }}>{value}</div>
                  {/* Score bar */}
                  <div style={{ width:60, height:3, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden", flexShrink:0 }}>
                    <div style={{ width:`${value}%`, height:"100%", borderRadius:99, background:color }} />
                  </div>
                </div>
                {/* Signal rows */}
                <div style={{ display:"flex", flexDirection:"column", gap:3, paddingLeft:14 }}>
                  {signals.map((sig, si) => (
                    <div key={si} style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
                      <span style={{ fontSize:10, color: sig.active ? C.green : "rgba(255,255,255,0.2)", flexShrink:0, lineHeight:1.5 }}>
                        {sig.active ? "✓" : "○"}
                      </span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <span style={{ fontSize:11, color: sig.active ? "rgba(255,255,255,0.8)" : C.dim, fontWeight: sig.active ? 600 : 400 }}>
                          {sig.label}
                        </span>
                        {sig.active && sig.detail && (
                          <div style={{ fontSize:10, color:C.muted, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sig.detail}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Feature #6: Performance History ── */}
          {(sortedPast.length > 0 || artistPickups.length > 0) && (
            <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace" }}>Pickup History</div>
                {pickupDelta !== null && (
                  <div style={{
                    fontSize:10, fontWeight:700, fontFamily:"'DM Mono',monospace",
                    color: pickupDelta > 0 ? C.green : pickupDelta < 0 ? "#FF6B6B" : C.muted,
                    background: pickupDelta > 0 ? "rgba(57,217,138,0.1)" : pickupDelta < 0 ? "rgba(255,107,107,0.1)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${pickupDelta > 0 ? "rgba(57,217,138,0.3)" : pickupDelta < 0 ? "rgba(255,107,107,0.3)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius:99, padding:"2px 10px",
                  }}>
                    {pickupDelta > 0 ? `+${pickupDelta}` : pickupDelta} vs last
                  </div>
                )}
              </div>

              {/* Current release row */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:C.cyan, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.9)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {release.release} <span style={{ fontSize:8, color:C.cyan, fontWeight:600, marginLeft:4 }}>CURRENT</span>
                  </div>
                </div>
                <div style={{ width:80, height:6, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden", flexShrink:0 }}>
                  <div style={{ width:`${Math.round((artistPickups.length/maxPickups)*100)}%`, height:"100%", borderRadius:99, background:C.cyan, minWidth: artistPickups.length>0?3:0 }} />
                </div>
                <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:C.cyan, fontWeight:700, width:18, textAlign:"right", flexShrink:0 }}>{artistPickups.length}</div>
              </div>

              {/* Past release rows */}
              {sortedPast.map((pr, i) => {
                const pCount = pr.pickups?.length || 0;
                const barW = Math.round((pCount/maxPickups)*100);
                const age = Math.floor((T.getTime()-new Date(pr.date).getTime())/86400000);
                const ageStr = age < 365 ? `${Math.floor(age/30)}mo` : `${Math.floor(age/365)}yr`;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"rgba(255,255,255,0.15)", flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:10, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {pr.release} <span style={{ fontSize:8, color:C.dim }}>· {ageStr} ago</span>
                      </div>
                    </div>
                    <div style={{ width:80, height:6, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden", flexShrink:0 }}>
                      <div style={{ width:`${barW}%`, height:"100%", borderRadius:99, background:"rgba(255,255,255,0.25)", minWidth:pCount>0?3:0 }} />
                    </div>
                    <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:C.dim, width:18, textAlign:"right", flexShrink:0 }}>{pCount}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT — Detail cards ── */}
        <div style={{ padding:"28px 32px 32px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* ── Feature #2: No driver submission warning ── */}
          {!hasDriverEntry && (
            <div style={{ background:"rgba(255,107,107,0.07)", border:`1px solid rgba(255,107,107,0.35)`, borderRadius:14, padding:18 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <div style={{ fontSize:22, lineHeight:1, flexShrink:0, marginTop:1 }}>⚠</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#FF6B6B", marginBottom:6, letterSpacing:"0.04em" }}>No Driver Submission on File</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", lineHeight:1.6 }}>
                    No pitching context has been submitted for this release. Story, similar artists, mood tags, and marketing drivers are all missing — this will significantly limit pitch effectiveness.
                  </div>
                  <div style={{ marginTop:10, display:"flex", gap:6, flexWrap:"wrap" }}>
                    {["Story","Similar Artists","Mood Tags","Song Styles","Marketing Drivers"].map(item => (
                      <span key={item} style={{ fontSize:9, fontWeight:700, color:"rgba(255,107,107,0.7)", background:"rgba(255,107,107,0.08)", border:"1px solid rgba(255,107,107,0.2)", borderRadius:99, padding:"2px 8px", fontFamily:"'DM Mono',monospace", textTransform:"uppercase", letterSpacing:"0.06em" }}>✗ {item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Story */}
          {d.story && (
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
              <SectionLabel>What's the Story</SectionLabel>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.75)", lineHeight:1.7, margin:0 }}>{d.story}</p>
            </div>
          )}

          {/* Drivers + DSP tools */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
            <SectionLabel>Marketing Drivers</SectionLabel>
            {d.drivers?.length > 0 ? (
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom: d.dspTools?.length > 0 ? 12 : 0 }}>
                {d.drivers.map(dr => (
                  <span key={dr} style={{ background:`${DRIVER_COLORS[dr]||C.cyan}18`, color:DRIVER_COLORS[dr]||C.cyan, border:`1px solid ${DRIVER_COLORS[dr]||C.cyan}44`, borderRadius:99, padding:"3px 10px", fontSize:10, fontWeight:700 }}>{dr}</span>
                ))}
              </div>
            ) : <div style={{ fontSize:11, color:C.dim }}>No drivers submitted</div>}
            {d.dspTools?.length > 0 && (
              <>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:6, marginTop:12 }}>DSP Tools</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {d.dspTools.map(t => (
                    <span key={t} style={{ background:"rgba(57,217,138,0.08)", color:C.green, border:`1px solid rgba(57,217,138,0.25)`, borderRadius:99, padding:"2px 9px", fontSize:10, fontWeight:600 }}>{t}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Shows / Press / Ad */}
          {(d.upcomingShows || d.confirmedPress || d.adDetails) && (
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
              <SectionLabel>Activity &amp; Momentum</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {d.upcomingShows && (
                  <div>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.green, fontFamily:"'DM Mono',monospace", marginBottom:4 }}>Upcoming Shows</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>{d.upcomingShows}</div>
                  </div>
                )}
                {d.confirmedPress && (
                  <div>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.cyan, fontFamily:"'DM Mono',monospace", marginBottom:4 }}>Confirmed Press</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>{d.confirmedPress}</div>
                  </div>
                )}
                {d.adDetails && (
                  <div>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.orange, fontFamily:"'DM Mono',monospace", marginBottom:4 }}>Ad Campaign</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>{d.adDetails}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social grid */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
            <SectionLabel>Social &amp; Audience</SectionLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { label:"Spotify ML",  value:release.spotifyML,  color:DSP_COLORS.Spotify },
                { label:"Instagram",   value:release.igFollowers,     color:"#E1306C" },
                { label:"TikTok",      value:release.tiktokFollowers, color:"#69C9D0" },
                { label:"YouTube",     value:release.ytFollowers,     color:"#FF0000" },
                { label:"Twitter/X",   value:release.twFollowers,     color:"#1DA1F2" },
              ].filter(p => p.value).map(p => (
                <div key={p.label} style={{ background:`${p.color}10`, border:`1px solid ${p.color}25`, borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ fontSize:9, color:C.muted, marginBottom:3 }}>{p.label}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:p.color, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.03em" }}>{fmtN(p.value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Story metadata — similar artists / mood / styles */}
          {(d.similarArtists || d.mood?.length > 0 || d.songStyles?.length > 0) && (
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
              <SectionLabel>Story &amp; Style</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {d.similarArtists && (
                  <div>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.purple, fontFamily:"'DM Mono',monospace", marginBottom:4 }}>Similar Artists / FFO</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>{d.similarArtists}</div>
                  </div>
                )}
                {d.mood?.length > 0 && (
                  <div>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:6 }}>Mood</div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      {d.mood.map(m => <span key={m} style={{ background:"rgba(180,92,255,0.1)", color:C.purple, border:`1px solid rgba(180,92,255,0.3)`, borderRadius:99, padding:"2px 9px", fontSize:10 }}>{m}</span>)}
                    </div>
                  </div>
                )}
                {d.songStyles?.length > 0 && (
                  <div>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:6 }}>Song Styles</div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      {d.songStyles.map(s => <span key={s} style={{ background:"rgba(0,217,255,0.08)", color:C.cyan, border:`1px solid rgba(0,217,255,0.25)`, borderRadius:99, padding:"2px 9px", fontSize:10 }}>{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Feature #7: Playlist Targets ── */}
          {playlistTargets.length > 0 && (
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <SectionLabel>Playlist Targets</SectionLabel>
                <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.gold, background:"rgba(255,184,0,0.08)", border:`1px solid rgba(255,184,0,0.25)`, borderRadius:99, padding:"2px 10px" }}>{playlistTargets.length} playlists</span>
              </div>
              <p style={{ fontSize:10, color:C.dim, lineHeight:1.55, margin:"0 0 14px 0", fontStyle:"italic" }}>
                Based on similar artists, these playlists have shown interest in this sound.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {playlistTargets.map((pt, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom: i < playlistTargets.length-1 ? `1px solid rgba(255,255,255,0.03)` : "none" }}>
                    {/* rank badge */}
                    <div style={{ width:18, height:18, borderRadius:4, background: pt.artists.length >= 3 ? "rgba(255,184,0,0.15)" : pt.artists.length === 2 ? "rgba(0,217,255,0.1)" : "rgba(255,255,255,0.05)", border:`1px solid ${pt.artists.length >= 3 ? "rgba(255,184,0,0.35)" : pt.artists.length === 2 ? "rgba(0,217,255,0.25)" : "rgba(255,255,255,0.1)"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, color: pt.artists.length >= 3 ? C.gold : pt.artists.length === 2 ? C.cyan : C.dim }}>{pt.artists.length}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{pt.playlist}</div>
                      <div style={{ fontSize:10, color:C.muted, marginTop:1, display:"flex", gap:5, alignItems:"center" }}>
                        <span style={{ color:DSP_COLORS[pt.dsp]||C.muted }}>{pt.dsp}</span>
                        {pt.followers && <span>· {fmtN(pt.followers)} followers</span>}
                        <span style={{ color:C.dim }}>· via {pt.artists.join(", ")}</span>
                      </div>
                    </div>
                    <div style={{ fontSize:9, color:pt.artists.length>=3?C.gold:pt.artists.length===2?C.cyan:C.dim, fontFamily:"'DM Mono',monospace", fontWeight:700, flexShrink:0, whiteSpace:"nowrap" }}>
                      {pt.artists.length} {pt.artists.length===1?"match":"matches"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Collapsible: Placement History ── */}
      <div style={{ padding:"0 32px", marginTop:24 }}>
        <CollapsibleToggle
          label="Placement History"
          isOpen={historyOpen}
          onToggle={() => setHistoryOpen(o => !o)}
          count={artistPickups.length + organicEd.length + ugcPlaylists.length}
        />
        {historyOpen && (
          <div style={{ background:C.surface, border:`1px solid rgba(0,217,255,0.3)`, borderTop:"none", borderRadius:"0 0 12px 12px", padding:"20px 24px 24px" }}>
            {/* Timeframe filter */}
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
              <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.04)", borderRadius:8, padding:3 }}>
                {HISTORY_TIMEFRAMES.map(tf => (
                  <button key={tf.label} onClick={() => setHistoryTimeframe(tf.label)} style={{
                    padding:"4px 12px", fontSize:10, fontWeight:700, letterSpacing:"0.08em",
                    textTransform:"uppercase", border:"none", borderRadius:6, cursor:"pointer",
                    background: historyTimeframe===tf.label ? C.bg : "transparent",
                    color: historyTimeframe===tf.label ? "#fff" : C.muted,
                    boxShadow: historyTimeframe===tf.label ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                    transition:"all 0.15s", fontFamily:"'DM Mono',monospace",
                  }}>{tf.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <HistSection label="Symphonic Pitched Editorial" source="AIRTABLE" sourceColor={C.green}
                count={artistPickups.filter(p=>inWindow(p.dateSent)).length} total={artistPickups.length}>
                {artistPickups.filter(p=>inWindow(p.dateSent)).length === 0
                  ? <EmptyRow msg="No Symphonic pitched pickups in this timeframe" />
                  : artistPickups.filter(p=>inWindow(p.dateSent)).map((p,i) => <PlRow key={i} {...p} />)}
              </HistSection>
              <HistSection label="Organic Editorial" source="CHARTMETRIC" sourceColor={C.cyan}
                count={organicEd.filter(p=>inWindow(p.date)).length} total={organicEd.length}>
                {organicEd.filter(p=>inWindow(p.date)).length === 0
                  ? <EmptyRow msg="No organic editorial placements in this timeframe" />
                  : organicEd.filter(p=>inWindow(p.date)).map((p,i) => <PlRow key={i} playlist={p.playlist} dsp={p.dsp} dateSent={p.date} followers={p.followers} note={p.note} />)}
              </HistSection>
              <HistSection label="User-Generated Playlists" source="CHARTMETRIC" sourceColor={C.purple}
                count={ugcPlaylists.filter(p=>inWindow(p.date)).length} total={ugcPlaylists.length}>
                {ugcPlaylists.filter(p=>inWindow(p.date)).length === 0
                  ? <EmptyRow msg="No UGC playlist placements in this timeframe" />
                  : ugcPlaylists.filter(p=>inWindow(p.date)).map((p,i) => <PlRow key={i} playlist={p.playlist} dsp={p.dsp} dateSent={p.date} followers={p.followers} curator={p.curator} />)}
              </HistSection>
              <HistSection label="Similar Artist Pickups" source="CHARTMETRIC" sourceColor={C.gold}
                count={similarPickups.length}>
                {similarPickups.length === 0
                  ? <EmptyRow msg="No similar artist data available" />
                  : similarPickups.map((p,i) => <PlRow key={i} playlist={p.playlist} dsp={p.dsp} followers={p.followers} artist={p.artist} />)}
              </HistSection>
            </div>
          </div>
        )}
      </div>

      {/* ── Collapsible: Release History ── */}
      {pastReleases.length > 0 && (
        <div style={{ padding:"0 32px", marginTop:12, marginBottom:64 }}>
          <CollapsibleToggle
            label="Release History"
            isOpen={releasesOpen}
            onToggle={() => setReleasesOpen(o => !o)}
            count={pastReleases.length}
          />
          {releasesOpen && (
            <div style={{ background:C.surface, border:`1px solid rgba(0,217,255,0.3)`, borderTop:"none", borderRadius:"0 0 12px 12px", padding:"16px 20px 20px" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {pastReleases.map((pr, i) => (
                  <div key={i}>
                    <div onClick={() => setExpandedRelease(expandedRelease===i ? null : i)}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background:"rgba(255,255,255,0.02)", borderRadius:10, cursor:"pointer", border:`1px solid ${expandedRelease===i ? C.cyan+"44" : "transparent"}` }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700 }}>{pr.release}</div>
                        <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{pr.format} · {fmtDate(pr.date)} · {pr.pickups?.length||0} pickup{(pr.pickups?.length||0)!==1?"s":""}</div>
                      </div>
                      <div style={{ fontSize:10, color:C.dim, fontFamily:"'DM Mono',monospace" }}>{expandedRelease===i ? "▲" : "▼"}</div>
                    </div>
                    {expandedRelease===i && pr.pickups?.length > 0 && (
                      <div style={{ padding:"8px 12px 4px", background:"rgba(0,217,255,0.03)", borderRadius:"0 0 10px 10px", border:`1px solid ${C.cyan}22`, borderTop:"none" }}>
                        {pr.pickups.map((p,pi) => <PlRow key={pi} {...p} />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
