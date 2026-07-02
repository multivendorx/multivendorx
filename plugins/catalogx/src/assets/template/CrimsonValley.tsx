import { __ } from '@wordpress/i18n';

export const CrimsonValley = {
	id: 'crimson-valley',
	name: __('Crimson Valley', 'catalogx'),
	blocks: [
		// Top header with brand
		{
			id: 1,
			type: 'columns',
			name: 'header-top',
			layout: '1',
			style: {
				backgroundColor: '#7c2d2d',
				paddingTop: 2,
				paddingBottom: 1.5,
				paddingRight: 4,
				paddingLeft: 4,
				borderRadius: '0.75rem 0.75rem 0 0',
				borderBottom: '4px solid #b91c1c',
			},
			columns: [
				[
					{
						id: 2,
						type: 'richtext',
						name: 'brand-name',
						html: __(
							'<div style="text-align: center;">' +
							'<span style="font-size: 1.5rem; font-weight: 700; color: #fca5a5; letter-spacing: 3px;">CRIMSON VALLEY</span>' +
							'<span style="display: block; font-size: 0.7rem; color: #fecaca; letter-spacing: 4px; text-transform: uppercase; margin-top: 0.25rem;">Order Confirmation</span>' +
							'</div>',
							'catalogx'
						),
						style: {
							textAlign: 'center',
						},
					},
				],
			],
		},

		// Order reference banner
		{
			id: 3,
			type: 'columns',
			name: 'order-ref',
			layout: '1',
			style: {
				backgroundColor: '#fef2f2',
				paddingTop: 0.75,
				paddingBottom: 0.75,
				paddingRight: 2,
				paddingLeft: 2,
				borderLeft: '1px solid #fecaca',
				borderRight: '1px solid #fecaca',
			},
			columns: [
				[
					{
						id: 4,
						type: 'richtext',
						name: 'ref-number',
						html: __(
							'<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.85rem; color: #991b1b;">' +
							'<span style="font-weight: 400;">Order Reference:</span>' +
							'<span style="font-weight: 700; letter-spacing: 1px; background: #fee2e2; padding: 0.125rem 0.75rem; border-radius: 0.25rem;">#ORD-2026-0042</span>' +
							'</div>',
							'catalogx'
						),
						style: {
							textAlign: 'center',
						},
					},
				],
			],
		},

		// Main content wrapper
		{
			id: 5,
			type: 'columns',
			name: 'main-content',
			layout: '1',
			style: {
				backgroundColor: '#ffffff',
				paddingTop: 2.5,
				paddingBottom: 2.5,
				paddingRight: 3.5,
				paddingLeft: 3.5,
				borderLeft: '1px solid #fecaca',
				borderRight: '1px solid #fecaca',
			},
			columns: [
				[
					// Status badge
					{
						id: 6,
						type: 'columns',
						name: 'status-badge',
						layout: '1',
						style: {
							marginBottom: 1.5,
						},
						columns: [
							[
								{
									id: 7,
									type: 'richtext',
									name: 'status-label',
									html: __(
										'<div style="text-align: center;">' +
										'<span style="background: #dc2626; color: #ffffff; padding: 0.25rem 1.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">Order Confirmed</span>' +
										'</div>',
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
						id: 8,
						type: 'heading',
						name: 'main-heading',
						text: __('Order Confirmation', 'catalogx'),
						level: 1,
						style: {
							fontSize: 2.25,
							lineHeight: 1.2,
							textAlign: 'center',
							color: '#7c2d2d',
							fontWeight: '700',
							letterSpacing: '-0.025em',
							marginBottom: 0.5,
						},
					},

					// Divider
					{
						id: 9,
						type: 'columns',
						name: 'divider',
						layout: '1',
						style: {
							marginTop: 0.5,
							marginBottom: 1.5,
						},
						columns: [
							[
								{
									id: 10,
									type: 'richtext',
									name: 'divider-line',
									html: __(
										'<hr style="border: none; height: 2px; background: linear-gradient(to right, transparent, #b91c1c, transparent); width: 40%; margin: 0 auto;" />',
										'catalogx'
									),
									style: {
										textAlign: 'center',
									},
								},
							],
						],
					},

					// Greeting section
					{
						id: 11,
						type: 'columns',
						name: 'greeting-box',
						layout: '1',
						style: {
							backgroundColor: '#fef2f2',
							paddingTop: 0.75,
							paddingBottom: 0.75,
							paddingRight: 1.5,
							paddingLeft: 1.5,
							marginBottom: 1.5,
							borderRadius: '0.5rem',
							borderLeft: '4px solid #b91c1c',
						},
						columns: [
							[
								{
									id: 12,
									type: 'richtext',
									name: 'greeting-text',
									html: __(
										'<div style="font-size: 1.125rem; font-weight: 500; color: #7c2d2d;">Dear {customer_name},</div>',
										'catalogx'
									),
									style: {
										paddingTop: 0.25,
										paddingBottom: 0.25,
									},
								},
							],
						],
					},

					// Message
					{
						id: 13,
						type: 'richtext',
						name: 'message-text',
						html: __(
							'<div style="font-size: 0.95rem; line-height: 1.7; color: #4a5568;">' +
							'<p style="margin-bottom: 0.75rem;">We are happy to confirm your order. Our team is currently preparing your items for shipment and you will receive a tracking number once the order has been dispatched.</p>' +
							'<p style="margin-bottom: 0;">If you have any questions about your order, please feel free to contact our support team.</p>' +
							'</div>',
							'catalogx'
						),
						style: {
							paddingTop: 0.313,
							paddingBottom: 1.5,
						},
					},

					// Order summary section
					{
						id: 14,
						type: 'heading',
						name: 'summary-title',
						text: __('Order Summary', 'catalogx'),
						level: 2,
						style: {
							fontSize: 1.25,
							lineHeight: 1.3,
							color: '#7c2d2d',
							fontWeight: '700',
							marginBottom: 0.25,
							paddingTop: 0.5,
							borderTop: '2px solid #fef2f2',
							paddingTop: 1.25,
						},
					},

					// Order details grid
					{
						id: 15,
						type: 'columns',
						name: 'order-details',
						layout: '2',
						style: {
							backgroundColor: '#ffffff',
							paddingTop: 1.25,
							paddingBottom: 1.25,
							paddingRight: 1.5,
							paddingLeft: 1.5,
							marginTop: 0.75,
							marginBottom: 1.5,
							borderRadius: '0.5rem',
							border: '1px solid #fecaca',
							boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
						},
						columns: [
							// Left column
							[
								{
									id: 16,
									type: 'columns',
									name: 'order-number',
									layout: '1',
									style: {
										paddingBottom: 0.75,
									},
									columns: [
										[
											{
												id: 17,
												type: 'richtext',
												name: 'order-label',
												html: __(
													'<span style="font-size: 0.65rem; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</span>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.125,
												},
											},
											{
												id: 18,
												type: 'richtext',
												name: 'order-value',
												html: __(
													'<span style="font-size: 1rem; font-weight: 500; color: #1a202c;">ORD-2026-0042</span>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.125,
												},
											},
										],
									],
								},
								{
									id: 19,
									type: 'columns',
									name: 'order-date',
									layout: '1',
									style: {
										paddingBottom: 0.5,
									},
									columns: [
										[
											{
												id: 20,
												type: 'richtext',
												name: 'date-label',
												html: __(
													'<span style="font-size: 0.65rem; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</span>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.125,
												},
											},
											{
												id: 21,
												type: 'richtext',
												name: 'date-value',
												html: __(
													'<span style="font-size: 1rem; font-weight: 500; color: #1a202c;">June 30, 2026</span>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.125,
												},
											},
										],
									],
								},
							],
							// Right column
							[
								{
									id: 22,
									type: 'columns',
									name: 'order-total',
									layout: '1',
									style: {
										paddingBottom: 0.75,
									},
									columns: [
										[
											{
												id: 23,
												type: 'richtext',
												name: 'total-label',
												html: __(
													'<span style="font-size: 0.65rem; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Total Amount</span>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.125,
												},
											},
											{
												id: 24,
												type: 'richtext',
												name: 'total-value',
												html: __(
													'<span style="font-size: 1.125rem; font-weight: 700; color: #7c2d2d;">$249.99</span>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.125,
												},
											},
										],
									],
								},
								{
									id: 25,
									type: 'columns',
									name: 'order-status',
									layout: '1',
									style: {
										paddingBottom: 0.5,
									},
									columns: [
										[
											{
												id: 26,
												type: 'richtext',
												name: 'status-label',
												html: __(
													'<span style="font-size: 0.65rem; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Order Status</span>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.125,
												},
											},
											{
												id: 27,
												type: 'richtext',
												name: 'status-value',
												html: __(
													'<span style="font-size: 0.85rem; font-weight: 600; color: #dc2626; background: #fef2f2; padding: 0.125rem 0.75rem; border-radius: 9999px; display: inline-block;">Processing</span>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.125,
												},
											},
										],
									],
								},
							],
						],
					},

					// Customer information section
					{
						id: 28,
						type: 'heading',
						name: 'customer-title',
						text: __('Customer Information', 'catalogx'),
						level: 2,
						style: {
							fontSize: 1.25,
							lineHeight: 1.3,
							color: '#7c2d2d',
							fontWeight: '700',
							marginBottom: 0.25,
							paddingTop: 0.5,
						},
					},

					// Customer details card
					{
						id: 29,
						type: 'columns',
						name: 'customer-card',
						layout: '2',
						style: {
							backgroundColor: '#fef2f2',
							paddingTop: 1.25,
							paddingBottom: 1.25,
							paddingRight: 1.5,
							paddingLeft: 1.5,
							marginTop: 0.75,
							marginBottom: 1.5,
							borderRadius: '0.5rem',
							border: '1px solid #fecaca',
						},
						columns: [
							[
								{
									id: 30,
									type: 'richtext',
									name: 'customer-name',
									html: __(
										'<div>' +
										'<span style="font-size: 0.65rem; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Customer Name</span>' +
										'<div style="font-size: 1.125rem; font-weight: 500; color: #1a202c; margin-top: 0.125rem;">{customer_name}</div>' +
										'</div>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.5,
									},
								},
							],
							[
								{
									id: 31,
									type: 'richtext',
									name: 'customer-email',
									html: __(
										'<div>' +
										'<span style="font-size: 0.65rem; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</span>' +
										'<div style="font-size: 1.125rem; font-weight: 500; color: #dc2626; margin-top: 0.125rem;">{customer_email}</div>' +
										'</div>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.5,
									},
								},
							],
						],
					},

					// Shipping information
					{
						id: 32,
						type: 'heading',
						name: 'shipping-title',
						text: __('Shipping Information', 'catalogx'),
						level: 2,
						style: {
							fontSize: 1.25,
							lineHeight: 1.3,
							color: '#7c2d2d',
							fontWeight: '700',
							marginBottom: 0.25,
							paddingTop: 0.5,
						},
					},

					// Shipping details
					{
						id: 33,
						type: 'columns',
						name: 'shipping-card',
						layout: '1',
						style: {
							backgroundColor: '#ffffff',
							paddingTop: 1,
							paddingBottom: 1,
							paddingRight: 1.5,
							paddingLeft: 1.5,
							marginTop: 0.75,
							marginBottom: 1.5,
							borderRadius: '0.5rem',
							border: '1px solid #fecaca',
						},
						columns: [
							[
								{
									id: 34,
									type: 'columns',
									name: 'shipping-grid',
									layout: '2',
									style: {},
									columns: [
										[
											{
												id: 35,
												type: 'richtext',
												name: 'shipping-method',
												html: __(
													'<div>' +
													'<span style="font-size: 0.65rem; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Method</span>' +
													'<div style="font-size: 0.95rem; font-weight: 500; color: #1a202c; margin-top: 0.125rem;">Standard Delivery (3-5 days)</div>' +
													'</div>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.5,
												},
											},
										],
										[
											{
												id: 36,
												type: 'richtext',
												name: 'shipping-address',
												html: __(
													'<div>' +
													'<span style="font-size: 0.65rem; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</span>' +
													'<div style="font-size: 0.95rem; font-weight: 400; color: #1a202c; margin-top: 0.125rem; line-height: 1.4;">123 Main Street<br />Apt 4B, New York, NY 10001</div>' +
													'</div>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.5,
												},
											},
										],
									],
								},
							],
						],
					},

					// Action buttons
					{
						id: 37,
						type: 'columns',
						name: 'actions',
						layout: '2',
						style: {
							marginTop: 1,
							marginBottom: 0.5,
							gap: '0.75rem',
						},
						columns: [
							[
								{
									id: 38,
									type: 'richtext',
									name: 'track-button',
									html: __(
										'<a href="#" style="display: block; background-color: #7c2d2d; color: #ffffff; text-decoration: none; padding: 0.625rem 1.5rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; text-align: center; width: 100%; box-sizing: border-box;">Track Order</a>',
										'catalogx'
									),
									style: {
										textAlign: 'center',
									},
								},
							],
							[
								{
									id: 39,
									type: 'richtext',
									name: 'support-button',
									html: __(
										'<a href="#" style="display: block; background-color: transparent; color: #7c2d2d; text-decoration: none; padding: 0.625rem 1.5rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; text-align: center; width: 100%; box-sizing: border-box; border: 2px solid #fecaca;">Contact Support</a>',
										'catalogx'
									),
									style: {
										textAlign: 'center',
									},
								},
							],
						],
					},

					// Helpful tip
					{
						id: 40,
						type: 'columns',
						name: 'help-tip',
						layout: '1',
						style: {
							backgroundColor: '#fef2f2',
							paddingTop: 0.75,
							paddingBottom: 0.75,
							paddingRight: 1.5,
							paddingLeft: 1.5,
							marginTop: 1.25,
							borderRadius: '0.5rem',
							border: '1px solid #fecaca',
						},
						columns: [
							[
								{
									id: 41,
									type: 'richtext',
									name: 'help-text',
									html: __(
										'<div style="font-size: 0.85rem; color: #991b1b; text-align: center;">' +
										'<span style="font-weight: 600;">Need assistance?</span>' +
										'<span style="margin-left: 0.5rem; color: #7c2d2d;">Our support team is available 24/7 to help you with any questions.</span>' +
										'</div>',
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
			id: 42,
			type: 'columns',
			name: 'footer',
			layout: '1',
			style: {
				backgroundColor: '#7c2d2d',
				paddingTop: 1.5,
				paddingBottom: 1.5,
				paddingRight: 4,
				paddingLeft: 4,
				borderRadius: '0 0 0.75rem 0.75rem',
				borderTop: '3px solid #b91c1c',
			},
			columns: [
				[
					{
						id: 43,
						type: 'richtext',
						name: 'footer-content',
						html: __(
							'<div style="text-align: center;">' +
							'<div style="color: #fca5a5; font-size: 0.75rem; margin-bottom: 0.5rem;">This is a confirmation notification from Crimson Valley</div>' +
							'<div style="display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; font-size: 0.65rem;">' +
							'<a href="#" style="color: #fecaca; text-decoration: none;">Privacy Policy</a>' +
							'<a href="#" style="color: #fecaca; text-decoration: none;">Terms of Service</a>' +
							'<a href="#" style="color: #fecaca; text-decoration: none;">Support</a>' +
							'<a href="#" style="color: #fecaca; text-decoration: none;">Returns</a>' +
							'</div>' +
							'<div style="color: #fecaca; font-size: 0.65rem; margin-top: 0.75rem; opacity: 0.7;">&copy; 2026 Crimson Valley. All rights reserved.</div>' +
							'</div>',
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
};