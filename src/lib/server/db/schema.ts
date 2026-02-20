import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp
} from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	nameEn: text('name_en'),
	slug: text('slug').notNull().unique(),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export const products = pgTable(
	'products',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		nameEn: text('name_en'),
		description: text('description'),
		descriptionEn: text('description_en'),
		categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
		qualityTier: text('quality_tier').notNull().default('standard'),
		price: integer('price').notNull(),
		status: text('status').notNull().default('available'),
		condition: text('condition'),
		warrantyMonths: integer('warranty_months').notNull().default(12),
		modelSeries: text('model_series'),
		stripeProductId: text('stripe_product_id'),
		stripePriceId: text('stripe_price_id'),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('products_category_id_idx').on(table.categoryId),
		index('products_status_idx').on(table.status),
		index('products_quality_tier_idx').on(table.qualityTier),
		index('products_created_at_idx').on(table.createdAt)
	]
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const productImages = pgTable(
	'product_images',
	{
		id: serial('id').primaryKey(),
		productId: integer('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		url: text('url').notNull(),
		alt: text('alt'),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('product_images_product_id_idx').on(table.productId)]
);

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;

export const locations = pgTable('locations', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	address: text('address').notNull(),
	city: text('city').notNull(),
	zip: text('zip').notNull(),
	phone: text('phone'),
	mobile: text('mobile'),
	whatsapp: text('whatsapp'),
	email: text('email'),
	lat: text('lat'),
	lng: text('lng'),
	openingHours: jsonb('opening_hours'),
	bookingConfig: jsonb('booking_config'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;

export const orders = pgTable(
	'orders',
	{
		id: serial('id').primaryKey(),
		orderNumber: text('order_number').notNull().unique(),
		stripeSessionId: text('stripe_session_id').unique(),
		stripePaymentIntentId: text('stripe_payment_intent_id'),
		status: text('status').notNull().default('pending'),
		fulfillmentType: text('fulfillment_type').notNull(),
		locationId: integer('location_id').references(() => locations.id, { onDelete: 'set null' }),
		customerName: text('customer_name').notNull(),
		customerPhone: text('customer_phone').notNull(),
		customerEmail: text('customer_email'),
		shippingAddress: jsonb('shipping_address'),
		totalAmount: integer('total_amount').notNull(),
		shippingCost: integer('shipping_cost').notNull().default(0),
		currency: text('currency').notNull().default('eur'),
		visitorId: text('visitor_id'),
		notes: text('notes'),
		metadata: jsonb('metadata'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		paidAt: timestamp('paid_at', { withTimezone: true }),
		fulfilledAt: timestamp('fulfilled_at', { withTimezone: true }),
		shippedAt: timestamp('shipped_at', { withTimezone: true }),
		cancellationRequestedAt: timestamp('cancellation_requested_at', { withTimezone: true })
	},
	(table) => [
		index('orders_status_idx').on(table.status),
		index('orders_created_at_idx').on(table.createdAt),
		index('orders_stripe_session_id_idx').on(table.stripeSessionId),
		index('orders_order_number_idx').on(table.orderNumber)
	]
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export const orderItems = pgTable('order_items', {
	id: serial('id').primaryKey(),
	orderId: integer('order_id')
		.notNull()
		.references(() => orders.id, { onDelete: 'cascade' }),
	productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
	productName: text('product_name').notNull(),
	quantity: integer('quantity').notNull(),
	unitPrice: integer('unit_price').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export const repairBookings = pgTable(
	'repair_bookings',
	{
		id: serial('id').primaryKey(),
		customerName: text('customer_name').notNull(),
		customerEmail: text('customer_email').notNull(),
		customerPhone: text('customer_phone').notNull(),
		serviceType: text('service_type').notNull(),
		machineModel: text('machine_model'),
		locationId: integer('location_id')
			.notNull()
			.references(() => locations.id, { onDelete: 'restrict' }),
		preferredDate: text('preferred_date').notNull(),
		preferredTimeSlot: text('preferred_time_slot').notNull(),
		status: text('status').notNull().default('confirmed'),
		notes: text('notes'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('repair_bookings_location_id_preferred_date_idx').on(
			table.locationId,
			table.preferredDate
		),
		index('repair_bookings_status_idx').on(table.status)
	]
);

export type RepairBooking = typeof repairBookings.$inferSelect;
export type NewRepairBooking = typeof repairBookings.$inferInsert;

export const contactSubmissions = pgTable('contact_submissions', {
	id: serial('id').primaryKey(),
	type: text('type').notNull(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	email: text('email').notNull(),
	phone: text('phone'),
	message: text('message'),
	locationPreference: text('location_preference'),
	images: jsonb('images'),
	isRead: integer('is_read').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;

export const pageViews = pgTable('page_views', {
	id: serial('id').primaryKey(),
	ipAddress: text('ip_address').notNull(),
	visitorId: text('visitor_id'),
	userAgent: text('user_agent'),
	referer: text('referer'),
	landingPage: text('landing_page').notNull(),
	utmSource: text('utm_source'),
	utmMedium: text('utm_medium'),
	utmCampaign: text('utm_campaign'),
	utmTerm: text('utm_term'),
	utmContent: text('utm_content'),
	locale: text('locale'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;

export const visitorEvents = pgTable(
	'visitor_events',
	{
		id: serial('id').primaryKey(),
		visitorId: text('visitor_id').notNull(),
		eventType: text('event_type').notNull(),
		page: text('page').notNull(),
		metadata: jsonb('metadata'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('visitor_events_visitor_id_created_at_idx').on(table.visitorId, table.createdAt)
	]
);

export type VisitorEvent = typeof visitorEvents.$inferSelect;
export type NewVisitorEvent = typeof visitorEvents.$inferInsert;

export const storeSettings = pgTable('store_settings', {
	id: serial('id').primaryKey(),
	isOpen: integer('is_open').notNull().default(1),
	mode: text('mode').notNull().default('auto'),
	closedMessage: text('closed_message'),
	shopEnabled: integer('shop_enabled').notNull().default(1),
	shippingFlatRate: integer('shipping_flat_rate').notNull().default(1990),
	shippingFreeThreshold: integer('shipping_free_threshold').notNull().default(20000),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type StoreSettings = typeof storeSettings.$inferSelect;
export type NewStoreSettings = typeof storeSettings.$inferInsert;

export * from './auth.schema';
