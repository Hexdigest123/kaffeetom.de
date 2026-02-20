import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { businessInfo, locations, formatPrice, dayNames } from '$lib/config';

let _resend: Resend | null = null;

function getResend(): Resend {
	if (!_resend) {
		if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
		_resend = new Resend(env.RESEND_API_KEY);
	}
	return _resend;
}

function getFromAddress(): string {
	return env.EMAIL_FROM || `${businessInfo.name} <noreply@kaffeetom.de>`;
}

function getAdminEmail(): string {
	return env.ADMIN_EMAIL || 'info@kaffeetom.de';
}

interface OrderEmailData {
	orderNumber: string;
	customerName: string;
	customerEmail: string;
	items: { name: string; quantity: number; unitPrice: number }[];
	totalAmount: number;
	shippingCost: number;
	fulfillmentType: 'pickup' | 'shipping';
	shippingAddress?: { street: string; city: string; zip: string } | null;
	locationName?: string;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
	const resend = getResend();

	const itemsHtml = data.items
		.map(
			(item) =>
				`<tr><td>${item.name}</td><td>${item.quantity}x</td><td>${formatPrice(item.unitPrice)}</td></tr>`
		)
		.join('');

	const fulfillmentHtml =
		data.fulfillmentType === 'shipping'
			? `<p><strong>Versand an:</strong> ${data.shippingAddress?.street}, ${data.shippingAddress?.zip} ${data.shippingAddress?.city}</p>`
			: `<p><strong>Abholung in:</strong> ${data.locationName ?? 'unserem Geschäft'}</p>`;

	await resend.emails.send({
		from: getFromAddress(),
		to: data.customerEmail,
		subject: `Bestellbestätigung ${data.orderNumber} - ${businessInfo.name}`,
		html: `
			<h2>Vielen Dank für Ihre Bestellung, ${data.customerName}!</h2>
			<p>Ihre Bestellnummer: <strong>${data.orderNumber}</strong></p>
			${fulfillmentHtml}
			<table>${itemsHtml}</table>
			${data.shippingCost > 0 ? `<p>Versandkosten: ${formatPrice(data.shippingCost)}</p>` : ''}
			<p><strong>Gesamtbetrag: ${formatPrice(data.totalAmount)}</strong></p>
			<p>Bei Fragen erreichen Sie uns telefonisch oder per WhatsApp.</p>
			<p>Mit freundlichen Grüßen,<br>${businessInfo.name}</p>
		`
	});

	await resend.emails.send({
		from: getFromAddress(),
		to: getAdminEmail(),
		subject: `Neue Bestellung ${data.orderNumber}`,
		html: `
			<h2>Neue Bestellung eingegangen</h2>
			<p><strong>Bestellnummer:</strong> ${data.orderNumber}</p>
			<p><strong>Kunde:</strong> ${data.customerName} (${data.customerEmail})</p>
			<p><strong>Typ:</strong> ${data.fulfillmentType === 'shipping' ? 'Versand' : 'Abholung'}</p>
			<p><strong>Betrag:</strong> ${formatPrice(data.totalAmount)}</p>
		`
	});
}

interface BookingEmailData {
	customerName: string;
	customerEmail: string;
	serviceType: string;
	machineModel?: string;
	locationName: string;
	preferredDate: string;
	preferredTimeSlot: string;
}

export async function sendBookingConfirmation(data: BookingEmailData) {
	const resend = getResend();

	const location = locations.find((l) => l.name === data.locationName);

	await resend.emails.send({
		from: getFromAddress(),
		to: data.customerEmail,
		subject: `Terminbestätigung Reparatur - ${businessInfo.name}`,
		html: `
			<h2>Ihr Reparaturtermin wurde bestätigt!</h2>
			<p><strong>Service:</strong> ${data.serviceType}</p>
			${data.machineModel ? `<p><strong>Gerät:</strong> ${data.machineModel}</p>` : ''}
			<p><strong>Standort:</strong> ${data.locationName}${location ? `, ${location.address}, ${location.zip} ${location.city}` : ''}</p>
			<p><strong>Datum:</strong> ${data.preferredDate}</p>
			<p><strong>Uhrzeit:</strong> ${data.preferredTimeSlot}</p>
			<p>Bitte bringen Sie Ihr Gerät zum vereinbarten Termin mit.</p>
			<p>Mit freundlichen Grüßen,<br>${businessInfo.name}</p>
		`
	});

	await resend.emails.send({
		from: getFromAddress(),
		to: getAdminEmail(),
		subject: `Neuer Reparaturtermin - ${data.customerName}`,
		html: `
			<h2>Neuer Reparaturtermin</h2>
			<p><strong>Kunde:</strong> ${data.customerName} (${data.customerEmail})</p>
			<p><strong>Service:</strong> ${data.serviceType}</p>
			${data.machineModel ? `<p><strong>Gerät:</strong> ${data.machineModel}</p>` : ''}
			<p><strong>Standort:</strong> ${data.locationName}</p>
			<p><strong>Datum:</strong> ${data.preferredDate}</p>
			<p><strong>Uhrzeit:</strong> ${data.preferredTimeSlot}</p>
		`
	});
}

interface BuybackEmailData {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	message?: string;
	locationPreference?: string;
}

export async function sendBuybackNotification(data: BuybackEmailData) {
	const resend = getResend();

	await resend.emails.send({
		from: getFromAddress(),
		to: data.email,
		subject: `Ankauf-Anfrage erhalten - ${businessInfo.name}`,
		html: `
			<h2>Vielen Dank für Ihre Anfrage!</h2>
			<p>Hallo ${data.firstName},</p>
			<p>wir haben Ihre Ankauf-Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
			<p>Mit freundlichen Grüßen,<br>${businessInfo.name}</p>
		`
	});

	await resend.emails.send({
		from: getFromAddress(),
		to: getAdminEmail(),
		subject: `Neue Ankauf-Anfrage von ${data.firstName} ${data.lastName}`,
		html: `
			<h2>Neue Ankauf-Anfrage</h2>
			<p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
			<p><strong>E-Mail:</strong> ${data.email}</p>
			${data.phone ? `<p><strong>Telefon:</strong> ${data.phone}</p>` : ''}
			${data.locationPreference ? `<p><strong>Standort:</strong> ${data.locationPreference}</p>` : ''}
			${data.message ? `<p><strong>Nachricht:</strong> ${data.message}</p>` : ''}
		`
	});
}
