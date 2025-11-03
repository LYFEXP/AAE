# Affiliate AI Hub - Automation Integration Guide

This guide explains how to connect live automation services to make your Affiliate AI Hub semi-autonomous.

## 🔑 Environment Variables

Add these to your `.env` file:

```bash
# Mock mode (default) - no OpenAI package needed
OPENAI_MOCK=1

# Live mode - requires OpenAI package installed
OPENAI_API_KEY=sk-...

# Other integrations
VITE_ZAPIER_HOOK_URL=https://hooks.zapier.com/hooks/catch/...
VITE_BUFFER_API_KEY=your_buffer_key
VITE_AFFILIATE_WEBHOOK_SECRET=your_secret_key
VITE_CRON_SECRET=your_cron_secret
```

## 🤖 AI Content Generation (OpenAI)

### Current Mode: MOCK (Safe Default)

The app is currently running in **MOCK mode** which means:
- ✅ No OpenAI SDK required
- ✅ No API costs
- ✅ Site works perfectly out of the box
- ✅ Returns template-based scripts and captions

Content generation uses the Supabase Edge Function at `/functions/v1/content-generate` which checks the `OPENAI_MOCK` environment variable.

### Switching to LIVE Mode (When Ready)

**Only do this when you're ready to use real OpenAI generation:**

1. **Get your OpenAI API key** from https://platform.openai.com/api-keys

2. **Update environment variables** in your `.env`:
   ```bash
   OPENAI_MOCK=0
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Install the OpenAI package** (only needed for live mode):
   ```bash
   npm install openai
   ```

4. **Rebuild the project**:
   ```bash
   npm run build
   ```

That's it! The Edge Function will automatically switch to real OpenAI generation.

### How It Works

**Mock Mode (`OPENAI_MOCK=1` or no API key):**
- Returns placeholder scripts instantly
- No external API calls
- No costs
- Perfect for development and testing

**Live Mode (`OPENAI_MOCK=0` + valid API key):**
- Calls GPT-4o-mini with your trend and offer
- Generates high-performing TikTok scripts with hooks, value points, and CTAs
- Creates optimized hashtag captions
- Real AI-powered content generation

### Auto-Publish Feature
- Add `auto_publish: true` to content generation
- Automatically schedules posts 1 hour in the future

## 📤 Zapier/Make Publishing

### Setup Zapier Webhook
1. Go to https://zapier.com
2. Create a new Zap with "Webhooks by Zapier" trigger
3. Choose "Catch Hook"
4. Copy the webhook URL to `VITE_ZAPIER_HOOK_URL`

### Payload Structure
```json
{
  "platform": "tiktok",
  "caption": "#trending #AI #affiliate",
  "asset_url": "https://...",
  "schedule": "2025-11-03T12:00:00Z",
  "post_id": "uuid"
}
```

### Connect to Buffer/Later
- Add Buffer/Later action in your Zap
- Map the fields from the webhook payload
- Posts will automatically publish to TikTok/YouTube/Instagram

## 💰 Affiliate Conversion Tracking

### Webhook Endpoint
```
POST https://your-project.supabase.co/functions/v1/affiliate-webhook
```

### Configure Your Affiliate Network
1. **PartnerStack**: Settings → Webhooks → Add endpoint
2. **Impact**: Settings → Postback URLs → Add URL
3. **CJ/ShareASale**: Configure S2S postback

### Expected Payload
```json
{
  "network": "PartnerStack",
  "click_ref": "unique_click_id",
  "amount": 99.99,
  "commission": 19.99
}
```

### Security (Optional)
Add signature validation in the webhook by checking:
```typescript
const signature = req.headers.get('X-Webhook-Signature');
const expected = await crypto.subtle.digest('SHA-256', secret + body);
```

## 📈 Trend Discovery Automation

### Webhook Endpoint
```
POST https://your-project.supabase.co/functions/v1/trends-ingest
```

### Zapier Integration
1. Create a Zap with Google Trends/Exploding Topics
2. Add "Webhooks by Zapier" action
3. Send POST request with:
```json
{
  "topic": "AI Logo Generator",
  "source": "Exploding Topics",
  "region": "US",
  "score": 82
}
```

### Auto-Mode
Enable in your app to automatically generate content when trends are ingested.

## 🧠 Nightly Brain Cron Job

### Endpoint
```
POST https://your-project.supabase.co/functions/v1/brain-update
Authorization: Bearer YOUR_CRON_SECRET
```

### Setup Cron
**Option 1: Supabase Cron**
```sql
SELECT cron.schedule(
  'brain-update',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/brain-update',
    headers:='{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
  );
  $$
);
```

**Option 2: External Service (EasyCron/cron-job.org)**
- Schedule daily at 2 AM
- HTTP POST to the endpoint
- Add Authorization header

### What It Does
- Analyzes top performing posts by EPC and CTR
- Fetches latest trends and offers
- Aggregates conversion data
- Returns summary for monitoring

## 🔗 Click Tracking System

### Short Links
Use the `/go/:slug` route to create trackable affiliate links:
```
https://yourapp.com/go/offer-slug-123
```

### Implementation
1. Create offer with slug in the ID field
2. Share the `/go/:slug` link
3. System logs:
   - Hashed IP (privacy-compliant)
   - Hashed User-Agent
   - Timestamp
   - Post ID (if applicable)
4. Redirects to actual affiliate URL

### Query Parameter Tracking
Automatically appends `?ref=slug` to affiliate URLs for better attribution.

## ✅ Testing Your Setup

### 1. Test OpenAI Generation
- Go to Factory page
- Select trend and offer
- Click Generate
- Check for AI-generated script

### 2. Test Zapier Hook
- Trigger a manual publish
- Check Zapier dashboard for received webhook
- Verify data structure

### 3. Test Affiliate Webhook
```bash
curl -X POST https://your-project.supabase.co/functions/v1/affiliate-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "network": "Test",
    "click_ref": "test-123",
    "amount": 100,
    "commission": 20
  }'
```

### 4. Test Trend Ingest
```bash
curl -X POST https://your-project.supabase.co/functions/v1/trends-ingest \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Test Trend",
    "source": "manual",
    "score": 50,
    "region": "US"
  }'
```

## 🎯 Automation Loops

### Loop 1: Trend → Content → Post
1. Zapier detects trending topic
2. POST to `/trends-ingest`
3. Auto-generate content with OpenAI
4. Schedule via Zapier to Buffer
5. Post goes live on TikTok/YouTube

### Loop 2: Click → Conversion → Dashboard
1. User clicks `/go/:slug` link
2. Click logged to database
3. User makes purchase
4. Affiliate network sends webhook
5. Conversion recorded
6. Dashboard metrics update in real-time

### Loop 3: Performance → Learning → Next Batch
1. Cron job runs nightly
2. Analyzes top performers by EPC/CTR
3. Identifies winning trends and offers
4. Returns analysis for optimization
5. Queue next batch of content

## 🚀 Going Live

1. Add all API keys to `.env`
2. Test each integration individually
3. Enable auto-mode for trends
4. Set up cron job
5. Configure affiliate webhooks
6. Monitor dashboard for real-time metrics

Your Affiliate AI Hub is now fully automated!
