import type { Handle, RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pageViews } from '$lib/server/db/schema';
import { createHash } from 'crypto';

const REFERER_SOURCE_MAP: [pattern: string, source: string, medium: string][] = [
	['facebook.com', 'facebook', 'social'],
	['fb.com', 'facebook', 'social'],
	['instagram.com', 'instagram', 'social'],
	['youtube.com', 'youtube', 'social'],
	['youtu.be', 'youtube', 'social'],
	['twitter.com', 'twitter', 'social'],
	['x.com', 'twitter', 'social'],
	['t.co', 'twitter', 'social'],
	['wa.me', 'whatsapp', 'social'],
	['whatsapp.com', 'whatsapp', 'social'],
	['google.com', 'google', 'organic'],
	['google.de', 'google', 'organic'],
	['bing.com', 'bing', 'organic'],
	['duckduckgo.com', 'duckduckgo', 'organic'],
	['ecosia.org', 'ecosia', 'organic'],
	['maps.google', 'google_maps', 'listing'],
	['maps.app.goo.gl', 'google_maps', 'listing']
];

function inferSourceFromReferer(referer: string): { source: string; medium: string } | null {
	let hostname: string;
	try {
		hostname = new URL(referer).hostname.toLowerCase();
	} catch {
		return null;
	}

	for (const [pattern, source, medium] of REFERER_SOURCE_MAP) {
		if (hostname.includes(pattern)) {
			return { source, medium };
		}
	}

	return null;
}

function getLocaleFromPath(pathname: string): 'de' | 'en' {
	const firstSegment = pathname.split('/').filter(Boolean)[0];
	return firstSegment === 'en' ? 'en' : 'de';
}

export function computeVisitorId(event: RequestEvent): string {
	const ip = event.getClientAddress();
	const userAgent = event.request.headers.get('user-agent') ?? '';
	const acceptLang = event.request.headers.get('accept-language') ?? '';

	return createHash('sha256').update(`${ip}:${userAgent}:${acceptLang}`).digest('hex').slice(0, 16);
}

export async function trackPageView(event: RequestEvent): Promise<void> {
	try {
		const referer = event.request.headers.get('referer');
		const utmSource = event.url.searchParams.get('utm_source');
		const utmMedium = event.url.searchParams.get('utm_medium');

		let source = utmSource;
		let medium = utmMedium;

		if (!source && referer) {
			const inferred = inferSourceFromReferer(referer);
			if (inferred) {
				source = inferred.source;
				medium = medium ?? inferred.medium;
			}
		}

		await db.insert(pageViews).values({
			ipAddress: event.getClientAddress(),
			visitorId: computeVisitorId(event),
			userAgent: event.request.headers.get('user-agent'),
			referer,
			landingPage: `${event.url.pathname}${event.url.search}`,
			utmSource: source,
			utmMedium: medium,
			utmCampaign: event.url.searchParams.get('utm_campaign'),
			utmTerm: event.url.searchParams.get('utm_term'),
			utmContent: event.url.searchParams.get('utm_content'),
			locale: getLocaleFromPath(event.url.pathname)
		});
	} catch (err) {
		console.error('Failed to track page view', err);
	}
}

export const handleTracking: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	const consent = event.cookies.get('tracking_consent');

	if (
		consent === 'granted' &&
		!pathname.includes('.') &&
		!pathname.startsWith('/admin') &&
		!pathname.startsWith('/_app') &&
		!pathname.startsWith('/api')
	) {
		void trackPageView(event);
	}

	return resolve(event);
};
