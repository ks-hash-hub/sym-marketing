/**
 * src/api/chartmetric.js
 * Chartmetric API integration — enriches releases with live audience stats.
 * Requires VITE_CHARTMETRIC_TOKEN (refresh token) at build time.
 *
 * Flow:
 *   1. Exchange refresh token for short-lived access token (cached 55min)
 *   2. For each release, extract Spotify artist ID from driver's spotifyUrl
 *   3. Resolve Chartmetric artist ID from Spotify ID
 *   4. Fetch current Spotify ML + social followers
 *   5. Return enriched release objects (spotifyML, igFollowers, tiktokFollowers)
 */

// Proxied through Vite dev server (/cm-api) and nginx (production) to avoid CORS
const CM_BASE     = "/cm-api";
const REFRESH_TOK = import.meta.env.VITE_CHARTMETRIC_TOKEN;

// ─── Auth ──────────────────────────────────────────────────────────────────

let _accessToken   = null;
let _tokenExpiry   = 0;

async function getAccessToken() {
  if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;

  // Try sessionStorage cache first
  const cached = sessionStorage.getItem("cm_token");
  const expiry  = Number(sessionStorage.getItem("cm_token_expiry") || 0);
  if (cached && Date.now() < expiry) {
    _accessToken = cached;
    _tokenExpiry = expiry;
    return _accessToken;
  }

  if (!REFRESH_TOK) throw new Error("VITE_CHARTMETRIC_TOKEN is not set");

  const res = await fetch(`${CM_BASE}/token`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ refreshtoken: REFRESH_TOK }),
  });

  if (!res.ok) throw new Error(`Chartmetric auth failed: ${res.status}`);

  const data = await res.json();
  _accessToken = data.token;
  _tokenExpiry = Date.now() + (55 * 60 * 1000); // 55min (token lasts 1hr)

  sessionStorage.setItem("cm_token",        _accessToken);
  sessionStorage.setItem("cm_token_expiry", String(_tokenExpiry));

  return _accessToken;
}

async function cmFetch(path, retries = 2) {
  const token = await getAccessToken();
  const res   = await fetch(`${CM_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 429 && retries > 0) {
    await new Promise(r => setTimeout(r, 2000));
    return cmFetch(path, retries - 1);
  }
  if (!res.ok) throw new Error(`Chartmetric ${res.status}: ${path}`);
  return res.json();
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Extract Spotify artist ID from a profile URL or bare ID */
function extractSpotifyId(spotifyUrl) {
  if (!spotifyUrl) return null;
  // Handles: https://open.spotify.com/artist/ABC123 or spotify:artist:ABC123
  const match = spotifyUrl.match(/artist[/:]([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

/** Extract Instagram handle from URL */
function extractIgHandle(igUrl) {
  if (!igUrl) return null;
  const match = igUrl.replace(/\/$/, "").match(/instagram\.com\/([^/?]+)/);
  return match ? match[1] : null;
}

/** Extract TikTok handle from URL */
function extractTiktokHandle(tiktokUrl) {
  if (!tiktokUrl) return null;
  const match = tiktokUrl.replace(/\/$/, "").match(/tiktok\.com\/@?([^/?]+)/);
  return match ? match[1] : null;
}

// ─── Per-artist cache (keyed by Spotify ID) ────────────────────────────────

const _statsCache = {};

/**
 * Fetch Chartmetric stats for one Spotify artist ID.
 * Returns { spotifyML, igFollowers, tiktokFollowers, cmId } or null on failure.
 */
async function fetchArtistStats(spotifyId) {
  if (!spotifyId) return null;
  if (_statsCache[spotifyId]) return _statsCache[spotifyId];

  // Check sessionStorage
  const cached = sessionStorage.getItem(`cm_stats_${spotifyId}`);
  if (cached) {
    const parsed = JSON.parse(cached);
    _statsCache[spotifyId] = parsed;
    return parsed;
  }

  try {
    // Step 1: resolve Chartmetric artist ID from Spotify ID
    const artistData = await cmFetch(`/artist/spotify/${spotifyId}`);
    const cmId = artistData?.obj?.id || artistData?.id;
    if (!cmId) return null;

    // Step 2: fetch stats in parallel
    const [spotifyStats, igStats, tiktokStats] = await Promise.allSettled([
      cmFetch(`/artist/${cmId}/stat/spotify?latest=true`),
      cmFetch(`/artist/${cmId}/stat/instagram?latest=true`),
      cmFetch(`/artist/${cmId}/stat/tiktok?latest=true`),
    ]);

    const getLatest = (result, field) => {
      if (result.status !== "fulfilled") return 0;
      const data = result.value?.obj;
      if (!data) return 0;
      // API returns array of [{timestp, value}] or {value}
      if (Array.isArray(data)) return data[data.length - 1]?.[field] || 0;
      return data[field] || data.value || 0;
    };

    const stats = {
      cmId,
      spotifyML:        getLatest(spotifyStats,  "listeners"),
      igFollowers:      getLatest(igStats,        "followers"),
      tiktokFollowers:  getLatest(tiktokStats,    "followers"),
    };

    _statsCache[spotifyId] = stats;
    sessionStorage.setItem(`cm_stats_${spotifyId}`, JSON.stringify(stats));
    return stats;

  } catch (err) {
    console.warn(`[chartmetric] Failed for spotifyId ${spotifyId}:`, err.message);
    return null;
  }
}

// ─── Main export ───────────────────────────────────────────────────────────

/**
 * Enrich an array of release objects with live Chartmetric stats.
 * Matches each release to its driver record (by artist name or UPC),
 * pulls the Spotify URL, fetches stats, and merges into the release.
 *
 * @param {object[]} releases   — from useAppData
 * @param {object}   driverData — from useAppData, keyed by artist/UPC
 * @returns {Promise<object[]>} releases with spotifyML, igFollowers, tiktokFollowers populated
 */
export async function enrichWithChartmetric(releases, driverData) {
  if (!REFRESH_TOK) {
    console.warn("[chartmetric] No token — skipping enrichment");
    return releases;
  }

  // Deduplicate: one Chartmetric lookup per unique Spotify ID
  const spotifyIdByArtist = {};
  for (const r of releases) {
    const d = driverData[r.artist] || driverData[r.upc];
    if (!d?.spotifyUrl) continue;
    const sid = extractSpotifyId(d.spotifyUrl);
    if (sid) spotifyIdByArtist[r.artist] = sid;
  }

  const uniqueIds = [...new Set(Object.values(spotifyIdByArtist))];

  // Fetch strictly sequentially — Chartmetric rate limit is ~1 req/sec
  const statsBySpotifyId = {};
  for (const sid of uniqueIds) {
    const stats = await fetchArtistStats(sid);
    if (stats) statsBySpotifyId[sid] = stats;
    await new Promise(r => setTimeout(r, 1200));
  }

  // Merge stats back onto releases
  return releases.map(r => {
    const sid   = spotifyIdByArtist[r.artist];
    const stats = sid ? statsBySpotifyId[sid] : null;
    if (!stats) return r;
    return {
      ...r,
      spotifyML:       stats.spotifyML       || r.spotifyML       || 0,
      igFollowers:     stats.igFollowers     || r.igFollowers     || 0,
      tiktokFollowers: stats.tiktokFollowers || 0,
    };
  });
}
