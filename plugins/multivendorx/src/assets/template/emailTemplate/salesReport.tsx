import { __ } from '@wordpress/i18n';

// Every `{tag}` below is replaced with a real value when the email is sent
// (see the tag list in the builder's "Insert a tag" picker).
const stat = (
	idBase: number,
	valueTag: string,
	label: string,
	color = '#2d3748'
) => [
	{
		id: idBase,
		type: 'heading',
		name: 'email-stat-value',
		text: valueTag,
		level: 2,
		style: {
			fontSize: 22,
			lineHeight: 1.2,
			textAlign: 'center',
			color,
			paddingTop: 18,
		},
	},
	{
		id: idBase + 1,
		type: 'richtext',
		name: 'email-stat-label',
		html: label,
		style: {
			color: '#718096',
			fontSize: 13,
			textAlign: 'center',
			paddingBottom: 18,
		},
	},
];

const breakdownRow = (
	idBase: number,
	label: string,
	valueTag: string,
	valueColor = '#2d3748',
	bold = false
) => ({
	id: idBase,
	type: 'columns',
	name: 'email-breakdown-row',
	layout: '2',
	style: {
		paddingTop: 12,
		paddingBottom: 12,
		paddingLeft: 24,
		paddingRight: 24,
	},
	columns: [
		[
			{
				id: idBase + 1,
				type: 'richtext',
				name: 'email-breakdown-label',
				html: label,
				style: {
					color: '#4a5568',
					fontSize: 15,
					fontWeight: bold ? 600 : 400,
				},
			},
		],
		[
			{
				id: idBase + 2,
				type: 'richtext',
				name: 'email-breakdown-value',
				html: valueTag,
				style: {
					color: valueColor,
					fontSize: 15,
					fontWeight: 600,
					textAlign: 'right',
				},
			},
		],
	],
});

export const salesReport = {
	id: 'store-registration',
	name: __('Sales Report', 'multivendorx'),
	previewText: __(
		'Your weekly sales summary from {siteName}',
		'multivendorx'
	),
	blocks: [
		// Greeting
		{
			id: 3,
			type: 'heading',
			name: 'email-greeting',
			text: __('Hi {storeName},', 'multivendorx'),
			level: 2,
			style: {
				fontSize: 20,
				color: '#1a202c',
				paddingTop: 28,
				paddingLeft: 24,
				paddingRight: 24,
			},
		},
		{
			id: 4,
			type: 'richtext',
			name: 'email-intro',
			html: __(
				"Here's how your store performed on {siteName} this week.",
				'multivendorx'
			),
			style: {
				color: '#4a5568',
				fontSize: 15,
				paddingTop: 6,
				paddingBottom: 24,
				paddingLeft: 24,
				paddingRight: 24,
			},
		},

		// Headline numbers
		{
			id: 5,
			type: 'columns',
			name: 'email-stats',
			layout: '3',
			style: {
				backgroundColor: '#f7f5fc',
				borderRadius: 8,
				marginLeft: 24,
				marginRight: 24,
			},
			columns: [
				stat(6, '{totalOrders}', __('Total orders', 'multivendorx')),
				stat(8, '{totalSales}', __('Total sales', 'multivendorx')),
				stat(
					10,
					'{storeEarnings}',
					__('Your earnings', 'multivendorx'),
					'#2f8a3b'
				),
			],
		},

		// Earnings breakdown
		{
			id: 12,
			type: 'heading',
			name: 'email-breakdown-title',
			text: __('Earnings breakdown', 'multivendorx'),
			level: 3,
			style: {
				fontSize: 16,
				color: '#1a202c',
				paddingTop: 32,
				paddingBottom: 4,
				paddingLeft: 24,
				paddingRight: 24,
			},
		},
		breakdownRow(
			13,
			__('Total sales', 'multivendorx'),
			'{totalSales}'
		),
		breakdownRow(
			16,
			__('Marketplace commission ({commissionRate})', 'multivendorx'),
			'−{commissionAmount}'
		),
		breakdownRow(
			19,
			__('Total refunds', 'multivendorx'),
			'−{totalRefunds}',
			'#d90d0d'
		),
		breakdownRow(
			22,
			__('Net earnings', 'multivendorx'),
			'{netEarnings}',
			'#2f8a3b',
			true
		),

		{
			id: 25,
			type: 'divider',
			name: 'email-divider',
			style: { marginTop: 24, marginLeft: 24, marginRight: 24 },
		},

		// Closing
		{
			id: 26,
			type: 'richtext',
			name: 'email-payout-note',
			html: __(
				'Your payout will be processed within 2–3 business days. Reply to this email if you have any questions.',
				'multivendorx'
			),
			style: {
				color: '#4a5568',
				fontSize: 15,
				paddingTop: 20,
				paddingLeft: 24,
				paddingRight: 24,
			},
		},
		{
			id: 27,
			type: 'richtext',
			name: 'email-signoff',
			html: __('Best regards,', 'multivendorx'),
			style: {
				color: '#718096',
				fontSize: 14,
				paddingTop: 24,
				paddingLeft: 24,
				paddingRight: 24,
			},
		},
		{
			id: 28,
			type: 'heading',
			name: 'email-signature',
			text: __('The {siteName} Team', 'multivendorx'),
			level: 4,
			style: {
				fontSize: 15,
				color: '#1a202c',
				paddingBottom: 28,
				paddingLeft: 24,
				paddingRight: 24,
			},
		},
	],
};
