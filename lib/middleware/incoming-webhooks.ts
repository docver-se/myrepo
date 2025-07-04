import { NextRequest, NextResponse } from "next/server";

export default async function IncomingWebhookMiddleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Only handle /services/* paths
  if (path.startsWith("/services/")) {
    // Rewrite to /api/webhooks/services/*
    url.pathname = `/api/webhooks${path}`;

    return NextResponse.rewrite(url);
  }

  // Return 404 for all other paths
  url.pathname = "/404";
  return NextResponse.rewrite(url, { status: 404 });
}

export function isWebhookPath(host: string | null) {
  const webhookHost = process.env.NEXT_PUBLIC_WEBHOOK_BASE_HOST;
  const appHost = process.env.NEXT_PUBLIC_APP_BASE_HOST;
  
  // If webhook host is the same as app host, don't treat as webhook path
  // This prevents the main app from being treated as webhook-only
  if (webhookHost === appHost) {
    console.log(`[WEBHOOK_MIDDLEWARE] isWebhookPath check: webhook host same as app host, returning false`, {
      host,
      webhookHost,
      appHost
    });
    return false;
  }
  
  const result = webhookHost && host === webhookHost;
  
  console.log(`[WEBHOOK_MIDDLEWARE] isWebhookPath check:`, {
    host,
    webhookHost,
    appHost,
    result
  });
  
  if (!webhookHost) {
    return false;
  }

  if (host === webhookHost) {
    return true;
  }

  return false;
}
