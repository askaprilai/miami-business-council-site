// Newsletter admin - get subscribers and campaigns
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { action } = req.query;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    if (action === 'subscribers') {
      const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ subscribers: subscribers || [] });
    }

    if (action === 'campaigns') {
      const { data: campaigns, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return res.status(200).json({ campaigns: campaigns || [] });
    }

    if (action === 'export') {
      const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('email, subscribed_at, status, source, total_opens, total_clicks')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;

      // Create CSV
      const headers = ['Email', 'Subscribed', 'Status', 'Source', 'Opens', 'Clicks'];
      const rows = (subscribers || []).map(s => [
        s.email,
        new Date(s.subscribed_at).toLocaleDateString(),
        s.status,
        s.source || 'blog',
        s.total_opens || 0,
        s.total_clicks || 0
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=newsletter-subscribers.csv');
      return res.status(200).send(csv);
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Newsletter admin error:', error);
    return res.status(500).json({ error: error.message });
  }
}
