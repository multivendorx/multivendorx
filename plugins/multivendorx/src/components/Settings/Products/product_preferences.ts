import { __ } from '@wordpress/i18n';

export default {
	id: 'product-preferencess',
	priority: 2,
	name: __('Product preferences', 'multivendorx'),
	desc: __(
		'Decide which product types, fields, and features stores can access when creating or managing products in their store.',
		'multivendorx'
	),
	icon: 'adminfont-single-product',
	submitUrl: 'settings',
	modal: [
		{
			key: 'type_options',
			type: 'checkbox',
			label: __('Allowed product options', 'multivendorx'),
			settingDescription: __(
				'Select the product fields stores can configure when adding or managing their products.',
				'multivendorx'
			),
			 
			desc: __(
				'<ul><li>Virtual - Choose this option for products that don’t have a physical form (e.g., services, memberships). <li>Downloadable - Use this option for products that customers can download (e.g., software, eBooks).</li><ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'virtual',
					label: __('Virtual', 'multivendorx'),
					value: 'virtual',
				},
				{
					key: 'downloadable',
					label: __('Downloadable', 'multivendorx'),
					value: 'downloadable',
				},
			],
			selectDeselect: true,
		},
		{
			key: 'products_fields',
			type: 'checkbox',
			label: __('Edit product page blocks', 'multivendorx'),
			settingDescription: __(
				'Control which product data fields are available to stores when creating or editing products.',
				'multivendorx'
			),
			 
			options: [
				{
					key: 'general',
					label: __('General', 'multivendorx'),
					desc: __(
						'Store can add description, and price of the product.',
						'multivendorx'
					),
					value: 'general',
				},
				{
					key: 'inventory',
					label: __('Inventory', 'multivendorx'),
					desc: __(
						'Stores can configure stock management options like SKU, stock levels, and availability.',
						'multivendorx'
					),
					value: 'inventory',
				},
				{
					key: 'linked_product',
					label: __('Linked product', 'multivendorx'),
					desc: __(
						'Let stores link related products, upsells, and cross-sells.',
						'multivendorx'
					),
					value: 'linked_product',
				},
				{
					key: 'attribute',
					label: __('Attribute', 'multivendorx'),
					desc: __(
						'Give stores the option to add product features such as size, color, or material.',
						'multivendorx'
					),
					value: 'attribute',
				},
				{
					key: 'advanced',
					label: __('Advanced', 'multivendorx'),
					desc: __(
						'Provide extra settings like purchase notes and catalog/order visibility.',
						'multivendorx'
					),
					value: 'advanced',
				},
				{
					key: 'policies',
					label: __('Policies', 'multivendorx'),
					desc: __(
						'Allow stores to add return, refund, or warranty policies to products.',
						'multivendorx'
					),
					value: 'policies',
				},
				{
					key: 'product_tag',
					label: __('Product tag', 'multivendorx'),
					desc: __(
						'Enable tagging so stores can categorize products for easier search and filtering.',
						'multivendorx'
					),
					value: 'product_tag',
				},
				{
					key: 'GTIN',
					label: __('GTIN', 'multivendorx'),
					desc: __(
						'Global Trade Item Number (barcode/identifier) can be assigned for product tracking.',
						'multivendorx'
					),
					value: 'GTIN',
				},
			],
			selectDeselect: true,
		},
		{
			key: 'separator_category_specific',
			type: 'section',
			desc: __(
				'Control how stores select categories while adding products.',
				'multivendorx'
			),
			hint: __('How stores choose product categories', 'multivendorx'),
		},
		{
			key: 'category_selection_method',
			type: 'setting-toggle',
			label: __('Product category selection', 'multivendorx'),
			settingDescription: __(
				'Choose whether stores follow a guided category selection flow or freely choose multiple categories.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Guided selection – Stores must first choose a primary category, then select from its subcategories.</li><li>Free selection – Stores can choose any number of categories and subcategories without restrictions.</li><ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'yes',
					label: __('Hierarchical selection', 'multivendorx'),
					value: 'yes',
				},
				{
					key: 'no',
					label: __('Free selection', 'multivendorx'),
					value: 'no',
				},
			],
		},

		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'Control how SKUs are handled for products.',
				'multivendorx'
			),
			hint: __('SKU generation', 'multivendorx'),
		},
		{
			key: 'sku_generator',
			type: 'setting-toggle',
			label: __('SKU management for products', 'multivendorx'),
			settingDescription: __(
				'Choose how SKUs for simple, external, or parent products are generated.',
				'multivendorx'
			),
			options: [
				{
					key: 'never',
					label: __('Never (let me set them)', 'multivendorx'),
					value: 'never',
				},
				{
					key: 'slugs',
					label: __('Using the product slug (name)', 'multivendorx'),
					value: 'slugs',
				},
				{
					key: 'ids',
					label: __('Using the product ID', 'multivendorx'),
					value: 'ids',
				},
			],
		},
		{
			key: 'sku_generator_attribute_spaces',
			type: 'setting-toggle',
			label: __('SKU space handling', 'multivendorx'),
			settingDescription: __(
				'Choose how spaces in attribute names should be handled when generating SKUs.',
				'multivendorx'
			),
			options: [
				{
					key: 'no',
					label: __('Keep spaces (   )', 'multivendorx'),
					value: 'no',
				},
				{
					key: 'underscore',
					label: __('Replace with underscore ( _ )', 'multivendorx'),
					value: 'underscore',
				},
				{
					key: 'dash',
					label: __('Replace with dash ( - )', 'multivendorx'),
					value: 'dash',
				},
			],
		},
		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'Products similar in type, category, or stores are displayed as related items to guide customers toward additional purchases.',
				'multivendorx'
			),
			hint: __('Related products source', 'multivendorx'),
		},
		{
			key: 'recommendation_source',
			type: 'setting-toggle',
			label: __('Recommendation source', 'multivendorx'),
			settingDescription: __(
				'Choose whether related products are shown from the same store only or from the entire marketplace.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Same store - Show related products only from the current store.</li><li>All stores - Show related products from across the marketplace.</li><li>Do not display - Hide related products completely.</li><ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'same_store',
					label: __('Same store', 'multivendorx'),
					value: 'same_store',
				},
				{
					key: 'all_stores',
					label: __('All stores', 'multivendorx'),
					value: 'all_stores',
				},
				{
					key: 'none',
					label: __('Do not display', 'multivendorx'),
					value: 'none',
				},
			],
		},
	],
};
