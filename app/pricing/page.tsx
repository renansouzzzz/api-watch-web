import Link from "next/link";
import Navbar from "../components/Navbar";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect to try ApiWatch.",
    color: "border-gray-700",
    buttonStyle: "bg-gray-700 hover:bg-gray-600 text-white",
    features: [
      "3 endpoints",
      "5-minute check interval",
      "7-day history",
      "1 team member",
    ],
    missing: ["Email alerts", "Webhooks", "Status page"],
    href: "/register",
    cta: "Get started free",
  },
  {
    name: "Starter",
    price: "$12",
    period: "per month",
    description: "For individuals and side projects.",
    color: "border-blue-700",
    buttonStyle: "bg-blue-600 hover:bg-blue-500 text-white",
    features: [
      "15 endpoints",
      "1-minute check interval",
      "30-day history",
      "Email alerts",
      "1 team member",
    ],
    missing: ["Webhooks", "Status page"],
    href: "/register",
    cta: "Start with Starter",
  },
  {
    name: "Pro",
    price: "$39",
    period: "per month",
    description: "For growing teams and products.",
    color: "border-purple-600",
    buttonStyle: "bg-purple-600 hover:bg-purple-500 text-white",
    highlight: true,
    badge: "Most popular",
    features: [
      "50 endpoints",
      "30-second check interval",
      "90-day history",
      "Email alerts",
      "Webhooks",
      "Public status page",
      "3 team members",
    ],
    missing: [],
    href: "/register",
    cta: "Start with Pro",
  },
  {
    name: "Business",
    price: "$89",
    period: "per month",
    description: "For companies that need reliability.",
    color: "border-yellow-600",
    buttonStyle: "bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold",
    features: [
      "Unlimited endpoints",
      "30-second check interval",
      "1-year history",
      "Email alerts",
      "Webhooks",
      "Public status page",
      "10 team members",
    ],
    missing: [],
    href: "/register",
    cta: "Start with Business",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold mb-3">Simple, transparent pricing</h1>
          <p className="text-gray-400 text-lg">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-gray-800 rounded-xl border-2 ${plan.color} p-6 flex flex-col gap-5`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <div>
                <h2 className="text-lg font-bold">{plan.name}</h2>
                <p className="text-gray-400 text-sm mt-0.5">{plan.description}</p>
              </div>

              <div>
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-400 text-sm ml-1">/{plan.period}</span>
              </div>

              <ul className="flex flex-col gap-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span>✗</span> {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`text-center py-2.5 rounded-lg text-sm transition-colors ${plan.buttonStyle}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
