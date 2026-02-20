import { json } from '@sveltejs/kit';
import { getAvailableSlots } from '$lib/server/booking';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const locationId = url.searchParams.get('locationId');
	const date = url.searchParams.get('date');

	if (!locationId || !date) {
		return json({ error: 'Missing locationId or date' }, { status: 400 });
	}

	const result = await getAvailableSlots(locationId, date);
	return json({ slots: result?.slots ?? [] });
};
