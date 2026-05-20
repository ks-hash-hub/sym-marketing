import { useState, useMemo, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from "recharts";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
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

const DSP_COLORS = {
  Spotify: "#1DB954", "Apple Music": "#fc3c44", "Amazon Music": "#FF9900",
  Tidal: "#00BFFF", Deezer: "#a238ff", SoundCloud: "#ff5500",
  Pandora: "#00A0EE", "YouTube Music": "#FF0000",
};
const PRIORITY_COLORS = { "Priority 1": C.pink, "Priority 2": C.gold, "Priority 3": C.cyan };
const GENRE_COLORS = {
  Electronic: C.cyan, Latin: C.orange, Pop: C.purple, "R&B": C.pink,
  "Hip-Hop": C.gold, Folk: C.green, Country: "#c9a84c", Alternative: "#7ec8e3", Rock: "#ff6b6b",
};

// ─── FAKE DATA ─────────────────────────────────────────────────────────────────
const T = new Date("2025-05-17");
const d = (n) => { const x = new Date(T); x.setDate(T.getDate() + n); return x.toISOString().split("T")[0]; };

const RELEASES = [
  { id:1,  upc:"824296182201", artist:"Neon Pulse",      release:"Static Dreams EP",   genre:"Electronic", subgenre:"Synthwave",      date:d(1),  priority:"Priority 1", format:"EP",     ei:true,  spReady:true,  apReady:true,  amReady:false, tiReady:true,  label:"Voltage Records",    lead:"Greg",    clientManager:"Sarah K.", territory:"US",    igFollowers:284000, spotifyML:1200000, override:["Viral Moment"], spotifyLink:"https://open.spotify.com/artist/neonpulse", appleLink:"https://music.apple.com/artist/neonpulse", presaveLink:"https://presave.io/neonpulse-staticdreams" },
  { id:2,  upc:"824296202201", artist:"Luna Vega",       release:"Amor Eterno",        genre:"Latin",      subgenre:"Reggaeton",      date:d(2),  priority:"Priority 1", format:"Single", ei:true,  spReady:true,  apReady:true,  amReady:true,  tiReady:false, label:"Sol Music",          lead:"AJ",      clientManager:"Carlos M.", territory:"LATAM", igFollowers:520000, spotifyML:3400000, override:[],              spotifyLink:"https://open.spotify.com/artist/lunavega",  appleLink:"https://music.apple.com/artist/lunavega",  presaveLink:"https://presave.io/lunavega-amoreterno" },
  { id:3,  upc:"824296302201", artist:"The Marble Way",  release:"Ghost Frequencies",  genre:"Alternative",subgenre:"Indie Rock",     date:d(3),  priority:"Priority 2", format:"Album",  ei:false, spReady:true,  apReady:false, amReady:false, tiReady:false, label:"Marble Records",     lead:"Greg",    clientManager:"Jamie L.",  territory:"UK/EU", igFollowers:92000,  spotifyML:420000,  override:[],              spotifyLink:"https://open.spotify.com/artist/marbleway",  appleLink:null, presaveLink:null },
  { id:4,  upc:"824296402201", artist:"Cassidy Blue",    release:"Midnight Remedy",    genre:"R&B",        subgenre:"Neo-Soul",       date:d(4),  priority:"Priority 1", format:"Single", ei:true,  spReady:false, apReady:false, amReady:false, tiReady:false, label:"Blue Note Dist.",    lead:"AJ",      clientManager:"Sarah K.", territory:"US",    igFollowers:178000, spotifyML:890000,  override:[],              spotifyLink:"https://open.spotify.com/artist/cassidyblue", appleLink:"https://music.apple.com/artist/cassidyblue", presaveLink:"https://presave.io/cassidy-midnightremedy" },
  { id:5,  upc:"824296502201", artist:"Fjord & Echo",    release:"Northern Light",     genre:"Folk",       subgenre:"Americana",      date:d(5),  priority:"Priority 2", format:"Album",  ei:false, spReady:true,  apReady:true,  amReady:true,  tiReady:true,  label:"Roots Co.",          lead:"Greg",    clientManager:"Jamie L.",  territory:"US",    igFollowers:41000,  spotifyML:210000,  override:[],              spotifyLink:"https://open.spotify.com/artist/fjordecho",  appleLink:"https://music.apple.com/artist/fjordecho", presaveLink:null },
  { id:6,  upc:"824296602201", artist:"SABLE",           release:"Ultraviolet",        genre:"Pop",        subgenre:"Electropop",     date:d(6),  priority:"Priority 1", format:"Single", ei:true,  spReady:true,  apReady:true,  amReady:true,  tiReady:true,  label:"Prism Label Group",  lead:"Greg",    clientManager:"Dana P.",  territory:"Global",igFollowers:940000, spotifyML:5200000, override:["CBS Discovery"],spotifyLink:"https://open.spotify.com/artist/sable",     appleLink:"https://music.apple.com/artist/sable",     presaveLink:"https://presave.io/sable-ultraviolet" },
  { id:7,  upc:"824296702201", artist:"Marco Salinas",   release:"Contigo Siempre",    genre:"Latin",      subgenre:"Latin Pop",      date:d(7),  priority:"Priority 2", format:"Single", ei:true,  spReady:true,  apReady:false, amReady:false, tiReady:false, label:"Sol Music",          lead:"AJ",      clientManager:"Carlos M.", territory:"LATAM", igFollowers:215000, spotifyML:1100000, override:[],              spotifyLink:"https://open.spotify.com/artist/marcosalinas", appleLink:null, presaveLink:"https://presave.io/marco-contigo" },
  { id:8,  upc:"824296802201", artist:"Drift Theory",    release:"Coastal Decay",      genre:"Electronic", subgenre:"Ambient",        date:d(10), priority:"Priority 3", format:"Album",  ei:false, spReady:true,  apReady:true,  amReady:false, tiReady:false, label:"Ocea Sounds",        lead:"Jeanette",clientManager:"Jamie L.",  territory:"US",    igFollowers:55000,  spotifyML:290000,  override:[],              spotifyLink:"https://open.spotify.com/artist/drifttheory", appleLink:"https://music.apple.com/artist/drifttheory", presaveLink:null },
  { id:9,  upc:"824296902201", artist:"Halo James",      release:"Broken Signal",      genre:"Hip-Hop",    subgenre:"Trap",           date:d(12), priority:"Priority 1", format:"EP",     ei:true,  spReady:false, apReady:false, amReady:false, tiReady:false, label:"Block Empire",       lead:"AJ",      clientManager:"Sarah K.", territory:"US",    igFollowers:380000, spotifyML:2100000, override:[],              spotifyLink:"https://open.spotify.com/artist/halojames",  appleLink:null, presaveLink:"https://presave.io/halojames-brokensignal" },
  { id:10, upc:"824296012201", artist:"Viveka",          release:"Temple of Noise",    genre:"Pop",        subgenre:"Dark Pop",       date:d(14), priority:"Priority 2", format:"Single", ei:true,  spReady:true,  apReady:true,  amReady:true,  tiReady:false, label:"Prism Label Group",  lead:"Greg",    clientManager:"Dana P.",  territory:"Global",igFollowers:620000, spotifyML:3800000, override:[],              spotifyLink:"https://open.spotify.com/artist/viveka",    appleLink:"https://music.apple.com/artist/viveka",    presaveLink:"https://presave.io/viveka-templeofnoise" },
  { id:11, upc:"824296112201", artist:"The Sundowners",  release:"Last Train Home",    genre:"Country",    subgenre:"Outlaw Country", date:d(15), priority:"Priority 2", format:"Album",  ei:false, spReady:true,  apReady:true,  amReady:true,  tiReady:false, label:"Boothill Records",   lead:"Greg",    clientManager:"Jamie L.",  territory:"US",    igFollowers:130000, spotifyML:640000,  override:[],              spotifyLink:"https://open.spotify.com/artist/sundowners", appleLink:"https://music.apple.com/artist/sundowners", presaveLink:null },
  { id:12, upc:"824296182185", artist:"Mira Echeverría", release:"Constelaciones",     genre:"Latin",      subgenre:"Flamenco-Pop",   date:d(16), priority:"Priority 1", format:"Album",  ei:true,  spReady:true,  apReady:true,  amReady:false, tiReady:true,  label:"Iberia Music",       lead:"AJ",      clientManager:"Carlos M.", territory:"LATAM", igFollowers:710000, spotifyML:4600000, override:[],              spotifyLink:"https://open.spotify.com/artist/miraecheverria", appleLink:"https://music.apple.com/artist/miraecheverria", presaveLink:"https://presave.io/mira-constelaciones" },
  { id:13, upc:"824296312201", artist:"Pale Forest",     release:"Overgrown",          genre:"Folk",       subgenre:"Neo-Folk",       date:d(18), priority:"Priority 3", format:"EP",     ei:false, spReady:true,  apReady:false, amReady:false, tiReady:false, label:"Roots Co.",          lead:"Greg",    clientManager:"Jamie L.",  territory:"US",    igFollowers:28000,  spotifyML:95000,   override:[],              spotifyLink:"https://open.spotify.com/artist/paleforest",  appleLink:null, presaveLink:null },
  { id:14, upc:"824296412201", artist:"Solène",          release:"Comme Avant",        genre:"Pop",        subgenre:"French Pop",     date:d(20), priority:"Priority 2", format:"Single", ei:true,  spReady:true,  apReady:true,  amReady:false, tiReady:false, label:"Maison Sonique",     lead:"Jeanette",clientManager:"Dana P.",  territory:"UK/EU", igFollowers:190000, spotifyML:870000,  override:[],              spotifyLink:"https://open.spotify.com/artist/solene",    appleLink:"https://music.apple.com/artist/solene",    presaveLink:"https://presave.io/solene-commeavant" },
  { id:15, upc:"824296512201", artist:"CRYPT0",          release:"Zero Sum",           genre:"Hip-Hop",    subgenre:"Boom Bap",       date:d(21), priority:"Priority 2", format:"Album",  ei:false, spReady:false, apReady:false, amReady:false, tiReady:false, label:"Block Empire",       lead:"AJ",      clientManager:"Sarah K.", territory:"US",    igFollowers:95000,  spotifyML:480000,  override:[],              spotifyLink:"https://open.spotify.com/artist/crypt0",    appleLink:null, presaveLink:null },
  { id:16, upc:"824296612201", artist:"Tidal Mass",      release:"Undertow",           genre:"Rock",       subgenre:"Post-Rock",      date:d(22), priority:"Priority 3", format:"Album",  ei:false, spReady:true,  apReady:true,  amReady:true,  tiReady:false, label:"Marble Records",     lead:"Greg",    clientManager:"Jamie L.",  territory:"UK/EU", igFollowers:67000,  spotifyML:310000,  override:[],              spotifyLink:"https://open.spotify.com/artist/tidalmass",  appleLink:"https://music.apple.com/artist/tidalmass", presaveLink:null },
  { id:17, upc:"824296712201", artist:"Glass Meridian",  release:"Refraction",         genre:"Electronic", subgenre:"House",          date:d(26), priority:"Priority 1", format:"EP",     ei:true,  spReady:true,  apReady:true,  amReady:true,  tiReady:true,  label:"Voltage Records",    lead:"Jeanette",clientManager:"Dana P.",  territory:"Global",igFollowers:430000, spotifyML:2700000, override:["Deck Worthy"], spotifyLink:"https://open.spotify.com/artist/glassmeridian", appleLink:"https://music.apple.com/artist/glassmeridian", presaveLink:"https://presave.io/glass-refraction" },
  { id:18, upc:"824296812201", artist:"Cedar & Stone",   release:"High Desert",        genre:"Country",    subgenre:"Americana",      date:d(28), priority:"Priority 3", format:"Album",  ei:false, spReady:true,  apReady:true,  amReady:false, tiReady:false, label:"Boothill Records",   lead:"Greg",    clientManager:"Jamie L.",  territory:"US",    igFollowers:49000,  spotifyML:180000,  override:[],              spotifyLink:"https://open.spotify.com/artist/cedarstone",  appleLink:null, presaveLink:null },
  { id:19, upc:"824296912201", artist:"Flor de Noche",   release:"Piel de Luna",       genre:"Latin",      subgenre:"Bolero",         date:d(24), priority:"Priority 2", format:"Single", ei:true,  spReady:true,  apReady:false, amReady:false, tiReady:false, label:"Iberia Music",       lead:"AJ",      clientManager:"Carlos M.", territory:"LATAM", igFollowers:155000, spotifyML:720000,  override:[],              spotifyLink:"https://open.spotify.com/artist/flordenoche", appleLink:null, presaveLink:"https://presave.io/flor-pielluna" },
  { id:20, upc:"824296022201", artist:"Yuki Tanaka",     release:"Sakura Circuit",     genre:"Electronic", subgenre:"J-Dance",        date:d(30), priority:"Priority 2", format:"Single", ei:true,  spReady:false, apReady:false, amReady:false, tiReady:false, label:"Pacific Rim Sounds", lead:"Jeanette",clientManager:"Dana P.",  territory:"APAC",  igFollowers:88000,  spotifyML:350000,  override:[],              spotifyLink:"https://open.spotify.com/artist/yukitanaka",  appleLink:null, presaveLink:"https://presave.io/yuki-sakuracircuit" },
];

const PICKUPS = [
  { playlist:"New Music Friday",       dsp:"Spotify",       artist:"Neon Pulse",     genre:"Electronic", dateSent:d(-3),  type:"1st Party", lead:"Greg",    cover:true  },
  { playlist:"Viva Latino",            dsp:"Spotify",       artist:"Luna Vega",      genre:"Latin",      dateSent:d(-5),  type:"1st Party", lead:"AJ",      cover:true  },
  { playlist:"Electronic Rising",      dsp:"Spotify",       artist:"Glass Meridian", genre:"Electronic", dateSent:d(-7),  type:"1st Party", lead:"Jeanette",cover:false },
  { playlist:"R&B Radar",              dsp:"Spotify",       artist:"Cassidy Blue",   genre:"R&B",        dateSent:d(-2),  type:"1st Party", lead:"AJ",      cover:false },
  { playlist:"Hot Tracks",             dsp:"Apple Music",   artist:"SABLE",          genre:"Pop",        dateSent:d(-1),  type:"1st Party", lead:"Greg",    cover:true  },
  { playlist:"New in Latin",           dsp:"Apple Music",   artist:"Marco Salinas",  genre:"Latin",      dateSent:d(-4),  type:"1st Party", lead:"AJ",      cover:false },
  { playlist:"Indie Spotlight",        dsp:"Spotify",       artist:"The Marble Way", genre:"Alternative",dateSent:d(-10), type:"1st Party", lead:"Greg",    cover:false },
  { playlist:"Synthwave Spectrum",     dsp:"Spotify",       artist:"Neon Pulse",     genre:"Electronic", dateSent:d(-14), type:"3rd Party", lead:"Jeanette",cover:false },
  { playlist:"Urban Hits",             dsp:"Amazon Music",  artist:"Halo James",     genre:"Hip-Hop",    dateSent:d(-6),  type:"1st Party", lead:"AJ",      cover:false },
  { playlist:"Country Heat",           dsp:"Amazon Music",  artist:"The Sundowners", genre:"Country",    dateSent:d(-8),  type:"1st Party", lead:"Greg",    cover:false },
  { playlist:"Alt Now",                dsp:"Apple Music",   artist:"The Marble Way", genre:"Alternative",dateSent:d(-12), type:"1st Party", lead:"Greg",    cover:false },
  { playlist:"Deep House Collective",  dsp:"Spotify",       artist:"Glass Meridian", genre:"Electronic", dateSent:d(-9),  type:"3rd Party", lead:"Jeanette",cover:false },
  { playlist:"TIDAL Rising",           dsp:"Tidal",         artist:"Viveka",         genre:"Pop",        dateSent:d(-3),  type:"1st Party", lead:"Greg",    cover:true  },
  { playlist:"Fresh Finds",            dsp:"Spotify",       artist:"Pale Forest",    genre:"Folk",       dateSent:d(-15), type:"1st Party", lead:"Greg",    cover:false },
  { playlist:"Reggaeton Fuego",        dsp:"Spotify",       artist:"Luna Vega",      genre:"Latin",      dateSent:d(-18), type:"3rd Party", lead:"AJ",      cover:false },
  { playlist:"Breaking Electronic",    dsp:"Deezer",        artist:"Drift Theory",   genre:"Electronic", dateSent:d(-20), type:"1st Party", lead:"Jeanette",cover:false },
  { playlist:"SoundCloud Weekly",      dsp:"SoundCloud",    artist:"CRYPT0",         genre:"Hip-Hop",    dateSent:d(-11), type:"3rd Party", lead:"AJ",      cover:false },
  { playlist:"Folk & Friends",         dsp:"Spotify",       artist:"Fjord & Echo",   genre:"Folk",       dateSent:d(-22), type:"3rd Party", lead:"Greg",    cover:false },
  { playlist:"Pop All Day",            dsp:"Apple Music",   artist:"Viveka",         genre:"Pop",        dateSent:d(-5),  type:"1st Party", lead:"Greg",    cover:false },
  { playlist:"New Music Daily",        dsp:"Amazon Music",  artist:"SABLE",          genre:"Pop",        dateSent:d(-2),  type:"1st Party", lead:"Greg",    cover:false },
  { playlist:"Latin Heat",             dsp:"Pandora",       artist:"Mira Echeverría",genre:"Latin",      dateSent:d(-16), type:"1st Party", lead:"AJ",      cover:false },
  { playlist:"Chill Electronic",       dsp:"Spotify",       artist:"Drift Theory",   genre:"Electronic", dateSent:d(-25), type:"3rd Party", lead:"Jeanette",cover:false },
  { playlist:"Rock The Block",         dsp:"Spotify",       artist:"Tidal Mass",     genre:"Rock",       dateSent:d(-13), type:"3rd Party", lead:"Greg",    cover:false },
  { playlist:"Trap Nation",            dsp:"YouTube Music", artist:"Halo James",     genre:"Hip-Hop",    dateSent:d(-19), type:"3rd Party", lead:"AJ",      cover:false },
  { playlist:"Americana Roots",        dsp:"Spotify",       artist:"Cedar & Stone",  genre:"Country",    dateSent:d(-30), type:"3rd Party", lead:"Greg",    cover:false },
  { playlist:"Beats & Rhymes",         dsp:"Spotify",       artist:"CRYPT0",         genre:"Hip-Hop",    dateSent:d(-8),  type:"3rd Party", lead:"AJ",      cover:false },
  { playlist:"Spotify Singles",        dsp:"Spotify",       artist:"SABLE",          genre:"Pop",        dateSent:d(-4),  type:"1st Party", lead:"Greg",    cover:false },
  { playlist:"Global Latin Hits",      dsp:"Spotify",       artist:"Mira Echeverría",genre:"Latin",      dateSent:d(-6),  type:"1st Party", lead:"AJ",      cover:true  },
  { playlist:"Electronic Avenues",     dsp:"Spotify",       artist:"Neon Pulse",     genre:"Electronic", dateSent:d(-21), type:"3rd Party", lead:"Jeanette",cover:false },
  { playlist:"Soul Sessions",          dsp:"Apple Music",   artist:"Cassidy Blue",   genre:"R&B",        dateSent:d(-17), type:"1st Party", lead:"AJ",      cover:false },
];

const WEEKLY_PICKUP_TREND = [
  { week:"W1 Feb", pickups:8,  firstParty:5, thirdParty:3 },
  { week:"W2 Feb", pickups:11, firstParty:7, thirdParty:4 },
  { week:"W3 Feb", pickups:9,  firstParty:6, thirdParty:3 },
  { week:"W4 Feb", pickups:14, firstParty:9, thirdParty:5 },
  { week:"W1 Mar", pickups:12, firstParty:8, thirdParty:4 },
  { week:"W2 Mar", pickups:17, firstParty:10,thirdParty:7 },
  { week:"W3 Mar", pickups:15, firstParty:9, thirdParty:6 },
  { week:"W4 Mar", pickups:21, firstParty:13,thirdParty:8 },
  { week:"W1 Apr", pickups:18, firstParty:11,thirdParty:7 },
  { week:"W2 Apr", pickups:24, firstParty:15,thirdParty:9 },
  { week:"W3 Apr", pickups:20, firstParty:12,thirdParty:8 },
  { week:"W4 Apr", pickups:28, firstParty:18,thirdParty:10},
  { week:"W1 May", pickups:25, firstParty:16,thirdParty:9 },
  { week:"W2 May", pickups:30, firstParty:19,thirdParty:11},
];

// ─── DRIVER DATA ──────────────────────────────────────────────────────────────
const DRIVER_DATA = {
  "Neon Pulse": {
    story: "Viral TikTok moment drove 2M+ views on lead single. Strong synthwave community following with growing crossover appeal into festival season.",
    drivers: ["Social Media Campaign","Ad Campaign","Sync Placement"],
    similarArtists: "Gunship, FM-84, Carpenter Brut, Perturbator",
    mood: ["Nostalgic","Energetic"], songStyles: ["Synthwave","Retro Electronic"],
    focusTrack: "Static Dreams",
    upcomingShows: "Summer festival circuit (June–Aug) — 8 confirmed dates",
    confirmedPress: "Mixmag feature, Resident Advisor preview, CLASH interview",
    adDetails: "$2,500 Meta campaign targeting synthwave/electronic fans 18–34",
    socialActivity: "Posting daily tour content and studio clips on IG/TikTok. Strong engagement with the synthwave community — every post generates saves and shares.",
    dspTools: ["Spotify Clips","Canvas"],
    releaseConsistency: 72,
    ig: 284000, tiktok: 380000, youtube: 95000, twitter: 42000, soundcloud: 28000,
  },
  "Luna Vega": {
    story: "LATAM breakthrough with 500K Spotify streams on debut. Active TikTok (1.2M followers) and strong reggaeton crossover appeal heading into a major arena tour.",
    drivers: ["Social Media Campaign","Radio Campaign","Ad Campaign","Touring"],
    similarArtists: "Bad Bunny, Becky G, Karol G, Nicki Nicole",
    mood: ["Energetic","Romantic"], songStyles: ["Reggaeton","Latin Pop"],
    focusTrack: "Amor Eterno",
    upcomingShows: "LATAM arena tour (July–Sept) — 15 dates confirmed",
    confirmedPress: "Billboard Latin feature, Rolling Stone LATAM cover story",
    adDetails: "$4,000 combined Meta + TikTok campaign, LATAM geo-targeted",
    socialActivity: "Daily tour stories and TikTok behind-the-scenes. 1.2M TikTok followers with extremely high video completion rates — algorithm is pushing her content hard right now.",
    dspTools: ["Spotify Clips","YouTube Shorts","Canvas"],
    releaseConsistency: 85,
    ig: 520000, tiktok: 1200000, youtube: 280000, twitter: 95000, soundcloud: 12000,
  },
  "The Marble Way": {
    story: "UK indie rock outfit riding tastemaker momentum. Album follows a successful EU headline tour and a sync placement in a BBC drama series.",
    drivers: ["Press Campaign","Sync Placement","Touring"],
    similarArtists: "Fontaines D.C., Shame, Yard Act, IDLES",
    mood: ["Melancholic","Intense"], songStyles: ["Indie Rock","Post-Punk"],
    focusTrack: "Ghost Frequencies",
    upcomingShows: "UK/EU headline tour (May–June) — 22 dates",
    confirmedPress: "NME 4-star review, DIY Magazine feature, BBC Radio 6 Music support",
    adDetails: null,
    socialActivity: "Regular tour updates and venue photos. Moderate daily posting during the tour cycle with strong engagement from UK indie community.",
    dspTools: ["Canvas"],
    releaseConsistency: 60,
    ig: 92000, tiktok: 45000, youtube: 38000, twitter: 31000, soundcloud: 8000,
  },
  "Cassidy Blue": {
    story: "Debut single from rising R&B talent with a powerful visual identity. Pre-existing fanbase from viral covers; Vogue profile confirmed ahead of release.",
    drivers: ["Press Campaign","Social Media Campaign"],
    similarArtists: "SZA, Jhené Aiko, Summer Walker, Ari Lennox",
    mood: ["Sensual","Melancholic"], songStyles: ["Neo-Soul","Contemporary R&B"],
    focusTrack: "Midnight Remedy",
    upcomingShows: null,
    confirmedPress: "Vogue profile, Pigeons & Planes premiere, The FADER feature",
    adDetails: null,
    socialActivity: "Daily IG stories with very high engagement rate (8.2%). Aesthetic/lifestyle content resonating strongly — fans are extremely vocal ahead of the release.",
    dspTools: ["Spotify Clips","Canvas"],
    releaseConsistency: 45,
    ig: 178000, tiktok: 220000, youtube: 65000, twitter: 48000, soundcloud: 5000,
  },
  "Fjord & Echo": {
    story: "Americana duo with deep folk community roots. NPR Tiny Desk performance confirmed. College radio favorite with a loyal, high-engagement fanbase.",
    drivers: ["Press Campaign","Radio Campaign","Touring"],
    similarArtists: "Mandolin Orange, The Milk Carton Kids, Iron & Wine",
    mood: ["Wistful","Peaceful"], songStyles: ["Americana","Folk"],
    focusTrack: "Northern Light",
    upcomingShows: "US college circuit tour (May–June) — 12 dates",
    confirmedPress: "NPR Tiny Desk confirmed, Paste Magazine premiere, American Songwriter feature",
    adDetails: null,
    socialActivity: "Consistent posting around tour dates. Behind-the-scenes travel content with strong fan engagement — audience is older and highly loyal.",
    dspTools: ["Canvas"],
    releaseConsistency: 68,
    ig: 41000, tiktok: 28000, youtube: 22000, twitter: 15000, soundcloud: 6000,
  },
  "SABLE": {
    story: "Pop phenomenon with CBS Discovery designation. Major label bidding war before independent signing. 940K IG with extremely high engagement and a global promo run planned.",
    drivers: ["Press Campaign","Ad Campaign","Social Media Campaign","Radio Campaign","Brand Partnership"],
    similarArtists: "Charli XCX, Caroline Polachek, Rina Sawayama, Carly Rae Jepsen",
    mood: ["Euphoric","Energetic"], songStyles: ["Electropop","Synth-Pop"],
    focusTrack: "Ultraviolet",
    upcomingShows: "Global promo run — NYC, LA, London, Berlin (June)",
    confirmedPress: "Rolling Stone cover story, NME feature, Billboard Hot 100 projection",
    adDetails: "$8,000 global Meta + YouTube + TikTok campaign across all markets",
    socialActivity: "Multiple posts daily across all platforms. Every post is going semi-viral — algo is fully behind her. Pre-save campaign drove 40K saves in 48 hours.",
    dspTools: ["Spotify Clips","YouTube Shorts","Canvas","Amazon A+ Content"],
    releaseConsistency: 90,
    ig: 940000, tiktok: 2800000, youtube: 520000, twitter: 310000, soundcloud: 45000,
  },
  "Marco Salinas": {
    story: "Established Latin Pop artist with dominant LATAM radio presence. Single tied to upcoming telenovela soundtrack placement on a major network.",
    drivers: ["Radio Campaign","Sync Placement","Touring"],
    similarArtists: "Alejandro Sanz, Luis Fonsi, Pablo Alborán",
    mood: ["Romantic","Nostalgic"], songStyles: ["Latin Pop","Ballad"],
    focusTrack: "Contigo Siempre",
    upcomingShows: "LATAM promo tour (July) — 6 cities",
    confirmedPress: "El País feature, Univision interview",
    adDetails: null,
    socialActivity: "Active during single push and around telenovela press cycle. Facebook audience particularly strong — large over-35 LATAM fanbase.",
    dspTools: ["Spotify Clips","Canvas"],
    releaseConsistency: 78,
    ig: 215000, tiktok: 380000, youtube: 195000, twitter: 88000, soundcloud: 9000,
  },
  "Drift Theory": {
    story: "Ambient electronic project with a devoted Bandcamp following. Niche appeal but deeply engaged listeners — ideal for mood, focus, and sleep playlists.",
    drivers: ["Social Media Campaign"],
    similarArtists: "Brian Eno, Stars of the Lid, Hammock, Nils Frahm",
    mood: ["Calm","Introspective"], songStyles: ["Ambient","Atmospheric Electronic"],
    focusTrack: "Coastal Decay",
    upcomingShows: null, confirmedPress: null, adDetails: null,
    socialActivity: "Infrequent posts — mostly ambient visuals and long-exposure photography. Small but deeply engaged community, especially on Instagram and Bandcamp.",
    dspTools: [],
    releaseConsistency: 55,
    ig: 55000, tiktok: 12000, youtube: 18000, twitter: 8000, soundcloud: 22000,
  },
  "Halo James": {
    story: "Heavyweight hip-hop EP backed by a major streetwear brand partnership and Nike campaign pending clearance. Strong streaming velocity on all prior releases.",
    drivers: ["Brand Partnership","Ad Campaign","Social Media Campaign"],
    similarArtists: "Pusha T, Freddie Gibbs, Boldy James, Conway the Machine",
    mood: ["Aggressive","Confident"], songStyles: ["Trap","Hard Rap"],
    focusTrack: "Broken Signal",
    upcomingShows: "US hip-hop festival circuit (Summer) — 5 dates",
    confirmedPress: "HipHopDX exclusive, Complex feature, Pitchfork preview",
    adDetails: "$3,500 Instagram + YouTube campaign targeting streetwear/hip-hop audience",
    socialActivity: "Daily brand content and hype posts. Nike collab teaser drove 300K+ impressions last week. Very active on Twitter/X with strong community interaction.",
    dspTools: ["Spotify Clips","YouTube Shorts"],
    releaseConsistency: 70,
    ig: 380000, tiktok: 620000, youtube: 145000, twitter: 195000, soundcloud: 35000,
  },
  "Viveka": {
    story: "Dark pop cult artist with deep fashion industry ties. Previous single synced in Netflix series. European critical momentum is at an all-time high.",
    drivers: ["Sync Placement","Press Campaign","Touring"],
    similarArtists: "Lana Del Rey, Weyes Blood, Cigarettes After Sex, Chelsea Wolfe",
    mood: ["Dark","Cinematic"], songStyles: ["Dark Pop","Atmospheric Pop"],
    focusTrack: "Temple of Noise",
    upcomingShows: "EU headline tour (May–June) — 18 dates",
    confirmedPress: "Pitchfork Best New Music, MOJO feature, Uncut 5-star review",
    adDetails: null,
    socialActivity: "Curated aesthetic posts every 2–3 days. High-quality visuals with a strong fashion audience crossover — brand partnership inquiries coming in regularly.",
    dspTools: ["Canvas","Spotify Clips"],
    releaseConsistency: 65,
    ig: 620000, tiktok: 480000, youtube: 230000, twitter: 140000, soundcloud: 18000,
  },
  "The Sundowners": {
    story: "Outlaw country outfit with a devoted touring fanbase. Album tracked at a legendary Nashville studio with a strong country radio campaign already in motion.",
    drivers: ["Radio Campaign","Touring","Press Campaign"],
    similarArtists: "Sturgill Simpson, Jason Isbell, Tyler Childers, Colter Wall",
    mood: ["Nostalgic","Gritty"], songStyles: ["Outlaw Country","Americana"],
    focusTrack: "Last Train Home",
    upcomingShows: "US country circuit (June–Aug) — 30+ dates confirmed",
    confirmedPress: "Rolling Stone Country feature, No Depression premiere",
    adDetails: null,
    socialActivity: "Very active during tour — daily venue photos and backstage clips. Facebook audience is massive and highly engaged for the genre. Posting every day on the road.",
    dspTools: ["Canvas"],
    releaseConsistency: 75,
    ig: 130000, tiktok: 95000, youtube: 72000, twitter: 55000, soundcloud: 4000,
  },
  "Mira Echeverría": {
    story: "Flamenco-pop crossover with international critical acclaim. Womad and Primavera Sound confirmed. Strongest Spanish and LATAM press campaign in years.",
    drivers: ["Press Campaign","Touring","Radio Campaign"],
    similarArtists: "Rosalía, Lola Índigo, Maria José Llergo",
    mood: ["Passionate","Elegant"], songStyles: ["Flamenco-Pop","Spanish Folk"],
    focusTrack: "Constelaciones",
    upcomingShows: "Womad, Primavera Sound, FIB (June–July)",
    confirmedPress: "El Confidencial cover, El País Arts, Pitchfork International Spotlight",
    adDetails: "$5,000 Meta targeting Spain, Mexico, Argentina, Colombia",
    socialActivity: "Daily festival prep content and flamenco performance clips going viral on TikTok and YouTube. Spanish media appearances driving major spikes.",
    dspTools: ["Spotify Clips","Canvas","YouTube Shorts"],
    releaseConsistency: 80,
    ig: 710000, tiktok: 920000, youtube: 385000, twitter: 175000, soundcloud: 8000,
  },
  "Pale Forest": {
    story: "Intimate neo-folk project with a growing blog following. Small but passionate fan community — ideal for chill, introspective, and indie folk playlists.",
    drivers: ["Press Campaign"],
    similarArtists: "Hand Habits, Hovvdy, Gia Margaret",
    mood: ["Peaceful","Wistful"], songStyles: ["Neo-Folk","Indie Folk"],
    focusTrack: "Overgrown",
    upcomingShows: null,
    confirmedPress: "Gorilla vs. Bear premiere, Stereogum blurb",
    adDetails: null,
    socialActivity: "Occasional posts — nature photography and sparse studio content. Low volume but authentic. Small community is very vocal in the comments.",
    dspTools: [],
    releaseConsistency: 40,
    ig: 28000, tiktok: 8000, youtube: 12000, twitter: 6000, soundcloud: 4000,
  },
  "Solène": {
    story: "French pop artist with a strong EU fanbase and fashion week sync history. Lead single tied to a Paris Fashion Week campaign for a major luxury brand.",
    drivers: ["Sync Placement","Press Campaign","Brand Partnership"],
    similarArtists: "Angèle, Pomme, Christine and the Queens",
    mood: ["Romantic","Nostalgic"], songStyles: ["French Pop","Chanson"],
    focusTrack: "Comme Avant",
    upcomingShows: "EU promo run (May) — Paris, London, Berlin",
    confirmedPress: "Les Inrockuptibles feature, ELLE France interview",
    adDetails: null,
    socialActivity: "Very active during fashion week — cross-posting between fashion and music audiences. High IG story view rate (consistently 40%+ of followers).",
    dspTools: ["Canvas","Spotify Clips"],
    releaseConsistency: 62,
    ig: 190000, tiktok: 145000, youtube: 68000, twitter: 42000, soundcloud: 3000,
  },
  "CRYPT0": {
    story: "Underground hip-hop with deep boom bap credibility. Limited mainstream appeal but strong niche playlist track record and cult following.",
    drivers: ["Social Media Campaign"],
    similarArtists: "Mach-Hommy, Your Old Droog, Rome Streetz",
    mood: ["Gritty","Introspective"], songStyles: ["Boom Bap","Underground Hip-Hop"],
    focusTrack: "Zero Sum",
    upcomingShows: null, confirmedPress: null, adDetails: null,
    socialActivity: "Minimal social presence by design — underground credibility strategy. Posts infrequently but with high impact in the niche community. Twitter/X most active platform.",
    dspTools: [],
    releaseConsistency: 50,
    ig: 95000, tiktok: 35000, youtube: 42000, twitter: 58000, soundcloud: 28000,
  },
  "Tidal Mass": {
    story: "Post-rock instrumental act with a strong UK/EU fanbase. Album features a collaboration with an acclaimed film composer — ideal for cinematic and focus playlists.",
    drivers: ["Press Campaign","Touring"],
    similarArtists: "Mogwai, Explosions in the Sky, God Is An Astronaut",
    mood: ["Epic","Melancholic"], songStyles: ["Post-Rock","Instrumental"],
    focusTrack: "Undertow",
    upcomingShows: "UK/EU tour (June–July) — 14 dates",
    confirmedPress: "The Quietus review, Rock Sound feature",
    adDetails: null,
    socialActivity: "Moderate tour content posting. YouTube is the strongest platform — live session videos and studio footage performing well with the post-rock audience.",
    dspTools: ["Canvas"],
    releaseConsistency: 58,
    ig: 67000, tiktok: 22000, youtube: 85000, twitter: 28000, soundcloud: 6000,
  },
  "Glass Meridian": {
    story: "House music powerhouse with DJ Deck Worthy designation. ADE headline slot confirmed. Massive DJ and curator network behind this release.",
    drivers: ["Touring","Social Media Campaign","Ad Campaign","Press Campaign"],
    similarArtists: "Four Tet, Bicep, Fred again.., Peggy Gou",
    mood: ["Euphoric","Energetic"], songStyles: ["House","Dance"],
    focusTrack: "Refraction",
    upcomingShows: "ADE (Amsterdam), Fabric (London), DC-10 (Ibiza) — full summer slate",
    confirmedPress: "Resident Advisor feature, Mixmag cover story, DJ Mag interview",
    adDetails: "$6,000 global Meta + Spotify Ad Studio — dance audience targeting",
    socialActivity: "Extremely active — daily DJ booth content, set videos, festival crowd clips. Posting IG stories every single day on tour. SoundCloud following is massive for the genre.",
    dspTools: ["Spotify Clips","YouTube Shorts","Canvas"],
    releaseConsistency: 88,
    ig: 430000, tiktok: 680000, youtube: 295000, twitter: 168000, soundcloud: 52000,
  },
  "Cedar & Stone": {
    story: "Regional Americana act with a loyal southwest following. Album crafted over two years in a rural Colorado studio. Perfect for laid-back country and chill playlists.",
    drivers: ["Touring","Radio Campaign"],
    similarArtists: "The War on Drugs, Hiss Golden Messenger, Strand of Oaks",
    mood: ["Peaceful","Nostalgic"], songStyles: ["Americana","Country Rock"],
    focusTrack: "High Desert",
    upcomingShows: "US Southwest regional dates (June–July) — 8 dates",
    confirmedPress: null, adDetails: null,
    socialActivity: "Consistent but low-frequency posting. Tour announcement content performing well in regional markets. Facebook is their most engaged platform.",
    dspTools: [],
    releaseConsistency: 52,
    ig: 49000, tiktok: 18000, youtube: 24000, twitter: 12000, soundcloud: 5000,
  },
  "Flor de Noche": {
    story: "Bolero revival tapping into the LATAM nostalgia market. Strong streaming numbers in Mexico and Colombia — ideal for romantic Latin playlist placement.",
    drivers: ["Radio Campaign","Social Media Campaign"],
    similarArtists: "Mon Laferte, Natalia Lafourcade, Los Panchos",
    mood: ["Romantic","Nostalgic"], songStyles: ["Bolero","Latin Romantic"],
    focusTrack: "Piel de Luna",
    upcomingShows: null,
    confirmedPress: "El Universal Mexico feature",
    adDetails: null,
    socialActivity: "Occasional lifestyle and music content. Strong resonance with 35+ LATAM audience on Facebook and Instagram. YouTube cover videos have strong passive discovery.",
    dspTools: ["Canvas"],
    releaseConsistency: 60,
    ig: 155000, tiktok: 88000, youtube: 52000, twitter: 35000, soundcloud: 4000,
  },
  "Yuki Tanaka": {
    story: "Japanese dance-pop with a growing APAC following and a confirmed anime sync placement. Strong presence on global J-pop playlists with crossover potential.",
    drivers: ["Sync Placement","Social Media Campaign"],
    similarArtists: "Kyary Pamyu Pamyu, CHAI, Perfume, Wednesday Campanella",
    mood: ["Playful","Energetic"], songStyles: ["J-Dance","J-Pop"],
    focusTrack: "Sakura Circuit",
    upcomingShows: null,
    confirmedPress: "Natalie JP feature, Rolling Stone Japan",
    adDetails: null,
    socialActivity: "Very active in the anime community — daily posts, collabs with anime content creators on TikTok and YouTube. High crossover engagement outside traditional music audience.",
    dspTools: ["Spotify Clips","YouTube Shorts"],
    releaseConsistency: 72,
    ig: 88000, tiktok: 420000, youtube: 185000, twitter: 62000, soundcloud: 8000,
  },
};

// ─── ORGANIC EDITORIAL (Chartmetric — editorial placements not pitched by Symphonic) ───
const ORGANIC_EDITORIAL = {
  "Neon Pulse":     [ { playlist:"Synthwave Central",    dsp:"Spotify",       followers:320000,  date:d(-18), note:"Algorithmic add" }, { playlist:"Electronic Essentials", dsp:"Apple Music", followers:180000, date:d(-30) } ],
  "Luna Vega":      [ { playlist:"Fuego Latino",         dsp:"Spotify",       followers:2100000, date:d(-9),  note:"Algorithmic add" }, { playlist:"Latin Hits",             dsp:"Amazon Music",followers:540000, date:d(-22) }, { playlist:"Top Latin",              dsp:"Tidal",       followers:210000, date:d(-14) } ],
  "The Marble Way": [ { playlist:"Indie Rock Now",       dsp:"Spotify",       followers:890000,  date:d(-25) }, { playlist:"New Noise",                dsp:"Apple Music", followers:420000, date:d(-11) } ],
  "Cassidy Blue":   [ { playlist:"RNB X",                dsp:"Spotify",       followers:1400000, date:d(-7),  note:"Algorithmic add" }, { playlist:"Soul Kitchen",           dsp:"Tidal",       followers:88000,  date:d(-19) } ],
  "Fjord & Echo":   [ { playlist:"Folk Roots",           dsp:"Spotify",       followers:240000,  date:d(-28) } ],
  "SABLE":          [ { playlist:"Pop Sauce",            dsp:"Spotify",       followers:1200000, date:d(-8),  note:"Algorithmic add" }, { playlist:"New Bangers",            dsp:"Apple Music", followers:890000, date:d(-12) }, { playlist:"Breaking Pop",           dsp:"Amazon Music",followers:340000, date:d(-20) } ],
  "Marco Salinas":  [ { playlist:"Latin Romántico",      dsp:"Spotify",       followers:760000,  date:d(-15) }, { playlist:"Baladas en Español",      dsp:"Apple Music", followers:310000, date:d(-22) } ],
  "Drift Theory":   [ { playlist:"Deep Focus",           dsp:"Spotify",       followers:3200000, date:d(-10), note:"Algorithmic add" }, { playlist:"Ambient Chill",          dsp:"Apple Music", followers:420000, date:d(-28) } ],
  "Halo James":     [ { playlist:"Rap Caviar",           dsp:"Spotify",       followers:14000000,date:d(-5),  note:"Algorithmic add" }, { playlist:"Hip Hop Central",        dsp:"Amazon Music",followers:1200000,date:d(-18) } ],
  "Viveka":         [ { playlist:"Gothic Indie",         dsp:"Spotify",       followers:380000,  date:d(-14) }, { playlist:"Alt Vibes",               dsp:"Apple Music", followers:560000, date:d(-21) } ],
  "The Sundowners": [ { playlist:"Country Roads",        dsp:"Spotify",       followers:890000,  date:d(-20) }, { playlist:"Outlaw Country",          dsp:"Apple Music", followers:240000, date:d(-30) } ],
  "Mira Echeverría":[ { playlist:"Flamenco Puro",        dsp:"Spotify",       followers:440000,  date:d(-12) }, { playlist:"España Vibrante",         dsp:"Apple Music", followers:280000, date:d(-19) }, { playlist:"World Music Picks",       dsp:"Tidal",       followers:95000,  date:d(-25) } ],
  "Pale Forest":    [ { playlist:"Bedroom Pop",          dsp:"Spotify",       followers:620000,  date:d(-22) } ],
  "Solène":         [ { playlist:"Café de Paris",        dsp:"Spotify",       followers:510000,  date:d(-16) }, { playlist:"French Hits",             dsp:"Apple Music", followers:180000, date:d(-24) } ],
  "CRYPT0":         [ { playlist:"Underground Rap",      dsp:"Spotify",       followers:280000,  date:d(-13) } ],
  "Tidal Mass":     [ { playlist:"Post Rock Forever",    dsp:"Spotify",       followers:190000,  date:d(-17) }, { playlist:"Cinematic Instrumentals", dsp:"Apple Music", followers:340000, date:d(-29) } ],
  "Glass Meridian": [ { playlist:"Defected Radio",       dsp:"Spotify",       followers:680000,  date:d(-6),  note:"Algorithmic add" }, { playlist:"House Music All Night", dsp:"Apple Music", followers:420000, date:d(-18) }, { playlist:"Dance Hits",             dsp:"Amazon Music",followers:890000, date:d(-11) } ],
  "Cedar & Stone":  [ { playlist:"Americana Today",      dsp:"Spotify",       followers:310000,  date:d(-24) } ],
  "Flor de Noche":  [ { playlist:"Boleros para el Alma", dsp:"Spotify",       followers:390000,  date:d(-20) }, { playlist:"Romantico Latino",        dsp:"Apple Music", followers:220000, date:d(-28) } ],
  "Yuki Tanaka":    [ { playlist:"J-Pop Now",            dsp:"Spotify",       followers:540000,  date:d(-11) }, { playlist:"Anime Hits",              dsp:"Apple Music", followers:760000, date:d(-18), note:"Algorithmic add" } ],
};

// ─── USER GENERATED PLAYLISTS (Chartmetric) ───────────────────────────────────
const UGC_PLAYLISTS = {
  "Neon Pulse":     [ { playlist:"Synthwave Drive",      dsp:"Spotify", followers:28000,  curator:"nightdrive_fx",  date:d(-10) }, { playlist:"80s Vibes Forever",    dsp:"Spotify", followers:14000, curator:"retrowaver",    date:d(-22) }, { playlist:"Best of Synthwave",    dsp:"Apple Music", followers:8400, curator:"synthfan1984", date:d(-30) } ],
  "Luna Vega":      [ { playlist:"Reggaeton para Bailar",dsp:"Spotify", followers:94000,  curator:"latinamix",      date:d(-5)  }, { playlist:"Perreo 2025",          dsp:"Spotify", followers:61000, curator:"fuego_dj",      date:d(-12) }, { playlist:"Bad Bunny Vibes",      dsp:"Spotify", followers:48000, curator:"urbano_fan",    date:d(-19) }, { playlist:"Latin Party Mix",      dsp:"Apple Music", followers:22000, curator:"fiesta_mx",   date:d(-27) } ],
  "The Marble Way": [ { playlist:"Indie UK Gems",        dsp:"Spotify", followers:18000,  curator:"ukindie_fan",    date:d(-15) }, { playlist:"Post-Punk Revival",    dsp:"Spotify", followers:12000, curator:"punklives",     date:d(-28) } ],
  "Cassidy Blue":   [ { playlist:"Late Night R&B",       dsp:"Spotify", followers:74000,  curator:"rnbvibes_",      date:d(-8)  }, { playlist:"Neo Soul Essentials",  dsp:"Spotify", followers:52000, curator:"soulfullady",   date:d(-16) }, { playlist:"Midnight Mood",        dsp:"Apple Music", followers:19000, curator:"nightmode_7", date:d(-24) } ],
  "Fjord & Echo":   [ { playlist:"Rainy Day Folk",       dsp:"Spotify", followers:31000,  curator:"cozyday_music",  date:d(-18) }, { playlist:"NPR Tiny Desk Picks",  dsp:"Spotify", followers:24000, curator:"tinydeskfan",   date:d(-30) } ],
  "SABLE":          [ { playlist:"POP BOPS 2025",        dsp:"Spotify", followers:210000, curator:"popqueen99",     date:d(-4)  }, { playlist:"Workout Anthems",      dsp:"Spotify", followers:180000,curator:"gymrat_pl",     date:d(-11) }, { playlist:"Feel Good Hits",       dsp:"Apple Music", followers:95000, curator:"goodvibes_am",date:d(-18) }, { playlist:"Charli XCX Fans",      dsp:"Spotify", followers:64000, curator:"xcx_universe",date:d(-25) } ],
  "Marco Salinas":  [ { playlist:"Noches de Telenovela", dsp:"Spotify", followers:43000,  curator:"telenovela_mx",  date:d(-12) }, { playlist:"Baladas de Amor",      dsp:"Spotify", followers:38000, curator:"amorlatino",    date:d(-24) } ],
  "Drift Theory":   [ { playlist:"Study & Focus",        dsp:"Spotify", followers:420000, curator:"studybeats",     date:d(-7)  }, { playlist:"Ambient Sleep",        dsp:"Spotify", followers:380000,curator:"sleepwell_pl",  date:d(-14) }, { playlist:"Lo-Fi Chillout",       dsp:"Apple Music", followers:120000,curator:"chillzone_am",date:d(-22) } ],
  "Halo James":     [ { playlist:"Trap Nation Fan",      dsp:"Spotify", followers:88000,  curator:"trapnationfan",  date:d(-9)  }, { playlist:"Street Rap 2025",      dsp:"Spotify", followers:72000, curator:"streetcodes",   date:d(-17) }, { playlist:"Nike Running Mix",     dsp:"Spotify", followers:55000, curator:"run_withme",    date:d(-26) } ],
  "Viveka":         [ { playlist:"Lana Del Rey Fans",    dsp:"Spotify", followers:96000,  curator:"ldr_universe",   date:d(-11) }, { playlist:"Dark Aesthetics",      dsp:"Spotify", followers:64000, curator:"darkaesthetic",  date:d(-20) }, { playlist:"Netflix Mood",         dsp:"Spotify", followers:48000, curator:"netflixviber",  date:d(-28) } ],
  "The Sundowners": [ { playlist:"Country Roads Trip",   dsp:"Spotify", followers:58000,  curator:"roadtrip_cntry", date:d(-16) }, { playlist:"Outlaw & Whiskey",     dsp:"Spotify", followers:34000, curator:"whiskeynights",  date:d(-27) } ],
  "Mira Echeverría":[ { playlist:"Rosalia Fans",         dsp:"Spotify", followers:72000,  curator:"rosaliafan_es",  date:d(-9)  }, { playlist:"Flamenco Moderno",     dsp:"Spotify", followers:44000, curator:"flamenco2025",   date:d(-18) }, { playlist:"Spanish Vibes",        dsp:"Apple Music", followers:28000, curator:"espana_mix",   date:d(-25) } ],
  "Pale Forest":    [ { playlist:"Sad Girl Autumn",      dsp:"Spotify", followers:89000,  curator:"sadgirlhours",   date:d(-14) }, { playlist:"Cozy Indie Folk",      dsp:"Spotify", followers:42000, curator:"cozyhours",     date:d(-26) } ],
  "Solène":         [ { playlist:"French Mood",          dsp:"Spotify", followers:36000,  curator:"paris_vibes",    date:d(-13) }, { playlist:"Fashion Week Playlist",dsp:"Spotify", followers:28000, curator:"runway2025",    date:d(-22) } ],
  "CRYPT0":         [ { playlist:"Underground Legends",  dsp:"Spotify", followers:24000,  curator:"hiphopheads",    date:d(-10) }, { playlist:"Boom Bap Classics",    dsp:"Spotify", followers:18000, curator:"boombapdad",    date:d(-25) } ],
  "Tidal Mass":     [ { playlist:"Post Rock Marathon",   dsp:"Spotify", followers:22000,  curator:"postrocklives",  date:d(-19) }, { playlist:"Cinematic Study",      dsp:"Spotify", followers:31000, curator:"filmscores",    date:d(-30) } ],
  "Glass Meridian": [ { playlist:"Ibiza 2025",           dsp:"Spotify", followers:160000, curator:"ibizasounds",    date:d(-5)  }, { playlist:"House Workout",        dsp:"Spotify", followers:120000,curator:"gymhouse_dj",   date:d(-13) }, { playlist:"ADE Picks",            dsp:"Spotify", followers:84000, curator:"ade_music",     date:d(-21) } ],
  "Cedar & Stone":  [ { playlist:"Desert Road Trip",     dsp:"Spotify", followers:27000,  curator:"southwest_mix",  date:d(-20) } ],
  "Flor de Noche":  [ { playlist:"Boleros para Mama",    dsp:"Spotify", followers:48000,  curator:"familia_mx",     date:d(-15) }, { playlist:"Romantic Spanish",     dsp:"Spotify", followers:32000, curator:"romantico_fm",   date:d(-27) } ],
  "Yuki Tanaka":    [ { playlist:"Anime OST Fan Mix",    dsp:"Spotify", followers:96000,  curator:"animefan2025",   date:d(-8)  }, { playlist:"J-Pop Obsession",      dsp:"Spotify", followers:54000, curator:"jpopworld",     date:d(-17) }, { playlist:"TikTok Japan Hits",    dsp:"Spotify", followers:38000, curator:"tiktokjp",     date:d(-24) } ],
};

// ─── SIMILAR ARTIST PICKUPS (Chartmetric — pitch intel) ───────────────────────
const SIMILAR_ARTIST_PICKUPS = {
  "Neon Pulse":     [ { artist:"Gunship",                playlist:"Synthwave Spectrum",      dsp:"Spotify",     followers:480000,   type:"Editorial" }, { artist:"FM-84",                  playlist:"80s Electronic",          dsp:"Apple Music", followers:220000,   type:"Editorial" }, { artist:"Carpenter Brut",         playlist:"Electronic Rising",       dsp:"Spotify",     followers:1100000,  type:"Editorial" } ],
  "Luna Vega":      [ { artist:"Karol G",                playlist:"Viva Latino",             dsp:"Spotify",     followers:9200000,  type:"Editorial" }, { artist:"Becky G",                playlist:"Tusa Reggaeton Mix",      dsp:"Spotify",     followers:3400000,  type:"Editorial" }, { artist:"Nicki Nicole",           playlist:"New Music Friday LATAM",  dsp:"Spotify",     followers:2100000,  type:"Editorial" }, { artist:"Bad Bunny",              playlist:"Hot Latin",               dsp:"Spotify",     followers:6800000,  type:"Editorial" } ],
  "The Marble Way": [ { artist:"Fontaines D.C.",         playlist:"Alt Now",                 dsp:"Apple Music", followers:890000,   type:"Editorial" }, { artist:"Yard Act",               playlist:"New Music Friday UK",     dsp:"Spotify",     followers:4100000,  type:"Editorial" }, { artist:"IDLES",                  playlist:"Punk & Hardcore",         dsp:"Spotify",     followers:540000,   type:"Editorial" } ],
  "Cassidy Blue":   [ { artist:"SZA",                    playlist:"R&B X",                   dsp:"Spotify",     followers:4600000,  type:"Editorial" }, { artist:"Ari Lennox",             playlist:"Soul Storm",              dsp:"Spotify",     followers:1200000,  type:"Editorial" }, { artist:"Summer Walker",          playlist:"R&B Radar",               dsp:"Spotify",     followers:2800000,  type:"Editorial" }, { artist:"Jhene Aiko",             playlist:"The Get Up",              dsp:"Apple Music", followers:1600000,  type:"Editorial" } ],
  "Fjord & Echo":   [ { artist:"Iron & Wine",            playlist:"Folk & Friends",          dsp:"Spotify",     followers:640000,   type:"Editorial" }, { artist:"Mandolin Orange",        playlist:"Americana Roots",         dsp:"Spotify",     followers:380000,   type:"Editorial" } ],
  "SABLE":          [ { artist:"Charli XCX",             playlist:"Pop Rising",              dsp:"Spotify",     followers:4200000,  type:"Editorial" }, { artist:"Caroline Polachek",      playlist:"Breaking Pop",            dsp:"Apple Music", followers:890000,   type:"Editorial" }, { artist:"Rina Sawayama",          playlist:"New Pop UK",              dsp:"Spotify",     followers:1800000,  type:"Editorial" }, { artist:"Carly Rae Jepsen",       playlist:"Pop All Day",             dsp:"Apple Music", followers:2100000,  type:"Editorial" } ],
  "Marco Salinas":  [ { artist:"Alejandro Sanz",         playlist:"Exitos Espana",           dsp:"Spotify",     followers:1900000,  type:"Editorial" }, { artist:"Luis Fonsi",             playlist:"Latino Mix",              dsp:"Spotify",     followers:5400000,  type:"Editorial" }, { artist:"Pablo Alboran",          playlist:"Baladas Romanticas",      dsp:"Spotify",     followers:1200000,  type:"Editorial" } ],
  "Drift Theory":   [ { artist:"Brian Eno",              playlist:"Ambient Chill",           dsp:"Spotify",     followers:3200000,  type:"Editorial" }, { artist:"Nils Frahm",             playlist:"Piano in the Background", dsp:"Spotify",     followers:2800000,  type:"Editorial" }, { artist:"Hammock",                playlist:"Deep Sleep",              dsp:"Spotify",     followers:1900000,  type:"Editorial" } ],
  "Halo James":     [ { artist:"Pusha T",                playlist:"Rap Caviar",              dsp:"Spotify",     followers:14000000, type:"Editorial" }, { artist:"Freddie Gibbs",          playlist:"Most Necessary",          dsp:"Spotify",     followers:4800000,  type:"Editorial" }, { artist:"Boldy James",            playlist:"Underground Rap",         dsp:"Spotify",     followers:680000,   type:"Editorial" } ],
  "Viveka":         [ { artist:"Lana Del Rey",           playlist:"Melancholic Hits",        dsp:"Spotify",     followers:2400000,  type:"Editorial" }, { artist:"Weyes Blood",            playlist:"Dreamy Vibes",            dsp:"Apple Music", followers:640000,   type:"Editorial" }, { artist:"Chelsea Wolfe",          playlist:"Dark Atmosphere",         dsp:"Spotify",     followers:380000,   type:"Editorial" } ],
  "The Sundowners": [ { artist:"Sturgill Simpson",       playlist:"Country Roads",           dsp:"Spotify",     followers:890000,   type:"Editorial" }, { artist:"Tyler Childers",         playlist:"Outlaw Country",          dsp:"Spotify",     followers:1200000,  type:"Editorial" }, { artist:"Jason Isbell",           playlist:"Americana Roots",         dsp:"Apple Music", followers:540000,   type:"Editorial" } ],
  "Mira Echeverría":[ { artist:"Rosalia",                playlist:"Viva Espana",             dsp:"Spotify",     followers:2800000,  type:"Editorial" }, { artist:"Maria Jose Llergo",      playlist:"Flamenco Fusion",         dsp:"Spotify",     followers:420000,   type:"Editorial" }, { artist:"Lola Indigo",            playlist:"Pop Baleares",            dsp:"Apple Music", followers:880000,   type:"Editorial" } ],
  "Pale Forest":    [ { artist:"Hand Habits",            playlist:"Indie Folk Chill",        dsp:"Spotify",     followers:480000,   type:"Editorial" }, { artist:"Gia Margaret",           playlist:"Bedroom Pop",             dsp:"Spotify",     followers:620000,   type:"Editorial" } ],
  "Solène":         [ { artist:"Angele",                 playlist:"French Hits",             dsp:"Spotify",     followers:1400000,  type:"Editorial" }, { artist:"Christine and the Queens",playlist:"Tendance France",        dsp:"Apple Music", followers:680000,   type:"Editorial" } ],
  "CRYPT0":         [ { artist:"Mach-Hommy",             playlist:"Underground Rap",         dsp:"Spotify",     followers:280000,   type:"Editorial" }, { artist:"Your Old Droog",         playlist:"Rap Underground",         dsp:"Spotify",     followers:190000,   type:"Editorial" } ],
  "Tidal Mass":     [ { artist:"Mogwai",                 playlist:"Post Rock Marathon",      dsp:"Spotify",     followers:480000,   type:"Editorial" }, { artist:"Explosions in the Sky",  playlist:"Cinematic Instrumentals", dsp:"Apple Music", followers:860000,   type:"Editorial" }, { artist:"God Is An Astronaut",    playlist:"Space Rock",              dsp:"Spotify",     followers:240000,   type:"Editorial" } ],
  "Glass Meridian": [ { artist:"Bicep",                  playlist:"Mint",                    dsp:"Spotify",     followers:3200000,  type:"Editorial" }, { artist:"Fred again..",           playlist:"New Music Friday",        dsp:"Spotify",     followers:4800000,  type:"Editorial" }, { artist:"Peggy Gou",              playlist:"Dance Rising",            dsp:"Spotify",     followers:2100000,  type:"Editorial" }, { artist:"Four Tet",               playlist:"Electronic Avenues",      dsp:"Spotify",     followers:1600000,  type:"Editorial" } ],
  "Cedar & Stone":  [ { artist:"Hiss Golden Messenger",  playlist:"Americana Today",         dsp:"Spotify",     followers:310000,   type:"Editorial" }, { artist:"Strand of Oaks",         playlist:"Singer-Songwriter",       dsp:"Apple Music", followers:180000,   type:"Editorial" } ],
  "Flor de Noche":  [ { artist:"Natalia Lafourcade",     playlist:"Latin Pop Favorites",     dsp:"Spotify",     followers:2800000,  type:"Editorial" }, { artist:"Mon Laferte",            playlist:"Nueva Cancion",           dsp:"Spotify",     followers:1400000,  type:"Editorial" } ],
  "Yuki Tanaka":    [ { artist:"Kyary Pamyu Pamyu",      playlist:"J-Pop Now",               dsp:"Spotify",     followers:540000,   type:"Editorial" }, { artist:"CHAI",                   playlist:"Anime Hits",              dsp:"Apple Music", followers:760000,   type:"Editorial" }, { artist:"Perfume",                playlist:"J-Dance",                 dsp:"Spotify",     followers:420000,   type:"Editorial" } ],
};

// ─── SYMPHONIC SCORE ──────────────────────────────────────────────────────────
function symphonicScore(r) {
  const d = DRIVER_DATA[r.artist] || {};
  const artistPickups = PICKUPS.filter(p => p.artist === r.artist);

  // 1. Symphonic Pickup History (0–25)
  const fp       = artistPickups.filter(p => p.type === "1st Party").length;
  const tp       = artistPickups.filter(p => p.type === "3rd Party").length;
  const cover    = artistPickups.some(p => p.cover) ? 5 : 0;
  const pickups  = Math.min(25, fp * 4 + tp * 2 + cover);

  // 2. Spotify Monthly Listeners / Audience Reach (0–20)
  const audience = r.spotifyML > 0
    ? Math.min(20, Math.round((Math.log10(r.spotifyML) / Math.log10(6000000)) * 20))
    : 0;

  // 3. Social Audience — weighted across platforms (0–20)
  const weighted = (r.igFollowers || 0) * 1.0 + (d.tiktok || 0) * 1.2 +
    (d.youtube || 0) * 0.8 + (d.twitter || 0) * 0.5 + (d.soundcloud || 0) * 0.3;
  const social   = Math.min(20, Math.round((weighted / 4500000) * 20));

  // 4. Marketing Drive Quality (0–20)
  const driverPts = Math.min(12, (d.drivers?.length || 0) * 3);
  const pressPts  = d.confirmedPress ? 4 : 0;
  const adPts     = d.adDetails ? 4 : 0;
  const drive     = Math.min(20, driverPts + pressPts + adPts);

  // 5. Release Consistency (0–15)
  const consistency = Math.round((d.releaseConsistency || 0) / 100 * 15);

  const total = pickups + audience + social + drive + consistency;
  return { total, breakdown: { pickups, audience, social, drive, consistency } };
}

function scoreColor(s) {
  if (s >= 80) return C.green;
  if (s >= 65) return C.cyan;
  if (s >= 50) return C.gold;
  return C.pink;
}

// ─── DAYS UNTIL ───────────────────────────────────────────────────────────────
function daysUntil(dateStr) {
  const diff = new Date(dateStr + "T12:00:00") - T;
  return Math.ceil(diff / 86400000);
}

function fmtDate(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric" });
}

// ─── INSIGHT ENGINE ───────────────────────────────────────────────────────────
function generateInsights(releases, pickups) {
  const insights = [];
  const thisWeekP1 = releases.filter(r => r.priority === "Priority 1" && daysUntil(r.date) <= 7 && daysUntil(r.date) >= 0);
  const coverSlots = pickups.filter(p => p.cover);
  const noDriversP1 = releases.filter(r => {
    const d = DRIVER_DATA[r.artist] || {};
    return r.priority === "Priority 1" && !d.story && daysUntil(r.date) <= 14 && daysUntil(r.date) >= 0;
  });
  const noPickupsP1 = releases.filter(r => {
    const count = pickups.filter(p => p.artist === r.artist).length;
    return r.priority === "Priority 1" && count === 0 && daysUntil(r.date) <= 14 && daysUntil(r.date) >= 0;
  });

  if (thisWeekP1.length)
    insights.push({ type:"urgent", icon:"🔥", title:`${thisWeekP1.length} Priority 1 release${thisWeekP1.length>1?"s":""} drop this week`, body: thisWeekP1.map(r=>r.artist).join(", ") });
  if (noDriversP1.length)
    insights.push({ type:"warning", icon:"📝", title:`${noDriversP1.length} Priority 1 release${noDriversP1.length>1?"s":""} missing pitch story`, body: noDriversP1.map(r=>`${r.artist} (${daysUntil(r.date)}d away)`).join(", ") });
  if (noPickupsP1.length)
    insights.push({ type:"warning", icon:"📭", title:`${noPickupsP1.length} Priority 1 release${noPickupsP1.length>1?"s":""} have no pickup history`, body: noPickupsP1.map(r=>r.artist).join(", ") });
  if (coverSlots.length)
    insights.push({ type:"positive", icon:"🎯", title:`${coverSlots.length} cover slot${coverSlots.length>1?"s":""} secured this month`, body: coverSlots.map(p=>`${p.playlist} (${p.dsp})`).join(", ") });

  return insights;
}

// ─── TOOLTIP STYLE ────────────────────────────────────────────────────────────
const TooltipStyle = { background:"#13152a", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", fontSize:12, color:"#fff" };

// ─── SUB COMPONENTS ───────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:C.muted, marginBottom:14, fontFamily:"'DM Mono',monospace" }}>{children}</div>;
}

function Card({ children, style={} }) {
  return <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:22, ...style }}>{children}</div>;
}

function KPI({ label, value, sub, color, trend }) {
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


function Pill({ label, color }) {
  return <span style={{ background:`${color}1a`, color, border:`1px solid ${color}44`, borderRadius:99, padding:"2px 9px", fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>{label}</span>;
}

function PlatformDots({ r }) {
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

// ─── ARTIST PANEL ─────────────────────────────────────────────────────────────
const DRIVER_COLORS = {
  "Touring": C.green, "Press Campaign": C.cyan, "Radio Campaign": C.gold,
  "Social Media Campaign": C.pink, "Ad Campaign": C.orange, "Sync Placement": C.purple,
  "Brand Partnership": "#ff9f43",
};

// ─── PAST RELEASES (per-artist release history; each release has its own pickups) ──
// In production this will come from Airtable keyed by UPC. Artist is a lookup on the release record.
const PAST_RELEASES = {
  "Neon Pulse": [
    { upc:"824296101001", release:"Voltage Drive",      format:"Single", date:"2024-11-14", genre:"Electronic",
      drivers:["Social Media Campaign","Ad Campaign"],
      pickups:[
        { playlist:"Synthwave Spectrum",    dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-11-11" },
        { playlist:"Electronic Rising",     dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-11-09" },
        { playlist:"80s Electronic",        dsp:"Apple Music", type:"3rd Party", cover:false, dateSent:"2024-11-07" },
      ]},
    { upc:"824296100882", release:"Phantom Grid EP",    format:"EP",     date:"2024-06-20", genre:"Electronic",
      drivers:["Touring","Ad Campaign"],
      pickups:[
        { playlist:"New Music Friday",      dsp:"Spotify",     type:"1st Party", cover:true,  dateSent:"2024-06-17" },
        { playlist:"Chill Electronic",      dsp:"Spotify",     type:"3rd Party", cover:false, dateSent:"2024-06-15" },
      ]},
    { upc:"824296100211", release:"Signal Drift",       format:"Single", date:"2023-09-05", genre:"Electronic",
      drivers:["Social Media Campaign"],
      pickups:[
        { playlist:"Electronic Avenues",    dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2023-09-02" },
      ]},
  ],
  "Luna Vega": [
    { upc:"824296201001", release:"Fuego",              format:"Single", date:"2024-10-18", genre:"Latin",
      drivers:["Radio Campaign","Social Media Campaign","Touring"],
      pickups:[
        { playlist:"Viva Latino",           dsp:"Spotify",     type:"1st Party", cover:true,  dateSent:"2024-10-15" },
        { playlist:"Hot Latin",             dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-10-14" },
        { playlist:"Latin Hits",            dsp:"Amazon Music",type:"1st Party", cover:false, dateSent:"2024-10-12" },
        { playlist:"Perreo Mix",            dsp:"Spotify",     type:"3rd Party", cover:false, dateSent:"2024-10-10" },
      ]},
    { upc:"824296200744", release:"Noche en Miami",     format:"EP",     date:"2024-03-22", genre:"Latin",
      drivers:["Radio Campaign","Touring"],
      pickups:[
        { playlist:"New Music Friday LATAM",dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-03-19" },
        { playlist:"Reggaeton Fuego",       dsp:"Spotify",     type:"3rd Party", cover:false, dateSent:"2024-03-17" },
      ]},
  ],
  "SABLE": [
    { upc:"824296601001", release:"Chrome Butterfly",   format:"Single", date:"2024-12-06", genre:"Pop",
      drivers:["Social Media Campaign","Press Campaign","Ad Campaign"],
      pickups:[
        { playlist:"Pop Rising",            dsp:"Spotify",     type:"1st Party", cover:true,  dateSent:"2024-12-03" },
        { playlist:"New Pop UK",            dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-12-01" },
        { playlist:"Breaking Pop",          dsp:"Apple Music", type:"1st Party", cover:false, dateSent:"2024-11-29" },
        { playlist:"Pop All Day",           dsp:"Apple Music", type:"3rd Party", cover:false, dateSent:"2024-11-27" },
        { playlist:"New Music Friday",      dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-11-25" },
      ]},
    { upc:"824296600512", release:"Neon Skin",          format:"EP",     date:"2024-07-11", genre:"Pop",
      drivers:["Ad Campaign","Social Media Campaign"],
      pickups:[
        { playlist:"Pop Bops",              dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-07-08" },
        { playlist:"Workout Anthems",       dsp:"Spotify",     type:"3rd Party", cover:false, dateSent:"2024-07-06" },
      ]},
    { upc:"824296600101", release:"Static Girl",        format:"Single", date:"2023-11-30", genre:"Pop",
      drivers:["Press Campaign"],
      pickups:[
        { playlist:"New Music Friday",      dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2023-11-27" },
      ]},
  ],
  "Mira Echeverría": [
    { upc:"824296182185", release:"Raíces",             format:"Album",  date:"2024-09-13", genre:"Latin",
      drivers:["Press Campaign","Touring","Social Media Campaign"],
      pickups:[
        { playlist:"Viva España",           dsp:"Spotify",     type:"1st Party", cover:true,  dateSent:"2024-09-10" },
        { playlist:"Flamenco Fusion",       dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-09-08" },
        { playlist:"World Music Picks",     dsp:"Apple Music", type:"1st Party", cover:false, dateSent:"2024-09-06" },
        { playlist:"Latin Pop Favorites",   dsp:"Spotify",     type:"3rd Party", cover:false, dateSent:"2024-09-04" },
      ]},
    { upc:"824296181901", release:"Alma de Noche",      format:"Single", date:"2024-02-14", genre:"Latin",
      drivers:["Social Media Campaign"],
      pickups:[
        { playlist:"New Music Friday LATAM",dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-02-11" },
        { playlist:"Romantico Latino",      dsp:"Apple Music", type:"3rd Party", cover:false, dateSent:"2024-02-09" },
      ]},
    { upc:"824296181544", release:"Duende",             format:"EP",     date:"2023-05-19", genre:"Latin",
      drivers:["Press Campaign","Touring"],
      pickups:[
        { playlist:"Flamenco Puro",         dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2023-05-16" },
      ]},
  ],
  "Glass Meridian": [
    { upc:"824296701001", release:"Mirror Pool",        format:"EP",     date:"2024-11-01", genre:"Electronic",
      drivers:["Ad Campaign","Social Media Campaign","Sync Placement"],
      pickups:[
        { playlist:"Mint",                  dsp:"Spotify",     type:"1st Party", cover:true,  dateSent:"2024-10-29" },
        { playlist:"Electronic Rising",     dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-10-27" },
        { playlist:"Dance Rising",          dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-10-25" },
        { playlist:"House Music All Night", dsp:"Apple Music", type:"1st Party", cover:false, dateSent:"2024-10-23" },
        { playlist:"Ibiza 2024",            dsp:"Spotify",     type:"3rd Party", cover:false, dateSent:"2024-10-21" },
      ]},
    { upc:"824296700612", release:"Fracture",           format:"Single", date:"2024-05-17", genre:"Electronic",
      drivers:["Touring","Ad Campaign"],
      pickups:[
        { playlist:"New Music Friday",      dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-05-14" },
        { playlist:"Deep House Collective", dsp:"Spotify",     type:"3rd Party", cover:false, dateSent:"2024-05-12" },
      ]},
  ],
  "Halo James": [
    { upc:"824296901001", release:"Cold Chain",         format:"Single", date:"2024-10-25", genre:"Hip-Hop",
      drivers:["Social Media Campaign","Ad Campaign"],
      pickups:[
        { playlist:"Rap Caviar",            dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-10-22" },
        { playlist:"Most Necessary",        dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-10-20" },
        { playlist:"Trap Nation",           dsp:"YouTube Music",type:"3rd Party",cover:false, dateSent:"2024-10-18" },
      ]},
    { upc:"824296900701", release:"Signal Loss EP",     format:"EP",     date:"2024-04-12", genre:"Hip-Hop",
      drivers:["Radio Campaign","Social Media Campaign"],
      pickups:[
        { playlist:"New Music Friday",      dsp:"Spotify",     type:"1st Party", cover:true,  dateSent:"2024-04-09" },
        { playlist:"Hip Hop Central",       dsp:"Amazon Music",type:"1st Party", cover:false, dateSent:"2024-04-07" },
        { playlist:"Street Rap 2024",       dsp:"Spotify",     type:"3rd Party", cover:false, dateSent:"2024-04-05" },
      ]},
  ],
  "Cassidy Blue": [
    { upc:"824296401001", release:"Velvet Hours",       format:"Single", date:"2024-08-09", genre:"R&B",
      drivers:["Press Campaign","Social Media Campaign"],
      pickups:[
        { playlist:"R&B X",                 dsp:"Spotify",     type:"1st Party", cover:true,  dateSent:"2024-08-06" },
        { playlist:"Soul Storm",            dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2024-08-04" },
        { playlist:"Late Night R&B",        dsp:"Apple Music", type:"3rd Party", cover:false, dateSent:"2024-08-02" },
      ]},
    { upc:"824296400312", release:"Indigo Fade",        format:"Single", date:"2023-12-01", genre:"R&B",
      drivers:["Social Media Campaign"],
      pickups:[
        { playlist:"R&B Radar",             dsp:"Spotify",     type:"1st Party", cover:false, dateSent:"2023-11-28" },
      ]},
  ],
  "Viveka": [
    { upc:"824296501001", release:"Widow's Peak",       format:"EP",     date:"2024-09-27", genre:"Pop",
      drivers:["Press Campaign","Ad Campaign","Social Media Campaign"],
      pickups:[
        { playlist:"TIDAL Rising",          dsp:"Tidal",       type:"1st Party", cover:true,  dateSent:"2024-09-24" },
        { playlist:"Dark Aesthetics",       dsp:"Spotify",     type:"3rd Party", cover:false, dateSent:"2024-09-22" },
        { playlist:"Pop All Day",           dsp:"Apple Music", type:"1st Party", cover:false, dateSent:"2024-09-20" },
        { playlist:"Melancholic Hits",      dsp:"Spotify",     type:"3rd Party", cover:false, dateSent:"2024-09-18" },
      ]},
    { upc:"824296500601", release:"Pale Blue Signal",   format:"Single", date:"2024-02-23", genre:"Pop",
      drivers:["Press Campaign"],
      pickups:[
        { playlist:"Breaking Pop",          dsp:"Apple Music", type:"1st Party", cover:false, dateSent:"2024-02-20" },
      ]},
  ],
};

const HISTORY_TIMEFRAMES = [
  { label:"30D",  days:30  },
  { label:"90D",  days:90  },
  { label:"6M",   days:180 },
  { label:"1Y",   days:365 },
  { label:"All",  days:null },
];

function ArtistPanel({ r, onClose, onViewProfile }) {
  const [activeTab,       setActiveTab]       = useState("overview");
  const [historyTimeframe,setHistoryTimeframe] = useState("1Y");
  const d = DRIVER_DATA[r.artist] || {};
  const artistPickups = PICKUPS.filter(p => p.artist === r.artist)
    .sort((a, b) => new Date(b.dateSent) - new Date(a.dateSent));
  const fmtN = n => n >= 1000000 ? (n/1000000).toFixed(1)+"M" : n >= 1000 ? Math.round(n/1000)+"K" : n;

  const tfDays   = HISTORY_TIMEFRAMES.find(t => t.label === historyTimeframe)?.days ?? null;
  const cutoff   = tfDays ? new Date(T.getTime() - tfDays * 86400000) : null;
  const inWindow = dateStr => !cutoff || new Date(dateStr) >= cutoff;
  const sc = symphonicScore(r);
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
        <div style={{ position:"absolute", top:16, right:16, display:"flex", gap:6, zIndex:1 }}>
          {onViewProfile && (
            <button onClick={onViewProfile} style={{ background:"rgba(0,217,255,0.1)", border:`1px solid rgba(0,217,255,0.3)`, color:C.cyan, borderRadius:6, fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", padding:"0 10px", height:28, cursor:"pointer", fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>Full Profile →</button>
          )}
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)", border:"none", color:C.muted, width:28, height:28, borderRadius:6, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6, paddingRight:40 }}>
          <div style={{ fontSize:20, fontWeight:800 }}>
            {r.artist} <span style={{ color:C.muted, fontWeight:400 }}>—</span> <span style={{ color:C.cyan }}>{r.release}</span>
          </div>
          {/* Symphonic Score badge */}
          <div style={{ flexShrink:0, textAlign:"center", background:`${scCol}14`, border:`1px solid ${scCol}44`, borderRadius:10, padding:"6px 12px", marginLeft:10 }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:scCol, fontFamily:"'DM Mono',monospace", marginBottom:2 }}>SYM SCORE</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, fontWeight:800, color:scCol, lineHeight:1, letterSpacing:"0.04em" }}>{sc.total}</div>
          </div>
        </div>
        {/* Score breakdown chips */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
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

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NavIc = ({ d }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    {d.map((p,i) => <path key={i} d={p} />)}
  </svg>
);
const NAV_ITEMS = [
  { id:"command",     label:"Command Center", icon:<NavIc d={["M3 3h7v7H3z","M14 3h7v7h-7z","M3 14h7v7H3z","M14 14h7v7h-7z"]} /> },
  { id:"releases",    label:"Releases",       icon:<NavIc d={["M3 6h18","M3 12h18","M3 18h18"]} /> },
  { id:"performance", label:"Performance",    icon:<NavIc d={["M18 20V10","M12 20V4","M6 20v-6"]} /> },
  { id:"artists",     label:"Artists",        icon:<NavIc d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"]} />, soon:true },
  { id:"campaigns",   label:"Campaigns",      icon:<NavIc d={["M22 12h-4l-3 9L9 3l-3 9H2"]} />, soon:true },
];

// ─── ARTIST PROFILE PAGE ──────────────────────────────────────────────────────
function ArtistProfilePage({ release, onBack }) {
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
  const fmtN            = n => n>=1000000?(n/1000000).toFixed(1)+"M":n>=1000?Math.round(n/1000)+"K":n;
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

  const EmptyRow = ({ msg }) => <div style={{ fontSize:12, color:C.dim, padding:"10px 0" }}>{msg}</div>;

  const PlRow = ({ p, fields }) => (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 10px", background:"rgba(255,255,255,0.02)", borderRadius:8, border:`1px solid rgba(255,255,255,0.05)`, marginBottom:5 }}>
      {fields}
    </div>
  );

  const profileSignals = [
    {
      metric:"Audience", value: profileRd.find(x=>x.metric==="Audience").value, color: C.cyan,
      signals:[
        { label:`${fmtN(release.spotifyML)} Spotify Monthly Listeners`, active:true,
          detail: release.spotifyML>=1000000?"strong":release.spotifyML>=200000?"mid":"emerging" },
      ],
    },
    {
      metric:"Activity", value: profileRd.find(x=>x.metric==="Activity").value, color: C.green,
      signals:[
        { label:"Upcoming Shows",   active:!!d.upcomingShows,    detail:d.upcomingShows },
        { label:"Social Activity",  active:!!d.socialActivity,   detail:d.socialActivity },
        { label:"DSP Tools in Use", active:d.dspTools?.length>0, detail:d.dspTools?.join(", ") },
      ],
    },
    {
      metric:"History", value: profileRd.find(x=>x.metric==="History").value, color: C.orange,
      signals:[
        { label:`${artistPickups.length} Symphonic pickup${artistPickups.length!==1?"s":""} on record`,
          active:artistPickups.length>0,
          detail:artistPickups.length>0?artistPickups.slice(0,2).map(p=>p.playlist).join(", ")+(artistPickups.length>2?` +${artistPickups.length-2} more`:""):null },
      ],
    },
    {
      metric:"Story", value: profileRd.find(x=>x.metric==="Story").value, color: C.purple,
      signals:[
        { label:"What's the Story",       active:!!d.story },
        { label:"Similar Artists / FFO",  active:!!d.similarArtists,      detail:d.similarArtists },
        { label:"Mood tags",              active:d.mood?.length>0,         detail:d.mood?.join(", ") },
        { label:"Song style tags",        active:d.songStyles?.length>0,   detail:d.songStyles?.join(", ") },
        { label:"Marketing drivers",      active:d.drivers?.length>0,      detail:d.drivers?.join(", ") },
      ],
    },
    {
      metric:"Momentum", value: profileRd.find(x=>x.metric==="Momentum").value, color: "#E1306C",
      signals:[
        { label:"Confirmed Press", active:!!d.confirmedPress, detail:d.confirmedPress },
        { label:"Ad Campaign",     active:!!d.adDetails,      detail:d.adDetails },
      ],
    },
    {
      metric:"Consistency", value: profileRd.find(x=>x.metric==="Consistency").value, color: C.gold,
      signals:[
        { label:`${d.releaseConsistency||0}% release consistency score`, active:(d.releaseConsistency||0)>0,
          detail:(d.releaseConsistency||0)>=70?"Regular release cadence":(d.releaseConsistency||0)>=40?"Moderate release cadence":"Infrequent releases" },
      ],
    },
  ];

  return (
    <div style={{ padding:"28px 36px 80px", animation:"fadeUp 0.25s ease" }}>

      {/* ── BACK ── */}
      <button onClick={onBack} style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`, color:C.muted, borderRadius:7, padding:"5px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.08em", cursor:"pointer", marginBottom:20, display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ fontSize:14 }}>←</span> Back to Releases
      </button>

      {/* ── HERO ── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:24, marginBottom:24, padding:"20px 24px", background:"rgba(255,255,255,0.02)", border:`1px solid ${C.border}`, borderRadius:14 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, letterSpacing:"0.04em", lineHeight:1, color:"#fff" }}>{release.artist}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, flexWrap:"wrap" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <span style={{ fontSize:14, fontWeight:700, color:"rgba(255,255,255,0.9)" }}>{release.release}</span>
            {release.upc && <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:C.dim }}>UPC {release.upc}</span>}
            <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.cyan, background:"rgba(0,217,255,0.08)", border:`1px solid rgba(0,217,255,0.2)`, borderRadius:99, padding:"2px 7px", letterSpacing:"0.1em" }}>CURRENT RELEASE</span>
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:10 }}>
            <Pill label={release.priority} color={PRIORITY_COLORS[release.priority]||C.cyan} />
            <Pill label={release.genre}    color={GENRE_COLORS[release.genre]||C.cyan} />
            <Pill label={release.format}   color={C.dim} />
            <Pill label={fmtDate(release.date)} color={C.gold} />
            {release.ei && <Pill label="EI" color={C.green} />}
            {release.override?.map(o => <Pill key={o} label={o} color={C.purple} />)}
          </div>
          <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, color:C.muted }}><span style={{ color:"rgba(255,255,255,0.5)" }}>{release.label}</span></span>
            <span style={{ color:C.border }}>·</span>
            <span style={{ fontSize:11, color:C.muted }}>Lead: <span style={{ color:"rgba(255,255,255,0.5)" }}>{release.lead}</span></span>
            <span style={{ color:C.border }}>·</span>
            <span style={{ fontSize:11, color:C.muted }}>Territory: <span style={{ color:"rgba(255,255,255,0.5)" }}>{release.territory}</span></span>
          </div>
        </div>

        {/* Right: score badge + breakdown bars */}
        <div style={{ flexShrink:0, background:`${scCol}08`, border:`1px solid ${scCol}30`, borderRadius:14, padding:"16px 20px", minWidth:200 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:14 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:8, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:scCol, fontFamily:"'DM Mono',monospace", marginBottom:2 }}>SYM SCORE</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:64, fontWeight:800, color:scCol, lineHeight:1, letterSpacing:"0.03em" }}>{sc.total}</div>
              <div style={{ fontSize:8, color:`${scCol}80`, fontFamily:"'DM Mono',monospace" }}>out of 100</div>
            </div>
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
              {[
                { label:"Pickups",  value:sc.breakdown.pickups,     max:25, color:C.green   },
                { label:"Audience", value:sc.breakdown.audience,    max:20, color:C.cyan    },
                { label:"Social",   value:sc.breakdown.social,      max:20, color:"#E1306C" },
                { label:"Drive",    value:sc.breakdown.drive,       max:20, color:C.orange  },
                { label:"Consist.", value:sc.breakdown.consistency, max:15, color:C.gold    },
              ].map(({ label, value, max, color }) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:48, fontSize:8, color:C.dim, fontFamily:"'DM Mono',monospace", textTransform:"uppercase", letterSpacing:"0.08em", flexShrink:0 }}>{label}</div>
                  <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.06)", borderRadius:99 }}>
                    <div style={{ width:`${(value/max)*100}%`, height:"100%", background:color, borderRadius:99, transition:"width 0.4s ease" }} />
                  </div>
                  <div style={{ fontSize:9, color, fontFamily:"'DM Mono',monospace", fontWeight:700, width:28, textAlign:"right", flexShrink:0 }}>{value}<span style={{ color:"rgba(255,255,255,0.2)", fontWeight:400 }}>/{max}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN 2-COL: Left = Radar + Score Detail, Right = Artist Info ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:20 }}>

        {/* LEFT — Strength Profile + Score Signal Detail */}
        <Card>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:12, textAlign:"center" }}>Strength Profile</div>
          <div style={{ position:"relative", height:360, marginBottom:20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={profileRd} cx="50%" cy="50%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" tick={false} />
                <Radar name={release.artist} dataKey="value" stroke={C.cyan} fill={C.cyan} fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={TooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
            {profileRd.map(({ metric, value, color, pos }) => (
              <div key={metric} style={{
                position:"absolute", top:pos.top, left:pos.left,
                transform:"translate(-50%,-50%)",
                display:"flex", flexDirection:"column", alignItems:"center",
                background:`${color}14`, border:`1px solid ${color}40`,
                borderRadius:8, padding:"5px 10px", pointerEvents:"none",
              }}>
                <div style={{ fontSize:7, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:`${color}cc`, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{metric}</div>
                <div style={{ fontSize:20, fontWeight:800, color, fontFamily:"'Bebas Neue',sans-serif", lineHeight:1.1, letterSpacing:"0.03em" }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace", marginBottom:10 }}>Score Breakdown</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {profileSignals.map(({ metric, value, color, signals }) => (
                <div key={metric} style={{ background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"8px 12px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <div style={{ fontSize:10, fontWeight:700, color, width:84, flexShrink:0 }}>{metric}</div>
                    <div style={{ flex:1, height:4, borderRadius:99, background:"rgba(255,255,255,0.06)" }}>
                      <div style={{ width:`${value}%`, height:"100%", borderRadius:99, background:color, transition:"width 0.4s" }} />
                    </div>
                    <div style={{ fontSize:11, fontWeight:800, color, fontFamily:"'DM Mono',monospace", width:28, textAlign:"right", flexShrink:0 }}>{value}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:3, paddingLeft:92 }}>
                    {signals.map((s, si) => (
                      <div key={si} style={{ display:"flex", alignItems:"baseline", gap:5 }}>
                        <span style={{ fontSize:10, color:s.active?C.green:"rgba(255,255,255,0.18)", flexShrink:0 }}>{s.active?"✓":"○"}</span>
                        <span style={{ fontSize:10, color:s.active?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.2)" }}>{s.label}</span>
                        {s.active && s.detail && (
                          <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontStyle:"italic", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:260 }}>— {s.detail}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* RIGHT — Artist info stacked */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <SectionLabel>Campaign Drivers</SectionLabel>
            <div style={{ fontSize:10, color:C.dim, marginBottom:8 }}>for {release.release}</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {(d.drivers||[]).length>0
                ?(d.drivers||[]).map(dr=><span key={dr} style={{ background:`${DRIVER_COLORS[dr]||C.cyan}18`, color:DRIVER_COLORS[dr]||C.cyan, border:`1px solid ${DRIVER_COLORS[dr]||C.cyan}44`, borderRadius:99, padding:"3px 10px", fontSize:10, fontWeight:700 }}>{dr}</span>)
                :<span style={{ fontSize:11, color:C.dim }}>No drivers submitted yet.</span>
              }
            </div>
            {d.dspTools?.length>0 && (
              <>
                <div style={{ marginTop:12 }}><SectionLabel>DSP Tools</SectionLabel></div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:6 }}>
                  {d.dspTools.map(t=><span key={t} style={{ background:"rgba(57,217,138,0.08)", color:C.green, border:`1px solid rgba(57,217,138,0.25)`, borderRadius:99, padding:"3px 10px", fontSize:10, fontWeight:700 }}>{t}</span>)}
                </div>
              </>
            )}
          </Card>

          {(d.upcomingShows||d.confirmedPress||d.adDetails) && (
            <Card>
              {d.upcomingShows && <div style={{ marginBottom:d.confirmedPress||d.adDetails?12:0 }}><SectionLabel>Upcoming Shows</SectionLabel><div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.5, marginTop:4 }}>{d.upcomingShows}</div></div>}
              {d.confirmedPress && <div style={{ marginBottom:d.adDetails?12:0, borderTop:d.upcomingShows?`1px solid ${C.border}`:"none", paddingTop:d.upcomingShows?12:0 }}><SectionLabel>Confirmed Press</SectionLabel><div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.5, marginTop:4 }}>{d.confirmedPress}</div></div>}
              {d.adDetails && <div style={{ borderTop:d.upcomingShows||d.confirmedPress?`1px solid ${C.border}`:"none", paddingTop:d.upcomingShows||d.confirmedPress?12:0 }}><SectionLabel>Ad Campaign</SectionLabel><div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.5, marginTop:4 }}>{d.adDetails}</div></div>}
            </Card>
          )}

          <Card>
            <SectionLabel>Social & Audience</SectionLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:8, marginBottom:d.socialActivity?10:0 }}>
              {[
                { label:"Spotify ML",  value:release.spotifyML,  color:DSP_COLORS.Spotify },
                { label:"Instagram",   value:release.igFollowers, color:"#E1306C" },
                { label:"TikTok",      value:d.tiktok,            color:"#69C9D0" },
                { label:"YouTube",     value:d.youtube,           color:"#FF0000" },
                { label:"Twitter/X",   value:d.twitter,           color:"#1DA1F2" },
                { label:"SoundCloud",  value:d.soundcloud,        color:"#ff5500" },
              ].filter(p=>p.value).map(p=>(
                <div key={p.label} style={{ background:`${p.color}10`, border:`1px solid ${p.color}25`, borderRadius:7, padding:"7px 9px" }}>
                  <div style={{ fontSize:8, color:C.muted, marginBottom:1 }}>{p.label}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:p.color, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.03em" }}>{fmtN(p.value)}</div>
                </div>
              ))}
            </div>
            {d.socialActivity && <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", lineHeight:1.5, fontStyle:"italic", borderTop:`1px solid ${C.border}`, paddingTop:8 }}>{d.socialActivity}</div>}
          </Card>

          <Card>
            {d.story && <div style={{ marginBottom:12 }}><SectionLabel>What's the Story</SectionLabel><div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", lineHeight:1.6, marginTop:4 }}>{d.story}</div></div>}
            {d.similarArtists && <div style={{ marginBottom:10, borderTop:d.story?`1px solid ${C.border}`:"none", paddingTop:d.story?12:0 }}><SectionLabel>Similar Artists / FFO</SectionLabel><div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", lineHeight:1.5, marginTop:4 }}>{d.similarArtists}</div></div>}
            {(d.mood?.length>0||d.songStyles?.length>0) && (
              <div style={{ display:"flex", gap:12, flexWrap:"wrap", borderTop:`1px solid ${C.border}`, paddingTop:10 }}>
                {d.mood?.length>0 && <div><SectionLabel>Mood</SectionLabel><div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:4 }}>{d.mood.map(m=><span key={m} style={{ background:"rgba(180,92,255,0.1)", color:C.purple, border:`1px solid rgba(180,92,255,0.25)`, borderRadius:99, padding:"2px 8px", fontSize:9, fontWeight:600 }}>{m}</span>)}</div></div>}
                {d.songStyles?.length>0 && <div><SectionLabel>Song Style</SectionLabel><div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:4 }}>{d.songStyles.map(s=><span key={s} style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.55)", border:`1px solid rgba(255,255,255,0.08)`, borderRadius:99, padding:"2px 8px", fontSize:9 }}>{s}</span>)}</div></div>}
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* ── COLLAPSIBLE: PLACEMENT HISTORY ── */}
      <div style={{ marginBottom:16 }}>
        <button onClick={()=>setHistoryOpen(o=>!o)} style={{
          width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
          background:"rgba(255,255,255,0.02)", border:`1px solid ${historyOpen?"rgba(0,217,255,0.3)":C.border}`,
          borderRadius:historyOpen?"12px 12px 0 0":"12px", padding:"14px 20px",
          cursor:"pointer", transition:"all 0.15s",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:historyOpen?C.cyan:C.muted, fontFamily:"'DM Mono',monospace" }}>Placement History</div>
            <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.cyan, background:"rgba(0,217,255,0.07)", border:`1px solid rgba(0,217,255,0.2)`, borderRadius:99, padding:"2px 8px" }}>{artistPickups.length} total pickups</span>
          </div>
          <span style={{ color:historyOpen?C.cyan:C.dim, fontSize:12 }}>{historyOpen?"▲":"▼"}</span>
        </button>
        {historyOpen && (
          <div style={{ background:"rgba(255,255,255,0.01)", border:`1px solid rgba(0,217,255,0.3)`, borderTop:"none", borderRadius:"0 0 12px 12px", padding:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ fontSize:9, color:C.dim, fontFamily:"'DM Mono',monospace" }}>Filter by timeframe</div>
              <div style={{ display:"flex", gap:3, background:"rgba(255,255,255,0.04)", borderRadius:7, padding:3 }}>
                {HISTORY_TIMEFRAMES.map(tf=>(
                  <button key={tf.label} onClick={()=>setHistoryTimeframe(tf.label)} style={{
                    padding:"3px 10px", fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
                    border:"none", borderRadius:5, cursor:"pointer",
                    background:historyTimeframe===tf.label?C.surface:"transparent",
                    color:historyTimeframe===tf.label?"#fff":C.muted,
                    boxShadow:historyTimeframe===tf.label?"0 1px 4px rgba(0,0,0,0.4)":"none",
                  }}>{tf.label}</button>
                ))}
              </div>
            </div>
            <HistSection label="Symphonic Pitched Editorial" source="AIRTABLE" sourceColor={C.green}
              count={`${artistPickups.filter(p=>inWindow(p.dateSent)).length} of ${artistPickups.length} total`} total={null}>
              {artistPickups.filter(p=>inWindow(p.dateSent)).length===0
                ?<EmptyRow msg={artistPickups.length>0?"No Symphonic pickups in this time window.":"No Symphonic pickup data available."} />
                :artistPickups.filter(p=>inWindow(p.dateSent)).map((p,i)=>(
                  <PlRow key={i} p={p} fields={<>
                    <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.85)"}}>{p.playlist}</div></div>
                    <span style={{background:`${DSP_COLORS[p.dsp]||C.cyan}18`,color:DSP_COLORS[p.dsp]||C.cyan,border:`1px solid ${DSP_COLORS[p.dsp]||C.cyan}33`,borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{p.dsp}</span>
                    <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{fmtDate(p.dateSent)}</div>
                    <span style={{color:p.type==="1st Party"?C.green:C.gold,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{p.type}</span>
                    <span style={{fontSize:10,textAlign:"center",minWidth:24,color:p.cover?C.green:C.dim}}>{p.cover?"✓":"—"}</span>
                  </>} />
                ))
              }
            </HistSection>
            <HistSection label="External Editorial — Organic" source="CHARTMETRIC" sourceColor={C.cyan}
              count={organicEditorial.filter(p=>inWindow(p.date)).length} total={organicEditorial.length}>
              {organicEditorial.filter(p=>inWindow(p.date)).length===0
                ?<EmptyRow msg={organicEditorial.length>0?"No organic editorial in this time window.":"No organic editorial data available."} />
                :organicEditorial.filter(p=>inWindow(p.date)).map((p,i)=>(
                  <PlRow key={i} p={p} fields={<>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.85)"}}>{p.playlist}</div>
                      {p.algorithmic&&<span style={{fontSize:9,color:"#69C9D0",background:"rgba(105,201,208,0.1)",border:"1px solid rgba(105,201,208,0.25)",borderRadius:99,padding:"1px 6px",marginTop:2,display:"inline-block"}}>Algorithmic add</span>}
                    </div>
                    <span style={{background:`${DSP_COLORS[p.dsp]||C.cyan}18`,color:DSP_COLORS[p.dsp]||C.cyan,border:`1px solid ${DSP_COLORS[p.dsp]||C.cyan}33`,borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{p.dsp}</span>
                    <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{fmtN(p.followers)} followers</div>
                    <div style={{fontSize:10,color:C.dim,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{fmtDate(p.date)}</div>
                  </>} />
                ))
              }
            </HistSection>
            <HistSection label="User Generated Playlists" source="CHARTMETRIC" sourceColor={C.purple}
              count={`${ugcPlaylists.filter(p=>inWindow(p.date)).length} of ${ugcPlaylists.length}`} total={null}>
              {ugcPlaylists.filter(p=>inWindow(p.date)).length===0
                ?<EmptyRow msg={ugcPlaylists.length>0?"No UGC playlists in this time window.":"No UGC playlist data available."} />
                :ugcPlaylists.filter(p=>inWindow(p.date)).map((p,i)=>(
                  <PlRow key={i} p={p} fields={<>
                    <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.85)"}}>{p.playlist}</div><div style={{fontSize:10,color:C.dim,marginTop:1}}>by {p.curator}</div></div>
                    <span style={{background:`${DSP_COLORS[p.dsp]||C.cyan}18`,color:DSP_COLORS[p.dsp]||C.cyan,border:`1px solid ${DSP_COLORS[p.dsp]||C.cyan}33`,borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{p.dsp}</span>
                    <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{fmtN(p.followers)} followers</div>
                    <div style={{fontSize:10,color:C.dim,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{fmtDate(p.date)}</div>
                  </>} />
                ))
              }
            </HistSection>
            <HistSection label="Similar Artist Pitch Intel" source="CHARTMETRIC" sourceColor={C.gold}
              count={`${similarPickups.length} targets`} total={null}>
              <div style={{fontSize:11,color:C.dim,marginBottom:8,lineHeight:1.5}}>Playlists similar artists have landed on — direct pitch targets.</div>
              {similarPickups.length===0
                ?<EmptyRow msg="No similar artist data available." />
                :similarPickups.map((p,i)=>(
                  <PlRow key={i} p={p} fields={<>
                    <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.85)"}}>{p.playlist}</div><div style={{fontSize:10,color:C.gold,marginTop:1}}>via {p.artist}</div></div>
                    <span style={{background:`${DSP_COLORS[p.dsp]||C.cyan}18`,color:DSP_COLORS[p.dsp]||C.cyan,border:`1px solid ${DSP_COLORS[p.dsp]||C.cyan}33`,borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{p.dsp}</span>
                    <div style={{fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{fmtN(p.followers)} followers</div>
                    <span style={{fontSize:9,fontWeight:700,color:C.gold,background:"rgba(255,184,0,0.08)",border:`1px solid rgba(255,184,0,0.2)`,borderRadius:99,padding:"1px 7px",whiteSpace:"nowrap"}}>Pitch Target</span>
                  </>} />
                ))
              }
            </HistSection>
          </div>
        )}
      </div>

      {/* ── COLLAPSIBLE: RELEASE HISTORY ── */}
      <div>
        <button onClick={()=>setReleasesOpen(o=>!o)} style={{
          width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
          background:"rgba(255,255,255,0.02)", border:`1px solid ${releasesOpen?"rgba(0,217,255,0.3)":C.border}`,
          borderRadius:releasesOpen?"12px 12px 0 0":"12px", padding:"14px 20px",
          cursor:"pointer", transition:"all 0.15s",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:releasesOpen?C.cyan:C.muted, fontFamily:"'DM Mono',monospace" }}>Release History</div>
            <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.muted, background:"rgba(255,255,255,0.05)", borderRadius:99, padding:"2px 8px" }}>{pastReleases.length} releases on record</span>
          </div>
          <span style={{ color:releasesOpen?C.cyan:C.dim, fontSize:12 }}>{releasesOpen?"▲":"▼"}</span>
        </button>
        {releasesOpen && (
          <div style={{ background:"rgba(255,255,255,0.01)", border:`1px solid rgba(0,217,255,0.3)`, borderTop:"none", borderRadius:"0 0 12px 12px", padding:"20px" }}>
            <div style={{ fontSize:11, color:C.dim, marginBottom:16 }}>Past releases and their Symphonic campaign results. Each release has its own campaign drivers and pickup record.</div>
            {pastReleases.length===0?(
              <div style={{ fontSize:12, color:C.dim, padding:"16px 0" }}>No past release history on record for this artist.</div>
            ):(
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {pastReleases.map((pr,i)=>{
                  const isOpen=expandedRelease===i;
                  const totalPickups=pr.pickups.length;
                  const covers=pr.pickups.filter(p=>p.cover).length;
                  const firstParty=pr.pickups.filter(p=>p.type==="1st Party").length;
                  return (
                    <div key={i} style={{ border:`1px solid ${isOpen?"rgba(0,217,255,0.25)":C.border}`, borderRadius:10, overflow:"hidden" }}>
                      <div onClick={()=>setExpandedRelease(isOpen?null:i)}
                        style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", cursor:"pointer", background:isOpen?"rgba(0,217,255,0.04)":"transparent" }}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:13,color:"rgba(255,255,255,0.9)"}}>{pr.release}</div>
                          <div style={{fontSize:10,color:C.dim,marginTop:2,fontFamily:"'DM Mono',monospace"}}>{pr.upc} · {pr.format} · {fmtDate(pr.date)}</div>
                        </div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap",maxWidth:300}}>
                          {(pr.drivers||[]).map(dr=><span key={dr} style={{background:`${DRIVER_COLORS[dr]||C.cyan}14`,color:DRIVER_COLORS[dr]||C.cyan,border:`1px solid ${DRIVER_COLORS[dr]||C.cyan}33`,borderRadius:99,padding:"2px 8px",fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>{dr}</span>)}
                        </div>
                        <div style={{display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
                          <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:totalPickups>0?C.green:C.dim,fontFamily:"'Bebas Neue',sans-serif",lineHeight:1}}>{totalPickups}</div><div style={{fontSize:8,color:C.dim,textTransform:"uppercase",letterSpacing:"0.1em"}}>pickups</div></div>
                          {covers>0&&<div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:C.gold,fontFamily:"'Bebas Neue',sans-serif",lineHeight:1}}>{covers}</div><div style={{fontSize:8,color:C.dim,textTransform:"uppercase",letterSpacing:"0.1em"}}>covers</div></div>}
                          <div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:700,color:C.cyan,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{firstParty}/{totalPickups}</div><div style={{fontSize:8,color:C.dim,textTransform:"uppercase",letterSpacing:"0.1em"}}>1st pty</div></div>
                          <span style={{color:isOpen?C.cyan:C.dim,fontSize:14,marginLeft:4}}>{isOpen?"▲":"▼"}</span>
                        </div>
                      </div>
                      {isOpen&&(
                        <div style={{borderTop:`1px solid ${C.border}`,padding:"12px 16px"}}>
                          {pr.pickups.length===0?(
                            <div style={{fontSize:12,color:C.dim}}>No Symphonic pickups recorded for this release.</div>
                          ):(
                            <table style={{width:"100%",borderCollapse:"collapse"}}>
                              <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>{["Playlist","DSP","Date","Type","Cover"].map(h=><th key={h} style={{textAlign:"left",padding:"5px 10px",fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,fontFamily:"'DM Mono',monospace"}}>{h}</th>)}</tr></thead>
                              <tbody>
                                {pr.pickups.map((p,j)=>(
                                  <tr key={j} style={{borderBottom:`1px solid rgba(255,255,255,0.03)`}}>
                                    <td style={{padding:"7px 10px",fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.85)"}}>{p.playlist}</td>
                                    <td style={{padding:"7px 10px"}}><span style={{background:`${DSP_COLORS[p.dsp]||C.cyan}18`,color:DSP_COLORS[p.dsp]||C.cyan,border:`1px solid ${DSP_COLORS[p.dsp]||C.cyan}33`,borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:700}}>{p.dsp}</span></td>
                                    <td style={{padding:"7px 10px",fontSize:11,color:C.muted,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{fmtDate(p.dateSent)}</td>
                                    <td style={{padding:"7px 10px"}}><span style={{color:p.type==="1st Party"?C.green:C.gold,fontSize:11,fontWeight:700}}>{p.type}</span></td>
                                    <td style={{padding:"7px 10px",textAlign:"center"}}>{p.cover?<span style={{color:C.green,fontWeight:700}}>✓</span>:<span style={{color:C.dim}}>—</span>}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
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

  // Chart data
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
        {/* Logo */}
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

        {/* Nav items */}
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

        {/* Back to list button when in artist profile */}
        {tab === "artist-profile" && (
          <button onClick={() => { setTab("releases"); setProfileTarget(null); }}
            style={{ marginTop:12, display:"flex", alignItems:"center", gap:8, padding:"9px 14px", borderRadius:9, background:"rgba(255,255,255,0.04)", border:"1px solid transparent", color:C.muted, fontSize:11, fontWeight:600, cursor:"pointer", width:"100%", textAlign:"left", fontFamily:"inherit" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Releases
          </button>
        )}

        {/* Bottom info */}
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

            {/* KPI Strip */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
              <KPI label="This Week" value={thisWeek.length} sub="releases dropping" color={C.gold} />
              <KPI label="Priority 1" value={p1Releases.length} sub="top tier releases" color={C.pink} />
              <KPI label="EI Flags" value={RELEASES.filter(r=>r.ei).length} sub="editorial inclusion" color={C.purple} />
              <KPI label="Total Pickups" value={PICKUPS.length} sub="all time" color={C.green} />
              <KPI label="Cover Slots" value={PICKUPS.filter(p=>p.cover).length} sub="this month" color={C.orange} />
            </div>

            {/* ── Priority Releases + This Week by Lead ── */}
            {(() => {
              const ranked = [...RELEASES]
                .filter(r => daysUntil(r.date) >= 0 && daysUntil(r.date) <= 30)
                .map(r => ({ r, sc: symphonicScore(r) }))
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
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

                  {/* LEFT — Priority releases ranked list */}
                  <Card style={{ alignSelf:"flex-start" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                      <SectionLabel>Priority Releases — Next 30 Days</SectionLabel>
                      <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.cyan, background:"rgba(0,217,255,0.07)", border:`1px solid rgba(0,217,255,0.2)`, borderRadius:99, padding:"2px 10px", letterSpacing:"0.1em" }}>BY SCORE</span>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column" }}>
                      {ranked.map(({ r, sc }, i) => {
                        const col = scoreColor(sc.total);
                        const days = daysUntil(r.date);
                        const d = DRIVER_DATA[r.artist] || {};
                        return (
                          <div key={r.id}
                            onClick={() => { setProfileTarget(r); setTab("artist-profile"); }}
                            style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom: i < ranked.length-1 ? `1px solid ${C.border}` : "none", cursor:"pointer" }}>
                            {/* Rank */}
                            <div style={{ width:20, textAlign:"center", fontFamily:"'Bebas Neue',sans-serif", fontSize:15, color:i===0?C.gold:i===1?"rgba(192,192,192,0.8)":i===2?"rgba(180,92,255,0.7)":C.dim, flexShrink:0 }}>{i+1}</div>
                            {/* Score badge */}
                            <div style={{ flexShrink:0, width:40, height:40, borderRadius:9, background:`${col}14`, border:`1px solid ${col}40`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:19, color:col, lineHeight:1 }}>{sc.total}</div>
                            </div>
                            {/* Info */}
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                                <div style={{ fontWeight:700, fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.artist}</div>
                                <Pill label={r.priority.replace("Priority ","")} color={PRIORITY_COLORS[r.priority]||C.cyan} />
                                {r.ei && <Pill label="EI" color={C.green} />}
                              </div>
                              <div style={{ fontSize:10, color:C.dim, display:"flex", alignItems:"center", gap:6 }}>
                                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>{r.release}</span>
                                <span style={{ color:C.border }}>·</span>
                                <span style={{ color: days<=3?C.pink:C.gold, fontWeight:700, whiteSpace:"nowrap" }}>{days===0?"TODAY":days===1?"TOMORROW":`${days}d`}</span>
                                <span style={{ color:C.border }}>·</span>
                                <span style={{ whiteSpace:"nowrap" }}>{r.lead}</span>
                              </div>
                            </div>
                            {/* Score pills */}
                            <div style={{ flexShrink:0, display:"flex", gap:3 }}>
                              {[
                                { v:sc.breakdown.pickups,  l:"PU",  c:C.green },
                                { v:sc.breakdown.audience, l:"ML",  c:C.cyan },
                                { v:sc.breakdown.social,   l:"SOC", c:"#E1306C" },
                                { v:sc.breakdown.drive,    l:"DRV", c:C.orange },
                              ].map(b=>(
                                <div key={b.l} style={{ background:`${b.c}15`, border:`1px solid ${b.c}30`, borderRadius:4, padding:"1px 5px", display:"flex", gap:3, alignItems:"center" }}>
                                  <span style={{ fontSize:8, color:`${b.c}cc`, fontFamily:"'DM Mono',monospace" }}>{b.l}</span>
                                  <span style={{ fontSize:9, fontWeight:800, color:b.c, fontFamily:"'DM Mono',monospace" }}>{b.v}</span>
                                </div>
                              ))}
                            </div>
                            {/* Warning if no story */}
                            {!d.story && <span title="No pitch story" style={{ fontSize:12, color:C.gold, flexShrink:0 }}>⚠</span>}
                          </div>
                        );
                      })}
                      {ranked.length===0 && <div style={{ color:C.muted, fontSize:12 }}>No releases in the next 30 days.</div>}
                    </div>
                  </Card>

                  {/* RIGHT — This week by lead */}
                  <Card style={{ alignSelf:"flex-start" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                      <SectionLabel>This Week by Lead</SectionLabel>
                      <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.muted, background:"rgba(255,255,255,0.05)", borderRadius:99, padding:"2px 10px" }}>{thisWeek.length} releases</span>
                    </div>
                    {byLead.length === 0
                      ? <div style={{ color:C.muted, fontSize:12 }}>No releases this week.</div>
                      : (
                        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                          {byLead.map(({ lead, releases }) => {
                            const p1 = releases.filter(r=>r.priority==="Priority 1").length;
                            const p2 = releases.filter(r=>r.priority==="Priority 2").length;
                            const p3 = releases.filter(r=>r.priority==="Priority 3").length;
                            return (
                              <div key={lead}>
                                {/* Lead header */}
                                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${C.border}` }}>
                                  <div style={{ width:30, height:30, borderRadius:8, background:"rgba(0,217,255,0.08)", border:`1px solid rgba(0,217,255,0.2)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                    <span style={{ fontSize:13, fontWeight:800, color:C.cyan, fontFamily:"'Bebas Neue',sans-serif" }}>{lead[0]}</span>
                                  </div>
                                  <div style={{ flex:1 }}>
                                    <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.9)" }}>{lead}</div>
                                    <div style={{ fontSize:10, color:C.dim, display:"flex", gap:6, marginTop:1 }}>
                                      {p1>0&&<span style={{ color:PRIORITY_COLORS["Priority 1"] }}>P1 ×{p1}</span>}
                                      {p2>0&&<span style={{ color:PRIORITY_COLORS["Priority 2"] }}>P2 ×{p2}</span>}
                                      {p3>0&&<span style={{ color:C.dim }}>P3 ×{p3}</span>}
                                    </div>
                                  </div>
                                </div>
                                {/* Release rows */}
                                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                  {releases.map(r => {
                                    const days = daysUntil(r.date);
                                    const sc = symphonicScore(r);
                                    const col = scoreColor(sc.total);
                                    const d2 = DRIVER_DATA[r.artist] || {};
                                    return (
                                      <div key={r.id}
                                        onClick={() => { setProfileTarget(r); setTab("artist-profile"); }}
                                        style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background:"rgba(255,255,255,0.02)", border:`1px solid ${C.border}`, borderRadius:9, cursor:"pointer" }}>
                                        {/* Priority dot */}
                                        <div style={{ width:6, height:6, borderRadius:99, background:PRIORITY_COLORS[r.priority]||C.cyan, flexShrink:0 }} />
                                        {/* Info */}
                                        <div style={{ flex:1, minWidth:0 }}>
                                          <div style={{ fontSize:12, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.artist}</div>
                                          <div style={{ fontSize:10, color:C.dim, display:"flex", gap:5, alignItems:"center", marginTop:1 }}>
                                            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:120 }}>{r.release}</span>
                                            {r.ei && <span style={{ color:C.green, fontSize:8, fontWeight:700, background:"rgba(57,217,138,0.12)", borderRadius:3, padding:"0 4px" }}>EI</span>}
                                            {r.override?.map(o=><span key={o} style={{ color:C.purple, fontSize:8, fontWeight:700, background:"rgba(180,92,255,0.1)", borderRadius:3, padding:"0 4px" }}>{o}</span>)}
                                          </div>
                                        </div>
                                        {/* Score */}
                                        <div style={{ fontSize:13, fontWeight:800, color:col, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.03em", flexShrink:0 }}>{sc.total}</div>
                                        {/* Days */}
                                        <div style={{ fontSize:10, fontWeight:700, color:days<=3?C.pink:C.gold, whiteSpace:"nowrap", flexShrink:0 }}>
                                          {days===0?"TODAY":days===1?"TMRW":`${days}d`}
                                        </div>
                                        {/* Story warning */}
                                        {!d2.story && <span title="No pitch story" style={{ fontSize:11, color:C.gold, flexShrink:0 }}>⚠</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    }
                  </Card>

                </div>
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

            {/* Artist detail panel — Command Center inline */}
            {selectedRelease && (
              <div style={{ background:C.surface, border:`1px solid ${C.cyan}33`, borderRadius:16, padding:24, position:"relative" }}>
                <ArtistPanel key={selectedRelease.id} r={selectedRelease} onClose={()=>setSelectedRelease(null)} onViewProfile={()=>{ setProfileTarget(selectedRelease); setSelectedRelease(null); setTab("artist-profile"); }} />
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

              {/* Tuesday Review banner */}
              {tuesdayMode && (
                <div style={{ background:"rgba(255,184,0,0.07)", border:`1px solid rgba(255,184,0,0.25)`, borderRadius:10, padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:14 }}>📅</span>
                  <span style={{ fontSize:12, fontWeight:700, color:C.gold }}>Tuesday Review Mode</span>
                  <span style={{ fontSize:11, color:C.muted }}>— P1 + P2 releases within the next 4 weeks · {sorted.length} releases</span>
                </div>
              )}

              {/* Filter / sort bar */}
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

              {/* Table */}
              <Card style={{ padding:0, overflow:"hidden" }}>
                <table>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${C.border}`, background:"rgba(255,255,255,0.02)" }}>
                      {["Artist","Release","Genre","Date","Days","Priority","EI","Lead","Pickups","Score","Links",""].map(h=>(
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
                          <td style={{ padding:"10px 16px" }} onClick={e=>e.stopPropagation()}>
                            <button onClick={()=>{ setProfileTarget(r); setTab("artist-profile"); }}
                              title="Open Full Profile"
                              style={{ width:26, height:26, borderRadius:5, background:"rgba(0,217,255,0.08)", border:"1px solid rgba(0,217,255,0.25)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.cyan} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                              </svg>
                            </button>
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
                    <ArtistPanel key={selectedRelease.id} r={selectedRelease} onClose={()=>setSelectedRelease(null)} onViewProfile={()=>{ setProfileTarget(selectedRelease); setSelectedRelease(null); setTab("artist-profile"); }} />
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
          <ArtistProfilePage release={profileTarget} onBack={()=>{ setTab("releases"); setProfileTarget(null); }} />
        )}

      </div>
      </div>
    </div>
  );
}
