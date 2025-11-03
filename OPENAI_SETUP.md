# OpenAI Integration - Mock vs Live Mode

## Current Status: MOCK MODE ✅

Your site is currently running in **mock mode** and works perfectly without OpenAI!

### What This Means

- ✅ **No build errors** - The OpenAI SDK is NOT imported in your client code
- ✅ **Site works end-to-end** - All features are functional
- ✅ **No API costs** - Mock responses are instant and free
- ✅ **Safe for development** - Test everything without worrying about API limits

### Mock Mode Behavior

When you generate content in the Factory page:
- Returns template-based scripts like: `"MOCK SCRIPT: This trend... [Hook] [Value 1] [Value 2] [Value 3] [CTA]"`
- Provides hashtag captions based on your trend and offer
- No external API calls are made
- Everything is processed by the Supabase Edge Function

## Architecture

### Where OpenAI Lives

The OpenAI SDK is **ONLY** loaded in the Supabase Edge Function at:
```
/supabase/functions/content-generate/index.ts
```

It is **NEVER** imported in:
- ❌ Client/UI components
- ❌ Shared libraries (src/lib/*)
- ❌ Page components (src/pages/*)
- ❌ Any browser-side code

This architecture prevents build errors and keeps the OpenAI dependency isolated to the server.

### How Content Generation Works

```
User clicks "Generate" in Factory
    ↓
Client calls API function (src/lib/api.ts)
    ↓
Fetch request to Supabase Edge Function
    ↓
Edge Function checks OPENAI_MOCK env var
    ↓
If MOCK=1: Return template response
If MOCK=0: Load OpenAI SDK and generate
    ↓
Response sent back to client
    ↓
Content saved to database
```

## Switching to Live Mode (When Ready)

**⚠️ Only follow these steps when you're ready for real OpenAI generation:**

### Step 1: Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it securely

### Step 2: Update Environment Variables

Edit your `.env` file in the **Supabase Dashboard** (not your local .env):

```bash
# Set mock mode to OFF
OPENAI_MOCK=0

# Add your real API key
OPENAI_API_KEY=sk-your-actual-key-here
```

**Important:** These environment variables are set in the Supabase Edge Function settings, not in your local .env file.

To update them:
1. Go to your Supabase Dashboard
2. Navigate to Edge Functions
3. Click on `content-generate`
4. Go to Settings → Environment Variables
5. Update or add:
   - `OPENAI_MOCK` = `0`
   - `OPENAI_API_KEY` = `sk-your-key-here`

### Step 3: Redeploy Edge Function (Optional)

The environment variables take effect immediately, but if you want to ensure they're loaded:

```bash
# If you have Supabase CLI (optional)
supabase functions deploy content-generate
```

Or simply trigger a new deployment through the dashboard.

### Step 4: Test It

1. Go to the Factory page
2. Select a trend and offer
3. Click "Generate Script"
4. You should now see real AI-generated content instead of mock templates

### Step 5: Monitor Usage

Watch your OpenAI usage at https://platform.openai.com/usage

Model used: `gpt-4o-mini` (cost-effective for this use case)

## Switching Back to Mock Mode

If you want to return to mock mode (stop OpenAI API calls):

```bash
# In Supabase Edge Function settings
OPENAI_MOCK=1
```

That's it! No redeployment needed.

## Cost Estimates

Using GPT-4o-mini:
- ~$0.15 per million input tokens
- ~$0.60 per million output tokens

Typical content generation:
- Input: ~150 tokens (your prompt)
- Output: ~200 tokens (script + caption)
- **Cost per generation: ~$0.0001** (1/100th of a cent)

Even with 1,000 generations: ~$0.10 total

## Troubleshooting

### "Mock script" still appearing in Live mode

1. Check that `OPENAI_MOCK=0` in Supabase Edge Function settings
2. Verify `OPENAI_API_KEY` is set correctly
3. Check Edge Function logs for errors

### Build errors mentioning "openai"

This should NOT happen because OpenAI is only in the Edge Function. If you see this:
1. Make sure you didn't accidentally import `openai` in any src/* files
2. Check that `src/lib/api.ts` only uses fetch() to call the Edge Function
3. Run `npm run build` to verify no import errors

### API errors in Live mode

Check the Edge Function logs in Supabase Dashboard:
- Invalid API key errors
- Rate limit errors (if you exceed free tier)
- Network/timeout issues

## Summary

✅ **Current state:** Mock mode, fully functional, no OpenAI needed
✅ **To enable OpenAI:** Update env vars in Supabase Edge Function settings only
✅ **Zero risk:** No client-side imports, can switch modes anytime
✅ **Cost-effective:** GPT-4o-mini is extremely cheap (~$0.0001 per generation)

You're all set! The site works great in mock mode, and when you're ready for AI generation, just flip the switch in Supabase settings.
