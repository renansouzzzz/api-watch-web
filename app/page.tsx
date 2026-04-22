"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardSummary, Endpoint } from "@/lib/types";
import StatCard from "./components/StatCard";
import StatusBadge from "./components/StatusBadge";
import Navbar from "./components/Navbar";

const REFRESH_INTERVAL_MS = 30_000;

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Add endpoint form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addInterval, setAddInterval] = useState(60);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/proxy/dashboard/summary", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Could not reach the API. Is the backend running?");
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function handleAddEndpoint(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch("/api/proxy/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName, url: addUrl, intervalSeconds: addInterval, timeoutSeconds: 10 }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setAddError(json.detail ?? json.error ?? "Failed to add endpoint.");
        return;
      }

      setShowAddForm(false);
      setAddName("");
      setAddUrl("");
      setAddInterval(60);
      await load();
    } catch {
      setAddError("Something went wrong. Try again.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/proxy/endpoints/${id}`, { method: "DELETE" });
      await load();
    } finally {
      setDeletingId(null);
    }
  }

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
              <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="font-semibold text-gray-100">Endpoints</h2>
                <button
                  onClick={() => { setShowAddForm((v) => !v); setAddError(null); }}
                  className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  {showAddForm ? "Cancel" : "+ Add Endpoint"}
                </button>
              </div>

              {/* Add endpoint form */}
              {showAddForm && (
                <form onSubmit={handleAddEndpoint} className="px-5 py-4 border-b border-gray-700 bg-gray-750 flex flex-col gap-3">
                  {addError && (
                    <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-3 py-2 text-xs">
                      {addError}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      required
                      className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors flex-1 min-w-32"
                    />
                    <input
                      type="url"
                      placeholder="https://example.com/health"
                      value={addUrl}
                      onChange={(e) => setAddUrl(e.target.value)}
                      required
                      className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors flex-[2] min-w-48"
                    />
                    <select
                      value={addInterval}
                      onChange={(e) => setAddInterval(Number(e.target.value))}
                      className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value={30}>30s</option>
                      <option value={60}>1 min</option>
                      <option value={300}>5 min</option>
                      <option value={600}>10 min</option>
                      <option value={1800}>30 min</option>
                    </select>
                    <button
                      type="submit"
                      disabled={adding}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      {adding ? "Adding..." : "Add"}
                    </button>
                  </div>
                </form>
              )}

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
                      <th className="px-5 py-3 font-medium"></th>
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
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleDelete(ep.id)}
                            disabled={deletingId === ep.id}
                            className="text-gray-500 hover:text-red-400 transition-colors text-xs disabled:opacity-40"
                          >
                            {deletingId === ep.id ? "..." : "Delete"}
                          </button>
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
