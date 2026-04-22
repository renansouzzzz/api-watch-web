"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const planColors: Record<string, string> = {
  Free:     "text-gray-400 border-gray-600",
  Starter:  "text-blue-400 border-blue-700",
  Pro:      "text-purple-400 border-purple-700",
  Business: "text-yellow-400 border-yellow-700",
};

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const planColor = planColors[session?.user?.planName ?? "Free"] ?? planColors.Free;

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        pathname === href ? "text-white" : "text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-white font-bold text-lg tracking-tight">
          ApiWatch
        </Link>
        {session && (
          <div className="hidden sm:flex items-center gap-4">
            {navLink("/", "Dashboard")}
            {navLink("/billing", "Billing")}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className={`text-xs font-medium border rounded-full px-2.5 py-0.5 ${planColor}`}>
              {session.user.planName}
            </span>
            <span className="text-gray-400 text-sm hidden sm:inline">{session.user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm bg-white text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              Sign in
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
