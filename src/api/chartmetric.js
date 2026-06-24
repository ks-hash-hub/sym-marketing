/**
 * src/api/chartmetric.js
 * Chartmetric API integration — enriches releases with live audience stats.
 * Requires VITE_CHARTMETRIC_TOKEN (refresh token) at build time.
 *
 * Flow:
 *   1. Exchange refresh token for short-lived access token (cached 55min)
 *   2. For each unique artist name, search Chartmetric to get CM artist ID
 *   3. Fetch Spotify ML + IG/TikTok/YouTube/Twitter followers in parallel
 *   4. Return enriched release objects
 */

// Proxied through Vite dev server (/cm-api) and nginx (production) to avoid CORS
const CM_BASE     = "/cm-api";
const REFRESH_TOK = import.meta.env.VITE_CHARTMETRIC_TOKEN;

// ─── Auth ──────────────────────────────────────────────────────────────────

let _accessToken = null;
let _tokenExpiry = 0;

async function getAccessToken() {
  if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;

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
  _tokenExpiry = Date.now() + (55 * 60 * 1000);

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
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Chartmetric ${res.status}: ${path} — ${body.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Per-artist cache (keyed by artist name) ──────────────────────────────

const _statsCache = {};

/**
 * Fetch Chartmetric stats for one artist by name.
 * Returns { cmId, spotifyML, igFollowers, tiktokFollowers, ytFollowers, twFollowers }
 * or null on failure.
 */
async function fetchArtistStats(artistName) {
  if (!artistName) return null;

  const cacheKey = `cm_stats_${artistName}`;
  if (_statsCache[cacheKey]) return _statsCache[cacheKey];

  const stored = sessionStorage.getItem(cacheKey);
  if (stored) {
    const parsed = JSON.parse(stored);
    _statsCache[cacheKey] = parsed;
    return parsed;
  }

  try {
    // Step 1: search by artist name to get Chartmetric ID
    const searchData = await cmFetch(`/search?q=${encodeURIComponent(artistName)}&type=artists&limit=1`);
    const cmId = searchData?.obj?.artists?.[0]?.id;
    if (!cmId) return null;

    // Step 2: fetch all platform stats in parallel
    const [spotifyStats, igStats, tiktokStats, ytStats, twStats] = await Promise.allSettled([
      cmFetch(`/artist/${cmId}/stat/spotify?latest=true`),
      cmFetch(`/artist/${cmId}/stat/instagram?latest=true`),
      cmFetch(`/artist/${cmId}/stat/tiktok?latest=true`),
      cmFetch(`/artist/${cmId}/stat/youtube?latest=true`),
      cmFetch(`/artist/${cmId}/stat/twitter?latest=true`),
    ]);

    const getLatest = (result, field) => {
      if (result.status !== "fulfilled") return 0;
      const data = result.value?.obj;
      if (!data) return 0;
      if (Array.isArray(data)) return data[data.length - 1]?.[field] || 0;
      return data[field] || data.value || 0;
    };

    const stats = {
      cmId,
      spotifyML:       getLatest(spotifyStats, "listeners"),
      igFollowers:     getLatest(igStats,       "followers"),
      tiktokFollowers: getLatest(tiktokStats,   "followers"),
      ytFollowers:     getLatest(ytStats,        "subscribers"),
      twFollowers:     getLatest(twStats,        "followers"),
    };

    _statsCache[cacheKey] = stats;
    sessionStorage.setItem(cacheKey, JSON.stringify(stats));
    return stats;

  } catch (err) {
    console.warn(`[chartmetric] Failed for artist "${artistName}":`, err.message);
    return null;
  }
}

// ─── Main export ───────────────────────────────────────────────────────────

/**
 * Enrich an array of release objects with live Chartmetric stats.
 * Looks up each unique artist by name, fetches platform stats, and merges
 * them onto the release objects.
 *
 * @param {object[]} releases   — from useAppData
 * @param {object}   driverData — unused, kept for API compatibility
 * @returns {Promise<object[]>} releases with live stats populated
 */
export async function enrichWithChartmetric(releases) {
  if (!REFRESH_TOK) {
    console.warn("[chartmetric] No token — skipping enrichment");
    return releases;
  }

  // Deduplicate by artist name
  const uniqueArtists = [...new Set(releases.map(r => r.artist).filter(Boolean))];

  // Fetch sequentially — Chartmetric rate limit is ~1 req/sec
  const statsByArtist = {};
  for (const artist of uniqueArtists) {
    const stats = await fetchArtistStats(artist);
    if (stats) statsByArtist[artist] = stats;
    await new Promise(r => setTimeout(r, 1200));
  }

  // Merge stats back onto releases
  return releases.map(r => {
    const stats = statsByArtist[r.artist];
    if (!stats) return r;
    return {
      ...r,
      spotifyML:       stats.spotifyML       || r.spotifyML       || 0,
      igFollowers:     stats.igFollowers     || r.igFollowers     || 0,
      tiktokFollowers: stats.tiktokFollowers || r.tiktokFollowers || 0,
      ytFollowers:     stats.ytFollowers     || r.ytFollowers     || 0,
      twFollowers:     stats.twFollowers     || r.twFollowers     || 0,
    };
  });
}
