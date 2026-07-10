"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
let stripe = null;
const isMock = () => {
    return process.env.MOCK_STRIPE === 'true' || !process.env.STRIPE_SECRET_KEY;
};
const createPaymentIntent = async (amount, currency = 'usd') => {
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
            stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2024-04-10',
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
    }
    catch (error) {
        console.error('Stripe Payment Intent Error:', error);
        throw new Error('Failed to initiate payment through Stripe.');
    }
};
exports.createPaymentIntent = createPaymentIntent;
