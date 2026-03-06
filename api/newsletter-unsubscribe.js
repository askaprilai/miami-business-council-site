// Unsubscribe from newsletter
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send('Email required');
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).send('Service unavailable');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    await supabase
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed' })
      .eq('email', email.toLowerCase());

    // Show confirmation page
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed | Miami Business Council</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #0a0a0b;
            color: #e8eaed;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            text-align: center;
            padding: 2rem;
          }
          .container {
            max-width: 400px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 16px;
            padding: 3rem;
          }
          h1 { color: #d4af37; font-weight: 300; }
          p { color: #ccc; line-height: 1.6; }
          a { color: #d4af37; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Unsubscribed</h1>
          <p>You've been unsubscribed from our newsletter.</p>
          <p>We're sorry to see you go! You can always resubscribe on our <a href="https://miamibusinesscouncil.com/blog">blog</a>.</p>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).send('Failed to unsubscribe');
  }
}
