/* global appLocalizer */
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { LICENSES, PRO_FEATURES, ProPopupDialog } from '../Popup/Popup';
import './pro-pitch.scss';
import { ACCOUNT_URL } from '../../services/links';

/**
 * Settings → License without CatalogX Pro: why Pro is worth it (what it adds, the plans and their prices, the
 * guarantee), and, for someone who has already bought it, how to get from the purchase to an active license.
 *
 * Features and plans come from the Pro popup (Popup.tsx), so the two never disagree on what Pro costs or includes.
 */
const ProPitch: React.FC = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className="cx-pitch">
			<section className="cx-pitch-hero">
				<span className="cx-pitch-pill">
					<i className="adminfont-pro-tag" aria-hidden="true" />
					{__('CatalogX Pro', 'catalogx')}
				</span>
				<h2>
					{__(
						'Turn every enquiry into a quote, and every quote into an order',
						'catalogx'
					)}
				</h2>
				<p>
					{__(
						'CatalogX lets customers ask about a product. Pro answers with professional quotes, sells to wholesale buyers at their own prices, and runs every conversation from one inbox.',
						'catalogx'
					)}
				</p>
				<div className="cx-pitch-actions">
					<button
						type="button"
						className="cx-pitch-button"
						onClick={() => setOpen(true)}
					>
						{__('Upgrade to Pro', 'catalogx')}
					</button>
					<a
						className="cx-pitch-link"
						href="#&tab=dashboard&view=free-vs-pro"
					>
						{__('Compare Free vs Pro', 'catalogx')}
						<i
							className="adminfont-arrow-right"
							aria-hidden="true"
						/>
					</a>
				</div>
				<p className="cx-pitch-guarantee">
					<i className="adminfont-security" aria-hidden="true" />
					{__(
						'15-day money-back guarantee. Your products, enquiries and settings stay as they are.',
						'catalogx'
					)}
				</p>
			</section>

			<section className="cx-pitch-section">
				<h3>{__('What Pro adds', 'catalogx')}</h3>
				<ul className="cx-pitch-features">
					{PRO_FEATURES.map((feature) => (
						<li key={feature.name}>
							<span className="cx-pitch-icon" aria-hidden="true">
								<i className={`adminfont-${feature.icon}`} />
							</span>
							<span>
								<strong>{feature.name}</strong>
								<span>{feature.desc}</span>
							</span>
						</li>
					))}
				</ul>
			</section>

			<section className="cx-pitch-section">
				<h3>{__('Pick a plan', 'catalogx')}</h3>
				<p className="cx-pitch-section-desc">
					{__(
						'Every plan includes every Pro feature. Plans differ only in how many sites you can activate.',
						'catalogx'
					)}
				</p>
				<ul className="cx-pitch-plans">
					{LICENSES.map((plan) => (
						<li key={plan.id}>
							<span className="cx-pitch-plan-sites">
								{plan.label}
							</span>
							<strong className="cx-pitch-plan-price">
								{plan.price}
							</strong>
							<a
								className="cx-pitch-plan-buy"
								href={plan.link}
								target="_blank"
								rel="noopener noreferrer"
							>
								{__('Buy now', 'catalogx')}
								<span className="screen-reader-text">
									{` ${plan.label} `}
									{__('(opens in a new tab)', 'catalogx')}
								</span>
							</a>
						</li>
					))}
				</ul>
			</section>

			<section className="cx-pitch-section">
				<h3>{__('Already bought CatalogX Pro?', 'catalogx')}</h3>
				<ol className="cx-pitch-steps">
					<li>
						<span
							className="cx-pitch-step-number"
							aria-hidden="true"
						>
							1
						</span>
						<span>
							<strong>{__('Download it', 'catalogx')}</strong>
							<span>
								{__(
									'Get the plugin file and your license key from your account.',
									'catalogx'
								)}{' '}
								<a
									href={ACCOUNT_URL}
									target="_blank"
									rel="noopener noreferrer"
								>
									{__('My account', 'catalogx')}
									<span className="screen-reader-text">
										{__(
											'(opens in a new tab)',
											'catalogx'
										)}
									</span>
								</a>
							</span>
						</span>
					</li>
					<li>
						<span
							className="cx-pitch-step-number"
							aria-hidden="true"
						>
							2
						</span>
						<span>
							<strong>
								{__('Install and activate it', 'catalogx')}
							</strong>
							<span>
								{__(
									'Upload the file under Plugins → Add New Plugin, then activate it.',
									'catalogx'
								)}{' '}
								<a
									href={`${appLocalizer.url}plugin-install.php?tab=upload`}
								>
									{__('Upload plugin', 'catalogx')}
								</a>
							</span>
						</span>
					</li>
					<li>
						<span
							className="cx-pitch-step-number"
							aria-hidden="true"
						>
							3
						</span>
						<span>
							<strong>
								{__('Enter your license key', 'catalogx')}
							</strong>
							<span>
								{__(
									'Come back to this tab: the license form appears here once CatalogX Pro is active.',
									'catalogx'
								)}
							</span>
						</span>
					</li>
				</ol>
			</section>

			{open && (
				<ProPopupDialog onClose={() => setOpen(false)} />
			)}
		</div>
	);
};

export default ProPitch;
