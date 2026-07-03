import { __ } from '@wordpress/i18n';

export const Starlight = {
	id: 'royal-indigo',
	name: __('Royal Indigo', 'catalogx'),
	blocks: [
		// Header
		{
			id: 1,
			type: 'columns',
			name: 'header',
			layout: '1',
			style: {
				backgroundColor: '#3730a3',
				paddingTop: 2.5,
				paddingBottom: 2,
				paddingRight: 4,
				paddingLeft: 4,
				borderRadius: '0.5rem 0.5rem 0 0',
				borderBottom: '4px solid #818cf8',
			},
			columns: [
				[
					{
						id: 2,
						type: 'heading',
						name: 'email-heading',
						text: __('New Enquiry Received', 'catalogx'),
						level: 2,
						style: {
							fontSize: 2,
							lineHeight: 1.2,
							textAlign: 'center',
							color: '#ffffff',
							fontWeight: '700',
							letterSpacing: '-0.02em',
						},
					},
				],
			],
		},

		// Greeting
		{
			id: 3,
			type: 'richtext',
			name: 'greeting',
			html: __('Hello Admin,', 'catalogx'),
			style: {
				fontSize: 1.1,
				lineHeight: 1.5,
				paddingTop: 1.5,
				paddingBottom: 0.5,
				paddingLeft: 2.5,
				paddingRight: 2.5,
				fontWeight: '600',
				color: '#1e1b4b',
			},
		},

		// Message
		{
			id: 4,
			type: 'richtext',
			name: 'message',
			html: __(
				'A customer has submitted a new product enquiry. Please review the details below.',
				'catalogx'
			),
			style: {
				fontSize: 0.95,
				lineHeight: 1.6,
				paddingTop: 0.313,
				paddingBottom: 1.5,
				paddingLeft: 2.5,
				paddingRight: 2.5,
				color: '#4b5563',
			},
		},

		// Section Header
		{
			id: 5,
			type: 'columns',
			name: 'section-header',
			layout: '1',
			style: {
				paddingTop: 1,
				paddingBottom: 1,
				paddingRight: 2.5,
				paddingLeft: 2.5,
				backgroundColor: '#f5f3ff',
				borderTop: '1px solid #e0e7ff',
				borderBottom: '1px solid #e0e7ff',
			},
			columns: [
				[
					{
						id: 6,
						type: 'heading',
						name: 'section-title',
						text: __('Enquiry Details', 'catalogx'),
						level: 2,
						style: {
							fontSize: 1.25,
							lineHeight: 1.3,
							color: '#3730a3',
							fontWeight: '600',
						},
					},
				],
			],
		},

		// Customer Info (Two Column Layout)
		{
			id: 7,
			type: 'columns',
			name: 'customer-info',
			layout: '2',
			style: {
				paddingTop: 1.5,
				paddingBottom: 1,
				paddingRight: 2.5,
				paddingLeft: 2.5,
			},
			columns: [
				[
					{
						id: 8,
						type: 'richtext',
						name: 'customer-name-label',
						html: __('Customer Name', 'catalogx'),
						style: {
							fontSize: 0.75,
							lineHeight: 1.3,
							color: '#6b7280',
							fontWeight: '600',
							textTransform: 'uppercase',
							letterSpacing: '0.5px',
							marginBottom: '0.25rem',
						},
					},
					{
						id: 9,
						type: 'richtext',
						name: 'customer-name',
						html: __('[{name_enter_your_name}]', 'catalogx'),
						style: {
							fontSize: 1.1,
							lineHeight: 1.4,
							color: '#1f2937',
							fontWeight: '500',
							marginBottom: '1rem',
						},
					},
				],
				[
					{
						id: 10,
						type: 'richtext',
						name: 'customer-email-label',
						html: __('Email Address', 'catalogx'),
						style: {
							fontSize: 0.75,
							lineHeight: 1.3,
							color: '#6b7280',
							fontWeight: '600',
							textTransform: 'uppercase',
							letterSpacing: '0.5px',
							marginBottom: '0.25rem',
						},
					},
					{
						id: 11,
						type: 'richtext',
						name: 'customer-email',
						html: __('[{email_enter_your_email}]', 'catalogx'),
						style: {
							fontSize: 1.1,
							lineHeight: 1.4,
							color: '#4f46e5',
							fontWeight: '500',
							marginBottom: '1rem',
						},
					},
				],
			],
		},

		// Divider
		{
			id: 12,
			type: 'richtext',
			name: 'divider',
			html: '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 2.5rem;" />',
			style: {
				paddingTop: 0,
				paddingBottom: 0,
			},
		},

		// Footer
		{
			id: 21,
			type: 'columns',
			name: 'footer',
			layout: '1',
			style: {
				paddingTop: 1.5,
				paddingBottom: 1.5,
				paddingRight: 2.5,
				paddingLeft: 2.5,
				backgroundColor: '#f9fafb',
				borderTop: '1px solid #e5e7eb',
				borderRadius: '0 0 0.5rem 0.5rem',
			},
			columns: [
				[
					{
						id: 22,
						type: 'richtext',
						name: 'footer-text',
						html: __('This is an automated notification.', 'catalogx'),
						style: {
							textAlign: 'center',
							fontSize: 0.85,
							lineHeight: 1.5,
							color: '#9ca3af',
						},
					},
				],
			],
		},
	],
};