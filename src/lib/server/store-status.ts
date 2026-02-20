import { db } from '$lib/server/db';
import { storeSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

const REQUIRED_STRIPE_KEYS = [
	'STRIPE_SECRET_KEY',
	'STRIPE_PUBLISHABLE_KEY',
	'STRIPE_WEBHOOK_SECRET'
] as const;

export function getStripeConfigStatus(): { configured: boolean; missingKeys: string[] } {
	const missing = REQUIRED_STRIPE_KEYS.filter((key) => !env[key]);
	return { configured: missing.length === 0, missingKeys: [...missing] };
}

const SETTINGS_ROW_ID = 1;
const TIMEZONE = 'Europe/Berlin';

function isWithinBusinessHours(): boolean {
	const now = new Date();
	const berlinTime = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
	const day = berlinTime.getDay();
	const hour = berlinTime.getHours();

	if (day === 0 || day === 3 || day === 6) return false;
	if (day === 4) return (hour >= 9 && hour < 12) || (hour >= 16 && hour < 19);
	return (hour >= 9 && hour < 12) || (hour >= 14 && hour < 17);
}

async function getRow() {
	const [row] = await db.select().from(storeSettings).where(eq(storeSettings.id, SETTINGS_ROW_ID));
	return row ?? null;
}

export async function isStoreOpen(): Promise<boolean> {
	const row = await getRow();
	if (!row) return isWithinBusinessHours();
	if (row.mode === 'manual') return row.isOpen === 1;
	return isWithinBusinessHours();
}

export async function isShopEnabled(): Promise<boolean> {
	const { configured } = getStripeConfigStatus();
	if (!configured) return false;
	const row = await getRow();
	return row?.shopEnabled !== 0;
}

export async function getStoreSettings() {
	const row = await getRow();
	const mode = row?.mode ?? 'auto';
	const open = mode === 'manual' ? row?.isOpen === 1 : isWithinBusinessHours();
	const stripeStatus = getStripeConfigStatus();

	return {
		isOpen: open,
		mode,
		closedMessage: row?.closedMessage ?? null,
		shopEnabled: stripeStatus.configured && row?.shopEnabled !== 0,
		shopEnabledByAdmin: row?.shopEnabled !== 0,
		stripeConfigured: stripeStatus.configured,
		stripeMissingKeys: stripeStatus.missingKeys,
		shippingFlatRate: row?.shippingFlatRate ?? 1990,
		shippingFreeThreshold: row?.shippingFreeThreshold ?? 20000
	};
}

export async function setStoreMode(
	mode: 'auto' | 'manual',
	open?: boolean,
	closedMessage?: string | null
) {
	const existing = await getRow();

	const values = {
		mode,
		isOpen: mode === 'manual' ? (open ? 1 : 0) : (existing?.isOpen ?? 1),
		closedMessage:
			mode === 'manual' && !open ? (closedMessage ?? existing?.closedMessage ?? null) : null,
		updatedAt: new Date()
	};

	if (existing) {
		await db.update(storeSettings).set(values).where(eq(storeSettings.id, SETTINGS_ROW_ID));
	} else {
		await db.insert(storeSettings).values({ id: SETTINGS_ROW_ID, ...values });
	}
}

export async function setShopEnabled(enabled: boolean) {
	const existing = await getRow();

	const values = {
		shopEnabled: enabled ? 1 : 0,
		updatedAt: new Date()
	};

	if (existing) {
		await db.update(storeSettings).set(values).where(eq(storeSettings.id, SETTINGS_ROW_ID));
	} else {
		await db.insert(storeSettings).values({ id: SETTINGS_ROW_ID, ...values });
	}
}

export async function setShippingConfig(flatRate: number, freeThreshold: number) {
	const existing = await getRow();

	const values = {
		shippingFlatRate: flatRate,
		shippingFreeThreshold: freeThreshold,
		updatedAt: new Date()
	};

	if (existing) {
		await db.update(storeSettings).set(values).where(eq(storeSettings.id, SETTINGS_ROW_ID));
	} else {
		await db.insert(storeSettings).values({ id: SETTINGS_ROW_ID, ...values });
	}
}
