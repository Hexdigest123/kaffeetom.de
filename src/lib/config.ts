export interface Location {
	id: string;
	slug: string;
	name: string;
	address: string;
	city: string;
	zip: string;
	phone: string;
	mobile?: string;
	whatsapp: string;
	email?: string;
	lat: string;
	lng: string;
	googleMapsUrl: string;
	openingHours: WeeklyHours;
}

export interface DayHours {
	open: string;
	close: string;
}

export type WeeklyHours = Record<string, DayHours[] | null>;

export interface ServiceType {
	id: string;
	nameKey: string;
	descriptionKey: string;
	price: number; // in cents
	intervalMonths: number;
}

export interface BusinessInfo {
	name: string;
	tagline: string;
	owner: string;
	since: number;
	taxInfo: string;
	taxNumber: string;
	ustIdNr: string;
	warrantyMonths: number;
	facebookUrl: string;
	youtubeUrl: string;
	youtubeChannelId: string;
}

export interface SocialLink {
	platform: string;
	url: string;
	icon: string;
	label: string;
}

// ─── Business Info ──────────────────────────────────────────────────────

export const businessInfo: BusinessInfo = {
	name: 'KAFFEETOM',
	tagline: 'An und Verkauf von Jura Kaffeevollautomaten',
	owner: 'Sabine Rossel',
	since: 2006,
	taxInfo: 'Differenzbesteuerung nach §25a UStG',
	taxNumber: '37334 / 32464',
	ustIdNr: 'DE 229835275',
	warrantyMonths: 12,
	facebookUrl: 'https://www.facebook.com/www.kaffeetom.de',
	youtubeUrl: 'https://www.youtube.com/channel/UCX6Q9WyBhJ5aNIxRcNCPLvQ',
	youtubeChannelId: 'UCX6Q9WyBhJ5aNIxRcNCPLvQ'
};

// ─── Locations ──────────────────────────────────────────────────────────

export const locations: Location[] = [
	{
		id: 'helmstadt',
		slug: 'helmstadt',
		name: 'Helmstadt',
		address: 'Epfenbacherstr. 5',
		city: 'Helmstadt',
		zip: '74921',
		phone: '07263/7099822',
		whatsapp: '4972637099822',
		email: 'info@kaffeetom.de',
		lat: '49.3468',
		lng: '8.9981',
		googleMapsUrl: 'https://maps.google.com/?q=Epfenbacherstr.+5,+74921+Helmstadt',
		openingHours: {
			mon: [
				{ open: '09:00', close: '12:00' },
				{ open: '14:00', close: '17:00' }
			],
			tue: [
				{ open: '09:00', close: '12:00' },
				{ open: '14:00', close: '17:00' }
			],
			wed: null,
			thu: [
				{ open: '09:00', close: '12:00' },
				{ open: '16:00', close: '19:00' }
			],
			fri: [
				{ open: '09:00', close: '12:00' },
				{ open: '14:00', close: '17:00' }
			],
			sat: null,
			sun: null
		}
	},
	{
		id: 'mannheim',
		slug: 'mannheim',
		name: 'Mannheim',
		address: 'Neckarauerstr. 9',
		city: 'Mannheim',
		zip: '68199',
		phone: '0621/853045',
		mobile: '0179-68 777 64',
		whatsapp: '491796877764',
		email: 'handy@kaffeetom.de',
		lat: '49.4741',
		lng: '8.4854',
		googleMapsUrl: 'https://maps.google.com/?q=Neckarauerstr.+9,+68199+Mannheim',
		openingHours: {
			mon: [{ open: '08:00', close: '15:00' }],
			tue: [{ open: '08:00', close: '15:00' }],
			wed: null,
			thu: [{ open: '08:00', close: '15:00' }],
			fri: [{ open: '08:00', close: '15:00' }],
			sat: null,
			sun: null
		}
	}
];

// ─── Repair/Maintenance Services ────────────────────────────────────────

export const serviceTypes: ServiceType[] = [
	{
		id: 'small_maintenance',
		nameKey: 'service_small_name',
		descriptionKey: 'service_small_desc',
		price: 5900, // 59.00 EUR
		intervalMonths: 18
	},
	{
		id: 'large_maintenance',
		nameKey: 'service_large_name',
		descriptionKey: 'service_large_desc',
		price: 11900, // 119.00 EUR
		intervalMonths: 36
	}
];

// ─── Social Links ───────────────────────────────────────────────────────

export const socialLinks: SocialLink[] = [
	{
		platform: 'facebook',
		url: 'https://www.facebook.com/www.kaffeetom.de',
		icon: 'facebook',
		label: 'Facebook'
	},
	{
		platform: 'youtube',
		url: 'https://www.youtube.com/channel/UCX6Q9WyBhJ5aNIxRcNCPLvQ',
		icon: 'youtube',
		label: 'YouTube'
	}
];

// ─── Product Quality Tiers ──────────────────────────────────────────────

export const qualityTiers = ['standard', 'premium'] as const;
export type QualityTier = (typeof qualityTiers)[number];

export const productStatuses = ['available', 'sold', 'reserved'] as const;
export type ProductStatus = (typeof productStatuses)[number];

// ─── Order Statuses ─────────────────────────────────────────────────────

export const orderStatuses = [
	'pending',
	'paid',
	'in_process',
	'fulfilled',
	'shipped',
	'cancelled',
	'refunded',
	'cancellation_requested'
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<string, string> = {
	pending: 'Ausstehend',
	paid: 'Bezahlt',
	in_process: 'In Bearbeitung',
	fulfilled: 'Abgeschlossen',
	shipped: 'Versendet',
	cancelled: 'Storniert',
	refunded: 'Erstattet',
	cancellation_requested: 'Stornierung angefragt'
};

export const fulfillmentTypes = ['pickup', 'shipping'] as const;
export type FulfillmentType = (typeof fulfillmentTypes)[number];

export const fulfillmentTypeLabels: Record<string, string> = {
	pickup: 'Abholung',
	shipping: 'Versand'
};

// ─── Repair Booking Statuses ────────────────────────────────────────────

export const bookingStatuses = [
	'pending',
	'confirmed',
	'completed',
	'cancelled',
	'rejected',
	'no_show'
] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export const bookingStatusLabels: Record<string, string> = {
	pending: 'Ausstehend',
	confirmed: 'Bestätigt',
	completed: 'Abgeschlossen',
	cancelled: 'Storniert',
	rejected: 'Abgelehnt',
	no_show: 'Nicht erschienen'
};

export const serviceTypeLabels: Record<string, string> = {
	small_maintenance: 'Kleine Wartung',
	large_maintenance: 'Große Wartung'
};

// ─── SEO Defaults ───────────────────────────────────────────────────────

export const seoDefaults = {
	siteName: 'KAFFEETOM',
	titleSuffix: ' | KAFFEETOM',
	defaultDescription:
		'Wir haben eine große Auswahl an gebrauchten Jura Kaffeevollautomaten. Verkauf, Reparatur und Wartung in Helmstadt und Mannheim.',
	defaultDescriptionEn:
		'We have a wide selection of used Jura fully automatic coffee machines. Sales, repair and maintenance in Helmstadt and Mannheim.',
	defaultKeywords:
		'Jura Kaffeevollautomat, gebraucht, Verkauf, Reparatur, Wartung, Helmstadt, Mannheim, Kaffeetom',
	ogImage: '/uploads/logo/kaffeetom-logo.webp',
	locale: 'de_DE',
	localeAlternate: 'en_US'
};

// ─── Formatting Helpers ─────────────────────────────────────────────────

/** Format price in cents to EUR display string */
export function formatPrice(cents: number): string {
	return new Intl.NumberFormat('de-DE', {
		style: 'currency',
		currency: 'EUR'
	}).format(cents / 100);
}

/** Format price in cents to EUR display string (English) */
export function formatPriceEn(cents: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'EUR'
	}).format(cents / 100);
}

/** Check if a specific location is currently open based on its opening hours */
export function isLocationOpenNow(location: Location): boolean {
	const now = new Date();
	const berlinTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
	const dayIndex = berlinTime.getDay(); // 0=Sun, 1=Mon...
	const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
	const dayKey = dayMap[dayIndex];
	const hours = location.openingHours[dayKey];
	if (!hours) return false;

	const currentMinutes = berlinTime.getHours() * 60 + berlinTime.getMinutes();
	for (const slot of hours) {
		const [openH, openM] = slot.open.split(':').map(Number);
		const [closeH, closeM] = slot.close.split(':').map(Number);
		const openMin = openH * 60 + openM;
		const closeMin = closeH * 60 + closeM;
		if (currentMinutes >= openMin && currentMinutes < closeMin) return true;
	}
	return false;
}

/** Day names for opening hours display */
export const dayNames: Record<string, { de: string; en: string }> = {
	mon: { de: 'Montag', en: 'Monday' },
	tue: { de: 'Dienstag', en: 'Tuesday' },
	wed: { de: 'Mittwoch', en: 'Wednesday' },
	thu: { de: 'Donnerstag', en: 'Thursday' },
	fri: { de: 'Freitag', en: 'Friday' },
	sat: { de: 'Samstag', en: 'Saturday' },
	sun: { de: 'Sonntag', en: 'Sunday' }
};
