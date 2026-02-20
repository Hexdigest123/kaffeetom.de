import { error, redirect, type RequestEvent } from '@sveltejs/kit';

export function requireAdmin(event: RequestEvent) {
	const user = event.locals.user;
	if (!user) {
		redirect(303, '/admin/login');
	}
	if (user.role !== 'admin') {
		error(403, 'Forbidden');
	}
	return user;
}

export function requireAdminApi(event: RequestEvent) {
	const user = event.locals.user;
	if (!user || user.role !== 'admin') {
		error(401, 'Unauthorized');
	}
	return user;
}
