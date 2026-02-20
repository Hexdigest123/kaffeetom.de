import { db } from './db';
import { storeSettings } from './db/schema';
import { eq } from 'drizzle-orm';

const SETTINGS_ROW_ID = 1;
const DEFAULT_FLAT_RATE = 1990;
const DEFAULT_FREE_THRESHOLD = 20000;

interface ShippingConfig {
	flatRate: number;
	freeThreshold: number;
}

async function getConfig(): Promise<ShippingConfig> {
	const [row] = await db.select().from(storeSettings).where(eq(storeSettings.id, SETTINGS_ROW_ID));
	return {
		flatRate: row?.shippingFlatRate ?? DEFAULT_FLAT_RATE,
		freeThreshold: row?.shippingFreeThreshold ?? DEFAULT_FREE_THRESHOLD
	};
}

export async function calculateShipping(subtotalCents: number): Promise<{
	cost: number;
	isFree: boolean;
	freeThreshold: number;
	amountUntilFree: number;
}> {
	const config = await getConfig();
	const isFree = subtotalCents >= config.freeThreshold;

	return {
		cost: isFree ? 0 : config.flatRate,
		isFree,
		freeThreshold: config.freeThreshold,
		amountUntilFree: isFree ? 0 : config.freeThreshold - subtotalCents
	};
}
