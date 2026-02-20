import { __ } from '@wordpress/i18n';

export const temp2 = {
	id: 'new-order',
	name: __('New Order Notification', 'multivendorx'),
	previewText: __(
		'New order received! Check details and start processing.',
		'multivendorx'
	),
	blocks: [
		{
			id: 1,
			type: 'heading',
			name: 'email-heading',
			label: 'Order Heading',
			text: __('New Order Received!', 'multivendorx'),
			level: 2,
			style: {
				backgroundColor: '#fff7ed',
				color: '#ea580c',
				fontSize: 24,
				fontWeight: 'bold',
				paddingTop: 20,
				paddingBottom: 20,
				textAlign: 'center',
				borderRadius: 8,
			},
		},
		{
			id: 2,
			type: 'richtext',
			name: 'email-text',
			label: 'Order Notification',
			html: __(
				'<p>You have received a new order from a customer. Here are the quick details:</p><div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;"><p><strong>Order ID:</strong> #ORD-2024-00123</p><p><strong>Customer:</strong> John Doe</p><p><strong>Total Amount:</strong> $149.99</p><p><strong>Order Date:</strong> January 15, 2024</p></div><p>Please process this order as soon as possible to ensure timely delivery.</p>',
				'multivendorx'
			),
			style: {
				backgroundColor: '#ffffff',
				color: '#555555',
				fontSize: 16,
				lineHeight: 1.6,
				paddingTop: 20,
				paddingBottom: 20,
			},
		},
		{
			id: 3,
			type: 'columns',
			name: 'email-columns',
			label: 'Action Buttons',
			layout: '2-50',
			columns: [
				[
					{
						id: 31,
						type: 'button',
						name: 'email-button',
						label: 'View Order',
						text: __('View Order Details', 'multivendorx'),
						url: '#',
						style: {
							backgroundColor: '#3b82f6',
							color: '#ffffff',
							fontSize: 14,
							fontWeight: 'bold',
							paddingTop: 10,
							paddingRight: 20,
							paddingBottom: 10,
							paddingLeft: 20,
							borderRadius: 5,
							width: '100%',
							textAlign: 'center',
						},
					},
				],
				[
					{
						id: 32,
						type: 'button',
						name: 'email-button',
						label: 'Process Order',
						text: __('Process Order', 'multivendorx'),
						url: '#',
						style: {
							backgroundColor: '#10b981',
							color: '#ffffff',
							fontSize: 14,
							fontWeight: 'bold',
							paddingTop: 10,
							paddingRight: 20,
							paddingBottom: 10,
							paddingLeft: 20,
							borderRadius: 5,
							width: '100%',
							textAlign: 'center',
						},
					},
				],
			],
			style: {
				backgroundColor: '#ffffff',
				paddingTop: 20,
				paddingBottom: 20,
			},
		},
	],
};
