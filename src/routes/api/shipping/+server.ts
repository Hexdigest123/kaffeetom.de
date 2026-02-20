import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { calculateShipping } from '$lib/server/shipping';

export const GET: RequestHandler = async ({ url }) => {
	const subtotal = Number.parseInt(url.searchParams.get('subtotal') ?? '0', 10);

	if (subtotal < 0) {
		return json({ cost: 0, isFree: false, freeThreshold: 20000, amountUntilFree: 20000 });
	}

	const result = await calculateShipping(subtotal);
	return json(result);
};
