import { __ } from '@wordpress/i18n';

export const Starlight = {
	id: 'star-light',
	name: __('Star light', 'catalogx'),
	blocks: [
		// Top header with gradient accent
		{
			id: 1,
			type: 'columns',
			name: 'header-top',
			layout: '1',
			style: {
				backgroundColor: '#0f172a',
				paddingTop: 1.5,
				paddingBottom: 1.5,
				paddingRight: 4,
				paddingLeft: 4,
				borderRadius: '0.75rem 0.75rem 0 0',
				borderBottom: '4px solid #3b82f6',
			},
			columns: [
				[
					{
						id: 2,
						type: 'richtext',
						name: 'header-brand',
						html: __(
							'<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">' +
							'<span style="font-size: 1.25rem; font-weight: 700; color: #ffffff; letter-spacing: 2px;">SHOPHIVE</span>' +
							'<span style="font-size: 0.7rem; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; background: #1e293b; padding: 0.25rem 0.75rem; border-radius: 9999px;">Notification</span>' +
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

		// Alert banner
		{
			id: 3,
			type: 'columns',
			name: 'alert-bar',
			layout: '1',
			style: {
				backgroundColor: '#fefce8',
				paddingTop: 0.5,
				paddingBottom: 0.5,
				paddingRight: 2,
				paddingLeft: 2,
				borderLeft: '1px solid #e2e8f0',
				borderRight: '1px solid #e2e8f0',
			},
			columns: [
				[
					{
						id: 4,
						type: 'richtext',
						name: 'alert-text',
						html: __(
							'<span style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.8rem; color: #854d0e;">' +
							'<span style="font-weight: 600;">📌 NEW</span>' +
							'<span style="color: #a16207;">Product enquiry requires your attention</span>' +
							'<span style="background: #fef08a; padding: 0.125rem 0.5rem; border-radius: 9999px; font-weight: 600; font-size: 0.65rem;">URGENT</span>' +
							'</span>',
							'catalogx'
						),
						style: {
							textAlign: 'center',
						},
					},
				],
			],
		},

		// Main content
		{
			id: 5,
			type: 'columns',
			name: 'main-wrapper',
			layout: '1',
			style: {
				backgroundColor: '#ffffff',
				paddingTop: 2,
				paddingBottom: 2,
				paddingRight: 3,
				paddingLeft: 3,
				borderLeft: '1px solid #e2e8f0',
				borderRight: '1px solid #e2e8f0',
			},
			columns: [
				[
					// Two column intro section
					{
						id: 6,
						type: 'columns',
						name: 'intro-section',
						layout: '2',
						style: {
							marginBottom: 1.5,
							paddingBottom: 1.5,
							borderBottom: '1px solid #f1f5f9',
						},
						columns: [
							// Left - Icon and greeting
							[
								{
									id: 7,
									type: 'richtext',
									name: 'greeting-icon',
									html: __(
										'<div style="display: flex; align-items: center; gap: 0.75rem;">' +
										'<div style="background: #dbeafe; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">👋</div>' +
										'<div>' +
										'<div style="font-size: 1.25rem; font-weight: 600; color: #0f172a;">Hello Admin</div>' +
										'<div style="font-size: 0.85rem; color: #64748b;">New enquiry received</div>' +
										'</div>' +
										'</div>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.5,
									},
								},
							],
							// Right - Reference
							[
								{
									id: 8,
									type: 'richtext',
									name: 'reference-box',
									html: __(
										'<div style="background: #f8fafc; padding: 0.75rem 1rem; border-radius: 0.5rem; text-align: right; border: 1px solid #e2e8f0;">' +
										'<div style="font-size: 0.65rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Reference</div>' +
										'<div style="font-size: 0.9rem; font-weight: 500; color: #0f172a;">#ENQ-2026-0042</div>' +
										'</div>',
										'catalogx'
									),
									style: {
										textAlign: 'right',
										paddingBottom: 0.5,
									},
								},
							],
						],
					},

					// Main message
					{
						id: 9,
						type: 'richtext',
						name: 'main-message',
						html: __(
							'<div style="font-size: 0.95rem; line-height: 1.7; color: #334155; margin-bottom: 1.5rem;">' +
							'<p style="margin-bottom: 0.75rem;">We have received a new product enquiry from one of our valued customers. The customer is interested in the following product and has provided their contact information for follow-up.</p>' +
							'<p style="margin-bottom: 0;">Please review the details below and respond at your earliest convenience.</p>' +
							'</div>',
							'catalogx'
						),
						style: {
							paddingBottom: 0.5,
						},
					},

					// Customer and Product Info in single card
					{
						id: 10,
						type: 'columns',
						name: 'info-card',
						layout: '1',
						style: {
							backgroundColor: '#f8fafc',
							paddingTop: 1.25,
							paddingBottom: 1.25,
							paddingRight: 1.5,
							paddingLeft: 1.5,
							marginTop: 0.5,
							marginBottom: 1.5,
							borderRadius: '0.625rem',
							border: '1px solid #e2e8f0',
						},
						columns: [
							[
								// Customer section
								{
									id: 11,
									type: 'heading',
									name: 'customer-heading',
									text: __('Customer Details', 'catalogx'),
									level: 4,
									style: {
										fontSize: 0.85,
										lineHeight: 1.3,
										color: '#475569',
										fontWeight: '600',
										marginBottom: 0.5,
										textTransform: 'uppercase',
										letterSpacing: '0.5px',
									},
								},
								{
									id: 12,
									type: 'columns',
									name: 'customer-grid',
									layout: '2',
									style: {
										marginBottom: 1.25,
										paddingBottom: 1.25,
										borderBottom: '1px solid #e2e8f0',
									},
									columns: [
										[
											{
												id: 13,
												type: 'richtext',
												name: 'customer-name',
												html: __(
													'<div style="font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px;">Name</div>' +
													'<div style="font-size: 1rem; font-weight: 500; color: #0f172a; margin-top: 0.125rem;">John Doe</div>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.5,
												},
											},
										],
										[
											{
												id: 14,
												type: 'richtext',
												name: 'customer-email',
												html: __(
													'<div style="font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px;">Email</div>' +
													'<div style="font-size: 1rem; font-weight: 500; color: #2563eb; margin-top: 0.125rem;">john.doe@example.com</div>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.5,
												},
											},
										],
									],
								},

								// Product section
								{
									id: 15,
									type: 'heading',
									name: 'product-heading',
									text: __('Product Details', 'catalogx'),
									level: 4,
									style: {
										fontSize: 0.85,
										lineHeight: 1.3,
										color: '#475569',
										fontWeight: '600',
										marginBottom: 0.5,
										textTransform: 'uppercase',
										letterSpacing: '0.5px',
									},
								},
								{
									id: 16,
									type: 'columns',
									name: 'product-grid',
									layout: '3',
									style: {},
									columns: [
										[
											{
												id: 17,
												type: 'richtext',
												name: 'product-name',
												html: __(
													'<div style="font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px;">Product</div>' +
													'<div style="font-size: 0.9rem; font-weight: 500; color: #0f172a; margin-top: 0.125rem;">Premium Headphones</div>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.5,
												},
											},
										],
										[
											{
												id: 18,
												type: 'richtext',
												name: 'product-qty',
												html: __(
													'<div style="font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px;">Quantity</div>' +
													'<div style="font-size: 0.9rem; font-weight: 500; color: #0f172a; margin-top: 0.125rem;">2 Units</div>',
													'catalogx'
												),
												style: {
													paddingBottom: 0.5,
												},
											},
										],
										[
											{
												id: 19,
												type: 'richtext',
												name: 'product-status',
												html: __(
													'<div style="font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px;">Status</div>' +
													'<div style="margin-top: 0.125rem;"><span style="font-size: 0.75rem; font-weight: 600; color: #1d4ed8; background: #dbeafe; padding: 0.125rem 0.75rem; border-radius: 9999px; display: inline-block;">Pending</span></div>',
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

					// Customer message section
					{
						id: 20,
						type: 'columns',
						name: 'message-section',
						layout: '1',
						style: {
							backgroundColor: '#f1f5f9',
							paddingTop: 1,
							paddingBottom: 1,
							paddingRight: 1.5,
							paddingLeft: 1.5,
							marginBottom: 1.5,
							borderRadius: '0.5rem',
							borderLeft: '4px solid #3b82f6',
						},
						columns: [
							[
								{
									id: 21,
									type: 'richtext',
									name: 'msg-label',
									html: __(
										'<div style="font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Customer Message</div>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.125,
									},
								},
								{
									id: 22,
									type: 'richtext',
									name: 'msg-content',
									html: __(
										'<div style="font-size: 0.9rem; line-height: 1.6; color: #1e293b; font-style: italic;">"I am interested in the Premium Headphones. Could you provide more details about the battery life and compatibility with different devices?"</div>',
										'catalogx'
									),
									style: {
										paddingBottom: 0.125,
									},
								},
							],
						],
					},

					// Action buttons - 3 column layout
					{
						id: 23,
						type: 'columns',
						name: 'action-section',
						layout: '3',
						style: {
							marginTop: 0.5,
							marginBottom: 0.5,
							gap: '0.75rem',
						},
						columns: [
							[
								{
									id: 24,
									type: 'richtext',
									name: 'btn-view',
									html: __(
										'<a href="#" style="display: block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 0.625rem 1rem; border-radius: 0.5rem; font-weight: 500; font-size: 0.8rem; text-align: center; width: 100%; box-sizing: border-box; transition: all 0.2s;">📋 View</a>',
										'catalogx'
									),
									style: {
										textAlign: 'center',
									},
								},
							],
							[
								{
									id: 25,
									type: 'richtext',
									name: 'btn-reply',
									html: __(
										'<a href="#" style="display: block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 0.625rem 1rem; border-radius: 0.5rem; font-weight: 500; font-size: 0.8rem; text-align: center; width: 100%; box-sizing: border-box; transition: all 0.2s;">✉️ Reply</a>',
										'catalogx'
									),
									style: {
										textAlign: 'center',
									},
								},
							],
							[
								{
									id: 26,
									type: 'richtext',
									name: 'btn-resolve',
									html: __(
										'<a href="#" style="display: block; background-color: transparent; color: #0f172a; text-decoration: none; padding: 0.625rem 1rem; border-radius: 0.5rem; font-weight: 500; font-size: 0.8rem; text-align: center; width: 100%; box-sizing: border-box; border: 2px solid #e2e8f0; transition: all 0.2s;">✓ Resolve</a>',
										'catalogx'
									),
									style: {
										textAlign: 'center',
									},
								},
							],
						],
					},

					// Quick stats
					{
						id: 27,
						type: 'columns',
						name: 'stats-section',
						layout: '3',
						style: {
							marginTop: 1.5,
							paddingTop: 1.25,
							borderTop: '1px solid #f1f5f9',
						},
						columns: [
							[
								{
									id: 28,
									type: 'richtext',
									name: 'stat-date',
									html: __(
										'<div style="text-align: center;">' +
										'<div style="font-size: 0.6rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Received</div>' +
										'<div style="font-size: 0.85rem; font-weight: 500; color: #0f172a;">Jun 30, 2026</div>' +
										'</div>',
										'catalogx'
									),
									style: {
										textAlign: 'center',
									},
								},
							],
							[
								{
									id: 29,
									type: 'richtext',
									name: 'stat-time',
									html: __(
										'<div style="text-align: center;">' +
										'<div style="font-size: 0.6rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Time</div>' +
										'<div style="font-size: 0.85rem; font-weight: 500; color: #0f172a;">10:30 AM</div>' +
										'</div>',
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
									name: 'stat-priority',
									html: __(
										'<div style="text-align: center;">' +
										'<div style="font-size: 0.6rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Priority</div>' +
										'<div style="font-size: 0.85rem; font-weight: 600; color: #dc2626;">High</div>' +
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
			id: 31,
			type: 'columns',
			name: 'footer',
			layout: '1',
			style: {
				backgroundColor: '#0f172a',
				paddingTop: 1.5,
				paddingBottom: 1.5,
				paddingRight: 4,
				paddingLeft: 4,
				borderRadius: '0 0 0.75rem 0.75rem',
			},
			columns: [
				[
					{
						id: 32,
						type: 'richtext',
						name: 'footer-content',
						html: __(
							'<div style="text-align: center;">' +
							'<div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.5rem;">This is an automated notification from ShopHive</div>' +
							'<div style="display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; font-size: 0.65rem; color: #64748b;">' +
							'<a href="#" style="color: #64748b; text-decoration: none;">Privacy</a>' +
							'<a href="#" style="color: #64748b; text-decoration: none;">Terms</a>' +
							'<a href="#" style="color: #64748b; text-decoration: none;">Support</a>' +
							'</div>' +
							'<div style="color: #475569; font-size: 0.65rem; margin-top: 0.75rem;">&copy; 2026 ShopHive. All rights reserved.</div>' +
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