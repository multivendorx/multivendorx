import { __ } from '@wordpress/i18n';

export const temp1 = {
	id: 'store-registration',
	name: __('Sales Report', 'multivendorx'),
	// previewText: __(
	// 	'Welcome to our marketplace! Complete your store setup to get started.',
	// 	'multivendorx'
	// ),
	blocks: [
		{
			id: 1,
			type: 'heading',
			name: 'email-heading-welcome',
			text: __('Hi Store Owner', 'multivendorx'),
			level: 1,
			style: {
				fontSize: 1.125,
			},
		},
		{
			id: 2,
			type: 'richtext',
			name: 'email-text-welcome-message',
			html: __("Here's your sales report for the week of April 1-7, 2026.", 'multivendorx'),
			style: {
				color: '#2d3748',
				fontSize: 0.9,
			},
		},

		// column start
		{
			id: 3,
			type: 'columns',
			name: 'email-columns',
			layout:'3',
			style: {
				backgroundColor: '#e8e8e8',
				paddingTop: 1.313,
				paddingBottom: 1.313,
				marginTop: 2.5,
				borderRadius: 0.313,
				gap: 2
			},
			columns: [
				[
					{
						id: 4,
						type: 'heading',
						name: 'email-heading-welcome',
						text: __('48', 'multivendorx'),
						level: 1,
						style: {
							fontSize: 2,
							lineHeight: 1,
							textAlign: 'center'
						},
					},
					{
						id: 5,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __("Total orders", 'multivendorx'),
						style: {
							color: '#2d3748',
							fontSize: 0.9,
							textAlign: 'center'

						},
					},
				],
				[
					{
						id: 6,
						type: 'heading',
						name: 'email-heading-welcome',
						text: __('$3,240', 'multivendorx'),
						level: 1,
						style: {
							fontSize: 2,
							lineHeight: 1,
							textAlign: 'center'

						},
					},
					{
						id: 7,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __("Total sales", 'multivendorx'),
						style: {
							color: '#2d3748',
							fontSize: 0.9,
							textAlign: 'center'
						},
					},
				],
				[
					{
						id: 8,
						type: 'heading',
						name: 'email-heading-welcome',
						text: __('$2,831', 'multivendorx'),
						level: 1,
						style: {
							fontSize: 2,
							lineHeight: 1,
							textAlign: 'center',
							color: '#59a937'
						},
					},
					{
						id: 9,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __("Your earnings", 'multivendorx'),
						style: {
							color: '#2d3748',
							fontSize: 0.9,
							textAlign: 'center'
						},
					},
				],
			],			
		},

		// 1st price column
		{
			id: 10,
			type: 'columns',
			name: 'email-columns',
			layout:'3',
			style: {
				paddingTop: 3,
			},
			columns: [
				[
					{
						id: 11,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __("Marketplace commission (10%)", 'multivendorx'),
						style: {
							color: '#2d3748',
							fontSize: 1,
							textAlign: 'right'
						},
					},
				],
				[
					{
						id: 12,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __("−$324.00", 'multivendorx'),
						style: {
							color: '#2d3748',
							fontSize: 1,
							fontWeight: 600,
							textAlign: 'right'
						},
					},
				],			
			]
		},
		// 2nd price column
		{
			id: 13,
			type: 'columns',
			name: 'email-columns',
			layout:'3',
			style: {
				paddingTop: 0.5,
			},
			columns: [
				[
					{
						id: 14,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __("Total refunds", 'multivendorx'),
						style: {
							color: '#2d3748',
							fontSize: 1,
							textAlign: 'right'
						},
					},
				],
				[
					{
						id: 15,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __("−$85.00", 'multivendorx'),
						style: {
							color: '#d90d0d',
							fontSize: 1,
							fontWeight: 600,
							textAlign: 'right'
						},
					},
				],			
			]
		},

		// 3rd price column
		{
			id: 16,
			type: 'columns',
			name: 'email-columns',
			layout:'3',
			style: {
				paddingTop: 0.5,
			},
			columns: [
				[
					{
						id: 17,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __("Net earnings", 'multivendorx'),
						style: {
							color: '#2d3748',
							fontSize: 1,
							textAlign: 'right'
						},
					},
				],
				[
					{
						id: 18,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __("$2324.00", 'multivendorx'),
						style: {
							color: '#59a937',
							fontSize: 1,
							fontWeight: 600,
							textAlign: 'right'
						},
					},
				],			
			]
		},
		{
			id: 19,
			type: 'richtext',
			name: 'email-text-welcome-message',
			html: __("Your payout will be processed within 2–3 business days. Reply to this email for any questions.", 'multivendorx'),
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
			html: __("Best regards,", 'multivendorx'),
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
			text: __('The Marketplace Team', 'multivendorx'),
			level: 6,
			style: {
				fontSize: 1,
			},
		},
	],
};
