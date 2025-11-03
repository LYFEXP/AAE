const { supabaseAdmin } = require("../_lib/supabaseAdmin.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST with JSON { topic, offer, platform? }" });
  }

  try {
    const { topic = "AI tool", offer = "Example Offer", platform = "tiktok" } = req.body || {};

    const script  = `Hook: ${topic} is exploding. 3 reasons it matters → [benefit 1], [benefit 2], [benefit 3]. Try ${offer} today.`;
    const caption = `Quick breakdown of ${topic}. Link in bio. #ai #tools #trending`;

    const supa = supabaseAdmin();
    const { data, error } = await supa
      .from("trend_logs")
      .insert({ keyword: topic, caption, script, platform })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "DB_INSERT_FAILED" });
    }

    return res.status(200).json({ script, caption, saved: true, trend_id: data?.id ?? null });
  } catch (e) {
    console.error("GEN_ERR", e);
    return res.status(500).json({ error: "FUNCTION_RUNTIME_ERROR" });
  }
};
