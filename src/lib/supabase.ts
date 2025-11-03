import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getTrends() {
  const { data, error } = await supabase
    .from('trends')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addTrend(trend: {
  topic: string;
  source?: string;
  score?: number;
  region?: string;
  status?: string;
}) {
  const { data, error } = await supabase
    .from('trends')
    .insert(trend)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOffers() {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addOffer(offer: {
  merchant: string;
  product: string;
  commission_type?: string;
  rate?: string;
  deeplink_template: string;
  network?: string;
  approved?: boolean;
}) {
  const { data, error } = await supabase
    .from('offers')
    .insert(offer)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAssets() {
  const { data, error } = await supabase
    .from('assets')
    .select('*, trends(*), offers(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addAsset(asset: {
  trend_id?: string;
  offer_id?: string;
  type: string;
  path: string;
  status?: string;
  metrics_json?: any;
}) {
  const { data, error } = await supabase
    .from('assets')
    .insert(asset)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*, assets(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addPost(post: {
  asset_id?: string;
  platform: string;
  status?: string;
  scheduled_at?: string;
  published_at?: string;
  url?: string;
}) {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function logClick(click: {
  post_id?: string;
  link_slug: string;
  ip_hash: string;
  ua_hash: string;
}) {
  const { data, error } = await supabase
    .from('clicks')
    .insert(click)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addConversion(conversion: {
  network: string;
  click_ref?: string;
  amount: number;
  commission: number;
}) {
  const { data, error } = await supabase
    .from('conversions')
    .insert(conversion)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAnalytics() {
  const [clicksResult, conversionsResult, postsResult] = await Promise.all([
    supabase.from('clicks').select('*'),
    supabase.from('conversions').select('*'),
    supabase.from('posts').select('impressions, clicks')
  ]);

  const totalClicks = clicksResult.data?.length || 0;
  const totalConversions = conversionsResult.data?.length || 0;
  const totalRevenue = conversionsResult.data?.reduce((sum, c) => sum + Number(c.commission || 0), 0) || 0;
  const totalImpressions = postsResult.data?.reduce((sum, p) => sum + (p.impressions || 0), 0) || 0;
  const totalPostClicks = postsResult.data?.reduce((sum, p) => sum + (p.clicks || 0), 0) || 0;

  return {
    totalClicks,
    totalConversions,
    totalRevenue,
    totalImpressions,
    totalPostClicks,
    ctr: totalImpressions > 0 ? (totalPostClicks / totalImpressions * 100).toFixed(2) : '0.00',
    conversionRate: totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : '0.00',
    epc: totalClicks > 0 ? (totalRevenue / totalClicks).toFixed(2) : '0.00'
  };
}

export async function getOfferBySlug(slug: string) {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('id', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}
