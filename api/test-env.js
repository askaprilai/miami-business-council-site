// Test endpoint to check environment variables
export default async function handler(req, res) {
  const envVars = {
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasStripePublishable: !!process.env.STRIPE_PUBLISHABLE_KEY,
    hasDomain: !!process.env.DOMAIN,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasResend: !!process.env.RESEND_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    // Show first 10 chars of secret key if it exists
    secretKeyPreview: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'NOT SET'
  };

  return res.status(200).json(envVars);
}
