import { NextRequest, NextResponse } from "next/server";

import { BLOCKED_PATHNAMES } from "@/lib/constants";

export default async function DomainMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const host = req.headers.get("host");

  console.log(`[DOMAIN_MIDDLEWARE] Processing:`, {
    path,
    host,
    url: req.url
  });

  // If it's the root path, redirect to docver.se/home
  if (path === "/") {
    console.log(`[DOMAIN_MIDDLEWARE] → Redirecting root to docver.se/home`);
    return NextResponse.redirect(
      new URL("https://docver.se/home", req.url),
    );
  }

  const url = req.nextUrl.clone();

  // Check for blocked pathnames
  if (BLOCKED_PATHNAMES.includes(path) || path.includes(".")) {
    console.log(`[DOMAIN_MIDDLEWARE] → 404 (blocked pathname or contains dot)`, {
      path,
      blockedPathnames: BLOCKED_PATHNAMES,
      containsDot: path.includes(".")
    });
    url.pathname = "/404";
    return NextResponse.rewrite(url, { status: 404 });
  }

  // Rewrite the URL to the correct page component for custom domains
  // Rewrite to the pages/view/domains/[domain]/[slug] route
  const rewritePath = `/view/domains/${host}${path}`;
  console.log(`[DOMAIN_MIDDLEWARE] → Rewriting to:`, {
    originalPath: path,
    rewritePath,
    host
  });
  url.pathname = rewritePath;

  return NextResponse.rewrite(url, {
    headers: {
      "X-Robots-Tag": "noindex",
      "X-Powered-By":
        "Docverse - Document sharing platform for the modern web",
    },
  });
}
