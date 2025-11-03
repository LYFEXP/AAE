// /api/content/generate.js
export default async function handler(req, res) {
  // --- CORS headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST with JSON { topic, offer }" });
  }

  // Body is parsed by Vercel when Content-Type: application/json
  const { topic = "AI tool", offer = "Example Offer" } = req.body || {};

  return res.status(200).json({
    script: `Hook: ${topic} is exploding. 3 reasons it matters → [benefit 1], [benefit 2], [benefit 3]. Try ${offer} today.`,
    caption: `Quick breakdown of ${topic}. Link in bio. #ai #tools #trending`,
  });
}
