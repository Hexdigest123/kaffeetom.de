import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { visitorEvents } from '$lib/server/db/schema';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const consent = cookies.get('tracking_consent');
	if (consent !== 'granted') {
		return json({ ok: false }, { status: 403 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { visitorId, eventType, page, metadata } = body as {
		visitorId: string;
		eventType: string;
		page: string;
		metadata?: Record<string, unknown>;
	};

	if (!visitorId || !eventType || !page) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	await db.insert(visitorEvents).values({
		visitorId,
		eventType,
		page,
		metadata: metadata ?? null
	});

	return json({ ok: true });
};
