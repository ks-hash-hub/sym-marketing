import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { C, DSP_COLORS, PRIORITY_COLORS, GENRE_COLORS, DRIVER_COLORS, HISTORY_TIMEFRAMES, TooltipStyle } from "../lib/constants.js";
import { T, daysUntil, fmtDate, fmtN } from "../lib/utils.js";
import { symphonicScore, scoreColor } from "../lib/scoreEngine.js";
import DRIVER_DATA from "../data/driverData.json";
import PICKUPS from "../data/pickups.json";
import PAST_RELEASES from "../data/pastReleases.json";
import ORGANIC_EDITORIAL from "../data/organicEditorial.json";
import UGC_PLAYLISTS from "../data/ugcPlaylists.json";
import SIMILAR_ARTIST_PICKUPS from "../data/similarArtistPickups.json";
import Pill from "./Pill.jsx";
import SectionLabel from "./SectionLabel.jsx";

export default function ArtistProfilePage({ release, onBack }) {
  const [historyTimeframe, setHistoryTimeframe] = useState("1Y");
  const [expandedRelease,  setExpandedRelease]  = useState(null);
  const [historyOpen,      setHistoryOpen]      = useState(false);
  const [releasesOpen,     setReleasesOpen]     = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, [release.id]);
  const d               = DRIVER_DATA[release.artist] || {};
  const artistPickups   = PICKUPS.filter(p => p.artist === release.artist).sort((a,b) => new Date(b.dateSent)-new Date(a.dateSent));
  const pastReleases    = PAST_RELEASES[release.artist] || [];
  const organicEditorial = ORGANIC_EDITORIAL[release.artist] || [];
  const ugcPlaylists    = UGC_PLAYLISTS[release.artist] || [];
  const similarPickups  = SIMILAR_ARTIST_PICKUPS[release.artist] || [];
  const sc              = symphonicScore(release);
  const scCol           = scoreColor(sc.total);
  const tfDays          = HISTORY_TIMEFRAMES.find(t=>t.label===historyTimeframe)?.days??null;
  const cutoff          = tfDays ? new Date(T.getTime()-tfDays*86400000) : null;
  const inWindow        = dateStr => !cutoff || new Date(dateStr) >= cutoff;

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
    { metric:"Audience",    value: Math.min(100, Math.round(release.spotifyML / 60000)), color: C.cyan,    pos:{ top:"2%",  left:"50%" } },
    { metric:"Activity",    value: profileActivityScore,                                  color: C.green,   pos:{ top:"25%", left:"93%" } },
    { metric:"History",     value: Math.min(100, artistPickups.length * 12),             color: C.orange,  pos:{ top:"75%", left:"93%" } },
    { metric:"Story",       value: profileStoryScore,                                    color: C.purple,  pos:{ top:"97%", left:"50%" } },
    { metric:"Momentum",    value: profileMomentumScore,                                 color: "#E1306C", pos:{ top:"75%", left:"7%"  } },
    { metric:"Consistency", value: d.releaseConsistency || 0,                            color: C.gold,    pos:{ top:"25%", left:"7%"  } },
  ];

  const HistSection = ({ label, source, sourceColor, count, total, children }) => (
    <div style={{ paddingTop:16, borderTop:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:sourceColor, fontFamily:"'DM Mono',monospace" }}>{label}</div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.cyan, background:"rgba(0,217,255,0.07)", border:`1px solid rgba(0,217,255,0.2)`, borderRadius:99, padding:"2px 10px", letterSpacing:"0.1em" }}>{source}</span>
          <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:C.muted, background:"rgba(255,255,255,0.05)", borderRadius:99, padding:"2px 10px" }}>{count}{total != null && ` of ${total}`}</span>
        </div>
      </div>
      {children}
    </div>
  );

  const EmptyRow = ({ msg }) => (
    <div style={{ padding:"14px 0", fontSize:11, color:C.dim, textAlign:"center" }}>{msg}</div>
  );

  const PlRow = ({ playlist, dsp, type, cover, dateSent, note, followers, curator, artist: simArtist }) => (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:`1px solid rgba(255,255,255,0.03)` }}>
      <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background: DSP_COLORS[dsp]||C.muted }} />
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

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {/* ── Hero ── */}
      <div style={{ background:`linear-gradient(135deg, ${scCol}0a 0%, transparent 60%)`, borderBottom:`1px solid ${C.border}`, padding:"28px 32px 24px", marginBottom:0 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'DM Mono',monospace", marginBottom:14, padding:0, display:"flex", alignItems:"center", gap:6 }}>
          ← Back
        </button>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:24 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:54, lineHeight:1, letterSpacing:"0.03em", marginBottom:4 }}>{release.artist}</div>
            <div style={{ fontSize:16, color:C.cyan, fontWeight:700, marginBottom:12 }}>{release.release}</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              <Pill label={release.priority} color={PRIORITY_COLORS[release.priority]||C.cyan} />
              <Pill label={release.genre}    color={GENRE_COLORS[release.genre]||C.cyan} />
              <Pill label={release.format}   color={C.dim} />
              <Pill label={fmtDate(release.date)} color={C.gold} />
              {release.ei && <Pill label="EI" color={C.green} />}
              {release.override?.map(o => <Pill key={o} label={o} color={C.purple} />)}
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {[
                { label:"Pickups",  value: sc.breakdown.pickups,     max:25, color: C.green },
                { label:"Audience", value: sc.breakdown.audience,    max:20, color: C.cyan },
                { label:"Social",   value: sc.breakdown.social,      max:20, color: "#E1306C" },
                { label:"Drive",    value: sc.breakdown.drive,       max:20, color: C.orange },
                { label:"Consist.", value: sc.breakdown.consistency, max:15, color: C.gold },
              ].map(({ label, value, max, color }) => (
                <div key={label} style={{ background:`${color}10`, border:`1px solid ${color}30`, borderRadius:7, padding:"3px 8px", display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ fontSize:9, color, fontWeight:700, fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em", textTransform:"uppercase" }}>{label}</span>
                  <span style={{ fontSize:11, fontWeight:800, color, fontFamily:"'DM Mono',monospace" }}>{value}</span>
                  <span style={{ fontSize:9, color:"rgba(255,255,255,0.2)", fontFamily:"'DM Mono',monospace" }}>/{max}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Score badge */}
          <div style={{ flexShrink:0, textAlign:"center", background:`${scCol}14`, border:`2px solid ${scCol}44`, borderRadius:16, padding:"14px 20px" }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:scCol, fontFamily:"'DM Mono',monospace", marginBottom:4 }}>SYM SCORE</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:88, fontWeight:800, color:scCol, lineHeight:1, letterSpacing:"0.04em" }}>{sc.total}</div>
          </div>
        </div>
      </div>

      {/* ── 2-col body ── */}
      <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:0, minHeight:0 }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ borderRight:`1px solid ${C.border}`, padding:"24px 24px 64px", display:"flex", flexDirection:"column", gap:20 }}>

          {/* Story card */}
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
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:d.dspTools?.length > 0 ? 12 : 0 }}>
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

          {/* Similar artists */}
          {similarPickups.length > 0 && (
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
              <SectionLabel>Similar Artist Pickups</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {similarPickups.slice(0,5).map((p, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", borderBottom: i < Math.min(similarPickups.length,5)-1 ? `1px solid rgba(255,255,255,0.03)` : "none" }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:DSP_COLORS[p.dsp]||C.muted, flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.playlist}</div>
                      <div style={{ fontSize:10, color:C.muted }}>{p.dsp} · {p.artist} · {fmtN(p.followers)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social grid */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
            <SectionLabel>Social Presence</SectionLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { label:"Instagram",  value:release.igFollowers, color:"#E1306C" },
                { label:"TikTok",     value:d.tiktok,            color:"#69C9D0" },
                { label:"YouTube",    value:d.youtube,           color:"#FF0000" },
                { label:"Twitter/X",  value:d.twitter,           color:"#1DA1F2" },
                { label:"SoundCloud", value:d.soundcloud,        color:"#ff5500" },
                { label:"Spotify ML", value:release.spotifyML,   color:DSP_COLORS.Spotify },
              ].filter(p => p.value).map(p => (
                <div key={p.label} style={{ background:`${p.color}10`, border:`1px solid ${p.color}25`, borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ fontSize:9, color:C.muted, marginBottom:3 }}>{p.label}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:p.color, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.03em" }}>{fmtN(p.value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Shows + Press */}
          {(d.upcomingShows || d.confirmedPress || d.adDetails) && (
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
              <SectionLabel>Activity & Momentum</SectionLabel>
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
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ padding:"24px 32px 64px", display:"flex", flexDirection:"column", gap:20 }}>

          {/* History card */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:22 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <SectionLabel>Pickup History</SectionLabel>
              <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.04)", borderRadius:8, padding:3 }}>
                {HISTORY_TIMEFRAMES.map(tf => (
                  <button key={tf.label} onClick={() => setHistoryTimeframe(tf.label)} style={{
                    padding:"4px 12px", fontSize:10, fontWeight:700, letterSpacing:"0.08em",
                    textTransform:"uppercase", border:"none", borderRadius:6, cursor:"pointer",
                    background: historyTimeframe === tf.label ? C.bg : "transparent",
                    color: historyTimeframe === tf.label ? "#fff" : C.muted,
                    boxShadow: historyTimeframe === tf.label ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                    transition:"all 0.15s", fontFamily:"'DM Mono',monospace",
                  }}>{tf.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {/* 1 — Symphonic Pitched */}
              <HistSection label="Symphonic Pitched Editorial" source="AIRTABLE" sourceColor={C.green}
                count={artistPickups.filter(p => inWindow(p.dateSent)).length} total={artistPickups.length}>
                {artistPickups.filter(p => inWindow(p.dateSent)).length === 0
                  ? <EmptyRow msg="No Symphonic pitched pickups in this timeframe" />
                  : artistPickups.filter(p => inWindow(p.dateSent)).map((p, i) => (
                      <PlRow key={i} {...p} />
                    ))
                }
              </HistSection>

              {/* 2 — Organic Editorial */}
              <HistSection label="Organic Editorial" source="CHARTMETRIC" sourceColor={C.cyan}
                count={organicEditorial.filter(p => inWindow(p.date)).length} total={organicEditorial.length}>
                {organicEditorial.filter(p => inWindow(p.date)).length === 0
                  ? <EmptyRow msg="No organic editorial placements in this timeframe" />
                  : organicEditorial.filter(p => inWindow(p.date)).map((p, i) => (
                      <PlRow key={i} playlist={p.playlist} dsp={p.dsp} dateSent={p.date} followers={p.followers} note={p.note} />
                    ))
                }
              </HistSection>

              {/* 3 — UGC */}
              <HistSection label="User-Generated Playlists" source="CHARTMETRIC" sourceColor={C.purple}
                count={ugcPlaylists.filter(p => inWindow(p.date)).length} total={ugcPlaylists.length}>
                {ugcPlaylists.filter(p => inWindow(p.date)).length === 0
                  ? <EmptyRow msg="No UGC playlist placements in this timeframe" />
                  : ugcPlaylists.filter(p => inWindow(p.date)).map((p, i) => (
                      <PlRow key={i} playlist={p.playlist} dsp={p.dsp} dateSent={p.date} followers={p.followers} curator={p.curator} />
                    ))
                }
              </HistSection>

              {/* 4 — Similar Artist Pickups */}
              <HistSection label="Similar Artist Pickups" source="CHARTMETRIC" sourceColor={C.gold}
                count={similarPickups.length}>
                {similarPickups.length === 0
                  ? <EmptyRow msg="No similar artist data available" />
                  : similarPickups.map((p, i) => (
                      <PlRow key={i} playlist={p.playlist} dsp={p.dsp} followers={p.followers} artist={p.artist} />
                    ))
                }
              </HistSection>
            </div>
          </div>

          {/* Past Releases */}
          {pastReleases.length > 0 && (
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:22 }}>
              <SectionLabel>Past Release History ({pastReleases.length})</SectionLabel>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {pastReleases.map((pr, i) => (
                  <div key={i}>
                    <div
                      onClick={() => setExpandedRelease(expandedRelease === i ? null : i)}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background:"rgba(255,255,255,0.02)", borderRadius:10, cursor:"pointer", border:`1px solid ${expandedRelease === i ? C.cyan+"44" : "transparent"}` }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700 }}>{pr.release}</div>
                        <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{pr.format} · {fmtDate(pr.date)} · {pr.pickups?.length || 0} pickup{(pr.pickups?.length||0) !== 1 ? "s" : ""}</div>
                      </div>
                      <div style={{ fontSize:10, color:C.dim, fontFamily:"'DM Mono',monospace" }}>{expandedRelease === i ? "▲" : "▼"}</div>
                    </div>
                    {expandedRelease === i && pr.pickups?.length > 0 && (
                      <div style={{ padding:"8px 12px 4px", background:"rgba(0,217,255,0.03)", borderRadius:"0 0 10px 10px", border:`1px solid ${C.cyan}22`, borderTop:"none" }}>
                        {pr.pickups.map((p, pi) => (
                          <PlRow key={pi} {...p} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
