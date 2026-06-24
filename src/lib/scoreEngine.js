import { C } from "./constants.js";

export function symphonicScore(r, driverData = {}, pickups = []) {
  const d = driverData[r.artist] || driverData[r.upc] || {};
  const artistPickups = pickups.filter(p => p.artist === r.artist);

  // 1. Symphonic Pickup History (0–25)
  const fp       = artistPickups.filter(p => p.type === "1st Party").length;
  const tp       = artistPickups.filter(p => p.type === "3rd Party").length;
  const cover    = artistPickups.some(p => p.cover) ? 5 : 0;
  const pScore   = Math.min(25, fp * 4 + tp * 2 + cover);

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

  const total = pScore + audience + social + drive + consistency;
  return { total, breakdown: { pickups: pScore, audience, social, drive, consistency } };
}

export function scoreColor(s) {
  if (s >= 80) return C.green;
  if (s >= 65) return C.cyan;
  if (s >= 50) return C.gold;
  return C.pink;
}
