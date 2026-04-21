import { DashboardSummary } from "./types";

const BASE_URL = "/api/proxy";

export async function fetchDashboard(): Promise<DashboardSummary> {
  const res = await fetch(`${BASE_URL}/dashboard/summary`, {
    // Tells Next.js not to cache this — we always want fresh data
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard: ${res.status}`);
  }

  return res.json();
}
