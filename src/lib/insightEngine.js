import DRIVER_DATA from "../data/driverData.json";
import { daysUntil } from "./utils.js";

export function generateInsights(releases, pickups) {
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
