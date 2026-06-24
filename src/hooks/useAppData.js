/**
 * src/hooks/useAppData.js
 * Loads release, driver, and pickup data — live from Airtable when
 * VITE_AIRTABLE_TOKEN is present, otherwise falls back to demo JSON.
 * If VITE_CHARTMETRIC_TOKEN is also present, releases are enriched
 * with live Spotify ML and social follower counts from Chartmetric.
 */

import { useState, useEffect } from "react";

import RELEASES_JSON    from "../data/releases.json";
import PICKUPS_JSON     from "../data/pickups.json";
import DRIVER_DATA_JSON from "../data/driverData.json";

import {
  fetchReleaseSchedule,
  fetchDriverSubmissions,
  fetchPickups,
} from "../api/airtable.js";

import { enrichWithChartmetric } from "../api/chartmetric.js";

const DEMO_DATA = {
  releases:   RELEASES_JSON,
  pickups:    PICKUPS_JSON,
  driverData: DRIVER_DATA_JSON,
};

/**
 * @returns {{
 *   releases:   object[],
 *   pickups:    object[],
 *   driverData: object,
 *   loading:    boolean,
 *   isLive:     boolean,
 *   isEnriched: boolean,
 *   error:      string|null,
 * }}
 */
export function useAppData() {
  const [state, setState] = useState({
    ...DEMO_DATA,
    loading:     false,
    isLive:      false,
    isEnriched:  false,
    lastUpdated: null,
    error:       null,
  });

  useEffect(() => {
    const airtableToken    = import.meta.env.VITE_AIRTABLE_TOKEN;
    const chartmetricToken = import.meta.env.VITE_CHARTMETRIC_TOKEN;

    if (!airtableToken) return; // no token → stay on demo data

    let cancelled = false;

    async function load() {
      setState(s => ({ ...s, loading: true, error: null }));

      try {
        // 1. Releases first — need UPCs for driver query
        const releases = await fetchReleaseSchedule();
        if (cancelled) return;

        const upcs = [...new Set(releases.map(r => r.upc).filter(Boolean))];

        // 2. Drivers + pickups in parallel
        const [driverData, pickups] = await Promise.all([
          fetchDriverSubmissions(upcs),
          fetchPickups(),
        ]);
        if (cancelled) return;

        // 3. Show Airtable data immediately while Chartmetric loads
        setState({ releases, driverData, pickups, loading: false, isLive: true, isEnriched: false, lastUpdated: new Date(), error: null });

        // 4. Enrich with Chartmetric if token present (non-blocking)
        if (chartmetricToken) {
          try {
            const enriched = await enrichWithChartmetric(releases, driverData);
            if (!cancelled) {
              setState(s => ({ ...s, releases: enriched, isEnriched: true, lastUpdated: new Date() }));
            }
          } catch (cmErr) {
            console.warn("[useAppData] Chartmetric enrichment failed (non-fatal):", cmErr.message);
          }
        }

      } catch (err) {
        if (cancelled) return;
        console.error("[useAppData] Airtable fetch failed — falling back to demo data:", err);
        setState(s => ({
          ...s,
          ...DEMO_DATA,
          loading:    false,
          isLive:     false,
          isEnriched: false,
          error:      err.message,
        }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return state;
}
