import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { repairBookings } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin-guard';
import { bookingStatuses } from '$lib/config';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const bookings = await db
		.select({
			id: repairBookings.id,
			customerName: repairBookings.customerName,
			serviceType: repairBookings.serviceType,
			locationId: repairBookings.locationId,
			preferredDate: repairBookings.preferredDate,
			preferredTimeSlot: repairBookings.preferredTimeSlot,
			status: repairBookings.status,
			createdAt: repairBookings.createdAt
		})
		.from(repairBookings)
		.orderBy(desc(repairBookings.createdAt));

	return {
		bookingStatuses,
		bookings: bookings.map((booking) => ({
			...booking,
			createdAt: booking.createdAt.toISOString()
		}))
	};
};

export const actions: Actions = {
	confirm: async (event) => {
		requireAdmin(event);
		const id = Number.parseInt(String((await event.request.formData()).get('id') ?? ''), 10);
		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { error: 'Ungültige Buchung.' });
		}

		await db.update(repairBookings).set({ status: 'confirmed' }).where(eq(repairBookings.id, id));
		return { success: true };
	},
	reject: async (event) => {
		requireAdmin(event);
		const id = Number.parseInt(String((await event.request.formData()).get('id') ?? ''), 10);
		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { error: 'Ungültige Buchung.' });
		}

		await db.update(repairBookings).set({ status: 'rejected' }).where(eq(repairBookings.id, id));
		return { success: true };
	},
	markCompleted: async (event) => {
		requireAdmin(event);
		const id = Number.parseInt(String((await event.request.formData()).get('id') ?? ''), 10);
		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { error: 'Ungültige Buchung.' });
		}

		await db.update(repairBookings).set({ status: 'completed' }).where(eq(repairBookings.id, id));
		return { success: true };
	},
	cancel: async (event) => {
		requireAdmin(event);
		const id = Number.parseInt(String((await event.request.formData()).get('id') ?? ''), 10);
		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { error: 'Ungültige Buchung.' });
		}

		await db.update(repairBookings).set({ status: 'cancelled' }).where(eq(repairBookings.id, id));
		return { success: true };
	}
};
