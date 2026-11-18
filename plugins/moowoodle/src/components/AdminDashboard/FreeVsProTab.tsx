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
		title: __('Power your Moodle eLearning platform', 'moowoodle'),
		features: [
			{
				name: __('Connect Moodle with WordPress', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('WooCommerce course selling', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Course synchronization', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Course category synchronization', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('One-click enrollment', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Student enrollment management', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Moodle test connection', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Log viewer & debugging tools', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Course listing management', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Multilingual support', 'moowoodle'),
				free: true,
				pro: true,
			},
		],
	},
	{
		title: __('Manage courses with advanced controls', 'moowoodle'),
		features: [
			{
				name: __('Import courses as draft', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Course status control', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Course image synchronization', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Course group synchronization', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Automatically create new products', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Automatically update existing products', 'moowoodle'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Synchronize users and access seamlessly', 'moowoodle'),
		features: [
			{
				name: __('Basic user synchronization', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Real-time user synchronization', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Bidirectional synchronization', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('User profile field mapping', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Existing user synchronization', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Single Sign-On (SSO)', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Synced login/logout between Moodle & WordPress',
					'moowoodle'
				),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Sell courses your way', 'moowoodle'),
		features: [
			{
				name: __('Individual course enrollment', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Classroom / multi-seat enrollment', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Cohort enrollment', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Group enrollment via variations', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Course gifting', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Seat reassignment', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Bulk student enrollment', 'moowoodle'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Flexible pricing and subscriptions', 'moowoodle'),
		features: [
			{
				name: __('One-time course purchase', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Tiered course access', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Subscription-based courses', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Tiered subscription support', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Bundled courses', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Multiple pricing models', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Course variations support', 'moowoodle'),
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
		<span className={`mw-fvp-yes${pro ? ' is-pro' : ''}`}>
			<i className="adminfont-check" aria-hidden="true" />
			<span className="screen-reader-text">
				{__('Included', 'moowoodle')}
			</span>
		</span>
	) : (
		<span className="mw-fvp-no">
			<span aria-hidden="true">—</span>
			<span className="screen-reader-text">
				{__('Not included', 'moowoodle')}
			</span>
		</span>
	);
};

/**
 * Dashboard → Free vs Pro (free sites only): what Pro adds, feature by feature. One upgrade button at the top and one
 * at the end, both opening the Pro popup (features, plans, buy) like every other upgrade button in MooWoodle.
 */
const FreeVsProTab: React.FC = () => {
	const [open, setOpen] = useState(false);
	const lowestPrice = LICENSES[0]?.price;

	const upgradeButton = (className = '') => (
		<button
			type="button"
			className={`admin-btn mw-upgrade-btn mw-fvp-upgrade ${className}`.trim()}
			onClick={() => setOpen(true)}
		>
			<i className="adminfont-pro-tag" aria-hidden="true" />
			{__('Upgrade to Pro', 'moowoodle')}
		</button>
	);

	return (
		<div className="mw-fvp">
			<section className="mw-fvp-hero">
				<div className="mw-fvp-hero-text">
					<span className="mw-fvp-pill">
						<i className="adminfont-pro-tag" aria-hidden="true" />
						{__('MooWoodle Pro', 'moowoodle')}
					</span>
					<h2>
						{__(
							'Everything in Free, plus the tools to sell to groups, subscribers and classrooms',
							'moowoodle'
						)}
					</h2>
					<p>
						{__(
							'Keep every course, product and enrollment you have today. Pro adds automation, Single Sign-On and new ways to sell on top.',
							'moowoodle'
						)}
					</p>
					<div className="mw-fvp-hero-actions">
						{upgradeButton('is-large')}
						{lowestPrice && (
							<span className="mw-fvp-price">
								{sprintf(
									/* translators: %s: lowest Pro license price, e.g. $199. */
									__('Plans from %s', 'moowoodle'),
									lowestPrice
								)}
							</span>
						)}
					</div>
					<p className="mw-fvp-guarantee">
						<i className="adminfont-security" aria-hidden="true" />
						{__('15-day money-back guarantee', 'moowoodle')}
					</p>
				</div>
				<dl className="mw-fvp-stats">
					<div>
						<dt>{__('Included in Free', 'moowoodle')}</dt>
						<dd>{freeCount}</dd>
					</div>
					<div className="is-pro">
						<dt>{__('More with Pro', 'moowoodle')}</dt>
						<dd>+{proOnlyCount}</dd>
					</div>
				</dl>
			</section>

			<section
				className="mw-fvp-compare"
				aria-labelledby="mw-fvp-compare-title"
			>
				<header className="mw-fvp-compare-head">
					<h3 id="mw-fvp-compare-title">
						{__('Compare feature by feature', 'moowoodle')}
					</h3>
					<p>
						{__(
							'Pro includes every Free feature. Rows marked Pro only are what you unlock.',
							'moowoodle'
						)}
					</p>
				</header>
				<table className="mw-fvp-table">
					<thead>
						<tr>
							<th scope="col">
								<span className="screen-reader-text">
									{__('Feature', 'moowoodle')}
								</span>
							</th>
							<th scope="col">{__('Free', 'moowoodle')}</th>
							<th scope="col" className="is-pro">
								{__('Pro', 'moowoodle')}
							</th>
						</tr>
					</thead>
					{sections.map((section) => {
						const added = section.features.filter(
							(feature) => !feature.free
						).length;

						return (
							<tbody key={section.title}>
								<tr className="mw-fvp-group">
									<th scope="rowgroup" colSpan={2}>
										{section.title}
										{added > 0 && (
											<span className="mw-fvp-added">
												{sprintf(
													/* translators: %d: number of features only in Pro. */
													__(
														'+%d with Pro',
														'moowoodle'
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
												<span className="mw-fvp-tag">
													{__(
														'Pro only',
														'moowoodle'
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

			<section className="mw-fvp-cta">
				<div>
					<h3>
						{sprintf(
							/* translators: %d: number of features only in Pro. */
							__('Unlock all %d Pro features today', 'moowoodle'),
							proOnlyCount
						)}
					</h3>
					<p>
						{__(
							'Every plan includes every Pro feature. Plans differ only in how many sites you activate.',
							'moowoodle'
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
