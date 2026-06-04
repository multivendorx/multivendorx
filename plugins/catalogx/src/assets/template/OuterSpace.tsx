import { __ } from '@wordpress/i18n';

export const OuterSpace = {
	id: 'store-registration',
	name: __('Sales Report', 'catalogx'),
	blocks: [
		{
			id: 1,
			type: 'heading',
			name: 'email-heading-welcome',
			text: __('Product Enquiry For Hoodie (p)', 'catalogx'),
			level: 1,
			style: {
				fontSize: 1.125,
			},
		},
		{
			id: 2,
			type: 'richtext',
			name: 'email-text-welcome-message',
			html: __(
				"Here's your sales report for the week of April 1-7, 2026.",
				'catalogx'
			),
			style: {
				color: '#2d3748',
				fontSize: 0.9,
			},
		},

		// 1st price column
		{
			id: 10,
			type: 'columns',
			name: 'email-columns',
			layout: '3',
			style: {
				paddingTop: 3,
			},
			columns: [
				[
					{
						id: 11,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __(
							'Marketplace commission (10%)',
							'catalogx'
						),
						style: {
							color: '#2d3748',
							fontSize: 1,
							textAlign: 'right',
						},
					},
				],
				[
					{
						id: 12,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __('−$324.00', 'catalogx'),
						style: {
							color: '#2d3748',
							fontSize: 1,
							fontWeight: 600,
							textAlign: 'right',
						},
					},
				],
			],
		},
		// 2nd price column
		{
			id: 13,
			type: 'columns',
			name: 'email-columns',
			layout: '3',
			style: {
				paddingTop: 0.5,
			},
			columns: [
				[
					{
						id: 14,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __('Total refunds', 'catalogx'),
						style: {
							color: '#2d3748',
							fontSize: 1,
							textAlign: 'right',
						},
					},
				],
				[
					{
						id: 15,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __('−$85.00', 'catalogx'),
						style: {
							color: '#d90d0d',
							fontSize: 1,
							fontWeight: 600,
							textAlign: 'right',
						},
					},
				],
			],
		},

		// 3rd price column
		{
			id: 16,
			type: 'columns',
			name: 'email-columns',
			layout: '3',
			style: {
				paddingTop: 0.5,
			},
			columns: [
				[
					{
						id: 17,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __('Net earnings', 'catalogx'),
						style: {
							color: '#2d3748',
							fontSize: 1,
							textAlign: 'right',
						},
					},
				],
				[
					{
						id: 18,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __('$2324.00', 'catalogx'),
						style: {
							color: '#59a937',
							fontSize: 1,
							fontWeight: 600,
							textAlign: 'right',
						},
					},
				],
			],
		},
		{
			id: 19,
			type: 'richtext',
			name: 'email-text-welcome-message',
			html: __(
				'Your payout will be processed within 2–3 business days. Reply to this email for any questions.',
				'catalogx'
			),
			style: {
				color: '#2d3748',
				fontSize: 1.125,
				marginTop: 6,
			},
		},
		{
			id: 20,
			type: 'richtext',
			name: 'email-text-welcome-message',
			html: __('Best regards,', 'catalogx'),
			style: {
				color: '#61666eff',
				fontSize: 1,
				marginBottom: 0.313,
				marginTop: 5,
			},
		},
		{
			id: 21,
			type: 'heading',
			name: 'email-heading-welcome',
			text: __('The Marketplace Team', 'catalogx'),
			level: 6,
			style: {
				fontSize: 1,
			},
		},
	],
};
