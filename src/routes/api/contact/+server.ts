import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { contactSubmissions } from '$lib/server/db/schema';
import { saveUploadedFile } from '$lib/server/upload';
import { sendBuybackNotification } from '$lib/server/email';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();

	const firstName = formData.get('firstName') as string;
	const lastName = formData.get('lastName') as string;
	const email = formData.get('email') as string;
	const phone = formData.get('phone') as string | null;
	const message = formData.get('message') as string;
	const machineModel = formData.get('machineModel') as string | null;

	if (!firstName || !lastName || !email || !message) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	const type = machineModel ? 'buyback' : 'contact';

	const imageFiles = formData.getAll('images') as File[];
	const imagePaths: string[] = [];

	for (const file of imageFiles) {
		if (file.size > 0) {
			const result = await saveUploadedFile(file, 'submissions');
			if (result.success) {
				imagePaths.push(result.path);
			}
		}
	}

	await db.insert(contactSubmissions).values({
		type,
		firstName,
		lastName,
		email,
		phone,
		message: machineModel ? `Modell: ${machineModel}\n\n${message}` : message,
		images: imagePaths.length > 0 ? imagePaths : null
	});

	if (type === 'buyback') {
		try {
			await sendBuybackNotification({
				firstName,
				lastName,
				email,
				phone: phone ?? undefined,
				message
			});
		} catch {
			// best-effort
		}
	}

	return json({ success: true });
};
