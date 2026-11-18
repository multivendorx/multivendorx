import { __ } from '@wordpress/i18n';

/**
 * Settings → Modules, drawn by zyra's `ModuleGridComponent` (Modules.tsx), the same way VuloCart's is.
 *
 * - `{ type: 'separator' }` rows are the category pills, not modules; a module's `category` must match its separator's
 *   `id`.
 * - `proModule: true` modules ship in CatalogX Pro and stay locked until Pro is active (`appLocalizer.khali_dabba`).
 * - `freeFeatures` is what the module does in CatalogX; `proFeatures` what CatalogX Pro adds (for a Pro module,
 *   everything it does). Both follow the Free vs Pro table on the dashboard (AdminDashboard/FreeVsProTab.tsx).
 * - A module id is the one the server stores; never rename it.
 */
const DOCS = 'https://catalogx.com/docs';
const UTM = '?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx';

export default {
	category: true,
	tab: 'modules',
	modules: [
		{
			type: 'separator',
			id: 'customer-engagement',
			label: __('Customer engagement', 'catalogx'),
		},
		{
			id: 'enquiry',
			name: __('Enquiry & Communication', 'catalogx'),
			desc: __(
				'An enquiry button on product pages, so customers can ask about a product and you reply from one inbox.',
				'catalogx'
			),
			docLink: `${DOCS}/enquiry-communication/${UTM}`,
			settingsLink: `${appLocalizer.admin_url}#&tab=settings&subtab=customer-engagement`,
			proModule: false,
			category: 'customer-engagement',
			icon: 'enquiry',
			freeFeatures: [
				__('Enquiry button and form on product pages', 'catalogx'),
				__('Product links in enquiry emails', 'catalogx'),
				__('WPML compatibility', 'catalogx'),
			],
			proFeatures: [
				__('Enquiry inbox with replies and files', 'catalogx'),
				__('Enquiry cart for several products', 'catalogx'),
				__('Form builder', 'catalogx'),
				__('Enquiry email templates', 'catalogx'),
				__('Custom form position', 'catalogx'),
			],
		},
		{
			id: 'quote',
			name: __('Quotation', 'catalogx'),
			desc: __(
				'Customers request a quote for one or more products, and you answer with your own price. Ideal for B2B and bulk orders.',
				'catalogx'
			),
			docLink: `${DOCS}/quotation/${UTM}`,
			settingsLink: `${appLocalizer.admin_url}#&tab=settings&subtab=customer-engagement`,
			proModule: false,
			category: 'customer-engagement',
			icon: 'quote',
			freeFeatures: [
				__('Add to quote button', 'catalogx'),
				__('Variable product support', 'catalogx'),
				__('Cart to quote conversion', 'catalogx'),
			],
			proFeatures: [
				__('Create quotes for customers', 'catalogx'),
				__('Accept, reject and expire quotes', 'catalogx'),
				__('PDF quotes', 'catalogx'),
				__('Quote list in My Account', 'catalogx'),
				__('Custom thank-you page', 'catalogx'),
			],
		},
		{
			type: 'separator',
			id: 'catalog',
			label: __('Catalog', 'catalogx'),
		},
		{
			id: 'catalog',
			name: __('Catalog Showcase', 'catalogx'),
			desc: __(
				'Show products without selling them: hide prices, the Add to cart button, and the cart and checkout pages.',
				'catalogx'
			),
			docLink: `${DOCS}/catalog/${UTM}`,
			settingsLink: `${appLocalizer.admin_url}#&tab=settings&subtab=customer-engagement`,
			proModule: true,
			category: 'catalog',
			icon: 'catalog',
			proFeatures: [
				__('Hide prices and Add to cart', 'catalogx'),
				__('Restrict cart and checkout', 'catalogx'),
				__('Selling and enquiry side by side', 'catalogx'),
			],
		},
		{
			type: 'separator',
			id: 'pricing',
			label: __('Pricing', 'catalogx'),
		},
		{
			id: 'wholesale',
			name: __('Wholesale Pricing', 'catalogx'),
			desc: __(
				'Separate prices and minimum quantities for approved wholesale buyers.',
				'catalogx'
			),
			docLink: `${DOCS}/wholesale-pricing/${UTM}`,
			settingsLink: `${appLocalizer.admin_url}#&tab=settings&subtab=wholesale`,
			proModule: true,
			category: 'pricing',
			icon: 'wholesale',
			proFeatures: [
				__('Wholesale customer role and approval', 'catalogx'),
				__('Wholesale prices per product or store-wide', 'catalogx'),
				__('Minimum quantities per product or cart', 'catalogx'),
				__('Wholesale order form', 'catalogx'),
				__('Show or hide retail prices', 'catalogx'),
			],
		},
		{
			id: 'rules',
			name: __('Dynamic Pricing Rules', 'catalogx'),
			desc: __(
				'Discounts or markups that apply automatically by quantity, product, category or customer.',
				'catalogx'
			),
			docLink: `${DOCS}/dynamic-pricing-rules/${UTM}`,
			settingsLink: `${appLocalizer.admin_url}#&tab=rules`,
			proModule: true,
			category: 'pricing',
			icon: 'rules',
			proFeatures: [
				__('Rules by role, customer, product or category', 'catalogx'),
				__('Quantity-based and multi-tier pricing', 'catalogx'),
				__('Percentage or fixed discounts and markups', 'catalogx'),
				__('Drag-and-drop rule priority', 'catalogx'),
			],
		},
	],
};
