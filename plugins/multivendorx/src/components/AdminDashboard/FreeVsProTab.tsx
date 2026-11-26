import React, { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { LICENSES, ProPopupDialog } from '../Popup/Popup';
import './free-vs-pro.scss';

interface Feature {
	name: string;
	free: boolean | string;
	pro: boolean | string;
	/** Another plugin the feature works with, e.g. "Needs WooCommerce Bookings". */
	note?: string;
}

interface Section {
	title: string;
	features: Feature[];
}

/** A feature in both Free and Pro. */
const free = (name: string, note?: string): Feature => ({
	name,
	free: true,
	pro: true,
	note,
});

/** A feature only in Pro. */
const pro = (name: string, note?: string): Feature => ({
	name,
	free: false,
	pro: true,
	note,
});

/* translators: %s: name of another WordPress plugin, e.g. "WooCommerce Bookings". */
const needs = (plugin: string) =>
	sprintf(__('Needs %s', 'multivendorx'), plugin);

/*
 * Every module and setting MultiVendorX ships, Free or Pro, as the Modules screen and the settings mark them
 * (src/components/Modules/index.ts, `proSetting` in the settings). Grouped by what a marketplace owner sets out to do,
 * the way buyers compare marketplace plugins. Keep in step with the modules: a new module gets a row here.
 */
const sections: Section[] = [
	{
		title: __('Run your marketplace', 'multivendorx'),
		features: [
			free(
				__('Store dashboard for sellers on your site', 'multivendorx')
			),
			free(__('Store sign-up form you can customize', 'multivendorx')),
			free(
				__(
					'Approve new stores, products and coupons before they go live',
					'multivendorx'
				)
			),
			free(__('Orders split by store automatically', 'multivendorx')),
			free(__('Marketplace reports for admin', 'multivendorx')),
			free(__('Announcements to all stores', 'multivendorx')),
			free(__('Knowledgebase articles for stores', 'multivendorx')),
			free(
				__('Compliance checks on stores and listings', 'multivendorx')
			),
			free(
				__(
					'Email and on-site notifications you can customize',
					'multivendorx'
				)
			),
			pro(
				__(
					'Store membership plans with their own limits and capabilities',
					'multivendorx'
				)
			),
			pro(
				__(
					'Franchise ordering, with orders assigned to the nearest store',
					'multivendorx'
				)
			),
		],
	},
	{
		title: __('Products you can sell', 'multivendorx'),
		features: [
			free(__('Simple products, physical or digital', 'multivendorx')),
			free(
				__(
					'One product sold by several stores (shared listing)',
					'multivendorx'
				)
			),
			free(__('Minimum and maximum order quantities', 'multivendorx')),
			free(
				__('AI-written product descriptions and images', 'multivendorx')
			),
			pro(__('Variable products', 'multivendorx')),
			pro(__('Grouped products', 'multivendorx')),
			pro(__('External and affiliate products', 'multivendorx')),
			pro(
				__('Product bundles', 'multivendorx'),
				needs('Product Bundles')
			),
			pro(
				__('Gift cards', 'multivendorx'),
				needs('YITH WooCommerce Gift Cards')
			),
			pro(
				__(
					'Product add-ons, like gift wrap or engraving',
					'multivendorx'
				),
				needs('Product Add-Ons')
			),
			pro(
				__('Custom product fields', 'multivendorx'),
				needs('Advanced Custom Fields')
			),
		],
	},
	{
		title: __('Marketplace types', 'multivendorx'),
		features: [
			pro(
				__('Bookings for services and equipment', 'multivendorx'),
				needs('WooCommerce Bookings')
			),
			pro(
				__('Appointments', 'multivendorx'),
				needs('WooCommerce Appointments')
			),
			pro(
				__('Accommodation and overnight stays', 'multivendorx'),
				needs('WooCommerce Accommodation Bookings')
			),
			pro(
				__('Rentals', 'multivendorx'),
				needs('RnB – WooCommerce Rental & Bookings')
			),
			pro(__('Subscription products', 'multivendorx')),
			pro(
				__('Auctions', 'multivendorx'),
				needs('YITH WooCommerce Auctions')
			),
		],
	},
	{
		title: __('Tools for stores', 'multivendorx'),
		features: [
			free(
				__('Store policies: returns, refunds, shipping', 'multivendorx')
			),
			free(__('Store location on a map', 'multivendorx')),
			free(
				__(
					'Privacy controls to show or hide store details',
					'multivendorx'
				)
			),
			pro(__('Media library for each store', 'multivendorx')),
			pro(__('Bulk import and export products with CSV', 'multivendorx')),
			pro(
				__(
					'Stock management, low-stock alerts and waitlists',
					'multivendorx'
				)
			),
			pro(__('Opening hours shown on the store', 'multivendorx')),
			pro(
				__('Vacation mode, with a notice for customers', 'multivendorx')
			),
			pro(__('Staff accounts with role-based access', 'multivendorx')),
			pro(
				__('Identity verification and a verified badge', 'multivendorx')
			),
			pro(__('Store analytics, with Google Analytics', 'multivendorx')),
		],
	},
	{
		title: __('Commissions and payouts', 'multivendorx'),
		features: [
			free(
				__(
					'Commission per order or per item, with tiers by price or order value',
					'multivendorx'
				)
			),
			free(
				__(
					'Split tax and shipping between marketplace and store',
					'multivendorx'
				)
			),
			free(
				__(
					'Store wallets with clearing period, reserve and payout minimum',
					'multivendorx'
				)
			),
			free(
				__(
					'Automatic payouts: hourly, daily, weekly or monthly',
					'multivendorx'
				)
			),
			free(
				__(
					'Pay stores by bank transfer, PayPal Payouts, Stripe Connect or cash',
					'multivendorx'
				)
			),
			free(__('Pass payment gateway fees to stores', 'multivendorx')),
			free(
				__(
					'Choose who pays for coupons: marketplace or store',
					'multivendorx'
				)
			),
			pro(
				__(
					'Instant split payments with Stripe Marketplace',
					'multivendorx'
				)
			),
			pro(
				__(
					'Instant split payments with PayPal Marketplace',
					'multivendorx'
				)
			),
			pro(__('Marketplace fees per order or per store', 'multivendorx')),
			pro(
				__(
					'Share a commission with a facilitator or agent',
					'multivendorx'
				)
			),
		],
	},
	{
		title: __('Shipping and delivery', 'multivendorx'),
		features: [
			free(__('Shipping by zone, country or distance', 'multivendorx')),
			free(__('Shipment tracking with major carriers', 'multivendorx')),
			free(__('Marketplace refunds', 'multivendorx')),
			pro(
				__(
					'Delivery stages: processing, shipped, delivered',
					'multivendorx'
				)
			),
			pro(
				__(
					'Shipping by weight, order value or quantity',
					'multivendorx'
				),
				needs('Table Rate Shipping')
			),
			pro(
				__('Shipping rate per product', 'multivendorx'),
				needs('Per Product Shipping for WooCommerce')
			),
			pro(__('Invoices and packing slips', 'multivendorx')),
			pro(__('Shipping labels with ShipStation', 'multivendorx')),
			pro(__('Print on demand with Printful', 'multivendorx')),
		],
	},
	{
		title: __('Customer experience', 'multivendorx'),
		features: [
			free(__('Store ratings and reviews', 'multivendorx')),
			free(__('Follow a store', 'multivendorx')),
			free(__('Product questions and answers', 'multivendorx')),
			free(__('Report a product or store', 'multivendorx')),
			pro(__('Live chat between customers and stores', 'multivendorx')),
			pro(__('Support tickets for each store', 'multivendorx')),
		],
	},
	{
		title: __('Marketing and growth', 'multivendorx'),
		features: [
			pro(
				__('SEO for stores and products', 'multivendorx'),
				needs('Yoast SEO or Rank Math')
			),
			pro(__('Paid product promotions', 'multivendorx')),
			pro(
				__(
					'Wholesale prices for selected customer groups',
					'multivendorx'
				)
			),
			pro(
				__('Affiliate program for stores', 'multivendorx'),
				needs('AffiliateWP')
			),
		],
	},
	{
		title: __('Works with', 'multivendorx'),
		features: [
			free(
				__('Elementor store page designs', 'multivendorx'),
				needs('Elementor')
			),
			free(
				__('Multilingual stores and products', 'multivendorx'),
				needs('WPML')
			),
			free(
				__('Social profiles for stores', 'multivendorx'),
				needs('BuddyPress')
			),
		],
	},
	{
		title: __('Support and updates', 'multivendorx'),
		features: [
			{
				name: __('Support', 'multivendorx'),
				free: __('Community forum', 'multivendorx'),
				pro: __('Priority support', 'multivendorx'),
			},
		],
	},
];

/** Counts, for the hero: what Free includes, and how many more Pro adds on top. */
// A feature can be listed under more than one section; count it once.
const allFeatures = [
	...new Map(
		sections
			.flatMap((section) => section.features)
			.map((feature): [string, Feature] => [feature.name, feature])
	).values(),
];
const freeCount = allFeatures.filter((feature) => feature.free).length;
const proOnlyCount = allFeatures.length - freeCount;

/** A Free/Pro cell: a mark for sighted readers, and the words for screen readers. */
const Cell: React.FC<{ value: boolean | string; pro?: boolean }> = ({
	value,
	pro = false,
}) => {
	if ('string' === typeof value) {
		return <>{value}</>;
	}

	return value ? (
		<span className={`mvx-fvp-yes${pro ? ' is-pro' : ''}`}>
			<i className="adminfont-check" aria-hidden="true" />
			<span className="screen-reader-text">
				{__('Included', 'multivendorx')}
			</span>
		</span>
	) : (
		<span className="mvx-fvp-no">
			<span aria-hidden="true">—</span>
			<span className="screen-reader-text">
				{__('Not included', 'multivendorx')}
			</span>
		</span>
	);
};

/**
 * Dashboard → Free vs Pro (free sites only): what Pro adds, feature by feature. One upgrade button at the top and one
 * at the end, both opening the Pro popup (features, plans, buy) like every other upgrade button in MultiVendorX.
 */
const FreeVsProTab: React.FC = () => {
	const [open, setOpen] = useState(false);
	const lowestPrice = LICENSES[0]?.price;

	const upgradeButton = (className = '') => (
		<button
			type="button"
			className={`admin-btn mvx-upgrade-btn mvx-fvp-upgrade ${className}`.trim()}
			onClick={() => setOpen(true)}
		>
			<i className="adminfont-pro-tag" aria-hidden="true" />
			{__('Upgrade to Pro', 'multivendorx')}
		</button>
	);

	return (
		<div className="mvx-fvp">
			<section className="mvx-fvp-hero">
				<div className="mvx-fvp-hero-text">
					<span className="mvx-fvp-pill">
						<i className="adminfont-pro-tag" aria-hidden="true" />
						{'MultiVendorX Pro'}
					</span>
					<h2>
						{__(
							'Everything in Free, plus memberships, verified stores and new ways to sell',
							'multivendorx'
						)}
					</h2>
					<p>
						{__(
							'Keep every store, product and setting you have today. Pro adds store memberships, verification, bookings, subscriptions and more on top.',
							'multivendorx'
						)}
					</p>
					<div className="mvx-fvp-hero-actions">
						{upgradeButton('is-large')}
						{lowestPrice && (
							<span className="mvx-fvp-price">
								{sprintf(
									/* translators: %s: lowest Pro license price, e.g. $299. */
									__('Plans from %s', 'multivendorx'),
									lowestPrice
								)}
							</span>
						)}
					</div>
				</div>
				<dl className="mvx-fvp-stats">
					<div>
						<dt>{__('Included in Free', 'multivendorx')}</dt>
						<dd>{freeCount}</dd>
					</div>
					<div className="is-pro">
						<dt>{__('More with Pro', 'multivendorx')}</dt>
						<dd>+{proOnlyCount}</dd>
					</div>
				</dl>
			</section>

			<section
				className="mvx-fvp-compare"
				aria-labelledby="mvx-fvp-compare-title"
			>
				<header className="mvx-fvp-compare-head">
					<h3 id="mvx-fvp-compare-title">
						{__('Compare feature by feature', 'multivendorx')}
					</h3>
					<p>
						{__(
							'Pro includes every Free feature. Rows marked Pro are what you unlock.',
							'multivendorx'
						)}
					</p>
				</header>
				<table className="mvx-fvp-table">
					<thead>
						<tr>
							<th scope="col">
								<span className="screen-reader-text">
									{__('Feature', 'multivendorx')}
								</span>
							</th>
							<th scope="col">{__('Free', 'multivendorx')}</th>
							<th scope="col" className="is-pro">
								{__('Pro', 'multivendorx')}
							</th>
						</tr>
					</thead>
					{sections.map((section) => {
						const added = section.features.filter(
							(feature) => !feature.free
						).length;

						return (
							<tbody key={section.title}>
								<tr className="mvx-fvp-group">
									<th scope="rowgroup" colSpan={2}>
										{section.title}
										{added > 0 && (
											<span className="mvx-fvp-added">
												{sprintf(
													/* translators: %d: number of features only in Pro. */
													__(
														'+%d with Pro',
														'multivendorx'
													),
													added
												)}
											</span>
										)}
									</th>
									<td className="is-pro" aria-hidden="true" />
								</tr>
								{section.features.map((feature) => (
									<tr
										key={feature.name}
										className={
											feature.free ? '' : 'is-pro-only'
										}
									>
										<th scope="row">
											{feature.name}
											{!feature.free && (
												<span className="admin-tag pro-tag">
													<i
														className="adminfont-pro-tag"
														aria-hidden="true"
													/>
													{__('Pro', 'multivendorx')}
												</span>
											)}
											{feature.note && (
												<span className="mvx-fvp-note">
													{feature.note}
												</span>
											)}
										</th>
										<td>
											<Cell value={feature.free} />
										</td>
										<td className="is-pro">
											<Cell value={feature.pro} pro />
										</td>
									</tr>
								))}
							</tbody>
						);
					})}
				</table>
			</section>

			<section className="mvx-fvp-cta">
				<div>
					<h3>
						{sprintf(
							/* translators: %d: number of features only in Pro. */
							__(
								'Unlock all %d Pro features today',
								'multivendorx'
							),
							proOnlyCount
						)}
					</h3>
					<p>
						{__(
							'Every plan includes every Pro feature. Plans differ only in how many sites you activate.',
							'multivendorx'
						)}
					</p>
				</div>
				{upgradeButton('is-light')}
			</section>

			{open && <ProPopupDialog onClose={() => setOpen(false)} />}
		</div>
	);
};

export default FreeVsProTab;
