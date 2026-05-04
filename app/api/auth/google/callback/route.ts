import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const role = url.searchParams.get("role") as "admin" | "client" | null;
  const expiresAt = url.searchParams.get("expires_at");

  const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  if (!token || !role) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`);
  }

  const expiresAtMs =
    expiresAt && expiresAt !== "" ? parseInt(expiresAt, 10) : null;

  const sessionValue = JSON.stringify({
    role,
    expiresAt: expiresAtMs,
    token,
  });

  const maxAge =
    role === "admin"
      ? 60 * 60 * 24 * 30
      : expiresAtMs
      ? Math.floor((expiresAtMs - Date.now()) / 1000)
      : 4 * 60 * 60;

  const response = NextResponse.redirect(`${appUrl}/landing`);
  response.cookies.set("auth_session", sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return response;
}
