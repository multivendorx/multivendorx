import { __ } from '@wordpress/i18n';

export const MoonlitSky = {
	id: 'sunset-orange',
	name: __('Sunset Orange', 'catalogx'),
	blocks: [
		// Header
		{
			id: 1,
			type: 'columns',
			name: 'header',
			layout: '1',
			style: {
				backgroundColor: '#c2410c',
				paddingTop: 2.5,
				paddingBottom: 2,
				paddingRight: 4,
				paddingLeft: 4,
				borderRadius: '0.5rem 0.5rem 0 0',
				borderBottom: '4px solid #fb923c',
			},
			columns: [
				[
					{
						id: 2,
						type: 'heading',
						name: 'email-heading',
						text: __('New Enquiry Alert', 'catalogx'),
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
			html: __('Dear Admin,', 'catalogx'),
			style: {
				fontSize: 1.1,
				lineHeight: 1.5,
				paddingTop: 1.5,
				paddingBottom: 0.5,
				paddingLeft: 2.5,
				paddingRight: 2.5,
				fontWeight: '600',
				color: '#1c1917',
			},
		},

		// Message
		{
			id: 4,
			type: 'richtext',
			name: 'message',
			html: __(
				'A new product enquiry has been submitted. Please find the customer details below.',
				'catalogx'
			),
			style: {
				fontSize: 0.95,
				lineHeight: 1.6,
				paddingTop: 0.313,
				paddingBottom: 1.5,
				paddingLeft: 2.5,
				paddingRight: 2.5,
				color: '#44403c',
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
				backgroundColor: '#fff7ed',
				borderTop: '1px solid #ffedd5',
				borderBottom: '1px solid #ffedd5',
			},
			columns: [
				[
					{
						id: 6,
						type: 'heading',
						name: 'section-title',
						text: __('Customer & Product Details', 'catalogx'),
						level: 2,
						style: {
							fontSize: 1.25,
							lineHeight: 1.3,
							color: '#c2410c',
							fontWeight: '600',
						},
					},
				],
			],
		},

		// Customer Info
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
						html: __('Full Name', 'catalogx'),
						style: {
							fontSize: 0.75,
							lineHeight: 1.3,
							color: '#78716c',
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
						html: __('{customer_name}', 'catalogx'),
						style: {
							fontSize: 1.1,
							lineHeight: 1.4,
							color: '#1c1917',
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
						html: __('Email', 'catalogx'),
						style: {
							fontSize: 0.75,
							lineHeight: 1.3,
							color: '#78716c',
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
						html: __('{customer_email}', 'catalogx'),
						style: {
							fontSize: 1.1,
							lineHeight: 1.4,
							color: '#ea580c',
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
			html: '<hr style="border: none; border-top: 2px solid #ffedd5; margin: 0 2.5rem;" />',
			style: {
				paddingTop: 0,
				paddingBottom: 0,
			},
		},

		// Product Info
		{
			id: 13,
			type: 'columns',
			name: 'product-info',
			layout: '2',
			style: {
				paddingTop: 1,
				paddingBottom: 1.5,
				paddingRight: 2.5,
				paddingLeft: 2.5,
			},
			columns: [
				[
					{
						id: 14,
						type: 'richtext',
						name: 'product-name-label',
						html: __('Product', 'catalogx'),
						style: {
							fontSize: 0.75,
							lineHeight: 1.3,
							color: '#78716c',
							fontWeight: '600',
							textTransform: 'uppercase',
							letterSpacing: '0.5px',
							marginBottom: '0.25rem',
						},
					},
					{
						id: 15,
						type: 'richtext',
						name: 'product-name',
						html: __('{product_name}', 'catalogx'),
						style: {
							fontSize: 1.1,
							lineHeight: 1.4,
							color: '#1c1917',
							fontWeight: '500',
							marginBottom: '1rem',
						},
					},
				],
				[
					{
						id: 16,
						type: 'richtext',
						name: 'product-category-label',
						html: __('Category', 'catalogx'),
						style: {
							fontSize: 0.75,
							lineHeight: 1.3,
							color: '#78716c',
							fontWeight: '600',
							textTransform: 'uppercase',
							letterSpacing: '0.5px',
							marginBottom: '0.25rem',
						},
					},
					{
						id: 17,
						type: 'richtext',
						name: 'product-category',
						html: __('{product_category}', 'catalogx'),
						style: {
							fontSize: 1.1,
							lineHeight: 1.4,
							color: '#1c1917',
							fontWeight: '500',
							marginBottom: '1rem',
						},
					},
				],
			],
		},

		// Message
		{
			id: 18,
			type: 'columns',
			name: 'message-section',
			layout: '1',
			style: {
				paddingTop: 0.5,
				paddingBottom: 2,
				paddingRight: 2.5,
				paddingLeft: 2.5,
			},
			columns: [
				[
					{
						id: 19,
						type: 'richtext',
						name: 'message-label',
						html: __('Message', 'catalogx'),
						style: {
							fontSize: 0.75,
							lineHeight: 1.3,
							color: '#78716c',
							fontWeight: '600',
							textTransform: 'uppercase',
							letterSpacing: '0.5px',
							marginBottom: '0.5rem',
						},
					},
					{
						id: 20,
						type: 'richtext',
						name: 'customer-message',
						html: __('{customer_message}', 'catalogx'),
						style: {
							fontSize: 0.95,
							lineHeight: 1.6,
							color: '#44403c',
							backgroundColor: '#fff7ed',
							padding: '1rem',
							borderRadius: '0.375rem',
							borderLeft: '3px solid #fb923c',
						},
					},
				],
			],
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
				backgroundColor: '#fafaf9',
				borderTop: '1px solid #e7e5e4',
				borderRadius: '0 0 0.5rem 0.5rem',
			},
			columns: [
				[
					{
						id: 22,
						type: 'richtext',
						name: 'footer-text',
						html: __('Please respond to this enquiry promptly.', 'catalogx'),
						style: {
							textAlign: 'center',
							fontSize: 0.85,
							lineHeight: 1.5,
							color: '#a8a29e',
						},
					},
				],
			],
		},
	],
};