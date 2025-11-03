import { supabaseAdmin } from "../../_lib/supabaseAdmin.js";

export default async function handler(req, res) {
  const { id } = req.query; // /api/r/123
  const supa = supabaseAdmin();

  const { data: link, error } = await supa.from("links").select("*").eq("id", id).single();
  if (error || !link) return res.status(404).send("Link not found");

  // increment + log click
  await supa.from("links").update({ click_count: (link.click_count ?? 0) + 1 }).eq("id", id);
  await supa.from("click_events").insert({
    link_id: link.id,
    source: req.headers.referer || "direct",
    ip: req.socket?.remoteAddress || null
  });

  res.writeHead(302, { Location: link.affiliate_url });
  return res.end();
}
