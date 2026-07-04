import { __ } from "@wordpress/i18n";

export const subscriptions = [
	{
		date: 'June 2, 2026',
		email: 'john.doe@gmail.com',
		status: 'Subscribed',
		status_key: 'subscribed',
		product: 'Classic White Coffee Mug',
		sku: 'MUG-001-WHT',
	},
	{
		date: 'June 5, 2026',
		email: 'sarah.williams@yahoo.com',
		status: 'Subscribed',
		status_key: 'subscribed',
		product: "Father's Day Special Mug",
		sku: 'MUG-002-FDS',
	},
	{
		date: 'June 8, 2026',
		email: 'michael.brown@outlook.com',
		status: 'Mail Sent',
		status_key: 'mail-sent',
		product: 'Personalised Name Mug',
		sku: 'MUG-003-PNM',
	},
	{
		date: 'June 10, 2026',
		email: 'emma.johnson@gmail.com',
		status: 'Subscribed',
		status_key: 'subscribed',
		product: 'Black Printed Coffee Mug',
		sku: 'MUG-004-BLK',
	},
	{
		date: 'June 12, 2026',
		email: 'alex.smith@test.com',
		status: 'Mail Sent',
		status_key: 'mail-sent',
		product: "Valentine's Day Special Mug",
		sku: 'MUG-005-VDS',
	},
	{
		date: 'June 14, 2026',
		email: 'olivia.miller@gmail.com',
		status: 'Subscribed',
		status_key: 'subscribed',
		product: 'Travel Coffee Mug',
		sku: 'MUG-006-TRV',
	},
	{
		date: 'June 16, 2026',
		email: 'david.wilson@test.com',
		status: 'Subscribed',
		status_key: 'subscribed',
		product: 'Premium Ceramic Mug',
		sku: 'MUG-007-PRM',
	},
	{
		date: 'June 18, 2026',
		email: 'sophia.clark@yahoo.com',
		status: 'Mail Sent',
		status_key: 'mail-sent',
		product: 'Birthday Gift Mug',
		sku: 'MUG-008-BDG',
	},
	{
		date: 'June 20, 2026',
		email: 'james.taylor@gmail.com',
		status: 'Subscribed',
		status_key: 'subscribed',
		product: 'Minimalist Coffee Cup',
		sku: 'MUG-009-MIN',
	},
	{
		date: 'June 21, 2026',
		email: 'mia.anderson@test.com',
		status: 'Mail Sent',
		status_key: 'mail-sent',
		product: 'Office Desk Mug',
		sku: 'MUG-010-OFD',
	},
];

export const defaultCategoryCounts = [
	{
		value: 'all',
		label: __('All', 'notifima'),
		count: 12,
	},
	{
		value: 'subscribed',
		label: __('Subscribed', 'notifima'),
		count: 9,
	},
	{
		value: 'unsubscribed',
		label: __('Unsubscribed', 'notifima'),
		count: 0,
	},
	{
		value: 'mail-sent',
		label: __('Mail Sent', 'notifima'),
		count: 3,
	},
];