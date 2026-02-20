import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe } from '$lib/server/stripe';
import { db } from '$lib/server/db';
import { orders, orderItems, products } from '$lib/server/db/schema';
import { isShopEnabled } from '$lib/server/store-status';
import { generateOrderNumber } from '$lib/server/order-number';
import { calculateShipping } from '$lib/server/shipping';
import { computeVisitorId } from '$lib/server/tracking';
import { eq, inArray } from 'drizzle-orm';

interface CartItemInput {
	productId: number;
	quantity: number;
}

interface CheckoutBody {
	items: CartItemInput[];
	fulfillmentType: 'pickup' | 'shipping';
	locationId?: string;
	customerName: string;
	customerPhone: string;
	customerEmail?: string;
	shippingAddress?: { street: string; city: string; zip: string };
	notes?: string;
}

export const POST: RequestHandler = async (event) => {
	const { request, url } = event;

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const {
		items,
		fulfillmentType,
		locationId,
		customerName,
		customerPhone,
		customerEmail,
		shippingAddress,
		notes
	} = body as CheckoutBody;

	if (!(await isShopEnabled())) {
		throw error(503, 'Online ordering is currently disabled');
	}

	if (
		!Array.isArray(items) ||
		items.length === 0 ||
		!fulfillmentType ||
		!customerName ||
		!customerPhone
	) {
		throw error(400, 'Missing required fields');
	}

	if (!['pickup', 'shipping'].includes(fulfillmentType)) {
		throw error(400, 'Invalid fulfillment type');
	}

	if (fulfillmentType === 'pickup' && !locationId) {
		throw error(400, 'Location required for pickup');
	}

	if (fulfillmentType === 'shipping') {
		if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.zip) {
			throw error(400, 'Shipping address required');
		}
	}

	const productIds = items.map((i) => i.productId);
	const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));

	const productMap = new Map(dbProducts.map((p) => [p.id, p]));

	const validatedItems: Array<{
		product: (typeof dbProducts)[0];
		quantity: number;
	}> = [];
	let subtotalCents = 0;

	for (const item of items) {
		const product = productMap.get(item.productId);

		if (!product) {
			throw error(400, `Product not found: ${item.productId}`);
		}

		if (product.status !== 'available') {
			throw error(400, `Product not available: ${product.name}`);
		}

		if (!product.stripePriceId) {
			throw error(400, `Product not configured for checkout: ${product.name}`);
		}

		const quantity = Math.max(1, Math.min(10, Math.floor(item.quantity)));
		subtotalCents += product.price * quantity;
		validatedItems.push({ product, quantity });
	}

	let shippingCost = 0;
	if (fulfillmentType === 'shipping') {
		const shipping = await calculateShipping(subtotalCents);
		shippingCost = shipping.cost;
	}

	const totalAmount = subtotalCents + shippingCost;
	const orderNumber = await generateOrderNumber();
	const visitorId = computeVisitorId(event);

	const locationDbId = fulfillmentType === 'pickup' ? (locationId === 'helmstadt' ? 1 : 2) : null;

	const [createdOrder] = await db
		.insert(orders)
		.values({
			orderNumber,
			status: 'pending',
			fulfillmentType,
			locationId: locationDbId,
			customerName,
			customerPhone,
			customerEmail: customerEmail || null,
			shippingAddress: fulfillmentType === 'shipping' ? shippingAddress : null,
			totalAmount,
			shippingCost,
			visitorId,
			notes: notes || null
		})
		.returning();

	await db.insert(orderItems).values(
		validatedItems.map((item) => ({
			orderId: createdOrder.id,
			productId: item.product.id,
			productName: item.product.name,
			quantity: item.quantity,
			unitPrice: item.product.price
		}))
	);

	const lineItems: Array<
		| { price: string; quantity: number }
		| {
				price_data: { currency: string; product_data: { name: string }; unit_amount: number };
				quantity: number;
		  }
	> = validatedItems.map((item) => ({
		price: item.product.stripePriceId!,
		quantity: item.quantity
	}));

	if (fulfillmentType === 'shipping' && shippingCost > 0) {
		lineItems.push({
			price_data: {
				currency: 'eur',
				product_data: { name: 'Versandkosten' },
				unit_amount: shippingCost
			},
			quantity: 1
		});
	}

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		mode: 'payment',
		currency: 'eur',
		line_items: lineItems,
		metadata: {
			order_id: String(createdOrder.id),
			order_number: orderNumber,
			fulfillment_type: fulfillmentType,
			customer_name: customerName,
			customer_phone: customerPhone
		},
		success_url: `${url.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${url.origin}/checkout/cancel`
	});

	await db
		.update(orders)
		.set({ stripeSessionId: session.id })
		.where(eq(orders.id, createdOrder.id));

	return json({ url: session.url });
};
