import { redirect, type RequestEvent } from '@sveltejs/kit';

export function requireUser(event: RequestEvent, redirectTo?: string) {
	const user = event.locals.user;
	if (!user) {
		const target =
			redirectTo ??
			`/konto/login?redirect=${encodeURIComponent(event.url.pathname + event.url.search)}`;
		redirect(302, target);
	}
	return user;
}
