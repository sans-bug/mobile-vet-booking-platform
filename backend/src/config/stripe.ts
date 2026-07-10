import Stripe from 'stripe';

let stripe: Stripe | null = null;

const isMock = (): boolean => {
  return process.env.MOCK_STRIPE === 'true' || !process.env.STRIPE_SECRET_KEY;
};

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd'
): Promise<{ id: string; clientSecret: string }> => {
  if (isMock()) {
    // Generate mock Stripe payment intent
    const mockId = `pi_mock_${Math.random().toString(36).substring(2, 15)}`;
    return {
      id: mockId,
      clientSecret: `${mockId}_secret_${Math.random().toString(36).substring(2, 10)}`,
    };
  }

  try {
    if (!stripe) {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2024-04-10' as any,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency,
      metadata: { integration_check: 'accept_a_payment' },
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || '',
    };
  } catch (error) {
    console.error('Stripe Payment Intent Error:', error);
    throw new Error('Failed to initiate payment through Stripe.');
  }
};
