import { db } from './db';
import { orders } from './db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(length = 6): string {
	const bytes = randomBytes(length);
	return Array.from(bytes)
		.map((b) => CHARSET[b % CHARSET.length])
		.join('');
}

export async function generateOrderNumber(): Promise<string> {
	for (let attempt = 0; attempt < 10; attempt++) {
		const orderNumber = `KT-${generateCode()}`;
		const [existing] = await db
			.select({ id: orders.id })
			.from(orders)
			.where(eq(orders.orderNumber, orderNumber));
		if (!existing) {
			return orderNumber;
		}
	}
	return `KT-${generateCode()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}
