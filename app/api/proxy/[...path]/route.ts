import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:5000";

const ALLOWED_PATH_PREFIXES = ["dashboard", "endpoints", "billing"];
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "DELETE"]);

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ALLOWED_METHODS.has(req.method)) {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { path } = await params;

  // Prevent path traversal
  if (path.some(segment => segment.includes("..") || segment.includes("/"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  // Only forward to known API paths
  if (!ALLOWED_PATH_PREFIXES.includes(path[0])) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const targetUrl = `${API_URL}/api/${path.join("/")}`;
  const searchParams = req.nextUrl.searchParams.toString();
  const fullUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await req.text()
    : undefined;

  const res = await fetch(fullUrl, {
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
