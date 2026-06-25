import {
  initializeBlock,
  useBase,
  useCursor,
  useLoadable,
  useWatchable,
  useRecords,
  useGlobalConfig,
  Box,
  Input,
  Button,
  Text,
} from "@airtable/blocks/ui";
import React, { useState, useMemo } from "react";
import { symphonicScore, scoreColor } from "./scoreEngine.js";

// ─── Table IDs ────────────────────────────────────────────────────────────

const TBL_RELEASES = "tblG0xtGOTXKbW7Bw";
const TBL_DRIVERS  = "tbl04m1kqODv3lNUm";
const TBL_PICKUPS  = "tbl8y6oVi2GjYgu7U";

// ─── Design tokens ────────────────────────────────────────────────────────

const C = {
  bg:      "#12141e",
  surface: "#1a1d2c",
  border:  "rgba(255,255,255,0.06)",
  muted:   "rgba(255,255,255,0.35)",
  dim:     "rgba(255,255,255,0.2)",
  green:   "#39d98a",
  cyan:    "#00d9ff",
  purple:  "#b45cff",
  orange:  "#ff8c42",
  gold:    "#ffb800",
  pink:    "#ff3f7a",
};

const PRIORITY_MAP = {
  "High Priority": "Priority 1", "Medium Priority": "Priority 2", "Low Priority": "Priority 3",
};

const PRIORITY_COLORS = {
  "Priority 1": C.pink, "Priority 2": C.gold, "Priority 3": C.muted,
};

const DSP_COLORS = {
  Spotify: "#1db954", "Apple Music": "#fa233b", "Amazon Music": "#ff9900",
  Tidal: "#00ffff", Deezer: "#a238ff", YouTube: "#FF0000",
};

// ─── Playlist targets by genre ────────────────────────────────────────────

const GENRE_TARGETS = {
  "R&B/Soul":          [{pl:"R&B Radar",dsp:"Spotify",n:3},{pl:"Soul in the City",dsp:"Apple Music",n:2},{pl:"Late Night R&B",dsp:"Spotify",n:2},{pl:"New R&B",dsp:"Amazon Music",n:1}],
  "Hip Hop/Rap":       [{pl:"Rap Caviar",dsp:"Spotify",n:3},{pl:"Most Necessary",dsp:"Spotify",n:2},{pl:"Hip Hop Central",dsp:"Apple Music",n:2},{pl:"New Hip-Hop",dsp:"Amazon Music",n:1}],
  "Pop":               [{pl:"New Music Friday",dsp:"Spotify",n:3},{pl:"Pop Rising",dsp:"Spotify",n:2},{pl:"Breaking Pop",dsp:"Apple Music",n:2},{pl:"Fresh Finds",dsp:"Spotify",n:1}],
  "Alternative":       [{pl:"All New Alt",dsp:"Spotify",n:3},{pl:"New Noise",dsp:"Spotify",n:2},{pl:"Breaking Alternative",dsp:"Apple Music",n:2}],
  "Country":           [{pl:"New Boots",dsp:"Spotify",n:3},{pl:"Country Rising",dsp:"Spotify",n:2},{pl:"New in Country",dsp:"Apple Music",n:2}],
  "Classical":         [{pl:"Classical New Releases",dsp:"Spotify",n:3},{pl:"New Classical",dsp:"Apple Music",n:2},{pl:"Classical Focus",dsp:"Amazon Music",n:2}],
  "Electronic":        [{pl:"Electronic Rising",dsp:"Spotify",n:3},{pl:"Synthwave Spectrum",dsp:"Spotify",n:2},{pl:"New Arrivals: Electronic",dsp:"Apple Music",n:2},{pl:"Dance Hits",dsp:"Amazon Music",n:1}],
  "Christian & Gospel":[{pl:"Christian Hits",dsp:"Spotify",n:3},{pl:"Worship & Devotion",dsp:"Apple Music",n:2},{pl:"Christian Rising",dsp:"Spotify",n:2}],
  "Jazz":              [{pl:"State of Jazz",dsp:"Spotify",n:3},{pl:"Jazz Classics",dsp:"Spotify",n:2},{pl:"Jazz New Releases",dsp:"Apple Music",n:2}],
  "Folk":              [{pl:"Fresh Folk",dsp:"Spotify",n:3},{pl:"Folk & Singer-Songwriter",dsp:"Apple Music",n:2},{pl:"Acoustic Morning",dsp:"Spotify",n:2}],
  "Singer/Songwriter": [{pl:"Singer-Songwriter",dsp:"Spotify",n:3},{pl:"Acoustic Hits",dsp:"Spotify",n:2},{pl:"A-List Singer/Songwriter",dsp:"Apple Music",n:2}],
  "Rock":              [{pl:"Rock This",dsp:"Spotify",n:3},{pl:"All New Rock",dsp:"Apple Music",n:2},{pl:"New Rock Arrivals",dsp:"Spotify",n:1}],
  "Latin":             [{pl:"Baila Reggaeton",dsp:"Spotify",n:3},{pl:"Latin Pop Rising",dsp:"Spotify",n:2},{pl:"Latin Hits",dsp:"Apple Music",n:2}],
  "Punk":              [{pl:"Punk Classics",dsp:"Spotify",n:2},{pl:"Rock This",dsp:"Apple Music",n:2},{pl:"Punk & Alt",dsp:"Spotify",n:1}],
};

function getTargets(genre) {
  if (!genre) return GENRE_TARGETS["Pop"];
  const key = Object.keys(GENRE_TARGETS).find(k => genre.toLowerCase().includes(k.toLowerCase()));
  return key ? GENRE_TARGETS[key] : GENRE_TARGETS["Pop"];
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const fmtN = n =>
  !n ? "0" : n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : String(n);

const scoreLabel = s =>
  s >= 70 ? "Strong — ready to pitch"
  : s >= 50 ? "Good — a few gaps"
  : s >= 35 ? "Fair — needs attention"
  : "Weak — missing key info";

const mono  = { fontFamily: "'DM Mono', 'Courier New', monospace" };
const bebas = { fontFamily: "'Bebas Neue', 'Impact', sans-serif" };

// ─── SVG Radar Chart ─────────────────────────────────────────────────────

function RadarChart({ sc, size }) {
  size = size || 180;
  const cx = size / 2, cy = size / 2;
  const r  = cx * 0.62;

  const axes = ["AUD", "ACT", "HIST", "STORY", "MOM", "CONS"];
  const cols = [C.cyan, C.green, C.orange, C.purple, C.pink, C.gold];
  const vals = [
    Math.min(100, (sc.breakdown.audience / 20) * 100),
    Math.min(100, (sc.breakdown.drive / 15) * 100),
    Math.min(100, (sc.breakdown.pickups / 25) * 100),
    Math.min(100, (sc.breakdown.story / 15) * 100),
    Math.min(100, ((sc.breakdown.drive + sc.breakdown.consistency) / 25) * 100),
    Math.min(100, (sc.breakdown.consistency / 10) * 100),
  ];

  const ringPoints = function(f) {
    return [0,1,2,3,4,5].map(function(i) {
      var a = i * Math.PI * 2 / 6 - Math.PI / 2;
      return (cx + Math.cos(a)*r*f) + "," + (cy + Math.sin(a)*r*f);
    }).join(" ");
  };

  const dataPoints = vals.map(function(v, i) {
    var a = i * Math.PI * 2 / 6 - Math.PI / 2;
    var d = r * (v / 100);
    return (cx + Math.cos(a)*d) + "," + (cy + Math.sin(a)*d);
  }).join(" ");

  return (
    <svg viewBox={"0 0 " + size + " " + size} width={size} height={size} style={{ display: "block" }}>
      {[0.3, 0.6, 0.85, 1].map(function(f, ri) {
        return <polygon key={ri} points={ringPoints(f)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      {[0,1,2,3,4,5].map(function(i) {
        var a = i * Math.PI * 2 / 6 - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a)*r} y2={cy + Math.sin(a)*r} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
      })}
      <polygon points={dataPoints} fill="rgba(0,217,255,0.1)" stroke={C.cyan} strokeWidth="1.5" />
      {axes.map(function(ax, i) {
        var a   = i * Math.PI * 2 / 6 - Math.PI / 2;
        var bx  = cx + Math.cos(a) * (r + 14);
        var by  = cy + Math.sin(a) * (r + 14);
        var col = cols[i];
        var val = Math.round(vals[i]);
        return (
          <g key={i}>
            <rect x={bx-11} y={by-9} width="22" height="18" rx="3" fill={col + "10"} stroke={col + "3a"} />
            <text x={bx} y={by-1} textAnchor="middle" fontSize="4" fontFamily="'DM Mono',monospace" fill={col + "90"}>{ax}</text>
            <text x={bx} y={by+7} textAnchor="middle" fontSize="8" fontFamily="'Bebas Neue',sans-serif" fill={col}>{val}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────

function Settings({ globalConfig, onSave }) {
  const [url, setUrl] = useState(globalConfig.get("dashboardUrl") || "");
  return (
    <div style={{ padding: 16, background: C.bg, minHeight: "100%" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Dashboard URL</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.6 }}>
        Paste your Cloud Run URL so "View Full Profile" links work. The link will be<br/>
        <span style={Object.assign({}, mono, { color: C.cyan, fontSize: 11 })}>[url]/[UPC]</span>
      </div>
      <Input value={url} onChange={function(e) { setUrl(e.target.value); }} placeholder="https://your-service.run.app" style={{ marginBottom: 10 }} />
      <Button onClick={function() { globalConfig.setAsync("dashboardUrl", url.trim()); onSave(); }} variant="primary">Save</Button>
    </div>
  );
}

// ─── Main extension ───────────────────────────────────────────────────────

function SymphonicScoreExtension() {
  const base         = useBase();
  const cursor       = useCursor();
  const globalConfig = useGlobalConfig();
  const [showSettings, setShowSettings] = useState(false);

  useLoadable(cursor);
  useWatchable(cursor, ["selectedRecordIds", "activeTableId"]);

  const dashboardUrl = (globalConfig.get("dashboardUrl") || "").replace(/\/$/, "");

  const releasesTable = base.getTableByIdIfExists(TBL_RELEASES);
  const driversTable  = base.getTableByIdIfExists(TBL_DRIVERS);
  const pickupsTable  = base.getTableByIdIfExists(TBL_PICKUPS);

  const releaseRecords = useRecords(releasesTable, {
    fields: [
      "UPC CODE", "ARTIST NAME (FOR ZAP)", "Release*", "DATE",
      "PRIORITY LEVEL", "GENRE", "EDITORIAL INCLUSION",
      "SPOTIFY ML (from ARTIST)", "IG FOLLOWERS (from ARTIST)",
    ],
  });

  const driverRecords = useRecords(driversTable, {
    fields: ["UPC", "ARTIST", "RELEASE LINK", "WHAT'S THE STORY", "SIMILAR ARTISTS / FOR FANS OF", "MOOD", "SONG STYLES", "MARKETING DRIVERS (MS)", "UPCOMING SHOWS", "AD DETAILS", "CONFIRMED PRESS"],
  });

  const pickupRecords = useRecords(pickupsTable, {
    fields: ["ARTIST", "UPC", "1ST or 3RD", "COVER", "PLAYLIST"],
  });

  const selectedId = cursor.selectedRecordIds && cursor.selectedRecordIds[0];
  const activeRec  = cursor.activeTableId === TBL_RELEASES
    ? releaseRecords && releaseRecords.find(function(r) { return r.id === selectedId; })
    : null;

  const release = useMemo(function() {
    if (!activeRec) return null;
    var cv  = function(f) { return activeRec.getCellValue(f); };
    var cvs = function(f) { return activeRec.getCellValueAsString(f); };

    // Lookup fields return [{linkedRecordId, value}] — extract the value
    function lookupNum(f) {
      var raw = cv(f);
      if (!raw) return 0;
      if (Array.isArray(raw)) return Number((raw[0] && raw[0].value != null ? raw[0].value : raw[0])) || 0;
      return Number(raw) || 0;
    }

    return {
      id:              activeRec.id,
      upc:             cvs("UPC CODE"),
      artist:          cvs("ARTIST NAME (FOR ZAP)"),
      release:         cvs("Release*"),
      date:            cvs("DATE"),
      priority:        PRIORITY_MAP[cvs("PRIORITY LEVEL")] || "Priority 3",
      genre:           cvs("GENRE") || "Pop",
      ei:              cv("EDITORIAL INCLUSION") || false,
      spotifyML:       lookupNum("SPOTIFY ML (from ARTIST)"),
      igFollowers:     lookupNum("IG FOLLOWERS (from ARTIST)"),
      tiktokFollowers: 0,
      ytFollowers:     0,
      twFollowers:     0,
    };
  }, [activeRec]);

  const driverData = useMemo(function() {
    if (!release || !driverRecords) return null;
    // RELEASE LINK links to the RELEASES table (not Release Schedule) — IDs won't match.
    // Match by UPC first (unique per release), fall back to artist name.
    var rec = driverRecords.find(function(r) {
      var upc = r.getCellValueAsString("UPC");
      if (upc && upc === release.upc) return true;
      var artist = r.getCellValueAsString("ARTIST");
      return artist === release.artist;
    });
    if (!rec) return null;
    var cv = function(f) { return rec.getCellValue(f); };
    return {
      story:              cv("WHAT'S THE STORY"),
      similarArtists:     cv("SIMILAR ARTISTS / FOR FANS OF"),
      mood:               cv("MOOD") || [],
      songStyles:         cv("SONG STYLES") || [],
      drivers:            cv("MARKETING DRIVERS (MS)") || [],
      upcomingShows:      cv("UPCOMING SHOWS"),
      adDetails:          cv("AD DETAILS"),
      confirmedPress:     cv("CONFIRMED PRESS"),
      socialActivity:     null,
      dspTools:           [],
      releaseConsistency: 0,
    };
  }, [release, driverRecords]);

  const pickups = useMemo(function() {
    if (!release || !pickupRecords) return [];
    return pickupRecords
      .filter(function(r) {
        var links = r.getCellValue("UPC") || [];
        if (links.some(function(l) { return l.id === release.id; })) return true;
        return r.getCellValueAsString("ARTIST") === release.artist;
      })
      .map(function(r) {
        return {
          playlist: r.getCellValueAsString("PLAYLIST"),
          type:     r.getCellValueAsString("1ST or 3RD"),
          cover:    r.getCellValue("COVER") || false,
        };
      });
  }, [release, pickupRecords]);

  const sc = useMemo(function() {
    return release ? symphonicScore(release, driverData || {}, pickups) : null;
  }, [release, driverData, pickups]);

  if (!releasesTable || !driversTable || !pickupsTable) {
    return <Box padding="16px"><Text textColor={C.pink}>Table IDs not found in this base.</Text></Box>;
  }

  if (showSettings) {
    return <Settings globalConfig={globalConfig} onSave={function() { setShowSettings(false); }} />;
  }

  if (!release || !sc) {
    return (
      <div style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80%", gap: 12, background: C.bg }}>
        <div style={{ fontSize: 28 }}>🎵</div>
        <div style={{ fontSize: 13, color: C.muted, textAlign: "center", lineHeight: 1.6 }}>
          Select a row in the <strong style={{ color: "#f1f5f9" }}>Release Schedule</strong> table to see its Symphonic Score.
        </div>
        <button onClick={function() { setShowSettings(true); }} style={{ marginTop: 8, background: "transparent", border: "1px solid " + C.border, color: C.muted, borderRadius: 6, padding: "6px 12px", fontSize: 11, cursor: "pointer" }}>
          ⚙ Settings
        </button>
      </div>
    );
  }

  const scCol      = scoreColor(sc.total);
  const prCol      = PRIORITY_COLORS[release.priority] || C.muted;
  const targets    = getTargets(release.genre).slice(0, 4);
  const hasDrivers = !!driverData;
  const profileUrl = dashboardUrl ? dashboardUrl + "/" + release.id : null;

  const PILLARS = [
    { n: "Pickups",  v: sc.breakdown.pickups,     m: 25, c: C.green   },
    { n: "Audience", v: sc.breakdown.audience,    m: 20, c: C.cyan    },
    { n: "Social",   v: sc.breakdown.social,      m: 15, c: "#E1306C" },
    { n: "Story",    v: sc.breakdown.story,       m: 15, c: C.purple  },
    { n: "Drive",    v: sc.breakdown.drive,       m: 15, c: C.orange  },
    { n: "Consist.", v: sc.breakdown.consistency, m: 10, c: C.gold    },
  ];

  const pills = [
    { label: release.priority === "Priority 1" ? "P1" : release.priority === "Priority 2" ? "P2" : "P3", col: prCol },
    { label: release.genre, col: "rgba(255,255,255,0.42)" },
  ];
  if (release.ei) pills.push({ label: "EI", col: C.green });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 0 }}>

        {/* Header */}
        <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid " + C.border, position: "relative" }}>
          <button onClick={function() { setShowSettings(true); }} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", padding: "2px 5px", borderRadius: 3 }}>⚙</button>
          <div style={Object.assign({}, bebas, { fontSize: 20, letterSpacing: "0.04em", lineHeight: 1, marginBottom: 2, paddingRight: 24 })}>{release.artist}</div>
          <div style={{ fontSize: 10, color: C.cyan, fontWeight: 600, marginBottom: 8 }}>{release.release}</div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {pills.map(function(p) {
              return (
                <span key={p.label} style={Object.assign({}, mono, { display: "inline-block", borderRadius: 3, padding: "1px 6px", fontSize: 8, fontWeight: 700, background: p.col + "14", color: p.col, border: "1px solid " + p.col + "28" })}>{p.label}</span>
              );
            })}
          </div>
        </div>

        {/* Score box */}
        <div style={{ margin: "10px 12px", background: scCol + "08", border: "1px solid " + scCol + "22", borderRadius: 9, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={Object.assign({}, bebas, { fontSize: 52, lineHeight: 1, letterSpacing: "0.04em", color: scCol, flexShrink: 0 })}>{sc.total}</div>
          <div>
            <div style={Object.assign({}, mono, { fontSize: 7, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: scCol, marginBottom: 2 })}>SYM Score</div>
            <div style={{ fontSize: 9, color: C.muted }}>{scoreLabel(sc.total)}</div>
          </div>
        </div>

        {/* Radar */}
        <div style={{ padding: "8px 12px 0" }}>
          <div style={Object.assign({}, mono, { fontSize: 7, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 7 })}>Strength Profile</div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <RadarChart sc={sc} size={180} />
          </div>
        </div>

        {/* Pillars */}
        <div style={{ padding: "8px 12px", borderTop: "1px solid " + C.border }}>
          <div style={Object.assign({}, mono, { fontSize: 7, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 7 })}>Score Breakdown</div>
          {PILLARS.map(function(p) {
            return (
              <div key={p.n} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.c, flexShrink: 0 }} />
                <div style={Object.assign({}, mono, { fontSize: 8, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: p.c, flex: 1 })}>{p.n}</div>
                <div style={{ width: 48, height: 3, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ width: Math.round(p.v/p.m*100) + "%", height: "100%", background: p.c, borderRadius: 99 }} />
                </div>
                <div style={Object.assign({}, mono, { fontSize: 8, width: 14, textAlign: "right", flexShrink: 0, color: p.c })}>{p.v}</div>
              </div>
            );
          })}
        </div>

        {/* Playlist targets */}
        <div style={{ padding: "8px 12px", borderTop: "1px solid " + C.border }}>
          <div style={Object.assign({}, mono, { fontSize: 7, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 4 })}>Top Playlist Targets</div>
          <div style={{ fontSize: 9, color: C.dim, fontStyle: "italic", marginBottom: 6 }}>Based on similar artist placements</div>
          {targets.map(function(t, i) {
            var mc = t.n >= 3 ? C.gold : t.n === 2 ? C.cyan : "rgba(255,255,255,0.2)";
            var mb = t.n >= 3 ? "rgba(255,184,0,0.09)" : t.n === 2 ? "rgba(0,217,255,0.07)" : "rgba(255,255,255,0.03)";
            var dc = DSP_COLORS[t.dsp] || C.cyan;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.025)" }}>
                <div style={Object.assign({}, mono, { width: 16, height: 16, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", background: mb, border: "1px solid " + mc + "28", fontSize: 8, fontWeight: 700, color: mc, flexShrink: 0 })}>{t.n}</div>
                <div style={{ flex: 1, fontSize: 10, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.pl}</div>
                <div style={{ fontSize: 9, color: dc, flexShrink: 0 }}>{t.dsp}</div>
              </div>
            );
          })}
        </div>

        {/* No-driver warning */}
        {!hasDrivers && (
          <div style={{ margin: "7px 12px", background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.18)", borderRadius: 6, padding: "7px 10px", fontSize: 9, color: "#ff8080", display: "flex", gap: 6, alignItems: "flex-start" }}>
            <span>⚠</span>
            <div>
              <strong style={{ color: "#ff6b6b", display: "block", marginBottom: 2, fontSize: 10 }}>No Driver Submission</strong>
              No pitching context on file.
            </div>
          </div>
        )}

        {/* Audience stats */}
        <div style={{ padding: "8px 12px", borderTop: "1px solid " + C.border }}>
          <div style={Object.assign({}, mono, { fontSize: 7, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 7 })}>Audience</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {[
              { label: "Spotify ML", value: fmtN(release.spotifyML),  color: DSP_COLORS.Spotify },
              { label: "Instagram",  value: fmtN(release.igFollowers), color: "#E1306C" },
            ].map(function(s) {
              return (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 6, padding: "7px 9px" }}>
                  <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{s.label}</div>
                  <div style={Object.assign({}, bebas, { fontSize: 18, color: s.color, lineHeight: 1 })}>{s.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 14 }} />
      </div>

      {/* Sticky footer */}
      <div style={{ flexShrink: 0, padding: "10px 12px 14px", borderTop: "1px solid " + C.border, background: C.bg }}>
        {profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={Object.assign({}, mono, {
              display: "block", width: "100%", textAlign: "center",
              background: "rgba(0,217,255,0.09)", border: "1px solid rgba(0,217,255,0.28)",
              color: C.cyan, borderRadius: 7, padding: "9px 0", fontSize: 10,
              fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              textDecoration: "none", cursor: "pointer",
            })}
          >
            ⚡ VIEW FULL PROFILE →
          </a>
        ) : (
          <button
            onClick={function() { setShowSettings(true); }}
            style={Object.assign({}, mono, {
              width: "100%", textAlign: "center", background: "rgba(255,255,255,0.04)",
              border: "1px solid " + C.border, color: C.muted, borderRadius: 7, padding: "9px 0",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: "pointer",
            })}
          >
            ⚙ Set dashboard URL to enable link
          </button>
        )}
      </div>
    </div>
  );
}

initializeBlock(function() { return <SymphonicScoreExtension />; });
