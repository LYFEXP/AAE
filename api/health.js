module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasSrv = !!process.env.SUPABASE_SERVICE_ROLE;
  const node = process.version;
  return res.status(200).json({ ok: hasUrl && hasSrv, env: { SUPABASE_URL: hasUrl, SUPABASE_SERVICE_ROLE: hasSrv }, node });
};
