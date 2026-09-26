import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic'; // Prevent static generation during build

export async function GET(request: Request) {
  // Initialize Stripe inside the handler to avoid build-time errors if ENV is missing
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2023-10-16' as any,
  });

  const { searchParams } = new URL(request.url);
  const plan = searchParams.get('plan');
  // Check if we want monthly or yearly billing
  const billing = searchParams.get('billing') || 'yearly';

  try {
    let priceData: any = {};
    let mode: 'payment' | 'subscription' = 'subscription';

    if (plan === 'pro') {
      priceData = {
        currency: 'eur',
        product_data: {
          name: 'LinkdnForge Pro',
          description: billing === 'yearly' ? 'Offre de lancement (-34%)' : 'Abonnement Pro Mensuel',
        },
        // Pro: 19€/mo if yearly (228€ total), 29€/mo if monthly
        unit_amount: billing === 'yearly' ? 22800 : 2900,
        recurring: {
          interval: billing === 'yearly' ? 'year' : 'month',
        },
      };
    } else {
      priceData = {
        currency: 'eur',
        product_data: {
          name: 'LinkdnForge Starter',
          description: 'Abonnement Starter',
        },
        // Starter: 9€/mo if yearly (108€ total), 14€/mo if monthly
        unit_amount: billing === 'yearly' ? 10800 : 1400,
        recurring: {
          interval: billing === 'yearly' ? 'year' : 'month',
        },
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode,
      subscription_data: {
        trial_period_days: 14,
      },
      metadata: {
        plan: plan || 'starter',
      },
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/fr/onboarding?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/fr/pricing?canceled=true`,
    });

    return NextResponse.redirect(session.url as string, 303);
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
