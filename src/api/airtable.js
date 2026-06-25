/**
 * src/api/airtable.js
 * Airtable REST API layer for the Symphonic Marketing Dashboard.
 * Set VITE_AIRTABLE_TOKEN and VITE_AIRTABLE_BASE in .env to enable live data.
 * Falls back to JSON demo data when the token is absent.
 */

const BASE_URL  = "https://api.airtable.com/v0";
const BASE_ID   = import.meta.env.VITE_AIRTABLE_BASE  || "apppQyOGTr6uGeYZd";
const TOKEN     = import.meta.env.VITE_AIRTABLE_TOKEN;

// Table IDs
const TBL_RELEASES = "tblG0xtGOTXKbW7Bw";   // Release Schedule
const TBL_DRIVERS  = "tbl04m1kqODv3lNUm";   // Drivers Submissions
const TBL_PICKUPS  = "tbl8y6oVi2GjYgu7U";   // Pickup

// Airtable priority name → dashboard format
const PRIORITY_MAP = {
  "High Priority":   "Priority 1",
  "Medium Priority": "Priority 2",
  "Low Priority":    "Priority 3",
};

// ─── low-level fetch helper ────────────────────────────────────────────────

/**
 * Fetch all pages from a table, handling Airtable pagination automatically.
 * @param {string} tableId
 * @param {{ fields?: string[], filter?: string, sort?: {field:string, direction?:string}[] }} options
 * @returns {Promise<object[]>} flat array of records (each has .id and .fields)
 */
export async function fetchAllPages(tableId, { fields = [], filter, sort = [] } = {}) {
  if (!TOKEN) throw new Error("VITE_AIRTABLE_TOKEN is not set");

  const records = [];
  let offset;

  do {
    const params = new URLSearchParams();
    fields.forEach(f => params.append("fields[]", f));
    if (filter)  params.set("filterByFormula", filter);
    sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction || "asc");
    });
    params.set("pageSize", "100");
    if (offset) params.set("offset", offset);

    const res = await fetch(
      `${BASE_URL}/${BASE_ID}/${tableId}?${params}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Airtable ${res.status}: ${body}`);
    }

    const data = await res.json();
    records.push(...(data.records || []));
    offset = data.offset;
  } while (offset);

  return records;
}

// ─── Release Schedule ──────────────────────────────────────────────────────

const RELEASE_FIELDS = [
  "UPC CODE",
  "ARTIST NAME (FOR ZAP)",   // multipleLookupValues → artist name string
  "Release*",                 // formula → release title
  "DATE",
  "GENRE",
  "SUBGENRE",
  "PRIORITY LEVEL",
  "MARKETING LEADS",          // multipleCollaborators → [{name,...}]
  "EDITORIAL INCLUSION",
  "EDITORIAL INCLUSION - UK/EU",
  "TERRITORY",                // multipleSelects → [name]
  "PRIORITY OVERRIDE",        // multipleSelects → [name]
  "SPOTIFY ML (from ARTIST)", // multipleLookupValues → [number]
  "IG FOLLOWERS (from ARTIST)",
  "LABEL",
  "WHAT'S THE STORY?",
];

function transformRelease(rec) {
  const f = rec.fields;

  const artist   = (f["ARTIST NAME (FOR ZAP)"] || [])[0] || "";
  const spotifyML  = Number((f["SPOTIFY ML (from ARTIST)"] || [])[0]) || 0;
  const igFollowers = Number((f["IG FOLLOWERS (from ARTIST)"] || [])[0]) || 0;

  return {
    id:       rec.id,
    upc:      f["UPC CODE"] || rec.id,
    artist,
    release:  f["Release*"] || "",
    date:     f["DATE"] || "",
    genre:    f["GENRE"] || "Other",
    subgenre: f["SUBGENRE"] || "",
    priority: PRIORITY_MAP[f["PRIORITY LEVEL"]] || "Priority 3",
    lead:     (f["MARKETING LEADS"] || [])[0]?.name || "",
    ei:       f["EDITORIAL INCLUSION"] || false,
    territory:(f["TERRITORY"] || [])[0] || "US",
    override: f["PRIORITY OVERRIDE"] || [],
    spotifyML,
    igFollowers,
    label:    f["LABEL"] || "",
    // Platform readiness flags — not yet in Airtable, default true
    spReady: true, apReady: true, amReady: true, tiReady: true,
  };
}

/**
 * Fetch a single release record by its Airtable record ID.
 * Used for direct URL routing (e.g. /recXXXXXXXXXX links from the Airtable extension).
 */
export async function fetchReleaseById(recordId) {
  if (!TOKEN) throw new Error("VITE_AIRTABLE_TOKEN is not set");
  const res = await fetch(
    `${BASE_URL}/${BASE_ID}/${TBL_RELEASES}/${recordId}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  if (!res.ok) throw new Error(`Airtable ${res.status}`);
  const rec = await res.json();
  return transformRelease(rec);
}

/**
 * Fetch upcoming releases (next 60 days + last 7 days) from Release Schedule.
 * Returns array of release objects shaped to match src/data/releases.json.
 */
export async function fetchReleaseSchedule() {
  const filter = [
    "AND(",
    "  IS_AFTER({DATE}, DATEADD(TODAY(), -8, 'days')),",
    "  IS_BEFORE({DATE}, DATEADD(TODAY(), 61, 'days'))",
    ")",
  ].join("").replace(/\s{2,}/g, " ").replace(/,\s*\)/g, ")");

  const records = await fetchAllPages(TBL_RELEASES, {
    fields: RELEASE_FIELDS,
    filter: "AND(IS_AFTER({DATE}, DATEADD(TODAY(), -8, 'days')), IS_BEFORE({DATE}, DATEADD(TODAY(), 61, 'days')))",
    sort:   [{ field: "DATE", direction: "asc" }],
  });

  return records
    .map(transformRelease)
    .filter(r => r.artist && r.release); // drop malformed rows
}

// ─── Drivers Submissions ───────────────────────────────────────────────────

const DRIVER_FIELDS = [
  "UPC",
  "ARTIST",
  "RELEASE",
  "RELEASE DATE",
  "WHAT'S THE STORY",
  "SIMILAR ARTISTS / FOR FANS OF",
  "MOOD",
  "SONG STYLES",
  "UPCOMING SHOWS",
  "AD DETAILS",
  "CONFIRMED PRESS",
  "MARKETING DRIVERS (MS)",
  "SONG CHARACTERISTICS",
  "SPOTIFY PROFILE URL",
  "IG LINK",
  "TIKTOK HANDLE",
  "YT LINK",
  "TW LINK",
  "SC LINK",
];

function transformDriver(f) {
  return {
    story:          f["WHAT'S THE STORY"]                   || null,
    similarArtists: f["SIMILAR ARTISTS / FOR FANS OF"]      || null,
    mood:           f["MOOD"]                               || [],
    songStyles:     f["SONG STYLES"]                        || [],
    drivers:        f["MARKETING DRIVERS (MS)"]             || [],
    upcomingShows:  f["UPCOMING SHOWS"]                     || null,
    adDetails:      f["AD DETAILS"]                         || null,
    confirmedPress: f["CONFIRMED PRESS"]                    || null,
    socialActivity: null,
    dspTools:       [],
    releaseConsistency: 0,
    // Social profile links — used by Chartmetric enrichment
    spotifyUrl:     f["SPOTIFY PROFILE URL"]                || null,
    igUrl:          f["IG LINK"]                            || null,
    tiktokUrl:      f["TIKTOK HANDLE"]                      || null,
    ytUrl:          f["YT LINK"]                            || null,
    twUrl:          f["TW LINK"]                            || null,
    scUrl:          f["SC LINK"]                            || null,
  };
}

/**
 * Fetch driver submissions, keyed by BOTH artist name AND UPC.
 * Fetches all submissions within the past 120 days — no UPC filter,
 * so entries missing a UPC (lookup by artist name only) are still found.
 *   driverData["EV"]             → works even if UPC field is blank
 *   driverData["824296202201"]   → also works
 */
export async function fetchDriverSubmissions(_upcs = []) {
  const records = await fetchAllPages(TBL_DRIVERS, {
    fields: DRIVER_FIELDS,
    filter: "IS_AFTER({RELEASE DATE}, DATEADD(TODAY(), -120, 'days'))",
    sort:   [{ field: "RELEASE DATE", direction: "desc" }],
  });

  const byArtist = {};
  const byUpc    = {};

  // Walk newest-first so the first entry per key wins (most recent submission)
  records.forEach(rec => {
    const f      = rec.fields;
    const artist = (f["ARTIST"] || "").trim();
    const upc    = (f["UPC"]    || "").trim();
    const data   = transformDriver(f);
    if (artist && !byArtist[artist]) byArtist[artist] = data;
    if (upc    && !byUpc[upc])       byUpc[upc]       = data;
  });

  return { ...byArtist, ...byUpc };
}

// ─── Pickups ───────────────────────────────────────────────────────────────

const PICKUP_FIELDS = [
  "PLAYLIST",
  "DSP",
  "Release",       // formula → array of release title strings
  "ARTIST",        // formula → artist string
  "1ST or 3RD",
  "DATE SENT",
  "MARKETING LEAD",// multipleSelects → [name]
  "COVER",
];

function transformPickup(rec) {
  const f = rec.fields;
  return {
    playlist:  f["PLAYLIST"]  || "",
    dsp:       f["DSP"]       || "",
    release:   (f["Release"]  || [])[0] || f["Release"] || "",
    artist:    f["ARTIST"]    || "",
    type:      f["1ST or 3RD"]|| "",
    dateSent:  f["DATE SENT"] || "",
    lead:      (f["MARKETING LEAD"] || [])[0] || "",
    cover:     f["COVER"]     || false,
  };
}

/**
 * Fetch playlist pickups from the last 365 days.
 * Returns array of pickup objects shaped to match src/data/pickups.json.
 */
export async function fetchPickups() {
  const records = await fetchAllPages(TBL_PICKUPS, {
    fields: PICKUP_FIELDS,
    filter: "IS_AFTER({DATE SENT}, DATEADD(TODAY(), -365, 'days'))",
    sort:   [{ field: "DATE SENT", direction: "desc" }],
  });

  return records
    .map(transformPickup)
    .filter(p => p.artist && p.playlist);
}
