/* global appLocalizer */
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { PopupComponent } from '@zyra/components';
import ShowProPopup, { LICENSES, PRO_FEATURES } from '../Popup/Popup';
import './pro-pitch.scss';
import { ACCOUNT_URL } from '../../services/links';

/**
 * Settings → License without Notifima Pro: why Pro is worth it (what it adds, the plans and their prices, the
 * guarantee), and, for someone who has already bought it, how to get from the purchase to an active license.
 *
 * Features and plans come from the Pro popup (Popup.tsx), so the two never disagree on what Pro costs or includes.
 */
const ProPitch: React.FC = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className="nf-pitch">
			<section className="nf-pitch-hero">
				<span className="nf-pitch-pill">
					<i className="adminfont-pro-tag" aria-hidden="true" />
					{__('Notifima Pro', 'notifima')}
				</span>
				<h2>
					{__(
						'Turn every out-of-stock visit into a sale',
						'notifima'
					)}
				</h2>
				<p>
					{__(
						'Notifima lets shoppers ask to be told when a product is back. Pro keeps that list clean and genuine, shows you which products people are waiting for, syncs them to Mailchimp and lets you manage stock for the whole store from one table.',
						'notifima'
					)}
				</p>
				<div className="nf-pitch-actions">
					<button
						type="button"
						className="nf-pitch-button"
						onClick={() => setOpen(true)}
					>
						{__('Upgrade to Pro', 'notifima')}
					</button>
					<a
						className="nf-pitch-link"
						href="#&tab=dashboard&view=free-vs-pro"
					>
						{__('Compare Free vs Pro', 'notifima')}
						<i
							className="adminfont-arrow-right"
							aria-hidden="true"
						/>
					</a>
				</div>
				<p className="nf-pitch-guarantee">
					<i className="adminfont-security" aria-hidden="true" />
					{__(
						'15-day money-back guarantee. Your subscribers and settings stay as they are.',
						'notifima'
					)}
				</p>
			</section>

			<section className="nf-pitch-section">
				<h3>{__('What Pro adds', 'notifima')}</h3>
				<ul className="nf-pitch-features">
					{PRO_FEATURES.map((feature) => (
						<li key={feature.name}>
							<span className="nf-pitch-icon" aria-hidden="true">
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

			<section className="nf-pitch-section">
				<h3>{__('Pick a plan', 'notifima')}</h3>
				<p className="nf-pitch-section-desc">
					{__(
						'Every plan includes every Pro feature. Plans differ only in how many sites you can activate.',
						'notifima'
					)}
				</p>
				<ul className="nf-pitch-plans">
					{LICENSES.map((plan) => (
						<li key={plan.id}>
							<span className="nf-pitch-plan-sites">
								{plan.label}
							</span>
							<strong className="nf-pitch-plan-price">
								{plan.price}
							</strong>
							<a
								className="nf-pitch-plan-buy"
								href={plan.link}
								target="_blank"
								rel="noopener noreferrer"
							>
								{__('Buy now', 'notifima')}
								<span className="screen-reader-text">
									{` ${plan.label} `}
									{__('(opens in a new tab)', 'notifima')}
								</span>
							</a>
						</li>
					))}
				</ul>
			</section>

			<section className="nf-pitch-section">
				<h3>{__('Already bought Notifima Pro?', 'notifima')}</h3>
				<ol className="nf-pitch-steps">
					<li>
						<span
							className="nf-pitch-step-number"
							aria-hidden="true"
						>
							1
						</span>
						<span>
							<strong>{__('Download it', 'notifima')}</strong>
							<span>
								{__(
									'Get the plugin file and your license key from your account.',
									'notifima'
								)}{' '}
								<a
									href={ACCOUNT_URL}
									target="_blank"
									rel="noopener noreferrer"
								>
									{__('My account', 'notifima')}
									<span className="screen-reader-text">
										{__('(opens in a new tab)', 'notifima')}
									</span>
								</a>
							</span>
						</span>
					</li>
					<li>
						<span
							className="nf-pitch-step-number"
							aria-hidden="true"
						>
							2
						</span>
						<span>
							<strong>
								{__('Install and activate it', 'notifima')}
							</strong>
							<span>
								{__(
									'Upload the file under Plugins → Add New Plugin, then activate it.',
									'notifima'
								)}{' '}
								<a
									href={`${appLocalizer.admin_url}plugin-install.php?tab=upload`}
								>
									{__('Upload plugin', 'notifima')}
								</a>
							</span>
						</span>
					</li>
					<li>
						<span
							className="nf-pitch-step-number"
							aria-hidden="true"
						>
							3
						</span>
						<span>
							<strong>
								{__('Enter your license key', 'notifima')}
							</strong>
							<span>
								{__(
									'Come back to this tab: the license form appears here once Notifima Pro is active.',
									'notifima'
								)}
							</span>
						</span>
					</li>
				</ol>
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

export default ProPitch;
