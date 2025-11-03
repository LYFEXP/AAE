const { supabaseAdmin } = require("../_lib/supabaseAdmin.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  try {
    const supa = supabaseAdmin();

    const { data: links, error: e1 } = await supa
      .from("links")
      .select("id,name,affiliate_url,click_count")
      .order("click_count", { ascending: false })
      .limit(10);

    const { count: last24, error: e2 } = await supa
      .from("click_events")
      .select("*", { count: "exact", head: true })
      .gte("ts", new Date(Date.now() - 24*60*60*1000).toISOString());

    if (e1 || e2) return res.status(500).json({ error: (e1||e2)?.message || "ANALYTICS_FAIL" });

    return res.status(200).json({
      last_24h_clicks: last24 ?? 0,
      top_links: links ?? []
    });
  } catch (e) {
    console.error("ANALYTICS_ERR", e);
    return res.status(500).json({ error: "FUNCTION_RUNTIME_ERROR" });
  }
};
