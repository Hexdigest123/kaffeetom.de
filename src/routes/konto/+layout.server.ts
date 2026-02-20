import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isAuthPage = url.pathname === '/konto/login' || url.pathname === '/konto/registrieren';

	if (isAuthPage) {
		if (locals.user) {
			const redirectTo = url.searchParams.get('redirect') || '/konto';
			redirect(302, redirectTo);
		}
		return { user: null };
	}

	if (!locals.user) {
		redirect(302, `/konto/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
	}

	return { user: locals.user };
};
