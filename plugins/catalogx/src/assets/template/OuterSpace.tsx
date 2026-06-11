import { __ } from '@wordpress/i18n';

export const OuterSpace = {
	id: 'store-registration',
	name: __('Sales Report', 'catalogx'),
	blocks: [
		{
			id: 1,
			type: 'heading',
			name: 'email-heading-welcome',
			text: __('Product Enquiry For Hoodie ,{customer_name}', 'catalogx'),
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
	],
};
