import { C } from "./constants.js";

export function symphonicScore(r, driverData = {}, pickups = []) {
  const d = driverData[r.id] || driverData[r.artist] || driverData[r.upc] || {};
  const artistPickups = pickups.filter(p =>
    (p.releaseId && p.releaseId === r.id) || p.artist === r.artist
  );

  // 1. Pickup History (0–25)
  const fp    = artistPickups.filter(p => p.type === "1st Party").length;
  const tp    = artistPickups.filter(p => p.type === "3rd Party").length;
  const cover = artistPickups.some(p => p.cover) ? 5 : 0;
  const pickupsScore = Math.min(25, fp * 4 + tp * 2 + cover);

  // 2. Audience Reach (0–20) — log-scaled Spotify ML
  const audience = r.spotifyML > 0
    ? Math.min(20, Math.round((Math.log10(r.spotifyML) / Math.log10(6000000)) * 20))
    : 0;

  // 3. Social Presence (0–15) — weighted cross-platform followers (from Chartmetric)
  const weighted = (r.igFollowers     || 0) * 1.0
    + (r.tiktokFollowers || 0) * 1.2
    + (r.ytFollowers     || 0) * 0.8
    + (r.twFollowers     || 0) * 0.5;
  const social = Math.min(15, Math.round((weighted / 4500000) * 15));

  // 4. Story Quality (0–15) — pitch completeness
  const storyPts = Math.min(15,
    (d.story          ? 5 : 0) +
    (d.similarArtists ? 3 : 0) +
    (d.mood?.length > 0       ? 2 : 0) +
    (d.songStyles?.length > 0 ? 2 : 0) +
    (d.drivers?.length > 0    ? Math.min(3, d.drivers.length) : 0)
  );

  // 5. Drive (0–15) — activity + momentum signals
  const drivePts = Math.min(15,
    (d.upcomingShows  ? 4 : 0) +
    (d.socialActivity ? 4 : 0) +
    (d.dspTools?.length > 0 ? Math.min(3, d.dspTools.length) : 0) +
    (d.confirmedPress ? 2 : 0) +
    (d.adDetails      ? 2 : 0)
  );

  // 6. Consistency (0–10) — historical release cadence
  const consistency = Math.round((d.releaseConsistency || 0) / 100 * 10);

  const total = pickupsScore + audience + social + storyPts + drivePts + consistency;
  return {
    total,
    breakdown: { pickups: pickupsScore, audience, social, story: storyPts, drive: drivePts, consistency },
  };
}

export function scoreColor(s) {
  if (s >= 80) return C.green;
  if (s >= 65) return C.cyan;
  if (s >= 50) return C.gold;
  return C.pink;
}
