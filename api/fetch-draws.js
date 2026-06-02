export const config = {
  runtime: 'edge', // Explicitly forces the Edge runtime to prevent internal Node fetch runtime crashes
};

export default async function handler(req) {
  const TARGET_URL = 'https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json';

  // Standardized headers configuration for smooth cross-origin handshakes
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
  };

  // Gracefully handle preflight checks from custom subdomains
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const upstreamResponse = await fetch(TARGET_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });

    if (!upstreamResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream error: ${upstreamResponse.status}` }), 
        { status: upstreamResponse.status, headers: corsHeaders }
      );
    }

    const data = await upstreamResponse.json();
    return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed fetching fresh matrix data from source engine.' }), 
      { status: 500, headers: corsHeaders }
    );
  }
}
