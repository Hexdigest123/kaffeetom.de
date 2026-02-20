import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../src/lib/server/db/schema';
import { hashPassword } from 'better-auth/crypto';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL is not set');
	process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

async function seed() {
	console.log('Seeding database...');

	const [standardCat, premiumCat] = await db
		.insert(schema.categories)
		.values([
			{ name: 'Standard', nameEn: 'Standard', slug: 'standard', sortOrder: 0 },
			{ name: 'Premium', nameEn: 'Premium', slug: 'premium', sortOrder: 1 }
		])
		.returning();
	console.log(`Created ${2} categories`);

	const [helmstadt, mannheim] = await db
		.insert(schema.locations)
		.values([
			{
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
				},
				bookingConfig: { maxBookingsPerSlot: 2, slotDurationMinutes: 60 }
			},
			{
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
				openingHours: {
					mon: [{ open: '08:00', close: '15:00' }],
					tue: [{ open: '08:00', close: '15:00' }],
					wed: null,
					thu: [{ open: '08:00', close: '15:00' }],
					fri: [{ open: '08:00', close: '15:00' }],
					sat: null,
					sun: null
				},
				bookingConfig: { maxBookingsPerSlot: 2, slotDurationMinutes: 60 }
			}
		])
		.returning();
	console.log(`Created ${2} locations`);

	const productData = [
		{
			name: 'Jura S9 Avantgarde',
			nameEn: 'Jura S9 Avantgarde',
			description: 'Eleganter Kaffeevollautomat der S-Serie mit Avantgarde Design.',
			descriptionEn:
				'Elegant fully automatic coffee machine from the S-series with Avantgarde design.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 22000,
			status: 'available',
			modelSeries: 'S',
			image: '/uploads/products/jura-s9-avantgarde.png'
		},
		{
			name: 'Jura Impressa C Serie Limited Edition',
			nameEn: 'Jura Impressa C Series Limited Edition',
			description: 'Sonderedition der beliebten Impressa C-Serie.',
			descriptionEn: 'Special edition of the popular Impressa C-series.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 22900,
			status: 'available',
			modelSeries: 'C',
			image: '/uploads/products/jura-impressa-c-serie-limited-edition.png'
		},
		{
			name: 'Jura C5 1. Generation',
			nameEn: 'Jura C5 1st Generation',
			description: 'Kompakter Kaffeevollautomat der ersten C5 Generation.',
			descriptionEn: 'Compact fully automatic coffee machine, first C5 generation.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 19900,
			status: 'available',
			modelSeries: 'C',
			image: '/uploads/products/jura-c5.jpg'
		},
		{
			name: 'Jura C5 2. Generation',
			nameEn: 'Jura C5 2nd Generation',
			description: 'Verbesserte zweite Generation des kompakten C5.',
			descriptionEn: 'Improved second generation of the compact C5.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 21900,
			status: 'available',
			modelSeries: 'C',
			image: '/uploads/products/jura-c5.jpg'
		},
		{
			name: 'Jura Impressa J9.2',
			nameEn: 'Jura Impressa J9.2',
			description: 'Hochwertiger Kaffeevollautomat der J-Serie mit umfangreichen Funktionen.',
			descriptionEn:
				'High-quality fully automatic coffee machine from the J-series with extensive features.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 38000,
			status: 'available',
			modelSeries: 'J',
			image: '/uploads/products/jura-impressa-j9-2.jpg'
		},
		{
			name: 'Jura C50 / C60',
			nameEn: 'Jura C50 / C60',
			description: 'Bewährte Kaffeevollautomaten der C50/C60 Reihe.',
			descriptionEn: 'Proven fully automatic coffee machines from the C50/C60 range.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 22900,
			status: 'available',
			modelSeries: 'C',
			image: '/uploads/products/jura-c50-c60.jpg'
		},
		{
			name: 'Jura F50 1. Generation',
			nameEn: 'Jura F50 1st Generation',
			description: 'Solider Kaffeevollautomat der F-Serie, erste Generation.',
			descriptionEn: 'Solid fully automatic coffee machine from the F-series, first generation.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 17900,
			status: 'available',
			modelSeries: 'F',
			image: '/uploads/products/jura-f50.jpg'
		},
		{
			name: 'Jura F50 2. Generation',
			nameEn: 'Jura F50 2nd Generation',
			description: 'Verbesserte zweite Generation des F50 mit optimierter Technik.',
			descriptionEn: 'Improved second generation of the F50 with optimized technology.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 22900,
			status: 'available',
			modelSeries: 'F',
			image: '/uploads/products/jura-f50.jpg'
		},
		{
			name: 'Jura J7',
			nameEn: 'Jura J7',
			description: 'Vielseitiger Kaffeevollautomat der J-Serie.',
			descriptionEn: 'Versatile fully automatic coffee machine from the J-series.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 29000,
			status: 'available',
			modelSeries: 'J',
			image: '/uploads/products/jura-j7.jpg'
		},
		{
			name: 'Jura Impressa F7',
			nameEn: 'Jura Impressa F7',
			description: 'Leistungsstarker Kaffeevollautomat der Impressa F-Serie.',
			descriptionEn: 'Powerful fully automatic coffee machine from the Impressa F-series.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 28000,
			status: 'available',
			modelSeries: 'F',
			image: '/uploads/products/jura-impressa-f7.jpg'
		},
		{
			name: 'Jura Impressa E85',
			nameEn: 'Jura Impressa E85',
			description: 'Zuverlässiger Kaffeevollautomat der Impressa E-Serie.',
			descriptionEn: 'Reliable fully automatic coffee machine from the Impressa E-series.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 18000,
			status: 'available',
			modelSeries: 'E',
			image: '/uploads/products/jura-impressa-e85.jpg'
		},
		{
			name: 'Jura F70',
			nameEn: 'Jura F70',
			description: 'Preisgünstiger Kaffeevollautomat der F-Serie.',
			descriptionEn: 'Affordable fully automatic coffee machine from the F-series.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 17000,
			status: 'available',
			modelSeries: 'F',
			image: '/uploads/products/jura-f70.jpg'
		},
		{
			name: 'Jura Impressa E50',
			nameEn: 'Jura Impressa E50',
			description: 'Einstiegsmodell der Impressa E-Serie zu günstigem Preis.',
			descriptionEn: 'Entry-level Impressa E-series model at an affordable price.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 12000,
			status: 'available',
			modelSeries: 'E',
			image: '/uploads/products/jura-impressa-e50.jpg'
		},
		{
			name: 'Jura E25 / E85',
			nameEn: 'Jura E25 / E85',
			description: 'Bewährte Modelle der E-Serie.',
			descriptionEn: 'Proven models from the E-series.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 17000,
			status: 'available',
			modelSeries: 'E',
			image: '/uploads/products/jura-e25-e85.jpg'
		},
		{
			name: 'Jura Impressa E40 / E70 / E75',
			nameEn: 'Jura Impressa E40 / E70 / E75',
			description: 'Vielseitige Impressa E-Serie Modelle.',
			descriptionEn: 'Versatile Impressa E-series models.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 15000,
			status: 'available',
			modelSeries: 'E',
			image: '/uploads/products/jura-impressa-e40-e70-e75.jpg'
		},
		{
			name: 'Jura XS9 One Touch',
			nameEn: 'Jura XS9 One Touch',
			description: 'Professioneller Kaffeevollautomat mit One Touch Bedienung.',
			descriptionEn: 'Professional fully automatic coffee machine with One Touch operation.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 28000,
			status: 'available',
			modelSeries: 'XS',
			image: '/uploads/products/jura-xs9-one-touch.png'
		},
		{
			name: 'Jura Giga 5',
			nameEn: 'Jura Giga 5',
			description: 'Professioneller Kaffeevollautomat der Giga-Serie mit Gebrauchsspuren.',
			descriptionEn:
				'Professional fully automatic coffee machine from the Giga series with signs of use.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 35000,
			status: 'available',
			condition: 'Gebrauchsspuren',
			modelSeries: 'Giga',
			image: '/uploads/products/jura-giga-5.jpg'
		},
		{
			name: 'Jura S9',
			nameEn: 'Jura S9',
			description: 'Klassischer Kaffeevollautomat der S-Serie.',
			descriptionEn: 'Classic fully automatic coffee machine from the S-series.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 15000,
			status: 'available',
			modelSeries: 'S',
			image: '/uploads/products/jura-s9.jpg'
		},
		{
			name: 'Jura D4',
			nameEn: 'Jura D4',
			description: 'Kompakter Kaffeevollautomat der D-Serie.',
			descriptionEn: 'Compact fully automatic coffee machine from the D-series.',
			categoryId: standardCat.id,
			qualityTier: 'standard',
			price: 28000,
			status: 'available',
			modelSeries: 'D',
			image: '/uploads/products/jura-d4.jpg'
		},
		{
			name: 'Jura J9.3 Premium',
			nameEn: 'Jura J9.3 Premium',
			description:
				'Premium-Gerät der J-Serie in Top-Zustand mit nur 6800 Bezügen. Sorgfältig ausgewählt und umfangreich aufbereitet.',
			descriptionEn:
				'Premium J-series machine in top condition with only 6800 cycles. Carefully selected and extensively refurbished.',
			categoryId: premiumCat.id,
			qualityTier: 'premium',
			price: 58000,
			status: 'sold',
			modelSeries: 'J',
			image: '/uploads/products/jura-j9-3-premium.jpg'
		}
	];

	const insertedProducts = await db
		.insert(schema.products)
		.values(
			productData.map(({ image, ...p }, i) => ({
				...p,
				warrantyMonths: 12,
				sortOrder: i
			}))
		)
		.returning();
	console.log(`Created ${insertedProducts.length} products`);

	const imageValues = productData.map((p, i) => ({
		productId: insertedProducts[i].id,
		url: p.image,
		alt: p.name,
		sortOrder: 0
	}));

	await db.insert(schema.productImages).values(imageValues);
	console.log(`Created ${imageValues.length} product images`);

	await db.insert(schema.storeSettings).values({
		isOpen: 1,
		mode: 'auto',
		shopEnabled: 1,
		shippingFlatRate: 1990,
		shippingFreeThreshold: 20000
	});
	console.log('Created store settings');

	const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@kaffeetom.de';
	const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';

	const passwordHash = await hashPassword(ADMIN_PASSWORD);
	const adminId = crypto.randomUUID();

	await db.insert(schema.user).values({
		id: adminId,
		name: 'Admin',
		email: ADMIN_EMAIL,
		emailVerified: true,
		role: 'admin',
		createdAt: new Date(),
		updatedAt: new Date()
	});

	await db.insert(schema.account).values({
		id: crypto.randomUUID(),
		accountId: adminId,
		providerId: 'credential',
		userId: adminId,
		password: passwordHash
	});

	console.log(`Created admin user: ${ADMIN_EMAIL}`);

	await client.end();
	console.log('Seed complete!');
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
