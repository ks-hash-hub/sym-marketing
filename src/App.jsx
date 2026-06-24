import { useState, useMemo, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";

import { C, DSP_COLORS, PRIORITY_COLORS, GENRE_COLORS, DRIVER_COLORS, NAV_ITEMS, TooltipStyle } from "./lib/constants.js";
import { daysUntil, fmtDate } from "./lib/utils.js";
import { symphonicScore, scoreColor } from "./lib/scoreEngine.js";
import { generateInsights } from "./lib/insightEngine.js";
import { useAppData } from "./hooks/useAppData.js";
import { fetchReleaseById } from "./api/airtable.js";

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

  // ── Live data (or JSON fallback) ──────────────────────────────────────────
  const { releases: RELEASES, pickups: PICKUPS, driverData: DRIVER_DATA,
          loading: dataLoading, isLive, isEnriched, lastUpdated, error: dataError } = useAppData();

  // ── URL routing: /recXXXX → artist profile ────────────────────────────────
  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, "").trim();
    if (!path) return;

    // Try matching against already-loaded releases first (fast path)
    const local = RELEASES.find(r => r.id === path || String(r.upc) === path);
    if (local) { setProfileTarget(local); setTab("artist-profile"); return; }

    // If URL is an Airtable record ID, fetch it directly — don't wait for full load
    if (path.startsWith("rec") && import.meta.env.VITE_AIRTABLE_TOKEN) {
      fetchReleaseById(path)
        .then(r => { setProfileTarget(r); setTab("artist-profile"); })
        .catch(() => {}); // silently fall back to command center on error
    }
  }, [RELEASES]);

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname.replace(/^\//, "").trim();
      if (!path) { setTab("command"); setProfileTarget(null); }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const thisWeek   = RELEASES.filter(r => daysUntil(r.date) >= 0 && daysUntil(r.date) <= 7);
  const next30     = RELEASES.filter(r => daysUntil(r.date) >= 0 && daysUntil(r.date) <= 30);
  const p1Releases = RELEASES.filter(r => r.priority === "Priority 1");
  const insights   = useMemo(() => generateInsights(RELEASES, PICKUPS), [RELEASES, PICKUPS]);

  const genreData = useMemo(() => {
    const c = {};
    RELEASES.forEach(r => { c[r.genre] = (c[r.genre]||0)+1; });
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({ name, value, fill: GENRE_COLORS[name]||C.cyan }));
  }, [RELEASES]);

  const dspData = useMemo(() => {
    const c = {};
    PICKUPS.forEach(p => { c[p.dsp] = (c[p.dsp]||0)+1; });
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({ name, value }));
  }, [PICKUPS]);

  const leadData = useMemo(() => {
    const c = {};
    PICKUPS.forEach(p => { c[p.lead] = (c[p.lead]||0)+1; });
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({ name, value }));
  }, [PICKUPS]);

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
  }, [RELEASES]);

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
          <button onClick={() => { setTab("releases"); setProfileTarget(null); window.history.pushState({}, "", "/"); }}
            style={{ marginTop:12, display:"flex", alignItems:"center", gap:8, padding:"9px 14px", borderRadius:9, background:"rgba(255,255,255,0.04)", border:"1px solid transparent", color:C.muted, fontSize:11, fontWeight:600, cursor:"pointer", width:"100%", textAlign:"left", fontFamily:"inherit" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Releases
          </button>
        )}

        <div style={{ marginTop:"auto", borderTop:`1px solid ${C.border}`, paddingTop:14, display:"flex", flexDirection:"column", gap:6 }}>
          {dataLoading ? (
            <div style={{ background:"rgba(0,217,255,0.06)", border:"1px solid rgba(0,217,255,0.2)", color:C.cyan, borderRadius:6, padding:"4px 10px", fontSize:9, fontWeight:700, letterSpacing:"0.1em", textAlign:"center", animation:"pulse 1.5s ease infinite" }}>
              ⟳ LOADING…
            </div>
          ) : isLive ? (
            <div style={{ background:"rgba(0,217,255,0.08)", border:"1px solid rgba(0,217,255,0.25)", color:C.cyan, borderRadius:6, padding:"4px 10px", fontSize:9, fontWeight:700, letterSpacing:"0.1em", textAlign:"center" }}>
              ● LIVE DATA{isEnriched ? " + CM" : ""}
            </div>
          ) : (
            <div style={{ background:"rgba(57,217,138,0.08)", border:"1px solid rgba(57,217,138,0.2)", color:C.green, borderRadius:6, padding:"4px 10px", fontSize:9, fontWeight:700, letterSpacing:"0.1em", textAlign:"center" }}>
              ● DEMO DATA
            </div>
          )}
          {dataError && (
            <div style={{ fontSize:8, color:C.gold, textAlign:"center", fontFamily:"'DM Mono',monospace", padding:"0 4px" }} title={dataError}>
              ⚠ fallback active
            </div>
          )}
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:C.dim, textAlign:"center" }}>
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit" })}`
              : new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })
            }
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1, marginLeft:220, minWidth:0 }}>
      <div style={{ padding:"26px 32px 64px", animation:"fadeUp 0.25s ease" }} key={tab}>

        {/* ════════════════ COMMAND CENTER ════════════════ */}
        {tab==="command" && (() => {
          const ranked = [...RELEASES]
            .filter(r => daysUntil(r.date) >= 0 && daysUntil(r.date) <= 30)
            .map(r => ({ r, sc: symphonicScore(r, DRIVER_DATA, PICKUPS) }))
            .sort((a, b) => b.sc.total - a.sc.total);

          const leads = [...new Set(thisWeek.map(r => r.lead))].sort();
          const byLead = leads.map(lead => ({
            lead,
            releases: thisWeek
              .filter(r => r.lead === lead)
              .sort((a, b) => {
                const po = { "Priority 1":0, "Priority 2":1, "Priority 3":2 };
                return (po[a.priority]||9) - (po[b.priority]||9) || daysUntil(a.date) - daysUntil(b.date);
              }),
          }));

          return (
            <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

              {/* KPI bar */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
                <KPI label="This Week"    value={thisWeek.length}                       sub="releases dropping"    color={C.gold} />
                <KPI label="Priority 1"  value={p1Releases.length}                     sub="top tier releases"    color={C.pink} />
                <KPI label="EI Flags"    value={RELEASES.filter(r=>r.ei).length}        sub="editorial inclusion"  color={C.purple} />
                <KPI label="Total Pickups" value={PICKUPS.length}                       sub="all time"             color={C.green} />
                <KPI label="Cover Slots" value={PICKUPS.filter(p=>p.cover).length}     sub="this month"           color={C.orange} />
              </div>

              {/* 2-col: Priority Releases + This Week by Lead */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, alignItems:"start" }}>

                {/* Priority Releases — Next 30 Days */}
                <Card>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <SectionLabel>Priority Releases — Next 30 Days</SectionLabel>
                    <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.cyan, background:"rgba(0,217,255,0.07)", border:`1px solid rgba(0,217,255,0.2)`, borderRadius:99, padding:"2px 10px", letterSpacing:"0.1em" }}>BY SCORE</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {ranked.map(({ r, sc }, i) => {
                      const col = scoreColor(sc.total);
                      const days = daysUntil(r.date);
                      const hasDriverEntry = !!(DRIVER_DATA[r.artist] || DRIVER_DATA[r.upc]);
                      const d = DRIVER_DATA[r.artist] || DRIVER_DATA[r.upc] || {};
                      return (
                        <div key={r.id} onClick={() => { setProfileTarget(r); setTab("artist-profile"); window.history.pushState({}, "", `/${r.upc}`); }}
                          style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 8px", borderRadius:8,
                            borderBottom: i < ranked.length-1 ? `1px solid ${C.border}` : "none",
                            cursor:"pointer", transition:"background 0.15s" }}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(0,217,255,0.04)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <div style={{ width:20, textAlign:"center", fontFamily:"'Bebas Neue',sans-serif", fontSize:14,
                            color: i===0?C.gold:i===1?"rgba(192,192,192,0.8)":i===2?"rgba(180,92,255,0.7)":C.dim, flexShrink:0 }}>{i+1}</div>
                          <div style={{ flexShrink:0, width:36, height:36, borderRadius:8, background:`${col}14`,
                            border:`1px solid ${col}44`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:col, lineHeight:1 }}>{sc.total}</div>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:700, fontSize:12, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.artist}</div>
                            <div style={{ fontSize:10, color:C.dim, display:"flex", gap:6, alignItems:"center", marginTop:1 }}>
                              <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:120 }}>{r.release}</span>
                              {r.ei && <span style={{ color:C.green, fontWeight:700, fontSize:9 }}>EI</span>}
                              {r.override?.length > 0 && <span style={{ color:C.purple, fontWeight:700, fontSize:9 }}>OVR</span>}
                            </div>
                          </div>
                          <div style={{ flexShrink:0, display:"flex", flexDirection:"column", gap:3, alignItems:"flex-end" }}>
                            <div style={{ display:"flex", gap:3 }}>
                              <div style={{ background:`${PRIORITY_COLORS[r.priority]||C.cyan}18`, border:`1px solid ${PRIORITY_COLORS[r.priority]||C.cyan}40`, borderRadius:4, padding:"1px 6px", fontSize:9, fontWeight:700, color:PRIORITY_COLORS[r.priority]||C.cyan, fontFamily:"'DM Mono',monospace" }}>
                                {r.priority.replace("Priority ","P")}
                              </div>
                              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:4, padding:"1px 6px", fontSize:9, color:C.muted, fontFamily:"'DM Mono',monospace" }}>
                                {days===0?"TODAY":days===1?"TOMORROW":`${days}d`}
                              </div>
                            </div>
                            {!hasDriverEntry
                              ? <span style={{ fontSize:8, color:"#FF6B6B", fontWeight:700 }}>⚠ NO SUBMISSION</span>
                              : !d.story && <span style={{ fontSize:8, color:C.gold }}>⚠ no story</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* This Week by Lead */}
                <Card>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <SectionLabel>This Week by Lead</SectionLabel>
                    <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.muted, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:99, padding:"2px 10px", letterSpacing:"0.06em" }}>{thisWeek.length} releases</span>
                  </div>
                  {byLead.length === 0 ? (
                    <div style={{ color:C.muted, fontSize:13 }}>No releases this week.</div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                      {byLead.map(({ lead, releases }) => {
                        const p1c = releases.filter(r=>r.priority==="Priority 1").length;
                        const p2c = releases.filter(r=>r.priority==="Priority 2").length;
                        const p3c = releases.filter(r=>r.priority==="Priority 3").length;
                        return (
                          <div key={lead}>
                            {/* Lead header */}
                            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                              <div style={{ width:30, height:30, borderRadius:"50%", background:`rgba(0,217,255,0.12)`,
                                border:`1px solid rgba(0,217,255,0.3)`, display:"flex", alignItems:"center", justifyContent:"center",
                                fontFamily:"'Bebas Neue',sans-serif", fontSize:15, color:C.cyan, flexShrink:0 }}>
                                {lead.charAt(0)}
                              </div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontWeight:700, fontSize:13 }}>{lead}</div>
                              </div>
                              <div style={{ display:"flex", gap:4 }}>
                                {p1c > 0 && <span style={{ fontSize:9, fontWeight:700, color:C.pink, background:`${C.pink}15`, border:`1px solid ${C.pink}30`, borderRadius:4, padding:"1px 6px", fontFamily:"'DM Mono',monospace" }}>P1 ×{p1c}</span>}
                                {p2c > 0 && <span style={{ fontSize:9, fontWeight:700, color:C.gold, background:`${C.gold}15`, border:`1px solid ${C.gold}30`, borderRadius:4, padding:"1px 6px", fontFamily:"'DM Mono',monospace" }}>P2 ×{p2c}</span>}
                                {p3c > 0 && <span style={{ fontSize:9, fontWeight:700, color:C.cyan, background:`${C.cyan}15`, border:`1px solid ${C.cyan}30`, borderRadius:4, padding:"1px 6px", fontFamily:"'DM Mono',monospace" }}>P3 ×{p3c}</span>}
                              </div>
                            </div>
                            {/* Release rows */}
                            <div style={{ display:"flex", flexDirection:"column", gap:4, paddingLeft:40 }}>
                              {releases.map(r => {
                                const sc = symphonicScore(r, DRIVER_DATA, PICKUPS);
                                const col = scoreColor(sc.total);
                                const days = daysUntil(r.date);
                                const hasDriverEntry2 = !!(DRIVER_DATA[r.artist] || DRIVER_DATA[r.upc]);
                                const d = DRIVER_DATA[r.artist] || DRIVER_DATA[r.upc] || {};
                                const dotColor = r.priority==="Priority 1"?C.pink:r.priority==="Priority 2"?C.gold:C.cyan;
                                return (
                                  <div key={r.id} onClick={() => { setProfileTarget(r); setTab("artist-profile"); window.history.pushState({}, "", `/${r.upc}`); }}
                                    style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", borderRadius:7,
                                      background:"rgba(255,255,255,0.02)", border:`1px solid ${C.border}`, cursor:"pointer", transition:"background 0.15s" }}
                                    onMouseEnter={e=>e.currentTarget.style.background="rgba(0,217,255,0.04)"}
                                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}>
                                    <div style={{ width:6, height:6, borderRadius:"50%", background:dotColor, flexShrink:0 }} />
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <div style={{ fontWeight:700, fontSize:12, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.artist}</div>
                                      <div style={{ fontSize:10, color:C.dim, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.release}</div>
                                    </div>
                                    <div style={{ flexShrink:0, display:"flex", gap:5, alignItems:"center" }}>
                                      {r.ei && <span style={{ fontSize:9, fontWeight:700, color:C.green, background:`${C.green}15`, border:`1px solid ${C.green}30`, borderRadius:3, padding:"1px 4px" }}>EI</span>}
                                      {r.override?.length > 0 && <span style={{ fontSize:9, fontWeight:700, color:C.purple, background:`${C.purple}15`, border:`1px solid ${C.purple}30`, borderRadius:3, padding:"1px 4px" }}>OVR</span>}
                                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:17, color:col, lineHeight:1 }}>{sc.total}</div>
                                      <div style={{ fontSize:10, color: days<=3?C.pink:C.muted, fontFamily:"'DM Mono',monospace" }}>
                                        {days===0?"TODAY":days===1?"TMR":`${days}d`}
                                      </div>
                                      {!hasDriverEntry2
                                        ? <span style={{ fontSize:9, color:"#FF6B6B", fontWeight:700 }}>⚠</span>
                                        : !d.story && <span style={{ fontSize:10, color:C.gold }}>⚠</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

              </div>

              {/* Release volume by week — full width */}
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

            </div>
          );
        })()}

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
            else if (sortBy === "score")    { va = symphonicScore(a, DRIVER_DATA, PICKUPS).total; vb = symphonicScore(b, DRIVER_DATA, PICKUPS).total; }
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
                      const hasDriverEntry3 = !!(DRIVER_DATA[r.artist] || DRIVER_DATA[r.upc]);
                      const hasStory = !!(DRIVER_DATA[r.artist]||DRIVER_DATA[r.upc]||{}).story;
                      return (
                        <tr key={r.id} className="release-row" onClick={()=>setSelectedRelease(r)}
                          style={{ borderBottom:`1px solid rgba(255,255,255,0.03)`, background: i%2 ? "rgba(255,255,255,0.012)" : "transparent" }}>
                          <td style={{ padding:"10px 16px" }}>
                            <div style={{ fontWeight:700, fontSize:13 }}>{r.artist}</div>
                            <div style={{ fontSize:10, color:C.dim, marginTop:1 }}>{r.label}</div>
                          </td>
                          <td style={{ padding:"10px 16px", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            <span style={{ fontSize:11, color:C.muted }}>{r.release}</span>
                            {!hasDriverEntry3
                              ? <span style={{ marginLeft:5, fontSize:9, color:"#FF6B6B", fontWeight:700 }}>⚠</span>
                              : !hasStory && <span style={{ marginLeft:5, fontSize:9, color:C.gold, fontWeight:700 }}>⚠</span>}
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
                              const sc = symphonicScore(r, DRIVER_DATA, PICKUPS);
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
                    <ArtistPanel key={selectedRelease.id} r={selectedRelease} onClose={()=>setSelectedRelease(null)} driverData={DRIVER_DATA} pickups={PICKUPS}
                      onViewProfile={()=>{ setProfileTarget(selectedRelease); setSelectedRelease(null); setTab("artist-profile"); window.history.pushState({}, "", `/${selectedRelease.upc}`); }} />
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
          <ArtistProfilePage r={profileTarget} release={profileTarget} onBack={()=>{ setTab("releases"); setProfileTarget(null); window.history.pushState({}, "", "/"); }} driverData={DRIVER_DATA} pickups={PICKUPS} />
        )}

      </div>
      </div>
    </div>
  );
}
