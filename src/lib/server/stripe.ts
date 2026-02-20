import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
	if (!_stripe) {
		if (!env.STRIPE_SECRET_KEY) {
			throw new Error('STRIPE_SECRET_KEY environment variable is not set');
		}
		_stripe = new Stripe(env.STRIPE_SECRET_KEY);
	}
	return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
	get(_, prop) {
		return Reflect.get(getStripe(), prop);
	}
});

export function getStripePublishableKey(): string {
	const key = env.STRIPE_PUBLISHABLE_KEY;
	if (!key) {
		throw new Error('STRIPE_PUBLISHABLE_KEY environment variable is not set');
	}
	return key;
}
