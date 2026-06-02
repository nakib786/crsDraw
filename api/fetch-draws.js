export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Global mirror fallback networks that scrape Canada.ca automatically
  const MIRROR_URLS = [
    'https://raw.githubusercontent.com/nakib786/crsDraw/main/ee_rounds_123_en.json',
    'https://cdn.jsdelivr.net/gh/nakib786/crsDraw@main/ee_rounds_123_en.json'
  ];

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Iterate over unblocked mirrors sequentially to find an alive endpoint
  for (const url of MIRROR_URLS) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(3500) // Fast 3.5 second timeout to prevent Vercel 504 hangs
      });

      if (response.ok) {
        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
      }
    } catch (e) {
      console.warn(`Mirror failed: ${url}`, e.message);
    }
  }

  // Final fallback: try a public proxy if the main git hubs fail
  try {
    const backupUrl = 'https://api.codetabs.com/v1/proxy/?quest=https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json';
    const response = await fetch(backupUrl, { signal: AbortSignal.timeout(4000) });
    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
    }
  } catch (err) {
    console.error("All backend streaming layers exhausted");
  }

  return new Response(
    JSON.stringify({ error: 'Gateway validation failures across all active cloud proxy nodes.' }), 
    { status: 502, headers: corsHeaders }
  );
}
