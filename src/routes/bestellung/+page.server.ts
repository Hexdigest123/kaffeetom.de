import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { orderItems, orders } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const orderIdParam = url.searchParams.get('id')?.trim().toUpperCase();
	if (!orderIdParam) {
		return { order: null, items: [] };
	}

	const [order] = await db
		.select({
			id: orders.id,
			orderNumber: orders.orderNumber,
			status: orders.status,
			fulfillmentType: orders.fulfillmentType,
			customerName: orders.customerName,
			totalAmount: orders.totalAmount,
			shippingCost: orders.shippingCost,
			createdAt: orders.createdAt,
			paidAt: orders.paidAt,
			fulfilledAt: orders.fulfilledAt,
			shippedAt: orders.shippedAt,
			cancellationRequestedAt: orders.cancellationRequestedAt
		})
		.from(orders)
		.where(eq(orders.orderNumber, orderIdParam));

	if (!order) {
		return { order: null, items: [], notFound: true };
	}

	const items = await db
		.select({
			id: orderItems.id,
			productName: orderItems.productName,
			quantity: orderItems.quantity,
			unitPrice: orderItems.unitPrice
		})
		.from(orderItems)
		.where(eq(orderItems.orderId, order.id));

	return {
		order: {
			...order,
			createdAt: order.createdAt.toISOString(),
			paidAt: order.paidAt?.toISOString() ?? null,
			fulfilledAt: order.fulfilledAt?.toISOString() ?? null,
			shippedAt: order.shippedAt?.toISOString() ?? null,
			cancellationRequestedAt: order.cancellationRequestedAt?.toISOString() ?? null
		},
		items
	};
};

export const actions: Actions = {
	requestCancellation: async ({ request }) => {
		const data = await request.formData();
		const orderId = Number.parseInt(String(data.get('orderId')), 10);

		if (!orderId) {
			return fail(400, { error: 'Missing order ID' });
		}

		const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
		if (!order) {
			return fail(404, { error: 'Order not found' });
		}

		if (!['paid', 'pending'].includes(order.status)) {
			return fail(400, { error: 'Order cannot be cancelled in its current status' });
		}

		if (order.status === 'cancellation_requested') {
			return fail(400, { error: 'Cancellation already requested' });
		}

		await db
			.update(orders)
			.set({
				status: 'cancellation_requested',
				cancellationRequestedAt: new Date()
			})
			.where(eq(orders.id, orderId));

		return { success: true };
	}
};
