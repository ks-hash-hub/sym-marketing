import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";

import { C, DSP_COLORS, PRIORITY_COLORS, GENRE_COLORS, DRIVER_COLORS, NAV_ITEMS, TooltipStyle } from "./lib/constants.js";
import { daysUntil, fmtDate } from "./lib/utils.js";
import { symphonicScore, scoreColor } from "./lib/scoreEngine.js";
import { generateInsights } from "./lib/insightEngine.js";

import RELEASES from "./data/releases.json";
import PICKUPS from "./data/pickups.json";
import DRIVER_DATA from "./data/driverData.json";
import WEEKLY_PICKUP_TREND from "./data/weeklyPickupTrend.json";

import SectionLabel from "./components/SectionLabel.jsx";
import Card from "./components/Card.jsx";
import KPI from "./components/KPI.jsx";
import Pill from "./components/Pill.jsx";
import PlatformDots from "./components/PlatformDots.jsx";
import ArtistPanel from "./components/ArtistPanel.jsx";
import ArtistProfilePage from "./components/ArtistProfilePage.jsx";

export default function App() {
  const [tab, setTab] = useState("command");
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [profileTarget, setProfileTarget] = useState(null);

  // Releases filter + sort state
  const [filterPriority,  setFilterPriority]  = useState("all");
  const [filterGenre,     setFilterGenre]      = useState("all");
  const [filterTerritory, setFilterTerritory]  = useState("all");
  const [filterLead,      setFilterLead]       = useState("all");
  const [filterEI,        setFilterEI]         = useState(false);
  const [filterNoStory,   setFilterNoStory]    = useState(false);
  const [tuesdayMode,     setTuesdayMode]      = useState(false);
  const [sortBy,          setSortBy]           = useState("date");
  const [sortDir,         setSortDir]          = useState("asc");

  const thisWeek   = RELEASES.filter(r => daysUntil(r.date) >= 0 && daysUntil(r.date) <= 7);
  const next30     = RELEASES.filter(r => daysUntil(r.date) >= 0 && daysUntil(r.date) <= 30);
  const p1Releases = RELEASES.filter(r => r.priority === "Priority 1");
  const insights   = useMemo(() => generateInsights(RELEASES, PICKUPS), []);

  const genreData = useMemo(() => {
    const c = {};
    RELEASES.forEach(r => { c[r.genre] = (c[r.genre]||0)+1; });
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({ name, value, fill: GENRE_COLORS[name]||C.cyan }));
  }, []);

  const dspData = useMemo(() => {
    const c = {};
    PICKUPS.forEach(p => { c[p.dsp] = (c[p.dsp]||0)+1; });
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({ name, value }));
  }, []);

  const leadData = useMemo(() => {
    const c = {};
    PICKUPS.forEach(p => { c[p.lead] = (c[p.lead]||0)+1; });
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({ name, value }));
  }, []);

  const releaseTimelineData = useMemo(() => {
    const weeks = {};
    RELEASES.forEach(r => {
      const day = daysUntil(r.date);
      const bucket = day <= 7 ? "This Week" : day <= 14 ? "Week 2" : day <= 21 ? "Week 3" : "Week 4+";
      if (!weeks[bucket]) weeks[bucket] = { week:bucket, p1:0, p2:0, p3:0 };
      if (r.priority==="Priority 1") weeks[bucket].p1++;
      else if (r.priority==="Priority 2") weeks[bucket].p2++;
      else weeks[bucket].p3++;
    });
    return ["This Week","Week 2","Week 3","Week 4+"].map(w => weeks[w]||{ week:w, p1:0, p2:0, p3:0 });
  }, []);

  const insightColors = { urgent:{ bg:"rgba(255,61,127,0.08)", border:"rgba(255,61,127,0.25)", icon:C.pink }, warning:{ bg:"rgba(255,184,0,0.07)", border:"rgba(255,184,0,0.22)", icon:C.gold }, positive:{ bg:"rgba(57,217,138,0.07)", border:"rgba(57,217,138,0.22)", icon:C.green } };

  const navItemStyle = (id) => ({
    display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderRadius:9,
    background: tab===id ? "rgba(0,217,255,0.1)" : "transparent",
    border: tab===id ? `1px solid rgba(0,217,255,0.2)` : "1px solid transparent",
    color: tab===id ? C.cyan : C.muted, fontSize:12, fontWeight:600, letterSpacing:"0.03em",
    cursor:"pointer", transition:"all 0.15s", width:"100%", textAlign:"left", fontFamily:"inherit",
  });

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:"#fff", fontFamily:"'DM Sans','Helvetica Neue',sans-serif", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        table{border-collapse:collapse;width:100%}
        button{font-family:inherit;cursor:pointer}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        .release-row:hover{background:rgba(0,217,255,0.04)!important;cursor:pointer}
        .nav-item:hover{background:rgba(255,255,255,0.04)!important;color:rgba(255,255,255,0.75)!important}
      `}</style>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width:220, flexShrink:0, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, bottom:0, zIndex:50, padding:"20px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28, paddingLeft:4 }}>
          <div style={{ position:"relative", width:8, height:8, flexShrink:0 }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:C.cyan, boxShadow:`0 0 10px ${C.cyan}` }} />
            <div style={{ position:"absolute", inset:-4, borderRadius:"50%", background:C.cyan, opacity:0.12, animation:"pulse 2s ease infinite" }} />
          </div>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:17, letterSpacing:"0.15em", lineHeight:1 }}>SYMPHONIC</div>
            <div style={{ fontSize:8, color:C.dim, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginTop:2 }}>Marketing Intel</div>
          </div>
        </div>

        <nav style={{ display:"flex", flexDirection:"column", gap:3 }}>
          {NAV_ITEMS.map(item => (
            item.soon ? (
              <div key={item.id} style={{ ...navItemStyle(item.id), opacity:0.4, cursor:"default" }}>
                {item.icon}
                <span>{item.label}</span>
                <span style={{ marginLeft:"auto", fontSize:8, fontFamily:"'DM Mono',monospace", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:4, padding:"1px 5px", letterSpacing:"0.06em", color:C.muted }}>SOON</span>
              </div>
            ) : (
              <button key={item.id} className="nav-item" style={navItemStyle(item.id)}
                onClick={() => { setTab(item.id); setSelectedRelease(null); setProfileTarget(null); }}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          ))}
        </nav>

        {tab === "artist-profile" && (
          <button onClick={() => { setTab("releases"); setProfileTarget(null); }}
            style={{ marginTop:12, display:"flex", alignItems:"center", gap:8, padding:"9px 14px", borderRadius:9, background:"rgba(255,255,255,0.04)", border:"1px solid transparent", color:C.muted, fontSize:11, fontWeight:600, cursor:"pointer", width:"100%", textAlign:"left", fontFamily:"inherit" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Releases
          </button>
        )}

        <div style={{ marginTop:"auto", borderTop:`1px solid ${C.border}`, paddingTop:14, display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ background:"rgba(57,217,138,0.08)", border:"1px solid rgba(57,217,138,0.2)", color:C.green, borderRadius:6, padding:"4px 10px", fontSize:9, fontWeight:700, letterSpacing:"0.1em", textAlign:"center" }}>● DEMO DATA</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:C.dim, textAlign:"center" }}>May 17, 2025</div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1, marginLeft:220, minWidth:0 }}>
      <div style={{ padding:"26px 32px 64px", animation:"fadeUp 0.25s ease" }} key={tab}>

        {/* ════════════════ COMMAND CENTER ════════════════ */}
        {tab==="command" && (
          <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
              <KPI label="This Week" value={thisWeek.length} sub="releases dropping" color={C.gold} />
              <KPI label="Priority 1" value={p1Releases.length} sub="top tier releases" color={C.pink} />
              <KPI label="EI Flags" value={RELEASES.filter(r=>r.ei).length} sub="editorial inclusion" color={C.purple} />
              <KPI label="Total Pickups" value={PICKUPS.length} sub="all time" color={C.green} />
              <KPI label="Cover Slots" value={PICKUPS.filter(p=>p.cover).length} sub="this month" color={C.orange} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:10 }}>
              {insights.map((ins, i) => {
                const style = insightColors[ins.type];
                return (
                  <div key={i} style={{ background:style.bg, border:`1px solid ${style.border}`, borderRadius:12, padding:"14px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ fontSize:18, lineHeight:1, marginTop:1 }}>{ins.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.9)", marginBottom:3 }}>{ins.title}</div>
                      <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>{ins.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Pitches leaderboard */}
            {(() => {
              const ranked = [...RELEASES]
                .filter(r => daysUntil(r.date) >= 0 && daysUntil(r.date) <= 30)
                .map(r => ({ r, sc: symphonicScore(r) }))
                .sort((a, b) => b.sc.total - a.sc.total)
                .slice(0, 7);
              return (
                <Card>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <SectionLabel>Top Pitches — Next 30 Days</SectionLabel>
                    <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.cyan, background:"rgba(0,217,255,0.07)", border:`1px solid rgba(0,217,255,0.2)`, borderRadius:99, padding:"2px 10px", letterSpacing:"0.1em" }}>BY SYMPHONIC SCORE</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {ranked.map(({ r, sc }, i) => {
                      const col = scoreColor(sc.total);
                      return (
                        <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom: i < ranked.length-1 ? `1px solid ${C.border}` : "none" }}>
                          <div style={{ width:22, textAlign:"center", fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color: i===0?C.gold:i===1?"rgba(192,192,192,0.9)":i===2?"rgba(180,92,255,0.8)":C.dim, flexShrink:0 }}>{i+1}</div>
                          <div style={{ flexShrink:0, width:42, height:42, borderRadius:10, background:`${col}14`, border:`1px solid ${col}44`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:col, lineHeight:1, letterSpacing:"0.03em" }}>{sc.total}</div>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:700, fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.artist}</div>
                            <div style={{ fontSize:10, color:C.dim, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.release} · {fmtDate(r.date)}</div>
                          </div>
                          <div style={{ flexShrink:0, display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end" }}>
                            <div style={{ width:100, height:4, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                              <div style={{ width:`${sc.total}%`, height:"100%", borderRadius:99, background:col }} />
                            </div>
                            <div style={{ display:"flex", gap:3 }}>
                              {[
                                { v: sc.breakdown.pickups,  label:"PU",  col: C.green },
                                { v: sc.breakdown.audience, label:"ML",  col: C.cyan },
                                { v: sc.breakdown.social,   label:"SOC", col:"#E1306C" },
                                { v: sc.breakdown.drive,    label:"DRV", col: C.orange },
                              ].map(b => (
                                <div key={b.label} style={{ background:`${b.col}15`, border:`1px solid ${b.col}30`, borderRadius:4, padding:"1px 5px", display:"flex", gap:3, alignItems:"center" }}>
                                  <span style={{ fontSize:8, color:`${b.col}cc`, fontFamily:"'DM Mono',monospace", letterSpacing:"0.06em" }}>{b.label}</span>
                                  <span style={{ fontSize:9, fontWeight:800, color:b.col, fontFamily:"'DM Mono',monospace" }}>{b.v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ flexShrink:0 }}>
                            <Pill label={r.priority.replace("Priority ","")} color={PRIORITY_COLORS[r.priority]||C.cyan} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })()}

            {/* Release volume by week */}
            <Card>
              <SectionLabel>Upcoming Release Volume by Week</SectionLabel>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={releaseTimelineData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TooltipStyle} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
                  <Legend wrapperStyle={{ fontSize:11, paddingTop:8 }} />
                  <Bar dataKey="p1" name="Priority 1" stackId="a" fill={C.pink} radius={[0,0,0,0]} />
                  <Bar dataKey="p2" name="Priority 2" stackId="a" fill={C.gold} />
                  <Bar dataKey="p3" name="Priority 3" stackId="a" fill={C.cyan} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <SectionLabel>Pickup Trend — Last 14 Weeks</SectionLabel>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={WEEKLY_PICKUP_TREND}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.cyan}  stopOpacity={0.25} />
                      <stop offset="95%" stopColor={C.cyan}  stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.green} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" tick={{ fill:C.muted, fontSize:10 }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fill:C.muted, fontSize:10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TooltipStyle} />
                  <Area type="monotone" dataKey="pickups"     name="Total"       stroke={C.cyan}  fill="url(#g1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="firstParty"  name="1st Party"   stroke={C.green} fill="url(#g2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Priority 1 — this week cards */}
            <div>
              <SectionLabel>Priority 1 — Releasing This Week</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:14 }}>
                {thisWeek.filter(r=>r.priority==="Priority 1").map(r => {
                  const days = daysUntil(r.date);
                  const allTimePickups = PICKUPS.filter(p => p.artist === r.artist);
                  const hasHistory = allTimePickups.length > 0;
                  const lastPickup = hasHistory ? [...allTimePickups].sort((a,b) => new Date(b.dateSent)-new Date(a.dateSent))[0] : null;
                  const d = DRIVER_DATA[r.artist] || {};
                  const hasStory = !!d.story;
                  return (
                    <div key={r.id} onClick={()=>setSelectedRelease(r)} style={{
                      background: C.surface, border:`1px solid ${C.border}`, borderRadius:14,
                      padding:"18px 20px", cursor:"pointer", transition:"border-color 0.18s",
                    }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                        <div>
                          <div style={{ fontWeight:800, fontSize:15, marginBottom:3 }}>{r.artist}</div>
                          <div style={{ fontSize:12, color:C.muted }}>{r.release}</div>
                        </div>
                        <div style={{ fontSize:11, fontWeight:700, color: days<=3 ? C.pink : C.gold }}>
                          {days === 0 ? "TODAY" : days===1 ? "TOMORROW" : `${days}d`}
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                        <Pill label={r.genre}     color={GENRE_COLORS[r.genre]||C.cyan} />
                        <Pill label={r.territory} color={C.dim} />
                        {r.ei && <Pill label="EI" color={C.green} />}
                        {r.override?.map(o=><Pill key={o} label={o} color={C.purple} />)}
                      </div>
                      {hasHistory && (
                        <div style={{ marginTop:6, background:"rgba(57,217,138,0.06)", border:`1px solid rgba(57,217,138,0.18)`, borderRadius:8, padding:"7px 10px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <span style={{ fontSize:11, color:C.green, fontWeight:700 }}>
                            {allTimePickups.length} all-time pickup{allTimePickups.length !== 1 ? "s" : ""}
                          </span>
                          {lastPickup && (
                            <span style={{ fontSize:10, color:C.muted }}>
                              Last: <span style={{ color:"rgba(255,255,255,0.6)" }}>{lastPickup.playlist}</span> · {fmtDate(lastPickup.dateSent)}
                            </span>
                          )}
                        </div>
                      )}
                      {!hasStory && (
                        <div style={{ marginTop:6, fontSize:10, color:C.gold, fontWeight:700 }}>⚠ No pitch story submitted</div>
                      )}
                    </div>
                  );
                })}
                {thisWeek.filter(r=>r.priority==="Priority 1").length===0 && (
                  <div style={{ color:C.muted, fontSize:13 }}>No Priority 1 releases dropping this week.</div>
                )}
              </div>
            </div>

            {/* Artist detail panel — Command Center inline */}
            {selectedRelease && (
              <div style={{ background:C.surface, border:`1px solid ${C.cyan}33`, borderRadius:16, padding:24, position:"relative" }}>
                <ArtistPanel key={selectedRelease.id} r={selectedRelease} onClose={()=>setSelectedRelease(null)}
                  onViewProfile={()=>{ setProfileTarget(selectedRelease); setSelectedRelease(null); setTab("artist-profile"); }} />
              </div>
            )}

          </div>
        )}

        {/* ════════════════ RELEASES ════════════════ */}
        {tab==="releases" && (() => {
          const allGenres      = [...new Set(RELEASES.map(r=>r.genre))].sort();
          const allTerritories = [...new Set(RELEASES.map(r=>r.territory))].sort();
          const allLeads       = [...new Set(RELEASES.map(r=>r.lead))].sort();

          const filtered = RELEASES.filter(r => {
            const days = daysUntil(r.date);
            if (tuesdayMode && (days < 0 || days > 28)) return false;
            if (tuesdayMode && r.priority === "Priority 3") return false;
            if (filterPriority  !== "all" && r.priority  !== filterPriority)  return false;
            if (filterGenre     !== "all" && r.genre     !== filterGenre)      return false;
            if (filterTerritory !== "all" && r.territory !== filterTerritory)  return false;
            if (filterLead      !== "all" && r.lead      !== filterLead)       return false;
            if (filterEI && !r.ei) return false;
            if (filterNoStory && (DRIVER_DATA[r.artist]||{}).story) return false;
            return true;
          });

          const sorted = [...filtered].sort((a, b) => {
            let va, vb;
            if      (sortBy === "date")     { va = daysUntil(a.date); vb = daysUntil(b.date); }
            else if (sortBy === "artist")   { va = a.artist; vb = b.artist; }
            else if (sortBy === "priority") { va = ["Priority 1","Priority 2","Priority 3"].indexOf(a.priority); vb = ["Priority 1","Priority 2","Priority 3"].indexOf(b.priority); }
            else if (sortBy === "pickups")  { va = PICKUPS.filter(p=>p.artist===a.artist).length; vb = PICKUPS.filter(p=>p.artist===b.artist).length; }
            else if (sortBy === "ml")       { va = a.spotifyML; vb = b.spotifyML; }
            else if (sortBy === "score")    { va = symphonicScore(a).total; vb = symphonicScore(b).total; }
            if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
            return sortDir === "asc" ? va - vb : vb - va;
          });

          const selSty = { background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:7, padding:"5px 10px", fontSize:11, color:"rgba(255,255,255,0.75)", fontFamily:"'DM Mono',monospace", cursor:"pointer", outline:"none" };
          const togSty = (on) => ({ border:`1px solid ${on ? C.cyan : C.border}`, background: on ? "rgba(0,217,255,0.12)" : "rgba(255,255,255,0.03)", color: on ? C.cyan : C.muted, borderRadius:7, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", transition:"all 0.15s" });

          return (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {tuesdayMode && (
                <div style={{ background:"rgba(255,184,0,0.07)", border:`1px solid rgba(255,184,0,0.25)`, borderRadius:10, padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:14 }}>📅</span>
                  <span style={{ fontSize:12, fontWeight:700, color:C.gold }}>Tuesday Review Mode</span>
                  <span style={{ fontSize:11, color:C.muted }}>— P1 + P2 releases within the next 4 weeks · {sorted.length} releases</span>
                </div>
              )}

              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                <button style={togSty(tuesdayMode)} onClick={()=>setTuesdayMode(v=>!v)}>📅 Tue Review</button>
                <div style={{ width:1, height:22, background:C.border }} />
                {[
                  { val:filterPriority,  set:setFilterPriority,  opts:["all","Priority 1","Priority 2","Priority 3"], lbl:"Priority" },
                  { val:filterGenre,     set:setFilterGenre,      opts:["all",...allGenres],                           lbl:"Genre" },
                  { val:filterTerritory, set:setFilterTerritory,  opts:["all",...allTerritories],                      lbl:"Territory" },
                  { val:filterLead,      set:setFilterLead,       opts:["all",...allLeads],                            lbl:"Lead" },
                ].map(({ val, set, opts, lbl }) => (
                  <select key={lbl} value={val} onChange={e=>set(e.target.value)} style={selSty}>
                    {opts.map(o => <option key={o} value={o}>{o === "all" ? `All ${lbl}s` : o}</option>)}
                  </select>
                ))}
                <button style={togSty(filterEI)}      onClick={()=>setFilterEI(v=>!v)}>EI Only</button>
                <button style={togSty(filterNoStory)} onClick={()=>setFilterNoStory(v=>!v)}>Missing Story</button>
                <div style={{ width:1, height:22, background:C.border }} />
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={selSty}>
                  <option value="date">Sort: Date</option>
                  <option value="priority">Sort: Priority</option>
                  <option value="artist">Sort: Artist</option>
                  <option value="pickups">Sort: Pickups</option>
                  <option value="ml">Sort: Spotify ML</option>
                  <option value="score">Sort: Score ↓</option>
                </select>
                <button onClick={()=>setSortDir(v=>v==="asc"?"desc":"asc")} style={{ ...selSty, padding:"5px 9px" }}>
                  {sortDir === "asc" ? "↑" : "↓"}
                </button>
                <span style={{ marginLeft:"auto", fontSize:11, color:C.muted, fontFamily:"'DM Mono',monospace" }}>
                  {sorted.length} / {RELEASES.length}
                </span>
              </div>

              <Card style={{ padding:0, overflow:"hidden" }}>
                <table>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${C.border}`, background:"rgba(255,255,255,0.02)" }}>
                      {["Artist","Release","Genre","Date","Days","Priority","EI","Lead","Pickups","Score","Links"].map(h=>(
                        <th key={h} style={{ textAlign:"left", padding:"10px 16px", color:C.muted, fontWeight:600, fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((r,i) => {
                      const days = daysUntil(r.date);
                      const pickupCount = PICKUPS.filter(p => p.artist === r.artist).length;
                      const hasStory = !!(DRIVER_DATA[r.artist]||{}).story;
                      return (
                        <tr key={r.id} className="release-row" onClick={()=>setSelectedRelease(r)}
                          style={{ borderBottom:`1px solid rgba(255,255,255,0.03)`, background: i%2 ? "rgba(255,255,255,0.012)" : "transparent" }}>
                          <td style={{ padding:"10px 16px" }}>
                            <div style={{ fontWeight:700, fontSize:13 }}>{r.artist}</div>
                            <div style={{ fontSize:10, color:C.dim, marginTop:1 }}>{r.label}</div>
                          </td>
                          <td style={{ padding:"10px 16px", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            <span style={{ fontSize:11, color:C.muted }}>{r.release}</span>
                            {!hasStory && <span style={{ marginLeft:5, fontSize:9, color:C.gold, fontWeight:700 }}>⚠</span>}
                          </td>
                          <td style={{ padding:"10px 16px" }}><Pill label={r.genre} color={GENRE_COLORS[r.genre]||C.cyan} /></td>
                          <td style={{ padding:"10px 16px", fontSize:12, color:C.gold, fontWeight:600, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{fmtDate(r.date)}</td>
                          <td style={{ padding:"10px 16px", fontSize:12, fontWeight:700, fontFamily:"'DM Mono',monospace", color: days<=3?C.pink:days<=7?C.gold:C.muted }}>{days}d</td>
                          <td style={{ padding:"10px 16px" }}><Pill label={r.priority} color={PRIORITY_COLORS[r.priority]||C.cyan} /></td>
                          <td style={{ padding:"10px 16px", textAlign:"center" }}>{r.ei ? <span style={{color:C.green,fontWeight:700}}>✓</span> : <span style={{color:C.dim}}>—</span>}</td>
                          <td style={{ padding:"10px 16px", fontSize:11, color:C.muted, whiteSpace:"nowrap" }}>{r.lead}</td>
                          <td style={{ padding:"10px 16px", fontSize:12, color: pickupCount>0?C.green:C.dim, fontFamily:"'DM Mono',monospace", fontWeight:700 }}>{pickupCount > 0 ? pickupCount : "—"}</td>
                          <td style={{ padding:"10px 16px" }}>
                            {(() => {
                              const sc = symphonicScore(r);
                              const col = scoreColor(sc.total);
                              return (
                                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:19, fontWeight:800, color:col, lineHeight:1, letterSpacing:"0.04em" }}>{sc.total}</div>
                                  <div style={{ width:34, height:4, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                                    <div style={{ width:`${sc.total}%`, height:"100%", borderRadius:99, background:col }} />
                                  </div>
                                </div>
                              );
                            })()}
                          </td>
                          <td style={{ padding:"10px 16px" }} onClick={e=>e.stopPropagation()}>
                            <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                              {r.spotifyLink && (
                                <a href={r.spotifyLink} target="_blank" rel="noreferrer" title="Spotify"
                                  style={{ width:22, height:22, borderRadius:4, background:"#1DB95420", border:"1px solid #1DB95440", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                                </a>
                              )}
                              {r.appleLink && (
                                <a href={r.appleLink} target="_blank" rel="noreferrer" title="Apple Music"
                                  style={{ width:22, height:22, borderRadius:4, background:"#fc3c4420", border:"1px solid #fc3c4440", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#fc3c44"><path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.762-.61c-.559-.094-1.12-.128-1.682-.128H5.876c-.562 0-1.123.034-1.682.128a5.026 5.026 0 0 0-1.762.61C1.31 1.624.563 2.622.24 3.934A9.235 9.235 0 0 0 0 6.124v11.754a9.23 9.23 0 0 0 .24 2.19c.317 1.31 1.062 2.31 2.18 3.043a5.022 5.022 0 0 0 1.762.61c.56.094 1.12.128 1.682.128h12.454c.562 0 1.123-.034 1.682-.128a5.026 5.026 0 0 0 1.762-.61c1.118-.734 1.863-1.733 2.18-3.043a9.235 9.235 0 0 0 .24-2.19V6.125zM14.25 7.688l-4.5 2.25v4.875a2.25 2.25 0 1 1-1.5-2.122V9l6-3v5.625a2.25 2.25 0 1 1-1.5-2.122V7.687z"/></svg>
                                </a>
                              )}
                              {r.presaveLink && (
                                <a href={r.presaveLink} target="_blank" rel="noreferrer" title="Pre-Save"
                                  style={{ width:22, height:22, borderRadius:4, background:"rgba(180,92,255,0.12)", border:`1px solid rgba(180,92,255,0.3)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:C.purple, textDecoration:"none", fontFamily:"'DM Mono',monospace" }}>
                                  PS
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {sorted.length === 0 && (
                      <tr><td colSpan={11} style={{ padding:"28px 16px", textAlign:"center", color:C.dim, fontSize:12 }}>No releases match the current filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </Card>

              {/* Slide-in detail panel */}
              {selectedRelease && (
                <>
                  <div onClick={()=>setSelectedRelease(null)} style={{ position:"fixed", inset:0, background:"rgba(7,8,15,0.6)", zIndex:100, backdropFilter:"blur(2px)" }} />
                  <div style={{ position:"fixed", right:0, top:0, bottom:0, width:520, background:C.surface, borderLeft:`1px solid rgba(0,217,255,0.18)`, zIndex:101, display:"flex", flexDirection:"column", padding:24, animation:"slideIn 0.22s cubic-bezier(0.16,1,0.3,1)" }}>
                    <ArtistPanel key={selectedRelease.id} r={selectedRelease} onClose={()=>setSelectedRelease(null)}
                      onViewProfile={()=>{ setProfileTarget(selectedRelease); setSelectedRelease(null); setTab("artist-profile"); }} />
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* ════════════════ PERFORMANCE ════════════════ */}
        {tab==="performance" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              <KPI label="Total Pickups" value={PICKUPS.length} sub="all time" color={C.green} trend={22} />
              <KPI label="1st Party" value={PICKUPS.filter(p=>p.type==="1st Party").length} sub="DSP editorial" color={C.cyan} />
              <KPI label="3rd Party" value={PICKUPS.filter(p=>p.type==="3rd Party").length} sub="curator network" color={C.gold} />
              <KPI label="Cover Slots" value={PICKUPS.filter(p=>p.cover).length} sub="this period" color={C.pink} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:18 }}>
              <Card>
                <SectionLabel>Weekly Pickup Trend (14 Weeks)</SectionLabel>
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={WEEKLY_PICKUP_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="week" tick={{ fill:C.muted, fontSize:10 }} axisLine={false} tickLine={false} interval={1} />
                    <YAxis tick={{ fill:C.muted, fontSize:10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TooltipStyle} />
                    <Legend wrapperStyle={{ fontSize:11 }} />
                    <Line type="monotone" dataKey="pickups"    name="Total"     stroke={C.cyan}  strokeWidth={2.5} dot={{ fill:C.cyan,  r:3 }} activeDot={{ r:5 }} />
                    <Line type="monotone" dataKey="firstParty" name="1st Party" stroke={C.green} strokeWidth={2}   dot={{ fill:C.green, r:3 }} activeDot={{ r:5 }} />
                    <Line type="monotone" dataKey="thirdParty" name="3rd Party" stroke={C.gold}  strokeWidth={2}   dot={{ fill:C.gold,  r:3 }} activeDot={{ r:5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <SectionLabel>Pickups by Marketing Lead</SectionLabel>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={leadData} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill:C.muted, fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill:C.muted, fontSize:12 }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip contentStyle={TooltipStyle} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="value" name="Pickups" fill={C.green} radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
              <Card>
                <SectionLabel>Pickups by DSP</SectionLabel>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dspData} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill:C.muted, fontSize:10 }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={50} />
                    <YAxis tick={{ fill:C.muted, fontSize:10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TooltipStyle} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="value" name="Pickups" radius={[4,4,0,0]}>
                      {dspData.map((e,i)=><Cell key={i} fill={DSP_COLORS[e.name]||C.cyan} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <SectionLabel>Pickup Genre Distribution</SectionLabel>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={(() => {
                      const c={};
                      PICKUPS.forEach(p=>{c[p.genre]=(c[p.genre]||0)+1;});
                      return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({ name, value }));
                    })()} cx="50%" cy="50%" outerRadius={85} innerRadius={40} dataKey="value" paddingAngle={3}>
                      {PICKUPS.map((_,i)=><Cell key={i} fill={Object.values(GENRE_COLORS)[i % Object.values(GENRE_COLORS).length]} />)}
                    </Pie>
                    <Tooltip contentStyle={TooltipStyle} />
                    <Legend wrapperStyle={{ fontSize:11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

          </div>
        )}

        {/* ════════════════ ARTIST PROFILE ════════════════ */}
        {tab==="artist-profile" && profileTarget && (
          <ArtistProfilePage r={profileTarget} release={profileTarget} onBack={()=>{ setTab("releases"); setProfileTarget(null); }} />
        )}

      </div>
      </div>
    </div>
  );
}
