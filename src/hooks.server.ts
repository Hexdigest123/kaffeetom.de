import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { handleTracking } from '$lib/server/tracking';

const handleParaglide: Handle = ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api')) {
		return resolve(event);
	}
	return paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', locale)
		});
	});
};

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(handleParaglide, handleBetterAuth, handleTracking);

export const handleError: HandleServerError = ({ error, status }) => {
	if (status !== 404) {
		console.error('Server error:', error);
	}
	return {
		message: status === 404 ? 'Not Found' : 'Internal Error'
	};
};
