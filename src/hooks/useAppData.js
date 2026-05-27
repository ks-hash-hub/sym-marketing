/**
 * src/hooks/useAppData.js
 * Loads release, driver, and pickup data — live from Airtable when
 * VITE_AIRTABLE_TOKEN is present, otherwise falls back to demo JSON.
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

const DEMO_DATA = {
  releases:   RELEASES_JSON,
  pickups:    PICKUPS_JSON,
  driverData: DRIVER_DATA_JSON,
};

/**
 * @returns {{
 *   releases: object[],
 *   pickups:  object[],
 *   driverData: object,
 *   loading: boolean,
 *   isLive: boolean,
 *   error: string|null,
 * }}
 */
export function useAppData() {
  const [state, setState] = useState({
    ...DEMO_DATA,
    loading: false,
    isLive:  false,
    error:   null,
  });

  useEffect(() => {
    const token = import.meta.env.VITE_AIRTABLE_TOKEN;
    if (!token) return; // no token → stay on demo data, no fetch

    let cancelled = false;

    async function load() {
      setState(s => ({ ...s, loading: true, error: null }));

      try {
        // 1. Releases first so we have UPCs for the driver query
        const releases = await fetchReleaseSchedule();
        if (cancelled) return;

        const upcs = [...new Set(releases.map(r => r.upc).filter(Boolean))];

        // 2. Drivers + pickups in parallel
        const [driverData, pickups] = await Promise.all([
          fetchDriverSubmissions(upcs),
          fetchPickups(),
        ]);
        if (cancelled) return;

        setState({ releases, driverData, pickups, loading: false, isLive: true, error: null });
      } catch (err) {
        if (cancelled) return;
        console.error("[useAppData] Airtable fetch failed — falling back to demo data:", err);
        setState(s => ({
          ...s,
          ...DEMO_DATA,
          loading: false,
          isLive:  false,
          error:   err.message,
        }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, []); // run once on mount

  return state;
}
