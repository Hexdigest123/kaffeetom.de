import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { orders, orderItems } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const orderNumber = url.searchParams.get('orderNumber')?.trim().toUpperCase();

	if (!orderNumber) {
		return json({ error: 'Missing order number' }, { status: 400 });
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
		.where(eq(orders.orderNumber, orderNumber));

	if (!order) {
		return json({ error: 'Order not found' }, { status: 404 });
	}

	const items = await db
		.select({
			productName: orderItems.productName,
			quantity: orderItems.quantity,
			unitPrice: orderItems.unitPrice
		})
		.from(orderItems)
		.where(eq(orderItems.orderId, order.id));

	return json({
		order: {
			...order,
			createdAt: order.createdAt.toISOString(),
			paidAt: order.paidAt?.toISOString() ?? null,
			fulfilledAt: order.fulfilledAt?.toISOString() ?? null,
			shippedAt: order.shippedAt?.toISOString() ?? null,
			cancellationRequestedAt: order.cancellationRequestedAt?.toISOString() ?? null
		},
		items
	});
};
