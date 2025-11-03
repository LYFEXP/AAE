import { addTrend, addOffer, addAsset, addPost, addConversion, getAnalytics, getTrends, getOffers } from './supabase';
import { supabase } from './supabase';

export async function ingestTrend(body: { topic: string; source?: string; score?: number; region?: string }) {
  try {
    const trend = await addTrend(body);
    return { status: 'ok', trend };
  } catch (error) {
    console.error('Error ingesting trend:', error);
    throw error;
  }
}

export async function resolveOffer(body: {
  merchant: string;
  product: string;
  commission_type?: string;
  rate?: string;
  deeplink_template: string;
  network?: string;
  approved?: boolean;
}) {
  try {
    const offer = await addOffer(body);
    return offer;
  } catch (error) {
    console.error('Error resolving offer:', error);
    throw error;
  }
}

export async function generateContent(body: {
  trend_id?: string;
  offer_id?: string;
  trend?: string;
  offer?: string;
  auto_publish?: boolean;
}) {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/content-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        trend_id: body.trend_id,
        offer_id: body.offer_id,
        trend: body.trend || 'trending topic',
        offer: body.offer || 'amazing product'
      })
    });

    if (!response.ok) {
      throw new Error(`Edge function failed: ${response.statusText}`);
    }

    const { script, caption } = await response.json();

    const asset = await addAsset({
      trend_id: body.trend_id,
      offer_id: body.offer_id,
      type: 'script',
      path: script,
      status: 'draft',
      metrics_json: { caption, auto_generated: true }
    });

    if (body.auto_publish) {
      await publishContent({
        asset_id: asset.id,
        platform: 'tiktok',
        scheduled_at: new Date(Date.now() + 3600000).toISOString()
      });
    }

    return { script, caption, asset };
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

export async function publishContent(body: {
  asset_id?: string;
  platform: string;
  scheduled_at?: string;
  url?: string;
  caption?: string;
  asset_url?: string;
}) {
  try {
    const post = await addPost({
      asset_id: body.asset_id,
      platform: body.platform,
      scheduled_at: body.scheduled_at,
      url: body.url,
      status: body.scheduled_at ? 'scheduled' : 'published',
      published_at: !body.scheduled_at ? new Date().toISOString() : undefined
    });

    const zapierHookUrl = import.meta.env.VITE_ZAPIER_HOOK_URL;

    if (zapierHookUrl && zapierHookUrl.length > 0) {
      try {
        await fetch(zapierHookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: body.platform,
            caption: body.caption || '',
            asset_url: body.asset_url || '',
            schedule: body.scheduled_at || new Date().toISOString(),
            post_id: post.id
          })
        });
      } catch (zapierError) {
        console.error('Zapier webhook failed, post queued locally:', zapierError);
      }
    }

    return { scheduled: true, post };
  } catch (error) {
    console.error('Error publishing content:', error);
    throw error;
  }
}

export async function handleAffiliateWebhook(body: {
  network: string;
  click_ref?: string;
  amount: number;
  commission: number;
}) {
  try {
    const conversion = await addConversion(body);
    return { status: 'ok', conversion };
  } catch (error) {
    console.error('Error handling affiliate webhook:', error);
    throw error;
  }
}

export async function updateBrain() {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/brain-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (!response.ok) {
      throw new Error(`Brain update failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating brain:', error);
    throw error;
  }
}

export async function fetchAnalytics() {
  try {
    return await getAnalytics();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}
