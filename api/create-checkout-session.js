// Create Stripe Checkout Session for membership payments
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      businessName,
      jobTitle,
      industry,
      employeeCount,
      incorporated,
      membershipType,
      billingFrequency,
      interests
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !membershipType || !billingFrequency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get Stripe secret key
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return res.status(500).json({ error: 'Payment service not configured' });
    }

    // Import Stripe dynamically (Vercel serverless functions)
    const stripe = require('stripe')(stripeSecretKey);

    // Price mapping for test mode
    // TODO: Replace these with your actual Stripe Price IDs from dashboard
    // For now, we'll create prices dynamically
    const prices = {
      individual: {
        annual: { amount: 25000, interval: null }, // $250.00
        monthly: { amount: 2500, interval: 'month' } // $25.00/month
      },
      nonprofit: {
        annual: { amount: 35000, interval: null }, // $350.00
        monthly: { amount: 3500, interval: 'month' } // $35.00/month
      },
      business: {
        annual: { amount: 45000, interval: null }, // $450.00
        monthly: { amount: 4500, interval: 'month' } // $45.00/month
      }
    };

    const priceConfig = prices[membershipType]?.[billingFrequency];
    if (!priceConfig) {
      return res.status(400).json({ error: 'Invalid membership type or billing frequency' });
    }

    // Determine session mode based on billing frequency
    const mode = billingFrequency === 'monthly' ? 'subscription' : 'payment';

    // Create line item
    const lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Membership`,
          description: `Miami Business Council ${membershipType} membership - ${billingFrequency === 'monthly' ? 'Monthly' : 'Annual'} billing`,
        },
        unit_amount: priceConfig.amount,
        ...(priceConfig.interval && {
          recurring: {
            interval: priceConfig.interval
          }
        })
      },
      quantity: 1
    }];

    // Get domain for URLs
    const domain = process.env.DOMAIN || 'https://miamibusinesscouncil.com';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: mode,
      line_items: lineItems,
      success_url: `${domain}/membership-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/membership-signup-test.html?canceled=true`,
      customer_email: email,
      metadata: {
        // Store all form data for webhook processing
        firstName,
        lastName,
        email,
        phone,
        businessName,
        jobTitle,
        industry: industry || '',
        employeeCount,
        incorporated,
        membershipType,
        billingFrequency,
        interests: interests || ''
      }
    });

    // Return the checkout session URL
    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Stripe Checkout Session creation error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
}
