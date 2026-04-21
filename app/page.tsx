"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardSummary } from "@/lib/types";
import StatCard from "./components/StatCard";
import StatusBadge from "./components/StatusBadge";
import Navbar from "./components/Navbar";

const REFRESH_INTERVAL_MS = 30_000;

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    try {
      // The proxy route at /api/proxy/* automatically adds the Bearer token
      const res = await fetch("/api/proxy/dashboard/summary", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Could not reach the API. Is the backend running?");
    }
  }

  // On mount: fetch immediately, then every 30s
  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Welcome back, {session?.user?.name}
            </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            {lastUpdated ? (
              <>
                <p>Last updated</p>
                <p className="text-gray-400">{lastUpdated.toLocaleTimeString()}</p>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Summary cards */}
        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Endpoints" value={data.totalEndpoints} color="blue" />
              <StatCard label="Up" value={data.upCount} color="green" />
              <StatCard label="Down" value={data.downCount} color="red" />
              <StatCard label="Avg Uptime (30d)" value={`${data.averageUptimeLast30Days.toFixed(1)}%`} color="yellow" />
            </div>

            {/* Endpoints table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-700">
                <h2 className="font-semibold text-gray-100">Endpoints</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-left border-b border-gray-700">
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">URL</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Latency</th>
                      <th className="px-5 py-3 font-medium">Uptime 24h</th>
                      <th className="px-5 py-3 font-medium">Last Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.endpoints.map((ep) => (
                      <tr key={ep.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-100">{ep.name}</td>
                        <td className="px-5 py-3 text-gray-400 max-w-xs truncate">
                          <a href={ep.url} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">
                            {ep.url}
                          </a>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge isUp={ep.isUp} />
                        </td>
                        <td className="px-5 py-3 text-gray-300">
                          {ep.lastLatencyMs > 0 ? `${ep.lastLatencyMs.toFixed(0)}ms` : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={ep.uptimeLast24h >= 99 ? "text-green-400" : ep.uptimeLast24h >= 95 ? "text-yellow-400" : "text-red-400"}>
                            {ep.uptimeLast24h.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400">
                          {ep.lastCheckedAt ? new Date(ep.lastCheckedAt).toLocaleTimeString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!data && !error && (
          <div className="flex items-center justify-center h-48 text-gray-500">
            Loading dashboard...
          </div>
        )}

        <p className="text-center text-xs text-gray-600 mt-8">
          Auto-refreshes every {REFRESH_INTERVAL_MS / 1000}s
        </p>
      </div>
    </div>
  );
}
