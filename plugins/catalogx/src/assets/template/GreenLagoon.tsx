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
					{
						id: 3,
						type: 'richtext',
						name: 'email-subtext',
						html: __(
							'Enquiry #ENQ-2026-0042 · Customer Enquiry',
							'catalogx'
						),
						style: {
							textAlign: 'center',
							fontSize: 0.9,
							lineHeight: 1.4,
							paddingTop: 0.45,
							color: '#6ee7b7',
							fontWeight: '300',
							letterSpacing: '0.5px',
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
							'{customer_name}',
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
							'{customer_email}',
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

		// Product Details Card
		{
			id: 14,
			type: 'columns',
			name: 'product-info',
			layout: '2',
			style: {
				backgroundColor: '#f0fdf4',
				paddingTop: 1.25,
				paddingBottom: 1.25,
				paddingRight: 1.5,
				paddingLeft: 1.5,
				marginTop: 0.5,
				marginBottom: 1.5,
				borderRadius: '0.5rem',
				border: '1px solid #bbf7d0',
			},
			columns: [
				[
					{
						id: 15,
						type: 'heading',
						name: 'product-name-label',
						text: __('Product Name', 'catalogx'),
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
						id: 16,
						type: 'richtext',
						name: 'product-name',
						html: __(
							'{product_name}',
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
						id: 17,
						type: 'heading',
						name: 'product-category-label',
						text: __('Category', 'catalogx'),
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
						id: 18,
						type: 'richtext',
						name: 'product-category',
						html: __(
							'{product_category}',
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
			],
		},

		// Customer Message Section
		{
			id: 19,
			type: 'columns',
			name: 'message-section',
			layout: '1',
			style: {
				backgroundColor: '#f0fdf4',
				paddingTop: 1,
				paddingBottom: 1,
				paddingRight: 1.5,
				paddingLeft: 1.5,
				marginTop: 0.5,
				marginBottom: 1.5,
				borderRadius: '0.5rem',
				borderLeft: '4px solid #059669',
			},
			columns: [
				[
					{
						id: 20,
						type: 'heading',
						name: 'message-label',
						text: __('Customer Message', 'catalogx'),
						level: 3,
						style: {
							fontSize: 0.85,
							lineHeight: 1.3,
							color: '#065f46',
							fontWeight: '600',
							textTransform: 'uppercase',
							letterSpacing: '0.5px',
							marginBottom: '0.25rem',
						},
					},
					{
						id: 21,
						type: 'richtext',
						name: 'message-content',
						html: __(
							'{customer_message}',
							'catalogx'
						),
						style: {
							fontSize: 0.95,
							lineHeight: 1.7,
							paddingTop: '0.25rem',
							color: '#1a202c',
							fontStyle: 'italic',
						},
					},
				],
			],
		},

		// Action Buttons
		{
			id: 22,
			type: 'columns',
			name: 'actions',
			layout: '2',
			style: {
				marginTop: 1,
				marginBottom: 1.5,
				paddingTop: 0.5,
				paddingBottom: 0.5,
			},
			columns: [
				[
					{
						id: 23,
						type: 'richtext',
						name: 'reply-button',
						html: __(
							'<a href="#" style="display: block; background-color: #065f46; color: #ffffff; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.85rem; text-align: center; width: 100%; box-sizing: border-box;">Reply to Customer</a>',
							'catalogx'
						),
						style: {
							textAlign: 'center',
						},
					},
				],
				[
					{
						id: 24,
						type: 'richtext',
						name: 'view-button',
						html: __(
							'<a href="#" style="display: block; background-color: transparent; color: #065f46; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.85rem; text-align: center; width: 100%; box-sizing: border-box; border: 2px solid #34d399;">View Enquiry</a>',
							'catalogx'
						),
						style: {
							textAlign: 'center',
						},
					},
				],
			],
		},

		// Footer
		{
			id: 25,
			type: 'columns',
			name: 'footer',
			layout: '1',
			style: {
				backgroundColor: '#065f46',
				paddingTop: 1.5,
				paddingBottom: 1.5,
				paddingRight: 4,
				paddingLeft: 4,
				borderRadius: '0 0 0.5rem 0.5rem',
				borderTop: '3px solid #34d399',
			},
			columns: [
				[
					{
						id: 26,
						type: 'richtext',
						name: 'footer-text',
						html: __(
							'<div style="text-align: center; color: #6ee7b7; font-size: 0.75rem; font-weight: 300;">This is an automated notification from Green Lagoon</div>',
							'catalogx'
						),
						style: {
							textAlign: 'center',
							paddingBottom: 0.25,
						},
					},
					{
						id: 27,
						type: 'richtext',
						name: 'footer-links',
						html: __(
							'<div style="text-align: center; color: #6ee7b7; font-size: 0.65rem; display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; padding-top: 0.5rem; padding-bottom: 0.5rem;"><a href="#" style="color: #6ee7b7; text-decoration: none;">Privacy Policy</a><a href="#" style="color: #6ee7b7; text-decoration: none;">Terms of Service</a><a href="#" style="color: #6ee7b7; text-decoration: none;">Support</a></div>',
							'catalogx'
						),
						style: {
							textAlign: 'center',
						},
					},
					{
						id: 28,
						type: 'richtext',
						name: 'footer-copyright',
						html: __(
							'<div style="text-align: center; color: #6ee7b7; font-size: 0.6rem; opacity: 0.6; padding-top: 0.5rem;">&copy; 2026 Green Lagoon. All rights reserved.</div>',
							'catalogx'
						),
						style: {
							textAlign: 'center',
							paddingTop: 0.5,
						},
					},
				],
			],
		},
	],
};