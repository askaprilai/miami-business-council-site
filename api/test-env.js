// Test endpoint to check environment variables
export default async function handler(req, res) {
  const envVars = {
    // Stripe
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasStripePublishable: !!process.env.STRIPE_PUBLISHABLE_KEY,
    hasStripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    // Supabase
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseServiceKey: !!(process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
    // Other
    hasResend: !!process.env.RESEND_API_KEY,
    hasDomain: !!process.env.DOMAIN,
    // Environment
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    // Previews (first 10 chars for debugging)
    stripeKeyPreview: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'NOT SET',
    webhookSecretPreview: process.env.STRIPE_WEBHOOK_SECRET ? process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10) + '...' : 'NOT SET'
  };

  return res.status(200).json(envVars);
}
