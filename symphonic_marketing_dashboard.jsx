import { useState, useMemo } from "react";
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
  { id:1,  artist:"Neon Pulse",      release:"Static Dreams EP",   genre:"Electronic", subgenre:"Synthwave",      date:d(1),  priority:"Priority 1", format:"EP",     ei:true,  spReady:true,  apReady:true,  amReady:false, tiReady:true,  label:"Voltage Records",    lead:"Greg",    clientManager:"Sarah K.", territory:"US",    igFollowers:284000, spotifyML:1200000, override:["Viral Moment"], spotifyLink:"https://open.spotify.com/artist/neonpulse", appleLink:"https://music.apple.com/artist/neonpulse", presaveLink:"https://presave.io/neonpulse-staticdreams" },
  { id:2,  artist:"Luna Vega",       release:"Amor Eterno",        genre:"Latin",      subgenre:"Reggaeton",      date:d(2),  priority:"Priority 1", format:"Single", ei:true,  spReady:true,  apReady:true,  amReady:true,  tiReady:false, label:"Sol Music",          lead:"AJ",      clientManager:"Carlos M.", territory:"LATAM", igFollowers:520000, spotifyML:3400000, override:[],              spotifyLink:"https://open.spotify.com/artist/lunavega",  appleLink:"https://music.apple.com/artist/lunavega",  presaveLink:"https://presave.io/lunavega-amoreterno" },
  { id:3,  artist:"The Marble Way",  release:"Ghost Frequencies",  genre:"Alternative",subgenre:"Indie Rock",     date:d(3),  priority:"Priority 2", format:"Album",  ei:false, spReady:true,  apReady:false, amReady:false, tiReady:false, label:"Marble Records",     lead:"Greg",    clientManager:"Jamie L.",  territory:"UK/EU", igFollowers:92000,  spotifyML:420000,  override:[],              spotifyLink:"https://open.spotify.com/artist/marbleway",  appleLink:null, presaveLink:null },
  { id:4,  artist:"Cassidy Blue",    release:"Midnight Remedy",    genre:"R&B",        subgenre:"Neo-Soul",       date:d(4),  priority:"Priority 1", format:"Single", ei:true,  spReady:false, apReady:false, amReady:false, tiReady:false, label:"Blue Note Dist.",    lead:"AJ",      clientManager:"Sarah K.", territory:"US",    igFollowers:178000, spotifyML:890000,  override:[],              spotifyLink:"https://open.spotify.com/artist/cassidyblue", appleLink:"https://music.apple.com/artist/cassidyblue", presaveLink:"https://presave.io/cassidy-midnightremedy" },
  { id:5,  artist:"Fjord & Echo",    release:"Northern Light",     genre:"Folk",       subgenre:"Americana",      date:d(5),  priority:"Priority 2", format:"Album",  ei:false, spReady:true,  apReady:true,  amReady:true,  tiReady:true,  label:"Roots Co.",          lead:"Greg",    clientManager:"Jamie L.",  territory:"US",    igFollowers:41000,  spotifyML:210000,  override:[],              spotifyLink:"https://open.spotify.com/artist/fjordecho",  appleLink:"https://music.apple.com/artist/fjordecho", presaveLink:null },
  { id:6,  artist:"SABLE",           release:"Ultraviolet",        genre:"Pop",        subgenre:"Electropop",     date:d(6),  priority:"Priority 1", format:"Single", ei:true,  spReady:true,  apReady:true,  amReady:true,  tiReady:true,  label:"Prism Label Group",  lead:"Greg",    clientManager:"Dana P.",  territory:"Global",igFollowers:940000, spotifyML:5200000, override:["CBS Discovery"],spotifyLink:"https://open.spotify.com/artist/sable",     appleLink:"https://music.apple.com/artist/sable",     presaveLink:"https://presave.io/sable-ultraviolet" },
  { id:7,  artist:"Marco Salinas",   release:"Contigo Siempre",    genre:"Latin",      subgenre:"Latin Pop",      date:d(7),  priority:"Priority 2", format:"Single", ei:true,  spReady:true,  apReady:false, amReady:false, tiReady:false, label:"Sol Music",          lead:"AJ",      clientManager:"Carlos M.", territory:"LATAM", igFollowers:215000, spotifyML:1100000, override:[],              spotifyLink:"https://open.spotify.com/artist/marcosalinas", appleLink:null, presaveLink:"https://presave.io/marco-contigo" },
  { id:8,  artist:"Drift Theory",    release:"Coastal Decay",      genre:"Electronic", subgenre:"Ambient",        date:d(10), priority:"Priority 3", format:"Album",  ei:false, spReady:true,  apReady:true,  amReady:false, tiReady:false, label:"Ocea Sounds",        lead:"Jeanette",clientManager:"Jamie L.",  territory:"US",    igFollowers:55000,  spotifyML:290000,  override:[],              spotifyLink:"https://open.spotify.com/artist/drifttheory", appleLink:"https://music.apple.com/artist/drifttheory", presaveLink:null },
  { id:9,  artist:"Halo James",      release:"Broken Signal",      genre:"Hip-Hop",    subgenre:"Trap",           date:d(12), priority:"Priority 1", format:"EP",     ei:true,  spReady:false, apReady:false, amReady:false, tiReady:false, label:"Block Empire",       lead:"AJ",      clientManager:"Sarah K.", territory:"US",    igFollowers:380000, spotifyML:2100000, override:[],              spotifyLink:"https://open.spotify.com/artist/halojames",  appleLink:null, presaveLink:"https://presave.io/halojames-brokensignal" },
  { id:10, artist:"Viveka",          release:"Temple of Noise",    genre:"Pop",        subgenre:"Dark Pop",       date:d(14), priority:"Priority 2", format:"Single", ei:true,  spReady:true,  apReady:true,  amReady:true,  tiReady:false, label:"Prism Label Group",  lead:"Greg",    clientManager:"Dana P.",  territory:"Global",igFollowers:620000, spotifyML:3800000, override:[],              spotifyLink:"https://open.spotify.com/artist/viveka",    appleLink:"https://music.apple.com/artist/viveka",    presaveLink:"https://presave.io/viveka-templeofnoise" },
  { id:11, artist:"The Sundowners",  release:"Last Train Home",    genre:"Country",    subgenre:"Outlaw Country", date:d(15), priority:"Priority 2", format:"Album",  ei:false, spReady:true,  apReady:true,  amReady:true,  tiReady:false, label:"Boothill Records",   lead:"Greg",    clientManager:"Jamie L.",  territory:"US",    igFollowers:130000, spotifyML:640000,  override:[],              spotifyLink:"https://open.spotify.com/artist/sundowners", appleLink:"https://music.apple.com/artist/sundowners", presaveLink:null },
  { id:12, artist:"Mira Echeverría", release:"Constelaciones",     genre:"Latin",      subgenre:"Flamenco-Pop",   date:d(16), priority:"Priority 1", format:"Album",  ei:true,  spReady:true,  apReady:true,  amReady:false, tiReady:true,  label:"Iberia Music",       lead:"AJ",      clientManager:"Carlos M.", territory:"LATAM", igFollowers:710000, spotifyML:4600000, override:[],              spotifyLink:"https://open.spotify.com/artist/miraecheverria", appleLink:"https://music.apple.com/artist/miraecheverria", presaveLink:"https://presave.io/mira-constelaciones" },
  { id:13, artist:"Pale Forest",     release:"Overgrown",          genre:"Folk",       subgenre:"Neo-Folk",       date:d(18), priority:"Priority 3", format:"EP",     ei:false, spReady:true,  apReady:false, amReady:false, tiReady:false, label:"Roots Co.",          lead:"Greg",    clientManager:"Jamie L.",  territory:"US",    igFollowers:28000,  spotifyML:95000,   override:[],              spotifyLink:"https://open.spotify.com/artist/paleforest",  appleLink:null, presaveLink:null },
  { id:14, artist:"Solène",          release:"Comme Avant",        genre:"Pop",        subgenre:"French Pop",     date:d(20), priority:"Priority 2", format:"Single", ei:true,  spReady:true,  apReady:true,  amReady:false, tiReady:false, label:"Maison Sonique",     lead:"Jeanette",clientManager:"Dana P.",  territory:"UK/EU", igFollowers:190000, spotifyML:870000,  override:[],              spotifyLink:"https://open.spotify.com/artist/solene",    appleLink:"https://music.apple.com/artist/solene",    presaveLink:"https://presave.io/solene-commeavant" },
  { id:15, artist:"CRYPT0",          release:"Zero Sum",           genre:"Hip-Hop",    subgenre:"Boom Bap",       date:d(21), priority:"Priority 2", format:"Album",  ei:false, spReady:false, apReady:false, amReady:false, tiReady:false, label:"Block Empire",       lead:"AJ",      clientManager:"Sarah K.", territory:"US",    igFollowers:95000,  spotifyML:480000,  override:[],              spotifyLink:"https://open.spotify.com/artist/crypt0",    appleLink:null, presaveLink:null },
  { id:16, artist:"Tidal Mass",      release:"Undertow",           genre:"Rock",       subgenre:"Post-Rock",      date:d(22), priority:"Priority 3", format:"Album",  ei:false, spReady:true,  apReady:true,  amReady:true,  tiReady:false, label:"Marble Records",     lead:"Greg",    clientManager:"Jamie L.",  territory:"UK/EU", igFollowers:67000,  spotifyML:310000,  override:[],              spotifyLink:"https://open.spotify.com/artist/tidalmass",  appleLink:"https://music.apple.com/artist/tidalmass", presaveLink:null },
  { id:17, artist:"Glass Meridian",  release:"Refraction",         genre:"Electronic", subgenre:"House",          date:d(26), priority:"Priority 1", format:"EP",     ei:true,  spReady:true,  apReady:true,  amReady:true,  tiReady:true,  label:"Voltage Records",    lead:"Jeanette",clientManager:"Dana P.",  territory:"Global",igFollowers:430000, spotifyML:2700000, override:["Deck Worthy"], spotifyLink:"https://open.spotify.com/artist/glassmeridian", appleLink:"https://music.apple.com/artist/glassmeridian", presaveLink:"https://presave.io/glass-refraction" },
  { id:18, artist:"Cedar & Stone",   release:"High Desert",        genre:"Country",    subgenre:"Americana",      date:d(28), priority:"Priority 3", format:"Album",  ei:false, spReady:true,  apReady:true,  amReady:false, tiReady:false, label:"Boothill Records",   lead:"Greg",    clientManager:"Jamie L.",  territory:"US",    igFollowers:49000,  spotifyML:180000,  override:[],              spotifyLink:"https://open.spotify.com/artist/cedarstone",  appleLink:null, presaveLink:null },
  { id:19, artist:"Flor de Noche",   release:"Piel de Luna",       genre:"Latin",      subgenre:"Bolero",         date:d(24), priority:"Priority 2", format:"Single", ei:true,  spReady:true,  apReady:false, amReady:false, tiReady:false, label:"Iberia Music",       lead:"AJ",      clientManager:"Carlos M.", territory:"LATAM", igFollowers:155000, spotifyML:720000,  override:[],              spotifyLink:"https://open.spotify.com/artist/flordenoche", appleLink:null, presaveLink:"https://presave.io/flor-pielluna" },
  { id:20, artist:"Yuki Tanaka",     release:"Sakura Circuit",     genre:"Electronic", subgenre:"J-Dance",        date:d(30), priority:"Priority 2", format:"Single", ei:true,  spReady:false, apReady:false, amReady:false, tiReady:false, label:"Pacific Rim Sounds", lead:"Jeanette",clientManager:"Dana P.",  territory:"APAC",  igFollowers:88000,  spotifyML:350000,  override:[],              spotifyLink:"https://open.spotify.com/artist/yukitanaka",  appleLink:null, presaveLink:"https://presave.io/yuki-sakuracircuit" },
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

// ─── READINESS SCORE ──────────────────────────────────────────────────────────

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

function ArtistPanel({ r, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const d = DRIVER_DATA[r.artist] || {};
  const artistPickups = PICKUPS.filter(p => p.artist === r.artist)
    .sort((a, b) => new Date(b.dateSent) - new Date(a.dateSent));
  const fmtN = n => n >= 1000000 ? (n/1000000).toFixed(1)+"M" : n >= 1000 ? Math.round(n/1000)+"K" : n;

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
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.06)", border:"none", color:C.muted, width:28, height:28, borderRadius:6, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:1 }}>✕</button>
        <div style={{ fontSize:20, fontWeight:800, marginBottom:6, paddingRight:40 }}>
          {r.artist} <span style={{ color:C.muted, fontWeight:400 }}>—</span> <span style={{ color:C.cyan }}>{r.release}</span>
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
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace" }}>Symphonic Pickups — All Time</div>
              <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:C.muted, background:"rgba(255,255,255,0.05)", borderRadius:99, padding:"2px 10px" }}>{artistPickups.length} total</span>
            </div>
            {artistPickups.length === 0 ? (
              <div style={{ fontSize:12, color:C.dim, padding:"10px 0" }}>No pickups on record for this artist.</div>
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
                  {artistPickups.map((p, i) => (
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

            {/* Organic placements — Songstats */}
            <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, fontFamily:"'DM Mono',monospace" }}>Organic Playlist Placements</div>
                <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:C.cyan, background:"rgba(0,217,255,0.07)", border:`1px solid rgba(0,217,255,0.2)`, borderRadius:99, padding:"2px 10px", letterSpacing:"0.1em" }}>VIA SONGSTATS</span>
              </div>
              <div style={{ background:"rgba(0,217,255,0.03)", border:`1px dashed rgba(0,217,255,0.15)`, borderRadius:12, padding:"16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:3 }}>Non-Symphonic editorial placements will appear here</div>
                  <div style={{ fontSize:11, color:C.dim }}>Connect Songstats API to surface organic DSP pickups</div>
                </div>
                <div style={{ flexShrink:0, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 12px", fontSize:9, fontWeight:700, color:C.dim, letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace" }}>Coming Soon</div>
              </div>
            </div>
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

  const TABS = [
    { id:"command",    label:"Command Center" },
    { id:"releases",  label:"Releases" },
    { id:"performance",label:"Performance" },
  ];

  const insightColors = { urgent:{ bg:"rgba(255,61,127,0.08)", border:"rgba(255,61,127,0.25)", icon:C.pink }, warning:{ bg:"rgba(255,184,0,0.07)", border:"rgba(255,184,0,0.22)", icon:C.gold }, positive:{ bg:"rgba(57,217,138,0.07)", border:"rgba(57,217,138,0.22)", icon:C.green } };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:"#fff", fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>
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
      `}</style>

      {/* ── NAV ── */}
      <div style={{ borderBottom:`1px solid ${C.border}`, padding:"0 32px", background:C.bg, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:54 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ position:"relative", width:8, height:8 }}>
              <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:C.cyan, boxShadow:`0 0 10px ${C.cyan}` }} />
              <div style={{ position:"absolute", inset:-4, borderRadius:"50%", background:C.cyan, opacity:0.12, animation:"pulse 2s ease infinite" }} />
            </div>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:19, letterSpacing:"0.15em" }}>SYMPHONIC</span>
            <span style={{ fontSize:10, color:C.dim, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace" }}>/ Marketing Intelligence</span>
          </div>
          <div style={{ display:"flex" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={()=>{ setTab(t.id); setSelectedRelease(null); }} style={{
                background: tab===t.id ? "rgba(0,217,255,0.07)" : "none",
                border:"none", borderBottom: tab===t.id ? `2px solid ${C.cyan}` : "2px solid transparent",
                color: tab===t.id ? C.cyan : C.muted, fontSize:11, fontWeight:700,
                letterSpacing:"0.1em", textTransform:"uppercase", padding:"0 22px", height:54, transition:"all 0.15s",
              }}>{t.label}</button>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:C.dim }}>May 17, 2025</span>
            <div style={{ background:"rgba(57,217,138,0.1)", border:"1px solid rgba(57,217,138,0.25)", color:C.green, borderRadius:6, padding:"3px 10px", fontSize:9, fontWeight:700, letterSpacing:"0.1em" }}>● DEMO DATA</div>
          </div>
        </div>
      </div>

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

            {/* Insight callouts */}
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

            {/* Pickup trend */}
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

            {/* Priority 1 — this week detailed cards */}
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
                <ArtistPanel key={selectedRelease.id} r={selectedRelease} onClose={()=>setSelectedRelease(null)} />
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
                      {["Artist","Release","Genre","Date","Days","Priority","EI","Lead","Pickups","Links"].map(h=>(
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
                      <tr><td colSpan={10} style={{ padding:"28px 16px", textAlign:"center", color:C.dim, fontSize:12 }}>No releases match the current filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </Card>

              {/* Slide-in detail panel */}
              {selectedRelease && (
                <>
                  <div onClick={()=>setSelectedRelease(null)} style={{ position:"fixed", inset:0, top:54, background:"rgba(7,8,15,0.6)", zIndex:100, backdropFilter:"blur(2px)" }} />
                  <div style={{ position:"fixed", right:0, top:54, bottom:0, width:520, background:C.surface, borderLeft:`1px solid rgba(0,217,255,0.18)`, zIndex:101, display:"flex", flexDirection:"column", padding:24, animation:"slideIn 0.22s cubic-bezier(0.16,1,0.3,1)" }}>
                    <ArtistPanel key={selectedRelease.id} r={selectedRelease} onClose={()=>setSelectedRelease(null)} />
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
      </div>
    </div>
  );
}
