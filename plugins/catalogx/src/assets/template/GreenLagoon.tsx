import { __ } from '@wordpress/i18n';

export const GreenLagoon = {
	id: 'green-lagoon',
	name: __('Green Lagoon', 'catalogx'),
	blocks: [
		// Header with green accent
		{
			id: 1,
			type: 'columns',
			name: 'header',
			layout: '1',
			style: {
				backgroundColor: '#065f46',
				paddingTop: 2.5,
				paddingBottom: 2,
				paddingRight: 4,
				paddingLeft: 4,
				borderRadius: '0.5rem 0.5rem 0 0',
				borderBottom: '3px solid #34d399',
			},
			columns: [
				[
					{
						id: 2,
						type: 'heading',
						name: 'email-heading',
						text: __('New Enquiry Submitted', 'catalogx'),
						level: 2,
						style: {
							fontSize: 2,
							lineHeight: 1.2,
							textAlign: 'center',
							color: '#ffffff',
							fontWeight: '600',
							letterSpacing: '-0.02em',
						},
					},
				],
			],
		},

		// Greeting section
		{
			id: 4,
			type: 'richtext',
			name: 'greeting',
			html: __(
				'Dear Admin,',
				'catalogx'
			),
			style: {
				fontSize: 1.1,
				lineHeight: 1.5,
				paddingTop: 1.5,
				paddingBottom: 0.5,
				paddingLeft: 2,
				paddingRight: 2,
				fontWeight: '500',
				color: '#1a202c',
			},
		},

		// Main message
		{
			id: 5,
			type: 'richtext',
			name: 'message',
			html: __(
				'A customer has submitted a new product enquiry. Please review the details below and respond at your earliest convenience.',
				'catalogx'
			),
			style: {
				fontSize: 0.95,
				lineHeight: 1.6,
				paddingTop: 0.313,
				paddingBottom: 1.5,
				paddingLeft: 2,
				paddingRight: 2,
				color: '#4a5568',
			},
		},

		// Enquiry Details Header
		{
			id: 6,
			type: 'columns',
			name: 'section-header',
			layout: '1',
			style: {
				paddingTop: 1.5,
				paddingRight: 4,
				paddingLeft: 4,
				paddingBottom: 0.5,
			},
			columns: [
				[
					{
						id: 7,
						type: 'heading',
						name: 'section-title',
						text: __('Enquiry Details', 'catalogx'),
						level: 2,
						style: {
							fontSize: 1.5,
							lineHeight: 1.3,
							textAlign: 'center',
							color: '#065f46',
							fontWeight: '600',
							borderBottom: '2px solid #34d399',
							paddingBottom: '0.5rem',
							display: 'inline-block',
						},
					},
					{
						id: 8,
						type: 'richtext',
						name: 'section-subtext',
						html: __(
							'Customer information and enquiry details',
							'catalogx'
						),
						style: {
							textAlign: 'center',
							fontSize: 0.9,
							lineHeight: 1.5,
							paddingTop: 0.45,
							color: '#718096',
						},
					},
				],
			],
		},

		// Customer Information Card
		{
			id: 9,
			type: 'columns',
			name: 'customer-info',
			layout: '2',
			style: {
				backgroundColor: '#f0fdf4',
				paddingTop: 1.25,
				paddingBottom: 1.25,
				paddingRight: 1.5,
				paddingLeft: 1.5,
				marginTop: 1,
				marginBottom: 1,
				borderRadius: '0.5rem',
				borderLeft: '4px solid #059669',
				border: '1px solid #bbf7d0',
			},
			columns: [
				[
					{
						id: 10,
						type: 'heading',
						name: 'customer-name-label',
						text: __('Customer Name', 'catalogx'),
						level: 3,
						style: {
							fontSize: 0.85,
							lineHeight: 1.3,
							color: '#065f46',
							fontWeight: '600',
							textTransform: 'uppercase',
							letterSpacing: '0.5px',
						},
					},
					{
						id: 11,
						type: 'richtext',
						name: 'customer-name',
						html: __(
							'[{name_enter_your_name}]',
							'catalogx'
						),
						style: {
							fontSize: 1.1,
							lineHeight: 1.4,
							paddingTop: '0.25rem',
							color: '#1a202c',
							fontWeight: '500',
						},
					},
				],
				[
					{
						id: 12,
						type: 'heading',
						name: 'customer-email-label',
						text: __('Customer Email', 'catalogx'),
						level: 3,
						style: {
							fontSize: 0.85,
							lineHeight: 1.3,
							color: '#065f46',
							fontWeight: '600',
							textTransform: 'uppercase',
							letterSpacing: '0.5px',
						},
					},
					{
						id: 13,
						type: 'richtext',
						name: 'customer-email',
						html: __(
							'[{email_enter_your_email}]',
							'catalogx'
						),
						style: {
							fontSize: 1.1,
							lineHeight: 1.4,
							paddingTop: '0.25rem',
							color: '#059669',
							fontWeight: '500',
						},
					},
				],
			],
		},
	],
};