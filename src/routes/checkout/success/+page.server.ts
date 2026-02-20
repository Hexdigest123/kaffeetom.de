import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const sessionId = url.searchParams.get('session_id');
	if (!sessionId) {
		return { orderNumber: null };
	}

	const [order] = await db
		.select({ orderNumber: orders.orderNumber })
		.from(orders)
		.where(eq(orders.stripeSessionId, sessionId));

	return { orderNumber: order?.orderNumber ?? null };
};
