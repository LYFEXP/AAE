import { supabaseAdmin } from "../../_lib/supabaseAdmin.js";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { name, affiliate_url } = req.body || {};
  if (!name || !affiliate_url) return res.status(400).json({ error: "name and affiliate_url required" });

  const supa = supabaseAdmin();
  const { data, error } = await supa.from("links").insert({ name, affiliate_url }).select().single();
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ link: data });
}
