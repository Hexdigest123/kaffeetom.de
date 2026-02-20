import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe } from '$lib/server/stripe';
import { db } from '$lib/server/db';
import { orders, orderItems } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { sendOrderConfirmation } from '$lib/server/email';
import type Stripe from 'stripe';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		throw error(400, 'Missing stripe-signature header');
	}

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET!);
	} catch (err) {
		console.error('Webhook signature verification failed:', err);
		throw error(400, 'Webhook signature verification failed');
	}

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object as Stripe.Checkout.Session;
			const orderId = session.metadata?.order_id;

			if (orderId) {
				const orderIdNum = Number.parseInt(orderId, 10);

				await db
					.update(orders)
					.set({
						status: 'paid',
						stripePaymentIntentId:
							typeof session.payment_intent === 'string'
								? session.payment_intent
								: (session.payment_intent?.id ?? null),
						paidAt: new Date()
					})
					.where(eq(orders.id, orderIdNum));

				try {
					const [order] = await db.select().from(orders).where(eq(orders.id, orderIdNum));

					if (order) {
						const items = await db
							.select()
							.from(orderItems)
							.where(eq(orderItems.orderId, orderIdNum));

						const locationName =
							order.fulfillmentType === 'pickup'
								? order.locationId === 1
									? 'Helmstadt'
									: 'Mannheim'
								: undefined;

						await sendOrderConfirmation({
							orderNumber: order.orderNumber,
							customerName: order.customerName,
							customerEmail: order.customerEmail ?? '',
							items: items.map((i) => ({
								name: i.productName,
								quantity: i.quantity,
								unitPrice: i.unitPrice
							})),
							totalAmount: order.totalAmount,
							shippingCost: order.shippingCost,
							fulfillmentType: order.fulfillmentType as 'pickup' | 'shipping',
							shippingAddress: order.shippingAddress as {
								street: string;
								city: string;
								zip: string;
							} | null,
							locationName
						});
					}
				} catch (emailErr) {
					console.error('Failed to send order confirmation email:', emailErr);
				}
			}
			break;
		}

		case 'checkout.session.expired': {
			const session = event.data.object as Stripe.Checkout.Session;
			const orderId = session.metadata?.order_id;

			if (orderId) {
				await db
					.update(orders)
					.set({ status: 'cancelled' })
					.where(eq(orders.id, Number.parseInt(orderId, 10)));
			}
			break;
		}

		case 'charge.refunded': {
			const charge = event.data.object as Stripe.Charge;
			const paymentIntentId =
				typeof charge.payment_intent === 'string'
					? charge.payment_intent
					: charge.payment_intent?.id;

			if (paymentIntentId) {
				await db
					.update(orders)
					.set({ status: 'refunded' })
					.where(eq(orders.stripePaymentIntentId, paymentIntentId));
			}
			break;
		}
	}

	return json({ received: true });
};
