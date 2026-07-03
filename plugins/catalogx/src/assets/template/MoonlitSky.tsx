import { __ } from '@wordpress/i18n';

export const MoonlitSky = {
	id: 'moon-litSky',
	name: __('Moonlit Sky', 'catalogx'),
	blocks: [
		{
			id: 1,
			type: 'columns',
			name: 'brand-header',
			layout: '1',
			style: {
				backgroundColor: '#0f172a',
				paddingTop: 2,
				paddingBottom: 2,
				paddingRight: 4,
				paddingLeft: 4,
				borderRadius: '0.75rem 0.75rem 0 0',
			},
			columns: [
				[
					{
						id: 2,
						type: 'richtext',
						name: 'brand-name',
						html: __(
							'<span style="font-size: 1.5rem; font-weight: 700; color: #e2e8f0; letter-spacing: 2px;">SHOPHIVE</span>',
							'catalogx'
						),
						style: {
							textAlign: 'center',
							paddingTop: 0.5,
							paddingBottom: 0.5,
						},
					},
					{
						id: 3,
						type: 'richtext',
						name: 'brand-tagline',
						html: __(
							'<span style="font-size: 0.875rem; color: #94a3b8; letter-spacing: 4px; text-transform: uppercase;">Admin Notification System</span>',
							'catalogx'
						),
						style: {
							textAlign: 'center',
							paddingTop: 0.25,
						},
					},
				],
			],
		},

		// Main content wrapper
		{
			id: 4,
			type: 'columns',
			name: 'main-content',
			layout: '1',
			style: {
				backgroundColor: '#ffffff',
				paddingTop: 2.5,
				paddingBottom: 2.5,
				paddingRight: 3.5,
				paddingLeft: 3.5,
				borderLeft: '1px solid #e2e8f0',
				borderRight: '1px solid #e2e8f0',
			},
			columns: [
				[
					// Notification badge
					{
						id: 5,
						type: 'columns',
						name: 'badge-container',
						layout: '1',
						style: {
							marginBottom: 1.5,
						},
						columns: [
							[
								{
									id: 6,
									type: 'richtext',
									name: 'notification-badge',
									html: __(
										'<span style="background-color: #f1f5f9; color: #0f172a; padding: 0.25rem 1rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">New Enquiry Received</span>',
										'catalogx'
									),
									style: {
										textAlign: 'center',
									},
								},
							],
						],
					},

					// Main heading
					{
						id: 7,
						type: 'heading',
						name: 'main-heading',
						text: __('Product Enquiry Notification', 'catalogx'),
						level: 1,
						style: {
							fontSize: 2.25,
							lineHeight: 1.2,
							textAlign: 'center',
							color: '#0f172a',
							fontWeight: '700',
							letterSpacing: '-0.025em',
							marginBottom: 0.75,
						},
					},

					// Divider
					{
						id: 8,
						type: 'columns',
						name: 'divider',
						layout: '1',
						style: {
							marginTop: 1,
							marginBottom: 1.5,
						},
						columns: [
							[
								{
									id: 9,
									type: 'richtext',
									name: 'divider-line',
									html: __(
										'<hr style="border: none; height: 2px; background: linear-gradient(to right, transparent, #cbd5e1, transparent); width: 50%; margin: 0 auto;" />',
										'catalogx'
									),
									style: {
										textAlign: 'center',
									},
								},
							],
						],
					},

					// Greeting
					{
						id: 10,
						type: 'richtext',
						name: 'greeting',
						html: __(
							'<span style="font-size: 1.125rem; font-weight: 500; color: #334155;">Dear Admin,</span>',
							'catalogx'
						),
						style: {
							paddingTop: 0.5,
							paddingBottom: 0.5,
						},
					},

					// Message
					{
						id: 11,
						type: 'richtext',
						name: 'message',
						html: __(
							'<span style="font-size: 1rem; line-height: 1.6; color: #475569;">We have received a new product enquiry from one of our customers. Please review the customer information below and take appropriate action.</span>',
							'catalogx'
						),
						style: {
							paddingTop: 0.313,
							paddingBottom: 1.5,
						},
					},

					// Customer information section title
					{
						id: 12,
						type: 'heading',
						name: 'section-title',
						text: __('Customer Information', 'catalogx'),
						level: 3,
						style: {
							fontSize: 1.25,
							lineHeight: 1.3,
							color: '#0f172a',
							fontWeight: '600',
							marginBottom: 0.5,
							paddingTop: 0.5,
						},
					},

					// Customer details in a grid layout
					{
						id: 13,
						type: 'columns',
						name: 'customer-details',
						layout: '2',
						style: {
							backgroundColor: '#f8fafc',
							paddingTop: 1.25,
							paddingBottom: 1.25,
							paddingRight: 1.5,
							paddingLeft: 1.5,
							marginTop: 0.75,
							marginBottom: 1.5,
							borderRadius: '0.5rem',
							border: '1px solid #e2e8f0',
						},
						columns: [
							// Left column - Customer Name
							[
								{
									id: 14,
									type: 'richtext',
									name: 'name-label',
									html: __(
										'<span style="font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</span>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.25,
									},
								},
								{
									id: 15,
									type: 'richtext',
									name: 'name-value',
									html: __(
										'<span style="font-size: 1.125rem; font-weight: 500; color: #0f172a;">John Doe</span>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.5,
									},
								},
							],
							// Right column - Customer Email
							[
								{
									id: 16,
									type: 'richtext',
									name: 'email-label',
									html: __(
										'<span style="font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</span>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.25,
									},
								},
								{
									id: 17,
									type: 'richtext',
									name: 'email-value',
									html: __(
										'<span style="font-size: 1.125rem; font-weight: 500; color: #0f172a;">john.doe@example.com</span>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.5,
									},
								},
							],
						],
					},

					// Enquiry details section
					{
						id: 18,
						type: 'heading',
						name: 'enquiry-title',
						text: __('Enquiry Details', 'catalogx'),
						level: 3,
						style: {
							fontSize: 1.25,
							lineHeight: 1.3,
							color: '#0f172a',
							fontWeight: '600',
							marginBottom: 0.5,
							paddingTop: 0.5,
						},
					},

					// Enquiry details grid
					{
						id: 19,
						type: 'columns',
						name: 'enquiry-details',
						layout: '2',
						style: {
							backgroundColor: '#ffffff',
							paddingTop: 1,
							paddingBottom: 1,
							paddingRight: 1.5,
							paddingLeft: 1.5,
							marginTop: 0.75,
							marginBottom: 1.5,
							borderRadius: '0.5rem',
							border: '1px solid #e2e8f0',
						},
						columns: [
							// Left column
							[
								{
									id: 20,
									type: 'richtext',
									name: 'product-label',
									html: __(
										'<span style="font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Product</span>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.25,
									},
								},
								{
									id: 21,
									type: 'richtext',
									name: 'product-value',
									html: __(
										'<span style="font-size: 1rem; font-weight: 400; color: #0f172a;">Premium Wireless Headphones</span>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.75,
									},
								},
								{
									id: 22,
									type: 'richtext',
									name: 'quantity-label',
									html: __(
										'<span style="font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Quantity</span>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.25,
									},
								},
								{
									id: 23,
									type: 'richtext',
									name: 'quantity-value',
									html: __(
										'<span style="font-size: 1rem; font-weight: 400; color: #0f172a;">2 Units</span>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.5,
									},
								},
							],
							// Right column
							[
								{
									id: 24,
									type: 'richtext',
									name: 'date-label',
									html: __(
										'<span style="font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Enquiry Date</span>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.25,
									},
								},
								{
									id: 25,
									type: 'richtext',
									name: 'date-value',
									html: __(
										'<span style="font-size: 1rem; font-weight: 400; color: #0f172a;">June 30, 2026</span>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.75,
									},
								},
								{
									id: 26,
									type: 'richtext',
									name: 'status-label',
									html: __(
										'<span style="font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Status</span>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.25,
									},
								},
								{
									id: 27,
									type: 'richtext',
									name: 'status-value',
									html: __(
										'<span style="font-size: 1rem; font-weight: 500; color: #2563eb; background: #eff6ff; padding: 0.125rem 0.75rem; border-radius: 9999px; display: inline-block;">Pending Review</span>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.5,
									},
								},
							],
						],
					},

					// Action buttons
					{
						id: 28,
						type: 'columns',
						name: 'actions',
						layout: '2',
						style: {
							marginTop: 1.5,
							marginBottom: 1,
							paddingTop: 0.5,
							paddingBottom: 0.5,
						},
						columns: [
							[
								{
									id: 29,
									type: 'richtext',
									name: 'view-button',
									html: __(
										'<a href="#" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 0.625rem 2rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.875rem; text-align: center; width: 100%; box-sizing: border-box;">View Enquiry</a>',
										'catalogx'
									),
									style: {
										textAlign: 'center',
									},
								},
							],
							[
								{
									id: 30,
									type: 'richtext',
									name: 'reply-button',
									html: __(
										'<a href="#" style="display: inline-block; background-color: transparent; color: #0f172a; text-decoration: none; padding: 0.625rem 2rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.875rem; text-align: center; border: 1px solid #cbd5e1; width: 100%; box-sizing: border-box;">Reply to Customer</a>',
										'catalogx'
									),
									style: {
										textAlign: 'center',
									},
								},
							],
						],
					},
				],
			],
		},

		// Footer
		{
			id: 31,
			type: 'columns',
			name: 'footer',
			layout: '1',
			style: {
				backgroundColor: '#0f172a',
				paddingTop: 2,
				paddingBottom: 2,
				paddingRight: 4,
				paddingLeft: 4,
				borderRadius: '0 0 0.75rem 0.75rem',
			},
			columns: [
				[
					{
						id: 32,
						type: 'richtext',
						name: 'footer-text',
						html: __(
							'<span style="color: #94a3b8; font-size: 0.875rem; text-align: center; display: block;">This is an automated notification from ShopHive.</span>',
							'catalogx'
						),
						style: {
							textAlign: 'center',
							paddingBottom: 0.25,
						},
					},
					
					{
						id: 34,
						type: 'richtext',
						name: 'footer-copyright',
						html: __(
							'<span style="color: #475569; font-size: 0.75rem; text-align: center; display: block; margin-top: 0.75rem;">&copy; 2026 ShopHive. All rights reserved.</span>',
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