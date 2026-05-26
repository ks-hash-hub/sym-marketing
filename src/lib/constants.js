import { createElement } from "react";

export const C = {
  bg: "#07080f",
  surface: "#0d0f1a",
  border: "rgba(255,255,255,0.07)",
  cyan: "#00d9ff",
  gold: "#ffb800",
  green: "#39d98a",
  pink: "#ff3d7f",
  purple: "#b45cff",
  orange: "#ff7043",
  muted: "rgba(255,255,255,0.38)",
  dim: "rgba(255,255,255,0.16)",
};

export const DSP_COLORS = {
  Spotify: "#1DB954", "Apple Music": "#fc3c44", "Amazon Music": "#FF9900",
  Tidal: "#00BFFF", Deezer: "#a238ff", SoundCloud: "#ff5500",
  Pandora: "#00A0EE", "YouTube Music": "#FF0000",
};

export const PRIORITY_COLORS = { "Priority 1": C.pink, "Priority 2": C.gold, "Priority 3": C.cyan };

export const GENRE_COLORS = {
  Electronic: C.cyan, Latin: C.orange, Pop: C.purple, "R&B": C.pink,
  "Hip-Hop": C.gold, Folk: C.green, Country: "#c9a84c", Alternative: "#7ec8e3", Rock: "#ff6b6b",
};

export const DRIVER_COLORS = {
  "Touring": C.green, "Press Campaign": C.cyan, "Radio Campaign": C.gold,
  "Social Media Campaign": C.pink, "Ad Campaign": C.orange, "Sync Placement": C.purple,
  "Brand Partnership": "#ff9f43",
};

export const HISTORY_TIMEFRAMES = [
  { label:"30D",  days:30  },
  { label:"90D",  days:90  },
  { label:"6M",   days:180 },
  { label:"1Y",   days:365 },
  { label:"All",  days:null },
];

export const TooltipStyle = {
  background:"#13152a",
  border:`1px solid ${C.border}`,
  borderRadius:8,
  padding:"10px 14px",
  fontSize:12,
  color:"#fff",
};

export const NavIc = ({ d }) =>
  createElement(
    "svg",
    { width:"15", height:"15", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round", style:{flexShrink:0} },
    ...d.map((p, i) => createElement("path", { key:i, d:p }))
  );

export const NAV_ITEMS = [
  { id:"command",     label:"Command Center", icon:createElement(NavIc, { d:["M3 3h7v7H3z","M14 3h7v7h-7z","M3 14h7v7H3z","M14 14h7v7h-7z"] }) },
  { id:"releases",    label:"Releases",       icon:createElement(NavIc, { d:["M3 6h18","M3 12h18","M3 18h18"] }) },
  { id:"performance", label:"Performance",    icon:createElement(NavIc, { d:["M18 20V10","M12 20V4","M6 20v-6"] }) },
  { id:"artists",     label:"Artists",        icon:createElement(NavIc, { d:["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"] }), soon:true },
  { id:"campaigns",   label:"Campaigns",      icon:createElement(NavIc, { d:["M22 12h-4l-3 9L9 3l-3 9H2"] }), soon:true },
];
