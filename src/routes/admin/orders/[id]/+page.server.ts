import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { orderItems, orders } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin-guard';
import { stripe } from '$lib/server/stripe';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

async function updateOrderStatus(
	orderId: number,
	status: 'in_process' | 'fulfilled' | 'shipped' | 'cancelled'
) {
	const [existing] = await db
		.select({ status: orders.status })
		.from(orders)
		.where(eq(orders.id, orderId));

	if (!existing) {
		return { error: 'Bestellung nicht gefunden.' };
	}
	if (existing.status === 'refunded') {
		return { error: 'Erstattete Bestellungen können nicht geändert werden.' };
	}

	const updates: {
		status: 'in_process' | 'fulfilled' | 'shipped' | 'cancelled';
		fulfilledAt?: Date | null;
		shippedAt?: Date | null;
		cancellationRequestedAt?: Date | null;
	} = { status };

	if (status === 'fulfilled') {
		updates.fulfilledAt = new Date();
	}
	if (status === 'shipped') {
		updates.shippedAt = new Date();
	}
	if (status === 'cancelled') {
		updates.cancellationRequestedAt = null;
	}

	await db.update(orders).set(updates).where(eq(orders.id, orderId));
	return { success: true };
}

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);
	const id = Number.parseInt(event.params.id, 10);

	if (!Number.isInteger(id) || id <= 0) {
		error(404, 'Bestellung nicht gefunden.');
	}

	const [order] = await db.select().from(orders).where(eq(orders.id, id));
	if (!order) {
		error(404, 'Bestellung nicht gefunden.');
	}

	const items = await db
		.select({
			id: orderItems.id,
			productName: orderItems.productName,
			quantity: orderItems.quantity,
			unitPrice: orderItems.unitPrice,
			createdAt: orderItems.createdAt
		})
		.from(orderItems)
		.where(eq(orderItems.orderId, id));

	return {
		order: {
			...order,
			createdAt: order.createdAt.toISOString(),
			paidAt: order.paidAt?.toISOString() ?? null,
			fulfilledAt: order.fulfilledAt?.toISOString() ?? null,
			shippedAt: order.shippedAt?.toISOString() ?? null,
			cancellationRequestedAt: order.cancellationRequestedAt?.toISOString() ?? null
		},
		items: items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))
	};
};

function parseOrderId(formData: FormData): number | null {
	const orderId = Number.parseInt(String(formData.get('orderId') ?? ''), 10);
	if (!Number.isInteger(orderId) || orderId <= 0) return null;
	return orderId;
}

export const actions: Actions = {
	markInProcess: async (event) => {
		requireAdmin(event);
		const orderId = parseOrderId(await event.request.formData());
		if (!orderId) return fail(400, { error: 'Ungültige Bestellung.' });
		const result = await updateOrderStatus(orderId, 'in_process');
		if ('error' in result) return fail(400, result);
		return { success: true };
	},
	markFulfilled: async (event) => {
		requireAdmin(event);
		const orderId = parseOrderId(await event.request.formData());
		if (!orderId) return fail(400, { error: 'Ungültige Bestellung.' });
		const result = await updateOrderStatus(orderId, 'fulfilled');
		if ('error' in result) return fail(400, result);
		return { success: true };
	},
	markShipped: async (event) => {
		requireAdmin(event);
		const orderId = parseOrderId(await event.request.formData());
		if (!orderId) return fail(400, { error: 'Ungültige Bestellung.' });
		const result = await updateOrderStatus(orderId, 'shipped');
		if ('error' in result) return fail(400, result);
		return { success: true };
	},
	markCancelled: async (event) => {
		requireAdmin(event);
		const orderId = parseOrderId(await event.request.formData());
		if (!orderId) return fail(400, { error: 'Ungültige Bestellung.' });
		const result = await updateOrderStatus(orderId, 'cancelled');
		if ('error' in result) return fail(400, result);
		return { success: true };
	},
	refund: async (event) => {
		requireAdmin(event);
		const orderId = parseOrderId(await event.request.formData());
		if (!orderId) return fail(400, { error: 'Ungültige Bestellung.' });

		const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
		if (!order) {
			return fail(404, { error: 'Bestellung nicht gefunden.' });
		}

		if (
			!['paid', 'in_process', 'fulfilled', 'shipped', 'cancellation_requested'].includes(
				order.status
			)
		) {
			return fail(400, {
				error: `Bestellung mit Status „${order.status}" kann nicht erstattet werden.`
			});
		}

		if (!order.stripePaymentIntentId) {
			await db.update(orders).set({ status: 'cancelled' }).where(eq(orders.id, orderId));
			return { success: true, refunded: false, cancelled: true };
		}

		try {
			await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
			await db.update(orders).set({ status: 'refunded' }).where(eq(orders.id, orderId));
			return { success: true, refunded: true };
		} catch {
			return fail(500, { error: 'Stripe-Erstattung fehlgeschlagen.' });
		}
	}
};
