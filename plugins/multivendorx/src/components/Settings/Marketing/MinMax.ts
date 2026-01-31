import { __ } from '@wordpress/i18n';

export default {
	id: 'min-max',
	priority: 6,
	name: __('Min/Max', 'multivendorx'),
	tabTitle: 'Per-product/listing purchase limits',
	desc: __(
		'Set purchase limits for individual products to prevent bulk buying or ensure minimum order quantities.',
		'multivendorx'
	),
	icon: 'adminfont-min-max',
	submitUrl: 'settings',
	modal: [
		{
			key: 'product_quantity_rules',
			type: 'nested',
			label: __('Purchase quantity limits', 'multivendorx'),
			single: true,
			settingDescription: __(
				'Set purchase limits for individual products/listing to prevent bulk buying or ensure minimum order quantities.',
				'multivendorx'
			),
			desc: __(
    '<strong>Example:</strong> You set <em>Min = 1</em> and <em>Max = 5</em> for a T-shirt.<br> If a customer tries to buy 6 units, it will be blocked.<br> However, buying 3 units is allowed.',
    'multivendorx'
),

			moduleEnabled: 'min-max',
			nestedFields: [
				{
					key: 'product_min_quantity',
					preInsideText: __('Min', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'product_max_quantity',
					preInsideText: __('Max', 'multivendorx'),
					type: 'number',
				},
			],
		},
		{
			key: 'product_amount_rules',
			type: 'nested',
			label: __('Product/listing purchase amount', 'multivendorx'),
			single: true,
			settingDescription: __(
				'Control how much a customer can spend on an individual product/listing by defining minimum and maximum purchase values.',
				'multivendorx'
			),
			desc: __(
    '<strong>Example:</strong> You set <em>Min = $20</em> and <em>Max = $100</em> for a Backpack.<br> If a customer tries to buy 1 backpack priced at $10, the purchase is blocked.<br> However, buying 2 backpacks at $30 each (total $60) is allowed.',
    'multivendorx'
),
moduleEnabled: 'min-max',
			nestedFields: [
				{
					key: 'product_min_amount',
					preInsideText: __('Min', 'multivendorx'),
					postInsideText: __('$', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'product_max_amount',
					preInsideText: __('Max', 'multivendorx'),
					postInsideText: __('$', 'multivendorx'),
					type: 'number',
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Order Purchase Limits', 'multivendorx'),
			desc: __(
				'Set limits on the total quantity or total value of an order to control bulk purchases or enforce minimum order requirements.',
				'multivendorx'
			),
		},
		{
			key: 'order_quantity_rules',
			type: 'nested',
			label: __('Total Items', 'multivendorx'),
			single: true,
			settingDescription: __(
				'Set the minimum and maximum number of items a customer can include in their cart.',
				'multivendorx'
			),
			desc: __(
	'<strong>Example:</strong> You set <em>Min = 2</em> and <em>Max = 5</em> items for the cart.<br> If a customer tries to place an order with <em>1 item</em>, the purchase is blocked.<br> Adding <em>2 to 5 items</em> to the cart is allowed.',
	'multivendorx'
),

			moduleEnabled: 'min-max',
			nestedFields: [
				{
					key: 'order_min_quantity',
					preInsideText: __('Min', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'order_max_quantity',
					preInsideText: __('Max', 'multivendorx'),
					type: 'number',
				},
			],
		},
		{
			key: 'order_amount_rules',
			type: 'nested',
			label: __('Order Value', 'multivendorx'),
			single: true,
			settingDescription: __(
				'Set the minimum and maximum total spend allowed for an order.',
				'multivendorx'
			),
			desc: __(
    '<strong>Example:</strong> You set the <em>minimum order value to $50</em> and the <em>maximum order value to $500</em>.<br> If a customer tries to checkout with an order total of $30, the checkout will be blocked.<br> However, checkout with an order total of $120 is allowed.',
    'multivendorx'
),


			moduleEnabled: 'min-max',
			nestedFields: [
				{
					key: 'order_min_amount',
					preInsideText: __('Min', 'multivendorx'),
					postInsideText: __('$', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'order_max_amount',
					preInsideText: __('Max', 'multivendorx'),
					postInsideText: __('$', 'multivendorx'),
					type: 'number',
				},
			],
		},
	],
};
