// Track newsletter opens and clicks
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { action, id, url } = req.query;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Still serve response even if DB fails
    if (action === 'open') {
      return servePixel(res);
    }
    return res.redirect(url || 'https://miamibusinesscouncil.com');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Parse tracking ID: campaignId_subscriberId
    const [campaignId, subscriberId] = (id || '').split('_');

    if (action === 'open' && campaignId && subscriberId !== 'test') {
      // Record open
      await supabase.from('newsletter_events').insert({
        campaign_id: campaignId,
        subscriber_id: subscriberId,
        event_type: 'open',
        created_at: new Date().toISOString()
      }).catch(() => {}); // Ignore errors

      // Update campaign open count
      await supabase.rpc('increment_campaign_opens', { cid: campaignId }).catch(() => {});

      // Update subscriber total opens
      await supabase.rpc('increment_subscriber_opens', { sid: subscriberId }).catch(() => {});

      return servePixel(res);
    }

    if (action === 'click' && url) {
      if (campaignId && subscriberId !== 'test') {
        // Record click
        await supabase.from('newsletter_events').insert({
          campaign_id: campaignId,
          subscriber_id: subscriberId,
          event_type: 'click',
          url: url,
          created_at: new Date().toISOString()
        }).catch(() => {});

        // Update campaign click count
        await supabase.rpc('increment_campaign_clicks', { cid: campaignId }).catch(() => {});

        // Update subscriber total clicks
        await supabase.rpc('increment_subscriber_clicks', { sid: subscriberId }).catch(() => {});
      }

      // Redirect to actual URL
      return res.redirect(decodeURIComponent(url));
    }

    // Default: serve pixel or redirect
    if (action === 'open') {
      return servePixel(res);
    }
    return res.redirect(url || 'https://miamibusinesscouncil.com');

  } catch (error) {
    console.error('Tracking error:', error);
    if (action === 'open') {
      return servePixel(res);
    }
    return res.redirect(url || 'https://miamibusinesscouncil.com');
  }
}

function servePixel(res) {
  // 1x1 transparent GIF
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res.status(200).send(pixel);
}
