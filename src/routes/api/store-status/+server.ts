import { json } from '@sveltejs/kit';
import { isStoreOpen, isShopEnabled } from '$lib/server/store-status';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const [open, shopEnabled] = await Promise.all([isStoreOpen(), isShopEnabled()]);
	return json({ open, shopEnabled });
};
