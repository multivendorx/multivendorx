/**
 * Sample records drawn, dimmed, behind a list table's "nothing yet" or Pro card (ListGate). Each is shaped like the
 * REST response its table already reads, so it goes through the table's own row mapping and looks exactly like a
 * real row. Four per table: the preview fades out below them.
 */

/** A date `daysAgo` days before today, as the REST API returns it (`YYYY-MM-DD HH:MM:SS`). */
const daysAgo = (days: number): string => {
	const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
	const pad = (value: number) => String(value).padStart(2, '0');

	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} 10:30:00`;
};

/** Stores (`/stores`). */
export const SAMPLE_STORES = [
	{
		id: 1,
		store_name: 'Green Leaf Organics',
		store_slug: 'green-leaf-organics',
		email: 'hello@greenleaf.example',
		status: 'active',
		create_time: daysAgo(42),
		primary_owner: { display_name: 'Maya Patel' },
		commission: { commission_total: 4280.5 },
	},
	{
		id: 2,
		store_name: 'Urban Thread Co.',
		store_slug: 'urban-thread-co',
		email: 'team@urbanthread.example',
		status: 'active',
		create_time: daysAgo(30),
		primary_owner: { display_name: 'Liam Brooks' },
		commission: { commission_total: 2915 },
	},
	{
		id: 3,
		store_name: 'Copper & Clay',
		store_slug: 'copper-and-clay',
		email: 'studio@copperclay.example',
		status: 'under_review',
		create_time: daysAgo(6),
		primary_owner: { display_name: 'Sofia Reyes' },
		commission: { commission_total: 0 },
	},
	{
		id: 4,
		store_name: 'Peak Outdoor Gear',
		store_slug: 'peak-outdoor-gear',
		email: 'sales@peakoutdoor.example',
		status: 'active',
		create_time: daysAgo(18),
		primary_owner: { display_name: 'Noah Kim' },
		commission: { commission_total: 1640.25 },
	},
];

/** The status tabs over a sample table: "All" and one per status the samples use. */
export const sampleCategoryCounts = (
	rows: { status?: string }[],
	labels: Record<string, string>,
	allLabel: string
) => [
	{ value: 'all', label: allLabel, count: rows.length },
	...Object.entries(labels).map(([value, label]) => ({
		value,
		label,
		count: rows.filter((row) => row.status === value).length,
	})),
];

/** Commissions (`/commissions`): one per order and store. */
export const SAMPLE_COMMISSIONS = [
	{
		id: 1042,
		order_id: 5218,
		store_name: 'Green Leaf Organics',
		status: 'unpaid',
		created_at: daysAgo(1),
		store_earning: 86.4,
		shipping_amount: 6,
		tax_amount: 4.32,
		gateway_fee: 2.9,
		marketplace_commission: 9.6,
		store_discount: 0,
		admin_discount: 0,
		store_payable: 93.82,
		marketplace_payable: 9.6,
	},
	{
		id: 1041,
		order_id: 5214,
		store_name: 'Urban Thread Co.',
		status: 'paid',
		created_at: daysAgo(3),
		store_earning: 142,
		shipping_amount: 8.5,
		tax_amount: 7.1,
		gateway_fee: 4.6,
		marketplace_commission: 15.8,
		store_discount: 0,
		admin_discount: 0,
		store_payable: 153,
		marketplace_payable: 15.8,
	},
	{
		id: 1040,
		order_id: 5209,
		store_name: 'Peak Outdoor Gear',
		status: 'paid',
		created_at: daysAgo(5),
		store_earning: 219.5,
		shipping_amount: 12,
		tax_amount: 10.98,
		gateway_fee: 6.7,
		marketplace_commission: 24.4,
		store_discount: 10,
		admin_discount: 0,
		store_payable: 225.78,
		marketplace_payable: 24.4,
	},
	{
		id: 1039,
		order_id: 5201,
		store_name: 'Green Leaf Organics',
		status: 'refunded',
		created_at: daysAgo(8),
		store_earning: 38,
		shipping_amount: 4,
		tax_amount: 1.9,
		gateway_fee: 1.4,
		marketplace_commission: 4.2,
		store_discount: 0,
		admin_discount: 0,
		store_payable: 0,
		marketplace_payable: 0,
	},
];

/** Approval Queue → Stores (`/stores?status=pending`): stores waiting for approval. */
export const SAMPLE_PENDING_STORES = [
	{
		id: 11,
		store_name: 'Copper & Clay',
		description: 'Hand-thrown ceramics and kitchenware.',
		applied_on: daysAgo(1),
	},
	{
		id: 12,
		store_name: 'Little Sprout Toys',
		description: 'Wooden toys made from sustainable timber.',
		applied_on: daysAgo(2),
	},
	{
		id: 13,
		store_name: 'Northwind Coffee',
		description: 'Small-batch roasted single-origin beans.',
		applied_on: daysAgo(4),
	},
	{
		id: 14,
		store_name: 'Velvet Bloom Florals',
		description: 'Dried flower bouquets and wreaths.',
		applied_on: daysAgo(6),
	},
];

/** Approval Queue → Products: products stores submitted for review. */
export const SAMPLE_PENDING_PRODUCTS = [
	{
		id: 201,
		name: 'Organic Matcha Powder',
		sku: 'GLO-MATCHA-100',
		store_name: 'Green Leaf Organics',
		price: 24,
		date_created: daysAgo(1),
		categories: [{ name: 'Tea' }],
	},
	{
		id: 202,
		name: 'Linen Overshirt',
		sku: 'UTC-LIN-OS',
		store_name: 'Urban Thread Co.',
		price: 68,
		date_created: daysAgo(2),
		categories: [{ name: 'Clothing' }],
	},
	{
		id: 203,
		name: 'Ultralight Trail Tent',
		sku: 'POG-TENT-2P',
		store_name: 'Peak Outdoor Gear',
		price: 289,
		date_created: daysAgo(3),
		categories: [{ name: 'Camping' }],
	},
	{
		id: 204,
		name: 'Stoneware Mug Set',
		sku: 'CC-MUG-4',
		store_name: 'Copper & Clay',
		price: 42,
		date_created: daysAgo(5),
		categories: [{ name: 'Kitchen' }],
	},
];

/** Approval Queue → Coupons: coupons stores submitted for review. */
export const SAMPLE_PENDING_COUPONS = [
	{
		id: 301,
		code: 'SPRING15',
		store_name: 'Green Leaf Organics',
		amount: 15,
		discount_type: 'percent',
		status: 'pending',
		date_created: daysAgo(1),
	},
	{
		id: 302,
		code: 'FREESHIP50',
		store_name: 'Peak Outdoor Gear',
		amount: 10,
		discount_type: 'fixed_cart',
		status: 'pending',
		date_created: daysAgo(2),
	},
	{
		id: 303,
		code: 'WELCOME10',
		store_name: 'Urban Thread Co.',
		amount: 10,
		discount_type: 'percent',
		status: 'pending',
		date_created: daysAgo(4),
	},
	{
		id: 304,
		code: 'MUGS5OFF',
		store_name: 'Copper & Clay',
		amount: 5,
		discount_type: 'fixed_product',
		status: 'pending',
		date_created: daysAgo(6),
	},
];

/** Approval Queue → Withdrawals: stores asking to be paid out. */
export const SAMPLE_WITHDRAWALS = [
	{
		id: 1,
		store_id: 1,
		store_name: 'Green Leaf Organics',
		withdraw_amount: 420,
		status: 'pending',
	},
	{
		id: 2,
		store_id: 2,
		store_name: 'Urban Thread Co.',
		withdraw_amount: 265.5,
		status: 'pending',
	},
	{
		id: 4,
		store_id: 4,
		store_name: 'Peak Outdoor Gear',
		withdraw_amount: 980,
		status: 'pending',
	},
	{
		id: 3,
		store_id: 3,
		store_name: 'Copper & Clay',
		withdraw_amount: 75,
		status: 'pending',
	},
];

/** Approval Queue → Deactivations: stores asking to close. */
export const SAMPLE_DEACTIVATIONS = [
	{
		id: 21,
		store_name: 'Velvet Bloom Florals',
		reason: 'Closing the shop for the season.',
		date: daysAgo(1),
	},
	{
		id: 22,
		store_name: 'Northwind Coffee',
		reason: 'Moving to our own website.',
		date: daysAgo(3),
	},
	{
		id: 23,
		store_name: 'Little Sprout Toys',
		reason: 'Owner retiring.',
		date: daysAgo(5),
	},
	{
		id: 24,
		store_name: 'Harbor Candle Co.',
		reason: 'Not enough orders yet.',
		date: daysAgo(9),
	},
];

/** Refund requests (WooCommerce orders in refund-requested status), with the customer's reason as order meta. */
export const sampleRefunds = (reasonMetaKey: string) =>
	[
		{
			id: 5231,
			store_id: 1,
			store_name: 'Green Leaf Organics',
			total: 48.5,
			commission_amount: 5.1,
			status: 'refund-requested',
			date_created: daysAgo(1),
			reason: 'Arrived damaged',
		},
		{
			id: 5227,
			store_id: 2,
			store_name: 'Urban Thread Co.',
			total: 68,
			commission_amount: 7.4,
			status: 'refund-requested',
			date_created: daysAgo(2),
			reason: 'Wrong size',
		},
		{
			id: 5219,
			store_id: 4,
			store_name: 'Peak Outdoor Gear',
			total: 289,
			commission_amount: 31.2,
			status: 'refund-accepted',
			date_created: daysAgo(4),
			reason: 'Changed my mind',
		},
		{
			id: 5212,
			store_id: 3,
			store_name: 'Copper & Clay',
			total: 42,
			commission_amount: 4.6,
			status: 'refund-requested',
			date_created: daysAgo(6),
			reason: 'Item not as described',
		},
	].map(({ reason, ...order }) => ({
		...order,
		meta_data: [{ key: reasonMetaKey, value: reason }],
	}));

/** Customers → Questions: product questions from shoppers. `status` only feeds the sample's Answered/Unanswered tabs. */
export const SAMPLE_QUERIES = [
	{
		id: 1,
		product_id: 201,
		product_name: 'Organic Matcha Powder',
		store_name: 'Green Leaf Organics',
		question_text: 'Is this ceremonial grade?',
		answer_text: 'Yes, it is first-harvest ceremonial grade.',
		total_votes: 4,
		author_name: 'Emma W.',
		status: 'has_answer',
		question_visibility: 'public',
		question_date: daysAgo(1),
	},
	{
		id: 2,
		product_id: 203,
		product_name: 'Ultralight Trail Tent',
		store_name: 'Peak Outdoor Gear',
		question_text: 'Does it fit two adults with gear?',
		answer_text: '',
		total_votes: 2,
		author_name: 'Daniel R.',
		status: 'no_answer',
		question_visibility: 'public',
		question_date: daysAgo(2),
	},
	{
		id: 3,
		product_id: 202,
		product_name: 'Linen Overshirt',
		store_name: 'Urban Thread Co.',
		question_text: 'Can it be machine washed?',
		answer_text: 'Yes, on a cold, gentle cycle.',
		total_votes: 1,
		author_name: 'Priya S.',
		status: 'has_answer',
		question_visibility: 'private',
		question_date: daysAgo(4),
	},
	{
		id: 4,
		product_id: 204,
		product_name: 'Stoneware Mug Set',
		store_name: 'Copper & Clay',
		question_text: 'Are these dishwasher safe?',
		answer_text: '',
		total_votes: 0,
		author_name: 'Tom H.',
		status: 'no_answer',
		question_visibility: 'public',
		question_date: daysAgo(5),
	},
];

/** Customers → Store reviews. */
export const SAMPLE_REVIEWS = [
	{
		id: 1,
		customer_name: 'Emma Wilson',
		store_name: 'Green Leaf Organics',
		overall_rating: 5,
		review_title: 'Fresh and fast',
		review_content:
			'Everything arrived well packed and earlier than expected.',
		status: 'approved',
		date_created: daysAgo(1),
	},
	{
		id: 2,
		customer_name: 'Daniel Ruiz',
		store_name: 'Peak Outdoor Gear',
		overall_rating: 4,
		review_title: 'Great gear',
		review_content: 'Tent is excellent, delivery took a few extra days.',
		status: 'pending',
		date_created: daysAgo(2),
	},
	{
		id: 3,
		customer_name: 'Priya Shah',
		store_name: 'Urban Thread Co.',
		overall_rating: 5,
		review_title: 'Perfect fit',
		review_content: 'The sizing guide was spot on. Will order again.',
		status: 'approved',
		date_created: daysAgo(4),
	},
	{
		id: 4,
		customer_name: 'Tom Hughes',
		store_name: 'Copper & Clay',
		overall_rating: 3,
		review_title: 'Lovely mugs',
		review_content: 'Beautiful glaze, but one mug had a small chip.',
		status: 'pending',
		date_created: daysAgo(6),
	},
];

/** Compliance → Reported products. */
export const SAMPLE_ABUSE_REPORTS = [
	{
		id: 1,
		product: { id: 203, name: 'Ultralight Trail Tent', sku: 'POG-TENT-2P' },
		store: { name: 'Peak Outdoor Gear' },
		email: 'daniel@example.com',
		reason: 'Listing uses another brand’s photos',
		created_at: daysAgo(1),
	},
	{
		id: 2,
		product: {
			id: 201,
			name: 'Organic Matcha Powder',
			sku: 'GLO-MATCHA-100',
		},
		store: { name: 'Green Leaf Organics' },
		email: 'emma@example.com',
		reason: 'Organic claim not certified',
		created_at: daysAgo(3),
	},
	{
		id: 3,
		product: { id: 202, name: 'Linen Overshirt', sku: 'UTC-LIN-OS' },
		store: { name: 'Urban Thread Co.' },
		email: 'priya@example.com',
		reason: 'Wrong material listed',
		created_at: daysAgo(5),
	},
	{
		id: 4,
		product: { id: 204, name: 'Stoneware Mug Set', sku: 'CC-MUG-4' },
		store: { name: 'Copper & Clay' },
		email: 'tom@example.com',
		reason: 'Price misleading',
		created_at: daysAgo(7),
	},
];

/** Announcements to stores. */
export const SAMPLE_ANNOUNCEMENTS = [
	{
		id: 1,
		title: 'Holiday shipping cut-off',
		content:
			'Orders must ship by 20 December to arrive before the holidays.',
		store_name: 'All stores',
		status: 'publish',
		status_label: 'Published',
		date_created: daysAgo(1),
	},
	{
		id: 2,
		title: 'New payout schedule',
		content: 'Payouts now run every Monday instead of monthly.',
		store_name: 'All stores',
		status: 'publish',
		status_label: 'Published',
		date_created: daysAgo(5),
	},
	{
		id: 3,
		title: 'Photo guidelines updated',
		content: 'Use a plain background and at least 1000px images.',
		store_name: 'Urban Thread Co., Copper & Clay',
		status: 'pending',
		status_label: 'Pending',
		date_created: daysAgo(8),
	},
	{
		id: 4,
		title: 'Spring sale',
		content: 'Join the marketplace-wide spring sale from 1 March.',
		store_name: 'All stores',
		status: 'draft',
		status_label: 'Draft',
		date_created: daysAgo(12),
	},
];

/** Knowledgebase articles for stores. */
export const SAMPLE_ARTICLES = [
	{
		id: 1,
		title: 'Adding your first product',
		content:
			'A step-by-step guide to listing a product with photos and stock.',
		status: 'publish',
		status_label: 'Published',
		date_created: daysAgo(2),
	},
	{
		id: 2,
		title: 'How payouts work',
		content: 'When commissions are paid, and how to request a withdrawal.',
		status: 'publish',
		status_label: 'Published',
		date_created: daysAgo(6),
	},
	{
		id: 3,
		title: 'Handling refund requests',
		content: 'What to do when a customer asks for a refund.',
		status: 'pending',
		status_label: 'Pending',
		date_created: daysAgo(9),
	},
	{
		id: 4,
		title: 'Shipping settings explained',
		content: 'Set up zones, rates and free-shipping thresholds.',
		status: 'draft',
		status_label: 'Draft',
		date_created: daysAgo(14),
	},
];

/** Transaction history → Wallet: one store's commissions in and payouts out, newest first. */
export const SAMPLE_WALLET_TRANSACTIONS = [
	{
		id: 88,
		transaction_type: 'Commission',
		commission_id: 1042,
		narration: '',
		status: 'upcoming',
		credit: 93.82,
		debit: 0,
		balance: 512.32,
		created_at: daysAgo(1),
	},
	{
		id: 87,
		transaction_type: 'Withdrawal',
		commission_id: null,
		narration: 'Payout via bank transfer',
		status: 'completed',
		credit: 0,
		debit: 400,
		balance: 418.5,
		created_at: daysAgo(4),
	},
	{
		id: 86,
		transaction_type: 'Commission',
		commission_id: 1036,
		narration: '',
		status: 'completed',
		credit: 153,
		balance: 818.5,
		debit: 0,
		created_at: daysAgo(6),
	},
	{
		id: 85,
		transaction_type: 'Commission',
		commission_id: 1031,
		narration: '',
		status: 'completed',
		credit: 225.78,
		debit: 0,
		balance: 665.5,
		created_at: daysAgo(9),
	},
];

/** Transaction history → Direct transactions (MultiVendorX Pro): payments that went straight to a store. */
export const SAMPLE_DIRECT_TRANSACTIONS = [
	{
		id: 64,
		commission_id: 1042,
		created_at: daysAgo(1),
		order_id: 5218,
		store_gateway_fee: 2.9,
		store_gross: 93.82,
		narration: 'Paid to store via Stripe Connect',
	},
	{
		id: 63,
		commission_id: 1041,
		created_at: daysAgo(3),
		order_id: 5214,
		store_gateway_fee: 4.6,
		store_gross: 153,
		narration: 'Paid to store via PayPal Marketplace',
	},
	{
		id: 62,
		commission_id: 1040,
		created_at: daysAgo(5),
		order_id: 5209,
		store_gateway_fee: 6.7,
		store_gross: 225.78,
		narration: 'Paid to store via Stripe Connect',
	},
	{
		id: 61,
		commission_id: 1038,
		created_at: daysAgo(7),
		order_id: 5198,
		store_gateway_fee: 1.9,
		store_gross: 61.2,
		narration: 'Paid to store via Stripe Connect',
	},
];
