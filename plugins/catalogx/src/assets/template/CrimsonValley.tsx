import { __ } from '@wordpress/i18n';

export const CrimsonValley = {
	id: 'minimal-card',
	name: __('Crimson Valley', 'catalogx'),
	blocks: [
		// Full width header with accent bar
		{
			id: 1,
			type: 'columns',
			name: 'header',
			layout: '1',
			style: {
				backgroundColor: '#ffffff',
				paddingTop: 1,
				paddingBottom: 1,
				paddingRight: 0,
				paddingLeft: 0,
				borderRadius: '0.5rem 0.5rem 0 0',
			},
			columns: [
				[
					{
						id: 2,
						type: 'richtext',
						name: 'accent-bar',
						html: '<div style="height: 4px; background: linear-gradient(to right, #f59e0b, #f97316, #ef4444);"></div>',
						style: {},
					},
				],
			],
		},

		// Clean white card body
		{
			id: 3,
			type: 'columns',
			name: 'card-body',
			layout: '1',
			style: {
				backgroundColor: '#ffffff',
				paddingTop: 2,
				paddingBottom: 2,
				paddingRight: 3,
				paddingLeft: 3,
				boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				borderRadius: '0 0 0.5rem 0.5rem',
			},
			columns: [
				[
					// Status badge
					{
						id: 4,
						type: 'richtext',
						name: 'status-badge',
						html: '<span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block;">NEW</span>',
						style: {
							marginBottom: '1rem',
						},
					},
					{
						id: 5,
						type: 'heading',
						name: 'email-heading',
						text: __('Product Enquiry', 'catalogx'),
						level: 2,
						style: {
							fontSize: 1.5,
							lineHeight: 1.3,
							color: '#1f2937',
							fontWeight: '700',
							marginBottom: '0.5rem',
						},
					},
					{
						id: 6,
						type: 'richtext',
						name: 'timestamp',
						html: __('Received: {date_time}', 'catalogx'),
						style: {
							fontSize: 0.85,
							lineHeight: 1.5,
							color: '#6b7280',
							marginBottom: '1.5rem',
						},
					},
					{
						id: 7,
						type: 'richtext',
						name: 'divider',
						html: '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 1.5rem 0;" />',
						style: {},
					},
					// Info grid
					{
						id: 8,
						type: 'richtext',
						name: 'info-grid',
						html: `
							<table style="width: 100%; border-collapse: collapse;">
								<tr>
									<td style="padding: 0.5rem 0; width: 33%;"><strong style="color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Customer</strong></td>
									<td style="padding: 0.5rem 0; color: #1f2937; font-weight: 500;">{customer_name}</td>
								</tr>
								<tr>
									<td style="padding: 0.5rem 0;"><strong style="color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Email</strong></td>
									<td style="padding: 0.5rem 0; color: #f59e0b; font-weight: 500;">{customer_email}</td>
								</tr>
								<tr>
									<td style="padding: 0.5rem 0;"><strong style="color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Product</strong></td>
									<td style="padding: 0.5rem 0; color: #1f2937; font-weight: 500;">{product_name}</td>
								</tr>
								<tr>
									<td style="padding: 0.5rem 0;"><strong style="color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Category</strong></td>
									<td style="padding: 0.5rem 0; color: #1f2937; font-weight: 500;">{product_category}</td>
								</tr>
							</table>
						`,
						style: {
							marginBottom: '1.5rem',
						},
					},
					
					// Footer note
					{
						id: 13,
						type: 'richtext',
						name: 'footer-note',
						html: __('<small style="color: #9ca3af; font-size: 0.75rem;">This is an automated notification. Please do not reply directly to this email.</small>', 'catalogx'),
						style: {
							textAlign: 'center',
							paddingTop: '1rem',
							borderTop: '1px solid #e5e7eb',
						},
					},
				],
			],
		},
	],
};