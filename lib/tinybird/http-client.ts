// HTTP-based Tinybird client to replace the zod-bird library
// This bypasses authentication issues by using direct HTTP calls

const TINYBIRD_BASE_URL = "https://api.europe-west2.gcp.tinybird.co/v0";

// Ingestion token for writing data
const INGESTION_TOKEN = process.env.TINYBIRD_API_KEY;
// Query token for reading data  
const QUERY_TOKEN = process.env.TINYBIRD_TOKEN;

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

interface DocumentDurationParams {
  documentId: string;
  excludedLinkIds: string;
  excludedViewIds: string;
  since: number;
  until?: number;
}

interface DocumentDurationResult {
  data: Array<{
    sum_duration: number;
  }>;
}

interface ViewPageDurationParams {
  documentId: string;
  viewId: string;
  since: number;
  until?: number;
}

interface ViewPageDurationResult {
  data: Array<{
    page: string;
    duration: number;
  }>;
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

// HTTP-based publishPageView function
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

// HTTP-based recordLinkViewTB function
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

// HTTP-based getTotalDocumentDuration function
export async function getTotalDocumentDurationHttp(
  params: DocumentDurationParams
): Promise<DocumentDurationResult> {
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

// HTTP-based getViewPageDuration function
export async function getViewPageDurationHttp(
  params: ViewPageDurationParams
): Promise<ViewPageDurationResult> {
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

// Test function to verify the HTTP client works
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