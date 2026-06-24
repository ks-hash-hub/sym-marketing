export const T = new Date();
T.setHours(0, 0, 0, 0);

export function daysUntil(dateStr) {
  const diff = new Date(dateStr + "T12:00:00") - T;
  return Math.ceil(diff / 86400000);
}

export function fmtDate(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric" });
}

export function fmtN(n) {
  return n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : n >= 1000 ? Math.round(n / 1000) + "K" : n;
}
