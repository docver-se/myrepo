import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import AppMiddleware from "@/lib/middleware/app";
import DomainMiddleware from "@/lib/middleware/domain";

import { BLOCKED_PATHNAMES } from "./lib/constants";
import IncomingWebhookMiddleware, {
  isWebhookPath,
} from "./lib/middleware/incoming-webhooks";
import PostHogMiddleware from "./lib/middleware/posthog";

function isAnalyticsPath(path: string) {
  // Create a regular expression
  // ^ - asserts position at start of the line
  // /ingest/ - matches the literal string "/ingest/"
  // .* - matches any character (except for line terminators) 0 or more times
  const pattern = /^\/ingest\/.*/;
  const result = pattern.test(path);
  
  if (result) {
    console.log(`[ANALYTICS_MIDDLEWARE] Analytics path detected:`, {
      path,
      pattern: pattern.toString(),
      result
    });
  }

  return result;
}

function isCustomDomain(host: string) {
  const isDev = process.env.NODE_ENV === "development";
  const isDevCustom = isDev && (host?.includes(".local") || host?.includes("papermark.dev"));
  const isProdCustom = !isDev && !(
    host?.includes("localhost") ||
    host?.includes("docver.se") ||
    host?.endsWith(".vercel.app")
  );
  
  const result = isDevCustom || isProdCustom;
  
  console.log(`[MIDDLEWARE] isCustomDomain check:`, {
    host,
    isDev,
    isDevCustom,
    isProdCustom,
    result,
    nodeEnv: process.env.NODE_ENV
  });
  
  return result;
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    "/((?!api/|_next/|_static|vendor|_icons|_vercel|favicon.ico|sitemap.xml).*)",
  ],
};

export default async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const path = req.nextUrl.pathname;
  const host = req.headers.get("host");


  if (isAnalyticsPath(path)) {
    // console.log(`[MIDDLEWARE] → PostHogMiddleware (analytics path)`);
    return PostHogMiddleware(req);
  }

  // Handle incoming webhooks
  if (isWebhookPath(host)) {
    // console.log(`[MIDDLEWARE] → IncomingWebhookMiddleware (webhook path)`);
    return IncomingWebhookMiddleware(req);
  }

  // For custom domains, we need to handle them differently
  if (isCustomDomain(host || "")) {
    // console.log(`[MIDDLEWARE] → DomainMiddleware (custom domain)`);
    return DomainMiddleware(req);
  }

  // Handle standard papermark.io paths
  if (
    !path.startsWith("/view/") &&
    !path.startsWith("/verify") &&
    !path.startsWith("/unsubscribe")
  ) {
    // console.log(`[MIDDLEWARE] → AppMiddleware (standard app path)`);
    return AppMiddleware(req);
  }

  // Check for blocked pathnames in view routes
  if (
    path.startsWith("/view/") &&
    (BLOCKED_PATHNAMES.some((blockedPath) => path.includes(blockedPath)) ||
      path.includes("."))
  ) {
    // console.log(`[MIDDLEWARE] → 404 (blocked pathname in view route)`);
    const url = req.nextUrl.clone();
    url.pathname = "/404";
    return NextResponse.rewrite(url, { status: 404 });
  }

  // console.log(`[MIDDLEWARE] → NextResponse.next() (fallthrough)`);
  return NextResponse.next();
}
