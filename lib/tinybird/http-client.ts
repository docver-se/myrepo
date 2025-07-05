// HTTP-based Tinybird client to replace the zod-bird library
// This bypasses authentication issues by using direct HTTP calls

const TINYBIRD_BASE_URL = "https://api.europe-west2.gcp.tinybird.co/v0";

// Ingestion token for writing data
const INGESTION_TOKEN = process.env.TINYBIRD_TOKEN;
// Query token for reading data  
const QUERY_TOKEN = process.env.TINYBIRD_TOKEN;

// ========================================
// INTERFACES FOR TYPE SAFETY
// ========================================

interface PageViewData {
  id: string;
  linkId: string;
  documentId: string;
  viewId: string;
  dataroomId?: string | null;
  versionNumber?: number;
  time: number;
  duration: number;
  pageNumber: string;
  country?: string;
  city?: string;
  region?: string;
  latitude?: string;
  longitude?: string;
  ua?: string;
  browser?: string;
  browser_version?: string;
  engine?: string;
  engine_version?: string;
  os?: string;
  os_version?: string;
  device?: string;
  device_vendor?: string;
  device_model?: string;
  cpu_architecture?: string;
  bot?: boolean;
  referer?: string;
  referer_url?: string;
}

interface LinkViewData {
  timestamp: string;
  click_id: string;
  view_id: string;
  link_id: string;
  document_id: string | null;
  dataroom_id: string | null;
  continent?: string;
  country?: string;
  city?: string;
  region?: string;
  latitude?: string;
  longitude?: string;
  device?: string;
  device_model?: string;
  device_vendor?: string;
  browser?: string;
  browser_version?: string;
  os?: string;
  os_version?: string;
  engine?: string;
  engine_version?: string;
  cpu_architecture?: string;
  ua?: string;
  bot?: boolean;
  referer?: string;
  referer_url?: string;
  ip_address?: string | null;
}

interface VideoViewData {
  timestamp: string;
  id: string;
  link_id: string;
  document_id: string;
  view_id: string;
  dataroom_id: string | null;
  version_number: number;
  event_type: string;
  start_time: number;
  end_time?: number;
  playback_rate: number;
  volume: number;
  is_muted: number;
  is_focused: number;
  is_fullscreen: number;
  country?: string;
  city?: string;
  region?: string;
  latitude?: string;
  longitude?: string;
  ua?: string;
  browser?: string;
  browser_version?: string;
  engine?: string;
  engine_version?: string;
  os?: string;
  os_version?: string;
  device?: string;
  device_vendor?: string;
  device_model?: string;
  cpu_architecture?: string;
  bot?: boolean;
  referer?: string;
  referer_url?: string;
  ip_address?: string | null;
}

interface ClickEventData {
  timestamp: string;
  event_id: string;
  session_id: string;
  link_id: string;
  document_id: string;
  view_id: string;
  page_number: string;
  href: string;
  version_number: number;
  dataroom_id: string | null;
}

interface WebhookEventData {
  event_id: string;
  webhook_id: string;
  message_id: string;
  event: string;
  url: string;
  http_status: number;
  request_body: string;
  response_body: string;
}

// ========================================
// INGESTION FUNCTIONS (Write Data)
// ========================================

export async function publishPageViewHttp(data: PageViewData): Promise<void> {
  const url = `${TINYBIRD_BASE_URL}/events?name=page_views`;
  
  const payload = {
    id: data.id,
    linkId: data.linkId,
    documentId: data.documentId,
    viewId: data.viewId,
    dataroomId: data.dataroomId || null,
    versionNumber: data.versionNumber || 1,
    time: data.time,
    duration: data.duration,
    pageNumber: data.pageNumber,
    country: data.country || "Unknown",
    city: data.city || "Unknown",
    region: data.region || "Unknown",
    latitude: data.latitude || "Unknown",
    longitude: data.longitude || "Unknown",
    ua: data.ua || "Unknown",
    browser: data.browser || "Unknown",
    browser_version: data.browser_version || "Unknown",
    engine: data.engine || "Unknown",
    engine_version: data.engine_version || "Unknown",
    os: data.os || "Unknown",
    os_version: data.os_version || "Unknown",
    device: data.device || "Desktop",
    device_vendor: data.device_vendor || "Unknown",
    device_model: data.device_model || "Unknown",
    cpu_architecture: data.cpu_architecture || "Unknown",
    bot: data.bot || false,
    referer: data.referer || "(direct)",
    referer_url: data.referer_url || "(direct)",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${INGESTION_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to ingest page view: ${response.status} ${errorText}`);
  }
}

export async function recordLinkViewTBHttp(data: LinkViewData): Promise<void> {
  const url = `${TINYBIRD_BASE_URL}/events?name=pm_click_events`;
  
  const payload = {
    timestamp: data.timestamp,
    click_id: data.click_id,
    view_id: data.view_id,
    link_id: data.link_id,
    document_id: data.document_id,
    dataroom_id: data.dataroom_id,
    continent: data.continent || "Unknown",
    country: data.country || "Unknown",
    city: data.city || "Unknown",
    region: data.region || "Unknown",
    latitude: data.latitude || "Unknown",
    longitude: data.longitude || "Unknown",
    device: data.device || "Desktop",
    device_model: data.device_model || "Unknown",
    device_vendor: data.device_vendor || "Unknown",
    browser: data.browser || "Unknown",
    browser_version: data.browser_version || "Unknown",
    os: data.os || "Unknown",
    os_version: data.os_version || "Unknown",
    engine: data.engine || "Unknown",
    engine_version: data.engine_version || "Unknown",
    cpu_architecture: data.cpu_architecture || "Unknown",
    ua: data.ua || "Unknown",
    bot: data.bot || false,
    referer: data.referer || "(direct)",
    referer_url: data.referer_url || "(direct)",
    ip_address: data.ip_address,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${INGESTION_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to ingest link view: ${response.status} ${errorText}`);
  }
}

export async function recordVideoViewHttp(data: VideoViewData): Promise<void> {
  const url = `${TINYBIRD_BASE_URL}/events?name=video_views`;
  
  const payload = {
    timestamp: data.timestamp,
    id: data.id,
    link_id: data.link_id,
    document_id: data.document_id,
    view_id: data.view_id,
    dataroom_id: data.dataroom_id,
    version_number: data.version_number,
    event_type: data.event_type,
    start_time: data.start_time,
    end_time: data.end_time,
    playback_rate: data.playback_rate,
    volume: data.volume,
    is_muted: data.is_muted,
    is_focused: data.is_focused,
    is_fullscreen: data.is_fullscreen,
    country: data.country || "Unknown",
    city: data.city || "Unknown",
    region: data.region || "Unknown",
    latitude: data.latitude || "Unknown",
    longitude: data.longitude || "Unknown",
    ua: data.ua || "Unknown",
    browser: data.browser || "Unknown",
    browser_version: data.browser_version || "Unknown",
    engine: data.engine || "Unknown",
    engine_version: data.engine_version || "Unknown",
    os: data.os || "Unknown",
    os_version: data.os_version || "Unknown",
    device: data.device || "Desktop",
    device_vendor: data.device_vendor || "Unknown",
    device_model: data.device_model || "Unknown",
    cpu_architecture: data.cpu_architecture || "Unknown",
    bot: data.bot || false,
    referer: data.referer || "(direct)",
    referer_url: data.referer_url || "(direct)",
    ip_address: data.ip_address,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${INGESTION_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to ingest video view: ${response.status} ${errorText}`);
  }
}

export async function recordClickEventHttp(data: ClickEventData): Promise<void> {
  const url = `${TINYBIRD_BASE_URL}/events?name=click_events`;
  
  const payload = {
    timestamp: data.timestamp,
    event_id: data.event_id,
    session_id: data.session_id,
    link_id: data.link_id,
    document_id: data.document_id,
    view_id: data.view_id,
    page_number: data.page_number,
    href: data.href,
    version_number: data.version_number,
    dataroom_id: data.dataroom_id,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${INGESTION_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to ingest click event: ${response.status} ${errorText}`);
  }
}

export async function recordWebhookEventHttp(data: WebhookEventData): Promise<void> {
  const url = `${TINYBIRD_BASE_URL}/events?name=webhook_events`;
  
  const payload = {
    event_id: data.event_id,
    webhook_id: data.webhook_id,
    message_id: data.message_id,
    event: data.event,
    url: data.url,
    http_status: data.http_status,
    request_body: data.request_body,
    response_body: data.response_body,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${INGESTION_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to ingest webhook event: ${response.status} ${errorText}`);
  }
}

// ========================================
// QUERY FUNCTIONS (Read Data)
// ========================================

export async function getTotalDocumentDurationHttp(params: {
  documentId: string;
  excludedLinkIds: string;
  excludedViewIds: string;
  since: number;
  until?: number;
}): Promise<{ data: Array<{ sum_duration: number }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    documentId: params.documentId,
    since: params.since.toString(),
  });

  if (params.until) {
    searchParams.append("until", params.until.toString());
  }

  const url = `${TINYBIRD_BASE_URL}/pipes/get_total_document_duration.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get document duration: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export async function getViewPageDurationHttp(params: {
  documentId: string;
  viewId: string;
  since: number;
  until?: number;
}): Promise<{ data: Array<{ page: string; duration: number }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    documentId: params.documentId,
    viewId: params.viewId,
    since: params.since.toString(),
  });

  if (params.until) {
    searchParams.append("until", params.until.toString());
  }

  const url = `${TINYBIRD_BASE_URL}/pipes/get_page_duration_per_view.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get view page duration: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export async function getTotalAvgPageDurationHttp(params: {
  documentId: string;
  excludedLinkIds: string;
  excludedViewIds: string;
  since: number;
}): Promise<{ data: Array<{ avg_duration: number }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    documentId: params.documentId,
    since: params.since.toString(),
  });

  const url = `${TINYBIRD_BASE_URL}/pipes/get_total_average_page_duration.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get avg page duration: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export async function getAvgPageDurationHttp(params: {
  documentId: string;
  excludedLinkIds: string;
  excludedViewIds: string;
  since: number;
}): Promise<{ data: Array<{ pageNumber: string; versionNumber: number; avg_duration: number }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    documentId: params.documentId,
    since: params.since.toString(),
  });

  if (params.excludedViewIds) {
    searchParams.append("excludedViewIds", params.excludedViewIds);
  }

  const url = `${TINYBIRD_BASE_URL}/pipes/get_average_page_duration.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get avg page duration: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export async function getTotalLinkDurationHttp(params: {
  linkId: string;
  documentId: string;
  excludedViewIds: string;
  since: number;
  until?: number;
}): Promise<{ data: Array<{ sum_duration: number }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    linkId: params.linkId,
    since: params.since.toString(),
  });

  if (params.until) {
    searchParams.append("until", params.until.toString());
  }

  const url = `${TINYBIRD_BASE_URL}/pipes/get_total_link_duration.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get link duration: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export async function getTotalViewerDurationHttp(params: {
  viewIds: string;
  since: number;
  until?: number;
}): Promise<{ data: Array<{ sum_duration: number }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    viewIds: params.viewIds,
    since: params.since.toString(),
  });

  if (params.until) {
    searchParams.append("until", params.until.toString());
  }

  const url = `${TINYBIRD_BASE_URL}/pipes/get_total_viewer_duration.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get viewer duration: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export async function getViewUserAgentHttp(params: {
  viewId: string;
}): Promise<{ data: Array<{ country: string; city: string; browser: string; os: string; device: string }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    viewId: params.viewId,
  });

  const url = `${TINYBIRD_BASE_URL}/pipes/get_useragent_per_view.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get user agent: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export async function getTotalDataroomDurationHttp(params: {
  dataroomId: string;
  excludedLinkIds: string[];
  excludedViewIds: string[];
  since: number;
}): Promise<{ data: Array<{ total_duration: number }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    dataroomId: params.dataroomId,
    since: params.since.toString(),
  });

  const url = `${TINYBIRD_BASE_URL}/pipes/get_total_dataroom_duration.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get dataroom duration: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export async function getDocumentDurationPerViewerHttp(params: {
  doc_id: string;
  viewIds: string;
}): Promise<{ data: Array<{ link_id: string; total_duration: number }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    doc_id: params.doc_id,
    viewIds: params.viewIds,
  });

  const url = `${TINYBIRD_BASE_URL}/pipes/get_document_duration_per_viewer.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get document duration per viewer: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export async function getWebhookEventsHttp(params: {
  webhook_id: string;
}): Promise<{ data: Array<{ event_id: string; webhook_id: string; message_id: string; event: string; url: string; http_status: number; request_body: string; response_body: string; timestamp: string }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    webhook_id: params.webhook_id,
  });

  const url = `${TINYBIRD_BASE_URL}/pipes/get_webhook_events.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get webhook events: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export async function getVideoEventsByDocumentHttp(params: {
  documentId: string;
}): Promise<{ data: Array<{ timestamp: string; view_id: string; event_type: string; start_time: number; end_time: number; playback_rate: number; volume: number; is_muted: number; is_focused: number; is_fullscreen: number }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    documentId: params.documentId,
  });

  const url = `${TINYBIRD_BASE_URL}/pipes/get_video_events_by_document.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get video events by document: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export async function getVideoEventsByViewHttp(params: {
  viewId: string;
}): Promise<{ data: Array<{ timestamp: string; event_type: string; start_time: number; end_time: number }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    viewId: params.viewId,
  });

  const url = `${TINYBIRD_BASE_URL}/pipes/get_video_events_by_view.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get video events by view: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

export async function getClickEventsByViewHttp(params: {
  viewId: string;
}): Promise<{ data: Array<{ timestamp: string; document_id: string; dataroom_id: string | null; view_id: string; page_number: string; version_number: number; href: string }> }> {
  const searchParams = new URLSearchParams({
    token: QUERY_TOKEN!,
    viewId: params.viewId,
  });

  const url = `${TINYBIRD_BASE_URL}/pipes/get_click_events_by_view.json?${searchParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get click events by view: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export async function testTinybirdConnection(): Promise<boolean> {
  try {
    // Test with a simple query
    const url = `${TINYBIRD_BASE_URL}/pipes/get_total_document_duration.json?token=${QUERY_TOKEN}&documentId=test&since=0`;
    const response = await fetch(url);
    
    // Even if it returns no data, a 200 response means the connection works
    return response.ok;
  } catch (error) {
    console.error("Tinybird connection test failed:", error);
    return false;
  }
} 