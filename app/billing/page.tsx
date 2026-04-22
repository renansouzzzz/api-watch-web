"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { Plan, Subscription } from "@/lib/types";

const planColors: Record<string, { border: string; button: string; badge?: string }> = {
  Free:     { border: "border-gray-600",   button: "bg-gray-700 hover:bg-gray-600 text-white" },
  Starter:  { border: "border-blue-700",   button: "bg-blue-600 hover:bg-blue-500 text-white" },
  Pro:      { border: "border-purple-600", button: "bg-purple-600 hover:bg-purple-500 text-white", badge: "Most popular" },
  Business: { border: "border-yellow-600", button: "bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold" },
};

const planFeatures: Record<string, string[]> = {
  Free:     ["3 endpoints", "5-min check interval", "7-day history", "1 team member"],
  Starter:  ["15 endpoints", "1-min check interval", "30-day history", "Email alerts", "1 team member"],
  Pro:      ["50 endpoints", "30-sec check interval", "90-day history", "Email alerts", "Webhooks", "Status page", "3 team members"],
  Business: ["Unlimited endpoints", "30-sec check interval", "1-year history", "Email alerts", "Webhooks", "Status page", "10 team members"],
};

export default function BillingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [plansRes, subRes] = await Promise.all([
          fetch("/api/proxy/billing/plans"),
          fetch("/api/proxy/billing/subscription"),
        ]);
        if (plansRes.ok) setPlans(await plansRes.json());
        if (subRes.ok) setSubscription(await subRes.json());
      } catch {
        setError("Failed to load billing info.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function subscribe(planId: number) {
    setSubscribing(planId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/proxy/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Subscription failed.");
        return;
      }
      const updated: Subscription = await res.json();
      setSubscription(updated);
      setSuccess(`Switched to ${updated.planName} plan.`);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubscribing(null);
    }
  }

  async function cancel() {
    setCanceling(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/proxy/billing/cancel", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Cancel failed.");
        return;
      }
      const subRes = await fetch("/api/proxy/billing/subscription");
      if (subRes.ok) setSubscription(await subRes.json());
      setSuccess("Subscription canceled. You're now on the Free plan.");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setCanceling(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold">Billing & Plans</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your subscription.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-900/40 border border-green-700 text-green-300 rounded-lg px-4 py-3 text-sm">
            {success}
          </div>
        )}

        {/* Current subscription */}
        {subscription && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current plan</p>
              <p className="text-lg font-bold">{subscription.planName}</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {subscription.priceMonthly === 0
                  ? "Free forever"
                  : `$${subscription.priceMonthly}/month`}
                {" · "}
                {subscription.maxEndpoints === -1 ? "Unlimited" : subscription.maxEndpoints} endpoints
                {subscription.currentPeriodEnd && (
                  <> · Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                )}
              </p>
            </div>
            {subscription.planId !== 1 && (
              <button
                onClick={cancel}
                disabled={canceling}
                className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 shrink-0"
              >
                {canceling ? "Canceling..." : "Cancel subscription"}
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-48 text-gray-500">
            Loading plans...
          </div>
        )}

        {/* Plans grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan) => {
              const style = planColors[plan.name] ?? planColors.Free;
              const features = planFeatures[plan.name] ?? [];
              const isCurrent = subscription?.planId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-gray-800 rounded-xl border-2 ${style.border} p-5 flex flex-col gap-4 ${isCurrent ? "ring-2 ring-white/10" : ""}`}
                >
                  {style.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {style.badge}
                    </span>
                  )}

                  <div>
                    <h2 className="font-bold text-base">{plan.name}</h2>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">
                        {plan.priceMonthly === 0 ? "$0" : `$${plan.priceMonthly}`}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">
                        {plan.priceMonthly === 0 ? "/forever" : "/month"}
                      </span>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-1.5 flex-1 text-sm">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-gray-300">
                        <span className="text-green-400 shrink-0">✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <div className="text-center py-2 text-sm text-gray-400 border border-gray-600 rounded-lg">
                      Current plan
                    </div>
                  ) : (
                    <button
                      onClick={() => subscribe(plan.id)}
                      disabled={subscribing !== null || canceling}
                      className={`py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${style.button}`}
                    >
                      {subscribing === plan.id
                        ? "Switching..."
                        : plan.priceMonthly === 0
                        ? "Switch to Free"
                        : `Switch to ${plan.name}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-600 mt-10">
          No credit card required during beta. Payments will be enabled soon.
        </p>
      </div>
    </div>
  );
}
