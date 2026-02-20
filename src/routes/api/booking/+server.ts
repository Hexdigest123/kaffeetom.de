import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { repairBookings } from '$lib/server/db/schema';
import { sendBookingConfirmation } from '$lib/server/email';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	const {
		locationId,
		serviceType,
		preferredDate,
		preferredTimeSlot,
		customerName,
		customerEmail,
		customerPhone,
		machineModel,
		notes
	} = body;

	if (
		!locationId ||
		!serviceType ||
		!preferredDate ||
		!preferredTimeSlot ||
		!customerName ||
		!customerEmail ||
		!customerPhone
	) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	const locationDbId = locationId === 'helmstadt' ? 1 : 2;

	const [booking] = await db
		.insert(repairBookings)
		.values({
			customerName,
			customerEmail,
			customerPhone,
			serviceType,
			machineModel: machineModel || null,
			locationId: locationDbId,
			preferredDate,
			preferredTimeSlot,
			notes: notes || null,
			status: 'confirmed'
		})
		.returning();

	try {
		await sendBookingConfirmation({
			customerName,
			customerEmail,
			serviceType,
			preferredDate,
			preferredTimeSlot,
			locationName: locationId === 'helmstadt' ? 'Helmstadt' : 'Mannheim'
		});
	} catch {
		// email delivery is best-effort
	}

	return json({ success: true, bookingId: booking.id });
};
