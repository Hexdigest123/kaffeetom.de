import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { orders, orderItems, repairBookings, contactSubmissions } from '$lib/server/db/schema';
import { eq, or, desc } from 'drizzle-orm';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user!; // guaranteed by layout guard

	// Orders: match by userId OR customerEmail
	const userOrders = await db
		.select({
			id: orders.id,
			orderNumber: orders.orderNumber,
			status: orders.status,
			fulfillmentType: orders.fulfillmentType,
			totalAmount: orders.totalAmount,
			createdAt: orders.createdAt
		})
		.from(orders)
		.where(or(eq(orders.userId, user.id), eq(orders.customerEmail, user.email)))
		.orderBy(desc(orders.createdAt));

	// Repair bookings: match by email
	const userBookings = await db
		.select({
			id: repairBookings.id,
			serviceType: repairBookings.serviceType,
			machineModel: repairBookings.machineModel,
			preferredDate: repairBookings.preferredDate,
			preferredTimeSlot: repairBookings.preferredTimeSlot,
			status: repairBookings.status,
			createdAt: repairBookings.createdAt
		})
		.from(repairBookings)
		.where(eq(repairBookings.customerEmail, user.email))
		.orderBy(desc(repairBookings.createdAt));

	// Contact submissions: match by email
	const userContacts = await db
		.select({
			id: contactSubmissions.id,
			type: contactSubmissions.type,
			message: contactSubmissions.message,
			createdAt: contactSubmissions.createdAt
		})
		.from(contactSubmissions)
		.where(eq(contactSubmissions.email, user.email))
		.orderBy(desc(contactSubmissions.createdAt));

	return {
		orders: userOrders.map((o) => ({
			...o,
			createdAt: o.createdAt.toISOString()
		})),
		bookings: userBookings.map((b) => ({
			...b,
			createdAt: b.createdAt.toISOString()
		})),
		contacts: userContacts.map((c) => ({
			...c,
			createdAt: c.createdAt.toISOString()
		}))
	};
};

export const actions: Actions = {
	signOut: async (event) => {
		await auth.api.signOut({ headers: event.request.headers });
		redirect(302, '/');
	}
};
