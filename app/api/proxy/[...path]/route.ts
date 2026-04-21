import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:5000";

// Forwards any request to the .NET API, injecting the user's JWT automatically
async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await getServerSession(authOptions);
  const { path } = await params;

  const targetUrl = `${API_URL}/api/${path.join("/")}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // If the user is logged in, attach their JWT so the .NET API knows who they are
  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await req.text()
    : undefined;

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
