import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products, productImages } from '$lib/server/db/schema';
import { eq, or, ilike, and, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';

	if (q.length < 2) {
		return json({ results: [] });
	}

	const term = `%${q}%`;

	const matched = await db
		.select()
		.from(products)
		.where(
			and(
				eq(products.status, 'available'),
				or(
					ilike(products.name, term),
					ilike(products.nameEn, term),
					ilike(products.description, term),
					ilike(products.descriptionEn, term),
					ilike(products.modelSeries, term)
				)
			)
		)
		.orderBy(desc(products.createdAt))
		.limit(8);

	const productIds = matched.map((p) => p.id);
	const images =
		productIds.length > 0
			? await db.select().from(productImages).where(eq(productImages.sortOrder, 0))
			: [];

	const imageMap: Record<number, string> = {};
	for (const img of images) {
		if (productIds.includes(img.productId) && !imageMap[img.productId]) {
			imageMap[img.productId] = img.url;
		}
	}

	const results = matched.map((p) => ({
		id: p.id,
		name: p.name,
		nameEn: p.nameEn,
		price: p.price,
		modelSeries: p.modelSeries,
		qualityTier: p.qualityTier,
		image: imageMap[p.id] ?? null
	}));

	return json({ results });
};
