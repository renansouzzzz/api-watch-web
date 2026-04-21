"use client";

import { SessionProvider } from "next-auth/react";

// Wraps the app with NextAuth's session context
// Must be a Client Component because it uses React context under the hood
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
