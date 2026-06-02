export default async function handler(req, res) {
  // Always permit cross-origin access requests explicitly from your own domains
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  const TARGET_URL = 'https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json';

  try {
    const response = await fetch(TARGET_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store' // Forces Vercel to bypass cached states and pull fresh data
    });

    if (!response.ok) {
      throw new Error(`Upstream server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Serverless API Fetch Failure:", error);
    return res.status(500).json({ error: 'Failed fetching fresh data from Canada.ca' });
  }
}
