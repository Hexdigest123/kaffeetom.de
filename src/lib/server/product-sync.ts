import { stripe } from './stripe';
import { db } from './db';
import { products } from './db/schema';
import { eq } from 'drizzle-orm';
import { formatPrice } from '$lib/config';

export async function syncProductToStripe(productId: number) {
	const [product] = await db.select().from(products).where(eq(products.id, productId));
	if (!product) throw new Error(`Product ${productId} not found`);

	let stripeProductId = product.stripeProductId;
	let stripePriceId = product.stripePriceId;

	if (!stripeProductId) {
		const stripeProduct = await stripe.products.create({
			name: product.name,
			description: product.description ?? undefined,
			metadata: {
				kaffeetom_product_id: String(product.id),
				quality_tier: product.qualityTier,
				model_series: product.modelSeries ?? ''
			}
		});
		stripeProductId = stripeProduct.id;
	} else {
		await stripe.products.update(stripeProductId, {
			name: product.name,
			description: product.description ?? undefined,
			metadata: {
				kaffeetom_product_id: String(product.id),
				quality_tier: product.qualityTier,
				model_series: product.modelSeries ?? ''
			}
		});
	}

	if (stripePriceId) {
		const existingPrice = await stripe.prices.retrieve(stripePriceId);
		if (existingPrice.unit_amount !== product.price) {
			await stripe.prices.update(stripePriceId, { active: false });
			stripePriceId = null;
		}
	}

	if (!stripePriceId) {
		const newPrice = await stripe.prices.create({
			product: stripeProductId,
			unit_amount: product.price,
			currency: 'eur',
			metadata: {
				display_price: formatPrice(product.price)
			}
		});
		stripePriceId = newPrice.id;
	}

	await db
		.update(products)
		.set({ stripeProductId, stripePriceId, updatedAt: new Date() })
		.where(eq(products.id, productId));

	return { stripeProductId, stripePriceId };
}

export async function archiveStripeProduct(productId: number) {
	const [product] = await db.select().from(products).where(eq(products.id, productId));
	if (!product) return;

	if (product.stripePriceId) {
		await stripe.prices.update(product.stripePriceId, { active: false });
	}
	if (product.stripeProductId) {
		await stripe.products.update(product.stripeProductId, { active: false });
	}
}
