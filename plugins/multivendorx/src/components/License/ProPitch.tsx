/* global appLocalizer */
import React, { useState } from 'react';
import { __, _n, sprintf } from '@wordpress/i18n';
import { LICENSES, ProPopupDialog } from '../Popup/Popup';
import { PRO_FEATURES } from '../../services/proFeatures';
import { ACCOUNT_URL } from '../../services/links';
import './pro-pitch.scss';

/**
 * Settings → License without MultiVendorX Pro: why Pro is worth it (what it adds, the plans and their prices) and,
 * for someone who has already bought it, how to get from the purchase to an active license.
 *
 * Features and plans are the same lists the dashboard and the Pro popup use, so they never disagree on what Pro
 * costs or includes.
 */
const ProPitch: React.FC = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className="mvx-pitch">
			<section className="mvx-pitch-hero">
				<span className="mvx-pitch-pill">
					<i className="adminfont-pro-tag" aria-hidden="true" />
					MultiVendorX Pro
				</span>
				<h2>
					{__(
						'Run a marketplace stores pay to join and buyers trust',
						'multivendorx'
					)}
				</h2>
				<p>
					{__(
						'MultiVendorX lets stores sell on your site. Pro adds store memberships, verification, bookings, subscriptions and the tools to run them at scale.',
						'multivendorx'
					)}
				</p>
				<div className="mvx-pitch-actions">
					<button
						type="button"
						className="mvx-pitch-button"
						onClick={() => setOpen(true)}
					>
						{__('Upgrade to Pro', 'multivendorx')}
					</button>
					<a
						className="mvx-pitch-link"
						href="#&tab=dashboard&view=free-vs-pro"
					>
						{__('Compare Free vs Pro', 'multivendorx')}
						<i
							className="adminfont-arrow-right"
							aria-hidden="true"
						/>
					</a>
				</div>
				<p className="mvx-pitch-guarantee">
					<i className="adminfont-security" aria-hidden="true" />
					{__(
						'Your stores, products and settings stay as they are.',
						'multivendorx'
					)}
				</p>
			</section>

			<section className="mvx-pitch-section">
				<h3>{__('What Pro adds', 'multivendorx')}</h3>
				<ul className="mvx-pitch-features">
					{PRO_FEATURES.map((feature) => (
						<li key={feature.title}>
							<span className="mvx-pitch-icon" aria-hidden="true">
								<i className={`adminfont-${feature.icon}`} />
							</span>
							<span>
								<strong>{feature.title}</strong>
								<span>{feature.desc}</span>
							</span>
						</li>
					))}
				</ul>
			</section>

			<section className="mvx-pitch-section">
				<h3>{__('Pick a plan', 'multivendorx')}</h3>
				<p className="mvx-pitch-section-desc">
					{__(
						'Every plan includes every Pro feature. Plans differ only in how many sites you can activate.',
						'multivendorx'
					)}
				</p>
				<ul className="mvx-pitch-plans">
					{LICENSES.map((plan) => {
						const label = sprintf(
							/* translators: %s: number of sites. */
							_n(
								'%s site',
								'%s sites',
								Number(plan.site),
								'multivendorx'
							),
							plan.site
						);

						return (
							<li key={plan.site}>
								<span className="mvx-pitch-plan-sites">
									{label}
								</span>
								<strong className="mvx-pitch-plan-price">
									{plan.price}
								</strong>
								<a
									className="mvx-pitch-plan-buy"
									href={plan.link}
									target="_blank"
									rel="noopener noreferrer"
								>
									{__('Buy now', 'multivendorx')}
									<span className="screen-reader-text">
										{` ${label} `}
										{__(
											'(opens in a new tab)',
											'multivendorx'
										)}
									</span>
								</a>
							</li>
						);
					})}
				</ul>
			</section>

			<section className="mvx-pitch-section">
				<h3>
					{__('Already bought MultiVendorX Pro?', 'multivendorx')}
				</h3>
				<ol className="mvx-pitch-steps">
					<li>
						<span
							className="mvx-pitch-step-number"
							aria-hidden="true"
						>
							1
						</span>
						<span>
							<strong>{__('Download it', 'multivendorx')}</strong>
							<span>
								{__(
									'Get the plugin file and your license key from your account.',
									'multivendorx'
								)}{' '}
								<a
									href={ACCOUNT_URL}
									target="_blank"
									rel="noopener noreferrer"
								>
									{__(
										'Sign in at multivendorx.com',
										'multivendorx'
									)}
									<span className="screen-reader-text">
										{__(
											'(opens in a new tab)',
											'multivendorx'
										)}
									</span>
								</a>
							</span>
						</span>
					</li>
					<li>
						<span
							className="mvx-pitch-step-number"
							aria-hidden="true"
						>
							2
						</span>
						<span>
							<strong>
								{__('Install and activate it', 'multivendorx')}
							</strong>
							<span>
								{__(
									'Upload the file under Plugins → Add New Plugin, then activate it.',
									'multivendorx'
								)}{' '}
								<a
									href={`${appLocalizer.admin_url}plugin-install.php?tab=upload`}
								>
									{__('Upload plugin', 'multivendorx')}
								</a>
							</span>
						</span>
					</li>
					<li>
						<span
							className="mvx-pitch-step-number"
							aria-hidden="true"
						>
							3
						</span>
						<span>
							<strong>
								{__('Enter your license key', 'multivendorx')}
							</strong>
							<span>
								{__(
									'Come back to this tab: the license form appears here once MultiVendorX Pro is active.',
									'multivendorx'
								)}
							</span>
						</span>
					</li>
				</ol>
			</section>

			{open && <ProPopupDialog onClose={() => setOpen(false)} />}
		</div>
	);
};

export default ProPitch;
