import { __ } from '@wordpress/i18n';

const gatewayList = appLocalizer.gateway_list || [];
const gatewayFields = gatewayList.flatMap((gateway) => [
	{
		key: `${gateway.value}_fixed`,
		type: 'number',
		preInsideText: __('$', 'multivendorx'),
		size: '8rem',
		preText: gateway.label,
		postText: '+',
	},
	{
		key: `${gateway.value}_percentage`,
		type: 'number',
		postInsideText: __('%', 'multivendorx'),
		size: '8rem',
	},
	{
		key: 'divider',
		type: 'divider',
	},
]);

const taxes_enabled = appLocalizer.taxes_enabled;

const nestedFields = [
	{
		key: 'default_fixed',
		type: 'number',
		preInsideText: __('$', 'multivendorx'),
		size: '8rem',
		preText: 'Default',
		postText: '+',
	},
	{
		key: 'default_percentage',
		type: 'number',
		postInsideText: __('%', 'multivendorx'),
		size: '8rem',
	},
	{
		key: 'divider',
		type: 'divider',
	},
	...gatewayFields,
];

export default {
	id: 'store-commissions',
	priority: 1,
	name: __('Commissions', 'multivendorx'),
	tabTitle: 'Commission share from the seller’s product/listing:',
	desc: __(
		'Decide how your marketplace takes commission from sales.',
		'multivendorx'
	),
	icon: 'adminfont-commission',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_rating_page',
			type: 'blocktext',
			blocktext: __(
				'You are currently using the older vendor-specific commission system from previous versions of MultiVendorX. Because of that, the <b>Marketplace commission</b> and <b>Commission value</b> fields shown below will continue to work as vendor-specific until you update or modify this settings page.<br><br>Once you make any change, your marketplace will automatically switch to the new <b>Marketplace commission</b> model. From that point onward, all commissions will be calculated using the updated system, and this notice will no longer appear.',
				'multivendorx'
			),
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('Marketplace commission', 'multivendorx'),
			settingDescription: __(
				'Decide how the system should calculate the marketplace commission.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Store order based - Calculated on the full order amount of each store. Example: A customer buys from 3 stores → commission applies separately to each store’s order.</li><li>Per item based - Applied to each product/listing in the order. Example: An order with 5 items → commission applies 5 times, once per item.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'store_order',
					label: __('Store order based', 'multivendorx'),
					value: 'store_order',
				},
				{
					key: 'per_item',
					label: __('Per item based', 'multivendorx'),
					value: 'per_item',
				},
			],
		},
		{
			key: 'commission_per_store_order',
			type: 'nested',
			label: 'Commission value',
			desc: __(
				'Set your default commission rate that will apply to all orders. You can choose between a fixed amount ($) or a percentage (%) of the order value. Additionally, you can create advanced commission rules below to automatically adjust rates based on specific conditions like product/listing price, quantity, or total order value.',
				'multivendorx'
			),
			addButtonLabel: 'Add New',
			deleteButtonLabel: 'Remove',
			nestedFields: [
				{
					key: 'rule_type',
					type: 'select',
					label: 'If',
					options: [
						{ value: 'price', label: 'Product/listing price' },
						{ value: 'quantity', label: 'Product/listing quantity' },
						{ value: 'order_value', label: 'Order value' },
					],
					skipFirstRow: true,
				},
				{
					key: 'rule',
					type: 'select',
					label: 'is',
					options: [
						{ value: 'less_than', label: 'up to' },
						{ value: 'more_than', label: 'more than' },
					],
					skipFirstRow: true,
				},
				{
					key: 'product_price',
					type: 'number',
					options: [
						{
							key: 'product_price',
							value: 'product_price',
						},
					],
					preInsideText: '$',
					size: '8rem',
					skipFirstRow: true,
					postText: 'then',
					dependent: {
						key: 'rule_type',
						set: true,
						value: 'price',
					},
				},
				{
					key: 'product_qty',
					type: 'number',
					options: [
						{
							key: 'product_qty',
							value: 'product_qty',
						},
					],
					preInsideText: '$',
					size: '8rem',
					skipFirstRow: true,
					postText: 'then',
					dependent: {
						key: 'rule_type',
						set: true,
						value: 'quantity',
					},
				},
				{
					key: 'order_value',
					type: 'number',
					options: [
						{
							key: 'order_value',
							value: 'order_value',
						},
					],
					size: '8rem',
					preInsideText: '$',
					postText: 'then',
					dependent: {
						key: 'rule_type',
						set: true,
						value: 'order_value',
					},
				},
				{
					key: 'commission_fixed',
					type: 'text',
					preInsideText: __('$', 'multivendorx'),
					size: '8rem',
					preText: 'fixed',
					preTextFirstRow: 'Fixed',
					postText: '+',
				},
				{
					key: 'commission_percentage',
					type: 'number',
					size: '8rem',
					postInsideText: __('%', 'multivendorx'),
					postText: 'commission will be charged.',
					postTextFirstRow: '',
				},
			],
			dependent: {
				key: 'commission_type',
				set: true,
				value: 'store_order',
			},
		},
		{
			key: 'commission_per_item',
			type: 'nested',
			label: 'Commission value',
			single: true,
			desc: __(
				'Set global commission rates that apply to each individual item quantity. Commission will be calculated by multiplying the rate with the total number of items across all products/listing in the order.',
				'multivendorx'
			),
			nestedFields: [
				{
					key: 'commission_fixed',
					type: 'number',
					preInsideText: __('$', 'multivendorx'),
					size: '8rem',
					preText: 'Fixed',
					postText: '+',
				},
				{
					key: 'commission_percentage',
					type: 'number',
					postInsideText: __('%', 'multivendorx'),
					size: '8rem',
				},
			],
			dependent: {
				key: 'commission_type',
				set: true,
				value: 'per_item',
			},
		},
		{
			key: 'separator_content',
			type: 'section',
			hint: __(
				'Shipping & tax distribution in store earnings',
				'multivendorx'
			),
			desc: __(
				'Choose which order components are factored into commission calculations.',
				'multivendorx'
			),
		},
		{
			key: 'give_tax',
			type: 'setting-toggle',
			label: __('Tax distribution options', 'multivendorx'),
			wooCheck: 'taxes_enabled',
			wooLink:
				'page=wc-settings&tab=general#taxes_and_coupons_options-description',
			settingDescription: __(
				'Configure how taxes are treated in commission calculations.',
				'multivendorx'
			),
			desc: __( '<strong>Example setup:</strong><br> Product price = ₹1,000<br> Tax rate = 10% → ₹100<br> Marketplace commission rate = 10%<ul> <li><strong>Marketplace share</strong><br> Customer pays = ₹1,100 (₹1,000 + ₹100 tax)<br> Marketplace commission = 10% of ₹1,000 = ₹100<br> Marketplace receives tax = ₹100<br> Marketplace total earning = ₹200 (commission + tax)<br> Store payout = ₹900 (tax not included)</li> <li><strong>Store share</strong><br> Customer pays = ₹1,100 (₹1,000 + ₹100 tax)<br> Marketplace commission = 10% of ₹1,000 = ₹100<br> Store earnings before tax = ₹900<br> Tax added to store earnings = ₹100<br> Final store payout = ₹1,000<br> Marketplace earning = ₹100 (commission only)</li> <li><strong>Commission based tax</strong><br> Customer pays = ₹1,100 (₹1,000 + ₹100 tax)<br> Marketplace commission = 10% of ₹1,000 = ₹100<br> Tax on marketplace commission = ₹10<br> Tax on store earnings = ₹90<br> Marketplace total earning = ₹110 (commission + tax share)<br> Store payout = ₹990 (earnings + tax share)</li> </ul>', 'multivendorx' ),
			options: [
				{
					key: 'no_tax',
					label: __('Marketplace share', 'multivendorx'),
					value: 'no_tax',
				},
				{
					key: 'full_tax',
					label: __('Store share', 'multivendorx'),
					value: 'full_tax',
				},
				{
					key: 'commision_based_tax',
					label: __('Commission based tax', 'multivendorx'),
					value: 'commision_based_tax',
				},
			],
		},
		{
			key: 'store_rating_page',
			type: 'blocktext',
			blocktext: __(
				'Allow each store to manage its own shipping methods, zones, and rates, and to pass shipping amounts to stores, please enable the <a href="' +
				appLocalizer.site_url +
				'/wp-admin/admin.php?page=multivendorx#&tab=modules"> "Shipping module".</a></b>',
				'multivendorx'
			),
		},
		{
			key: 'taxable',
			label: __('Charge tax on shipping cost', 'multivendorx'),
			settingDescription: __(
				'Shipping charges will be treated as taxable items during checkout. Otherwise shipping costs will be tax-free.',
				'multivendorx'
			),
			desc: __('', 'multivendorx'),
			type: 'checkbox',
			moduleEnabled: 'store-shipping',
			options: [
				{
					key: 'taxable',
					value: 'taxable',
				},
			],
			look: 'toggle',
		},
		{
			key: 'separator_content',
			type: 'section',
			hint: __('Fees deducted from store earnings', 'multivendorx'),
			desc: __(
				'Determine which fees to deduct from the store earning.',
				'multivendorx'
			),
		},
		{
			key: 'marketplace_fees',
			type: 'nested',
			label: __('Platform fees', 'multivendorx'),
			single: true,
			proSetting: true,
			settingDescription: __(
				'Set a platform fee as a fixed, percentage, or combined rate calculated on the product/listing price. Choose whether the fee is paid by the customer at checkout or deducted from the store’s commission.',
				'multivendorx'
			),
			desc: __('<strong>Example setup:</strong><br>' + 'Total product/listing price = $100<br>' + 'Marketplace commission = $2 + 10%<br>' + 'Platform fee = 5%<br>' + '<em>(Platform fee is calculated on the total product/listing price)</em>' + '<ul>' + '<li><strong>Option 1 – Added to the customer’s order total:</strong><br>' + 'Platform fee = 5% of $100 = $5<br>' + 'Customer pays = $100 + $5 = $105<br>' + 'Store receives = $100 − $12 = $88</li>' + '<li><strong>Option 2 – Deducted from the store’s commission:</strong><br>' + 'Customer pays = $100<br>' + 'Marketplace commission = $2 + 10% of $100 = $12<br>' + 'Platform fee = 5% of $100 = $5<br>' + 'Store receives = $100 − (12 + 5) = $83</li>' + '</ul>', 'multivendorx'),
			nestedFields: [
				{
					key: 'commission_fixed',
					type: 'text',
					preInsideText: __('$', 'multivendorx'),
					size: '8rem',
					preText: 'Charge a fixed',
					postText: '+',
				},
				{
					key: 'commission_percentage',
					type: 'number',
					size: '8rem',
					postInsideText: __('%', 'multivendorx'),
				},
				{
					key: 'rule',
					type: 'select',
					label: 'to be',
					options: [
						{
							value: 'customer',
							label: 'added to the customer’s order total',
						},
						{
							value: 'store',
							label: 'deducted from the store’s commission',
						},
					],
					// postText: "",
				},
			],
			moduleEnabled: 'marketplace-fee',
		},

		{
			key: 'facilitator_fees',
			type: 'nested',
			label: 'Facilitator fees',
			single: true,
			proSetting: true,
			settingDescription: __(
				'Set facilitator fees as a fixed amount, a percentage, or both. These fees are calculated only on the product/listing price and then deducted from the store’s earnings.',
				'multivendorx'
			),
			desc: __(
				'<strong>Global facilitator:</strong> Assign a single facilitator for the entire marketplace from <a href="' +
				appLocalizer.site_url +
				'/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=facilitator">here</a>.<br><strong>Individual facilitators:</strong> Set facilitators for specific stores from the <em>Facilitator Settings</em> section or the <em>Store Edit</em> page.<br>	Marketplace commission = 20%<br>Facilitator fee = $50 + 5%<br><em>(Facilitator fee is calculated on the total product/listing price)</em><ul><li><strong>Marketplace commission :</strong> = 20% of $1,000 = $200</li><li><strong>Facilitator fee :</strong> $50 + 5% of $1,000 = $100</li><li><strong>Final store payout:</strong> = $1,000 − ($200 + $100) = $700</li></ul>',
				'multivendorx',
			),
			nestedFields: [
				{
					key: 'facilitator_fixed',
					type: 'number',
					preInsideText: __('$', 'multivendorx'),
					size: '8rem',
					preText: 'Fixed',
					postText: '+',
				},
				{
					key: 'facilitator_percentage',
					type: 'number',
					postInsideText: __('%', 'multivendorx'),
					size: '8rem',
				},
			],
			moduleEnabled: 'facilitator',
		},
		{
			key: 'gateway_fees',
			type: 'nested',
			label: __('Gateway fees', 'multivendorx'),
			settingDescription: __(
				'Set up gateway fees to recover the transaction costs charged by your payment provider. These fees are deducted from the store’s commission so your earnings remain unaffected.',
				'multivendorx'
			),
			rowClass: 'single-line',
			moduleEnabled: 'marketplace-gateway',
			single: true,
			desc: __(
				'<strong>Use this setting</strong> to manage transaction fees for different payment methods. You can set a default fee or define specific fees for each payment mode, such as bank transfer or cash on delivery.<br><strong>Example setup:</strong><br> Total order price = $100<br> Marketplace commission rate = 20%<br> Gateway fees = $10 + 5% <ul> <li>Customer pays = $100</li> <li>Marketplace commission = 20% of $100 = $20</li> <li>Gateway fees = $10 + 5% of $100 = $15</li> <li>Total marketplace earning = $20 + $15 = $35</li> <li>Store receives = $100 - $35 = $65</li> </ul>',			
				'multivendorx'
			),
			nestedFields,
		},
	],
};
