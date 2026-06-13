import { __ } from '@wordpress/i18n';

export const OuterSpace = {
	id: 'store-registration',
	name: __('Sales Report', 'catalogx'),
	blocks: [
		// first column (heading)
		{
			id: 1,
			type: 'columns',
			name: 'header',
			layout: '1',
			style: {
				backgroundColor: '#fff8f1',
				paddingTop: 2,
				paddingBottom: 2,
				paddingRight: 4,
				paddingLeft: 4,
				borderRadius: 0.313,
			},
			columns: [
				[
					{
						id: 2,
						type: 'heading',
						name: 'email-heading-welcome',
						text: __('New product enquiry', 'multivendorx'),
						level: 2,
						style: {
							fontSize: 2,
							lineHeight: 1,
							textAlign: 'center',
						},
					},
					{
						id: 3,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __(
							"Admin notification · ShopHive (p)",
							'multivendorx'
						),
						style: {
							textAlign: 'center',
							fontSize: 1,
							lineHeight: 1,
							paddingTop: 0.45
						},
					},
				],
			],
		},

		// hi admin section
		{
			id: 6,
			type: 'richtext',
			name: 'email-text-welcome-message',
			html: __(
				"Hello Admin,",
				'multivendorx'
			),
			style: {
				fontSize: 1,
				lineHeight: 1,
				paddingTop: 1.5
			},
		},
		{
			id: 6,
			type: 'richtext',
			name: 'email-text-welcome-message',
			html: __(
				"A customer has submitted a product enquiry. Here are the full details below.",
				'multivendorx'
			),
			style: {
				fontSize: 0.95,
				lineHeight: 1,
				paddingTop: 0.313
			},
		},

		// enquiry details
		{
			id: 1,
			type: 'columns',
			name: 'header',
			layout: '1',
			style: {
				paddingTop: 2,
				paddingRight: 4,
				paddingLeft: 4,
				borderRadius: 0.313,
			},
			columns: [
				[
					{
						id: 2,
						type: 'heading',
						name: 'email-heading-welcome',
						text: __('Enquiry Details', 'multivendorx'),
						level: 2,
						style: {
							fontSize: 1.713,
							lineHeight: 1,
							textAlign: 'center',
						},
					},
					{
						id: 3,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __(
							"Admin notification · ShopHive (p)",
							'multivendorx'
						),
						style: {
							textAlign: 'center',
							fontSize: 1,
							lineHeight: 1,
							paddingTop: 0.45
						},
					},
				],
			],
		},
		// 2nd column (heading)
		{
			id: 4,
			type: 'columns',
			name: 'user-info',
			layout: '2',
			style: {
				backgroundColor: '#fff8f1',
				paddingTop: 1,
				paddingBottom: 1,
				paddingRight: 1,
				paddingLeft: 1,
				marginTop: 1,
				borderRadius: 0.313,
			},
			columns: [
				[
					{
						id: 5,
						type: 'heading',
						name: 'user-name',
						text: __('User Name', 'multivendorx'),
						level: 2,
						style: {
							fontSize: 1.25,
							lineHeight: 1
						},
					},
					{
						id: 6,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __(
							"Customer Name",
							'multivendorx'
						),
						style: {
							fontSize: 1.125,
							lineHeight: 1,
							paddingTop: '0.313rem'
						},
					},
				],
				[
					{
						id: 7,
						type: 'heading',
						name: 'user-name',
						text: __('User Email', 'multivendorx'),
						level: 2,
						style: {
							fontSize: 1.25,
							lineHeight: 1
						},
					},
					{
						id: 8,
						type: 'richtext',
						name: 'email-text-welcome-message',
						html: __(
							"Customer Name",
							'multivendorx'
						),
						style: {
							fontSize: 1.125,
							lineHeight: 1,
							paddingTop: '0.313rem'
						},
					},
				],
			],
		},
	],
};
