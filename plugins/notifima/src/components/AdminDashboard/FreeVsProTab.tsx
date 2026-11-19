import React, { useState } from 'react';
import { PopupComponent } from '@zyra/components';
import { __, sprintf } from '@wordpress/i18n';
import ShowProPopup, { LICENSES } from '../Popup/Popup';
import './free-vs-pro.scss';

interface Feature {
	name: string;
	free: boolean | string;
	pro: boolean | string;
	/** Planned for Pro but not released yet: tagged "Coming soon" rather than "Pro only". */
	comingSoon?: boolean;
}

interface Section {
	title: string;
	features: Feature[];
}
const sections: Section[] = [
	{
		title: __('Never Miss a Sale Opportunity', 'notifima'),
		features: [
			{
				name: __('Back-in-stock subscription form', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Automatic restock email notifications', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Admin alerts for new subscriptions', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Support for guest and logged-in customers', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Prevent duplicate subscriptions', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Works with WooCommerce backorders', 'notifima'),
				free: true,
				pro: true,
			},
		],
	},
	{
		title: __('Customize the Subscriber Experience', 'notifima'),
		features: [
			{
				name: __('Customize subscription form text and styling', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Customize email headings and subjects', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('WPML compatibility', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Customer self-service subscription dashboard', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('View and manage product waitlists', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('One-click unsubscribe from notifications', 'notifima'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Grow and Engage Your Subscriber List', 'notifima'),
		features: [
			{
				name: __('Double opt-in subscription confirmation', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Ensure genuine subscriber interest', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Mailchimp integration', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Instant subscriber syncing', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Automated list management', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Batch synchronization options', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Enhanced customer segmentation', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Track email delivery and unsubscribe status', 'notifima'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Subscriber Management & Reporting', 'notifima'),
		features: [
			{
				name: __('Export subscriber list from WordPress tools', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Advanced subscriber export with names, emails, and dates', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Subscription management dashboard', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Sort subscriptions by products and dates', 'notifima'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Smart Inventory Management', 'notifima'),
		features: [
			{
				name: __('Export shop stock data', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Inventory manager dashboard', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('View and manage all products centrally', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Quick edit stock, SKU, and product data', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Import and update inventory via CSV', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Product stock history and movement logs', 'notifima'),
				free: false,
				pro: true,
				comingSoon: true,
			},
		],
	},
	{
		title: __('Security & Spam Protection', 'notifima'),
		features: [
			{
				name: __('Smart ReCAPTCHA protection', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Block automated spam subscriptions', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Prevent fake subscriptions and maintain data quality', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Ensure notification compliance and sender reputation', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Block subscriptions from specific email addresses', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Block subscriptions from specific email domains', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Customize subscription restriction messages', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Create safe-sender email lists', 'notifima'),
				free: false,
				pro: true,
			},
		],
	},
];

/** Counts, for the hero: what Free includes, and how many more Pro adds on top. */
const allFeatures = sections.flatMap((section) => section.features);
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
		<span className={`nf-fvp-yes${pro ? ' is-pro' : ''}`}>
			<i className="adminfont-check" aria-hidden="true" />
			<span className="screen-reader-text">
				{__('Included', 'notifima')}
			</span>
		</span>
	) : (
		<span className="nf-fvp-no">
			<span aria-hidden="true">—</span>
			<span className="screen-reader-text">
				{__('Not included', 'notifima')}
			</span>
		</span>
	);
};

/**
 * Dashboard → Free vs Pro (free sites only): what Pro adds, feature by feature. One upgrade button at the top and one
 * at the end, both opening the Pro popup (features, plans, buy) like every other upgrade button in Notifima.
 */
const FreeVsProTab: React.FC = () => {
	const [open, setOpen] = useState(false);
	const lowestPrice = LICENSES[0]?.price;

	const upgradeButton = (className = '') => (
		<button
			type="button"
			className={`admin-btn nf-upgrade-btn nf-fvp-upgrade ${className}`.trim()}
			onClick={() => setOpen(true)}
		>
			<i className="adminfont-pro-tag" aria-hidden="true" />
			{__('Upgrade to Pro', 'notifima')}
		</button>
	);

	return (
		<div className="nf-fvp">
			<section className="nf-fvp-hero">
				<div className="nf-fvp-hero-text">
					<span className="nf-fvp-pill">
						<i className="adminfont-pro-tag" aria-hidden="true" />
						{__('Notifima Pro', 'notifima')}
					</span>
					<h2>
						{__(
							'Everything in Free, plus the tools to keep waitlists clean and act on demand',
							'notifima'
						)}
					</h2>
					<p>
						{__(
							'Keep every subscriber, email and setting you have today. Pro adds double opt-in, spam protection, Mailchimp, a full subscriber list and an inventory manager on top.',
							'notifima'
						)}
					</p>
					<div className="nf-fvp-hero-actions">
						{upgradeButton('is-large')}
						{lowestPrice && (
							<span className="nf-fvp-price">
								{sprintf(
									/* translators: %s: lowest Pro license price, e.g. $199. */
									__('Plans from %s', 'notifima'),
									lowestPrice
								)}
							</span>
						)}
					</div>
					<p className="nf-fvp-guarantee">
						<i className="adminfont-security" aria-hidden="true" />
						{__('15-day money-back guarantee', 'notifima')}
					</p>
				</div>
				<dl className="nf-fvp-stats">
					<div>
						<dt>{__('Included in Free', 'notifima')}</dt>
						<dd>{freeCount}</dd>
					</div>
					<div className="is-pro">
						<dt>{__('More with Pro', 'notifima')}</dt>
						<dd>+{proOnlyCount}</dd>
					</div>
				</dl>
			</section>

			<section
				className="nf-fvp-compare"
				aria-labelledby="nf-fvp-compare-title"
			>
				<header className="nf-fvp-compare-head">
					<h3 id="nf-fvp-compare-title">
						{__('Compare feature by feature', 'notifima')}
					</h3>
					<p>
						{__(
							'Pro includes every Free feature. Rows marked Pro only are what you unlock.',
							'notifima'
						)}
					</p>
				</header>
				<table className="nf-fvp-table">
					<thead>
						<tr>
							<th scope="col">
								<span className="screen-reader-text">
									{__('Feature', 'notifima')}
								</span>
							</th>
							<th scope="col">{__('Free', 'notifima')}</th>
							<th scope="col" className="is-pro">
								{__('Pro', 'notifima')}
							</th>
						</tr>
					</thead>
					{sections.map((section) => {
						const added = section.features.filter(
							(feature) => !feature.free
						).length;

						return (
							<tbody key={section.title}>
								<tr className="nf-fvp-group">
									<th scope="rowgroup" colSpan={2}>
										{section.title}
										{added > 0 && (
											<span className="nf-fvp-added">
												{sprintf(
													/* translators: %d: number of features only in Pro. */
													__(
														'+%d with Pro',
														'notifima'
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
												<span className="nf-fvp-tag">
													{feature.comingSoon
														? __(
																'Coming soon',
																'notifima'
															)
														: __(
																'Pro only',
																'notifima'
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

			<section className="nf-fvp-cta">
				<div>
					<h3>
						{sprintf(
							/* translators: %d: number of features only in Pro. */
							__('Unlock all %d Pro features today', 'notifima'),
							proOnlyCount
						)}
					</h3>
					<p>
						{__(
							'Every plan includes every Pro feature. Plans differ only in how many sites you activate.',
							'notifima'
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
