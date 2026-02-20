import { db } from './db';
import { repairBookings, locations as locationsTable } from './db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { locations as locationConfig, type WeeklyHours, type DayHours } from '$lib/config';

const SLOT_DURATION_MINUTES = 60;
const MAX_BOOKINGS_PER_SLOT = 2;

const DAY_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function getOpeningHoursForDay(openingHours: WeeklyHours, date: Date): DayHours[] | null {
	const dayKey = DAY_MAP[date.getDay()];
	return (openingHours[dayKey] as DayHours[] | null) ?? null;
}

function generateTimeSlots(periods: DayHours[]): string[] {
	const slots: string[] = [];

	for (const period of periods) {
		const [openH, openM] = period.open.split(':').map(Number);
		const [closeH, closeM] = period.close.split(':').map(Number);

		let currentMinutes = openH * 60 + openM;
		const endMinutes = closeH * 60 + closeM;

		while (currentMinutes + SLOT_DURATION_MINUTES <= endMinutes) {
			const h = Math.floor(currentMinutes / 60);
			const m = currentMinutes % 60;
			slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
			currentMinutes += SLOT_DURATION_MINUTES;
		}
	}

	return slots;
}

export async function getAvailableSlots(
	locationSlug: string,
	dateStr: string
): Promise<{ slots: string[]; date: string; locationName: string } | null> {
	const location = locationConfig.find((l) => l.slug === locationSlug);
	if (!location) return null;

	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return null;

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	if (date < today) return null;

	const periods = getOpeningHoursForDay(location.openingHours, date);
	if (!periods) return { slots: [], date: dateStr, locationName: location.name };

	const allSlots = generateTimeSlots(periods);

	const [dbLocation] = await db
		.select({ id: locationsTable.id })
		.from(locationsTable)
		.where(eq(locationsTable.slug, locationSlug));

	if (!dbLocation) return { slots: allSlots, date: dateStr, locationName: location.name };

	const existingBookings = await db
		.select({
			timeSlot: repairBookings.preferredTimeSlot,
			count: sql<number>`count(*)::int`
		})
		.from(repairBookings)
		.where(
			and(
				eq(repairBookings.locationId, dbLocation.id),
				eq(repairBookings.preferredDate, dateStr),
				sql`${repairBookings.status} IN ('pending', 'confirmed')`
			)
		)
		.groupBy(repairBookings.preferredTimeSlot);

	const bookingCounts = new Map(existingBookings.map((b) => [b.timeSlot, b.count]));

	const availableSlots = allSlots.filter(
		(slot) => (bookingCounts.get(slot) ?? 0) < MAX_BOOKINGS_PER_SLOT
	);

	return { slots: availableSlots, date: dateStr, locationName: location.name };
}

export async function getBookedDates(
	locationSlug: string,
	month: number,
	year: number
): Promise<string[]> {
	const location = locationConfig.find((l) => l.slug === locationSlug);
	if (!location) return [];

	const [dbLocation] = await db
		.select({ id: locationsTable.id })
		.from(locationsTable)
		.where(eq(locationsTable.slug, locationSlug));

	if (!dbLocation) return [];

	const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
	const endDate =
		month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`;

	const fullDates = await db
		.select({
			date: repairBookings.preferredDate,
			totalBookings: sql<number>`count(*)::int`
		})
		.from(repairBookings)
		.where(
			and(
				eq(repairBookings.locationId, dbLocation.id),
				sql`${repairBookings.preferredDate} >= ${startDate}`,
				sql`${repairBookings.preferredDate} < ${endDate}`,
				sql`${repairBookings.status} IN ('pending', 'confirmed')`
			)
		)
		.groupBy(repairBookings.preferredDate);

	const fullyBookedDates: string[] = [];
	for (const { date, totalBookings } of fullDates) {
		const d = new Date(date);
		const periods = getOpeningHoursForDay(location.openingHours, d);
		if (!periods) continue;

		const totalSlots = generateTimeSlots(periods).length;
		if (totalBookings >= totalSlots * MAX_BOOKINGS_PER_SLOT) {
			fullyBookedDates.push(date);
		}
	}

	return fullyBookedDates;
}
