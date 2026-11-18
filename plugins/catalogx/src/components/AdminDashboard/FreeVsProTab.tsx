import React, { useState } from 'react';
import { PopupComponent } from '@zyra/components';
import { __, sprintf } from '@wordpress/i18n';
import ShowProPopup, { LICENSES } from '../Popup/Popup';
import './free-vs-pro.scss';

interface Feature {
	name: string;
	free: boolean | string;
	pro: boolean | string;
}

interface Section {
	title: string;
	features: Feature[];
}
const sections: Section[] = [
	{
		title: __('Core features', 'catalogx'),
		features: [
			{
				name: __('Enquiry management', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Catalog mode', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Quotation management', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Wholesale pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Dynamic pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Live page builder', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Form builder', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Blocks & shortcodes', 'catalogx'),
		features: [
			{
				name: __('Enquiry button', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Quote button', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Enquiry cart', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Quote cart', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Multi enquiry button', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Wholesale pricing block', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Dynamic pricing block', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Live page builder', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Form builder', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Enquiry features', 'catalogx'),
		features: [
			{
				name: __('Flexible enquiry form display', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Product links in enquiry emails', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('WPML compatibility', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Custom enquiry form position', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Multi enquiry support', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Enquiry cart', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Enquiry email templates', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Form builder', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Enquiry management dashboard', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Combined selling and enquiry mode', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Quotation features', 'catalogx'),
		features: [
			{
				name: __('Add to quote button', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Variable product support', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Universal quote access', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Cart to quote conversion', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Customizable quote button', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('PDF quote viewing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Custom thank you page', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Custom quote creation', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Quote acceptance and rejection', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Admin quote notifications', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('User quote management', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Quote expiration', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Wholesale pricing', 'catalogx'),
		features: [
			{
				name: __('Wholesale customer role', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Show or hide retail prices', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Wholesale pricing fields', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Coupon restrictions for wholesalers', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Hide products without wholesale pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Global wholesale pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Minimum cart quantity', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Per-product minimum quantity', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Wholesale order form', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Percentage discounts', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Fixed amount discounts', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Per-user wholesale pricing', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Dynamic pricing', 'catalogx'),
		features: [
			{
				name: __('Role-based pricing rules', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Customer-specific pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Fixed pricing adjustments', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Discounts and markups', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Bulk pricing adjustments', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Quantity-based pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Replace product prices with markups', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Custom user roles', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Drag-and-drop rule priority', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Product-level pricing rules', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Multi-tier pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Category-based pricing rules', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
];

/** Counts, for the hero: what Free includes, and how many more Pro adds on top. */
// A feature can be listed under more than one section (Form builder, Enquiry cart…); count it once.
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
		<span className={`cx-fvp-yes${pro ? ' is-pro' : ''}`}>
			<i className="adminfont-check" aria-hidden="true" />
			<span className="screen-reader-text">
				{__('Included', 'catalogx')}
			</span>
		</span>
	) : (
		<span className="cx-fvp-no">
			<span aria-hidden="true">—</span>
			<span className="screen-reader-text">
				{__('Not included', 'catalogx')}
			</span>
		</span>
	);
};

/**
 * Dashboard → Free vs Pro (free sites only): what Pro adds, feature by feature. One upgrade button at the top and one
 * at the end, both opening the Pro popup (features, plans, buy) like every other upgrade button in CatalogX.
 */
const FreeVsProTab: React.FC = () => {
	const [open, setOpen] = useState(false);
	const lowestPrice = LICENSES[0]?.price;

	const upgradeButton = (className = '') => (
		<button
			type="button"
			className={`admin-btn cx-upgrade-btn cx-fvp-upgrade ${className}`.trim()}
			onClick={() => setOpen(true)}
		>
			<i className="adminfont-pro-tag" aria-hidden="true" />
			{__('Upgrade to Pro', 'catalogx')}
		</button>
	);

	return (
		<div className="cx-fvp">
			<section className="cx-fvp-hero">
				<div className="cx-fvp-hero-text">
					<span className="cx-fvp-pill">
						<i className="adminfont-pro-tag" aria-hidden="true" />
						{__('CatalogX Pro', 'catalogx')}
					</span>
					<h2>
						{__(
							'Everything in Free, plus quotations, wholesale selling and pricing rules',
							'catalogx'
						)}
					</h2>
					<p>
						{__(
							'Keep every product, enquiry and setting you have today. Pro adds an enquiry inbox, professional quotes and B2B selling on top.',
							'catalogx'
						)}
					</p>
					<div className="cx-fvp-hero-actions">
						{upgradeButton('is-large')}
						{lowestPrice && (
							<span className="cx-fvp-price">
								{sprintf(
									/* translators: %s: lowest Pro license price, e.g. $129. */
									__('Plans from %s', 'catalogx'),
									lowestPrice
								)}
							</span>
						)}
					</div>
					<p className="cx-fvp-guarantee">
						<i className="adminfont-security" aria-hidden="true" />
						{__('15-day money-back guarantee', 'catalogx')}
					</p>
				</div>
				<dl className="cx-fvp-stats">
					<div>
						<dt>{__('Included in Free', 'catalogx')}</dt>
						<dd>{freeCount}</dd>
					</div>
					<div className="is-pro">
						<dt>{__('More with Pro', 'catalogx')}</dt>
						<dd>+{proOnlyCount}</dd>
					</div>
				</dl>
			</section>

			<section
				className="cx-fvp-compare"
				aria-labelledby="cx-fvp-compare-title"
			>
				<header className="cx-fvp-compare-head">
					<h3 id="cx-fvp-compare-title">
						{__('Compare feature by feature', 'catalogx')}
					</h3>
					<p>
						{__(
							'Pro includes every Free feature. Rows marked Pro only are what you unlock.',
							'catalogx'
						)}
					</p>
				</header>
				<table className="cx-fvp-table">
					<thead>
						<tr>
							<th scope="col">
								<span className="screen-reader-text">
									{__('Feature', 'catalogx')}
								</span>
							</th>
							<th scope="col">{__('Free', 'catalogx')}</th>
							<th scope="col" className="is-pro">
								{__('Pro', 'catalogx')}
							</th>
						</tr>
					</thead>
					{sections.map((section) => {
						const added = section.features.filter(
							(feature) => !feature.free
						).length;

						return (
							<tbody key={section.title}>
								<tr className="cx-fvp-group">
									<th scope="rowgroup" colSpan={2}>
										{section.title}
										{added > 0 && (
											<span className="cx-fvp-added">
												{sprintf(
													/* translators: %d: number of features only in Pro. */
													__(
														'+%d with Pro',
														'catalogx'
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
												<span className="cx-fvp-tag">
													{__(
														'Pro only',
														'catalogx'
													)}
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

			<section className="cx-fvp-cta">
				<div>
					<h3>
						{sprintf(
							/* translators: %d: number of features only in Pro. */
							__('Unlock all %d Pro features today', 'catalogx'),
							proOnlyCount
						)}
					</h3>
					<p>
						{__(
							'Every plan includes every Pro feature. Plans differ only in how many sites you activate.',
							'catalogx'
						)}
					</p>
				</div>
				{upgradeButton('is-light')}
			</section>

			{open && (
				<PopupComponent
					position="lightbox"
					open
					onClose={() => setOpen(false)}
					width={46}
					height="auto"
				>
					<ShowProPopup />
				</PopupComponent>
			)}
		</div>
	);
};

export default FreeVsProTab;
