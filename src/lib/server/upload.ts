import { writeFile, mkdir, unlink } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = 'static/uploads/products';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadProductImage(file: File): Promise<string> {
	if (!ALLOWED_TYPES.includes(file.type)) {
		throw new Error(`Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}`);
	}

	if (file.size > MAX_FILE_SIZE) {
		throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB`);
	}

	await mkdir(UPLOAD_DIR, { recursive: true });

	const ext = extname(file.name) || mimeToExt(file.type);
	const filename = `${randomUUID()}${ext}`;
	const filepath = join(UPLOAD_DIR, filename);

	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(filepath, buffer);

	return `/uploads/products/${filename}`;
}

export async function deleteProductImage(url: string): Promise<void> {
	if (!url.startsWith('/uploads/products/')) return;

	const filepath = join('static', url);
	try {
		await unlink(filepath);
	} catch {
		// file may already be gone
	}
}

export async function saveUploadedFile(
	file: File,
	subdirectory: string
): Promise<{ success: boolean; path: string }> {
	if (!ALLOWED_TYPES.includes(file.type)) {
		return { success: false, path: '' };
	}

	if (file.size > MAX_FILE_SIZE) {
		return { success: false, path: '' };
	}

	const dir = `static/uploads/${subdirectory}`;
	await mkdir(dir, { recursive: true });

	const ext = extname(file.name) || mimeToExt(file.type);
	const filename = `${randomUUID()}${ext}`;
	const filepath = join(dir, filename);

	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(filepath, buffer);

	return { success: true, path: `/uploads/${subdirectory}/${filename}` };
}

function mimeToExt(mime: string): string {
	switch (mime) {
		case 'image/jpeg':
			return '.jpg';
		case 'image/png':
			return '.png';
		case 'image/webp':
			return '.webp';
		default:
			return '.jpg';
	}
}
