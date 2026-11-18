/* global appLocalizer */
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { PopupComponent } from '@zyra/components';
import ShowProPopup, { LICENSES, PRO_FEATURES } from '../Popup/Popup';
import './pro-pitch.scss';

const UTM =
	'utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=moowoodle';

/**
 * Settings → License without MooWoodle Pro: why Pro is worth it (what it adds, the plans and their prices, the
 * guarantee), and, for someone who has already bought it, how to get from the purchase to an active license.
 *
 * Features and plans come from the Pro popup (Popup.tsx), so the two never disagree on what Pro costs or includes.
 */
const ProPitch: React.FC = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className="mw-pitch">
			<section className="mw-pitch-hero">
				<span className="mw-pitch-pill">
					<i className="adminfont-pro-tag" aria-hidden="true" />
					{__('MooWoodle Pro', 'moowoodle')}
				</span>
				<h2>
					{__(
						'Turn your Moodle™ courses into a learning business',
						'moowoodle'
					)}
				</h2>
				<p>
					{__(
						'MooWoodle connects one course to one buyer. Pro sells to whole groups, classrooms and subscribers, keeps everything in sync on its own, and lets students open Moodle™ without a second login.',
						'moowoodle'
					)}
				</p>
				<div className="mw-pitch-actions">
					<button
						type="button"
						className="mw-pitch-button"
						onClick={() => setOpen(true)}
					>
						{__('Upgrade to Pro', 'moowoodle')}
					</button>
					<a
						className="mw-pitch-link"
						href="#&tab=dashboard&view=free-vs-pro"
					>
						{__('Compare Free vs Pro', 'moowoodle')}
						<i
							className="adminfont-arrow-right"
							aria-hidden="true"
						/>
					</a>
				</div>
				<p className="mw-pitch-guarantee">
					<i className="adminfont-security" aria-hidden="true" />
					{__(
						'15-day money-back guarantee. Your courses, products and enrollments stay as they are.',
						'moowoodle'
					)}
				</p>
			</section>

			<section className="mw-pitch-section">
				<h3>{__('What Pro adds', 'moowoodle')}</h3>
				<ul className="mw-pitch-features">
					{PRO_FEATURES.map((feature) => (
						<li key={feature.name}>
							<span className="mw-pitch-icon" aria-hidden="true">
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

			<section className="mw-pitch-section">
				<h3>{__('Pick a plan', 'moowoodle')}</h3>
				<p className="mw-pitch-section-desc">
					{__(
						'Every plan includes every Pro feature. Plans differ only in how many sites you can activate.',
						'moowoodle'
					)}
				</p>
				<ul className="mw-pitch-plans">
					{LICENSES.map((plan) => (
						<li key={plan.id}>
							<span className="mw-pitch-plan-sites">
								{plan.label}
							</span>
							<strong className="mw-pitch-plan-price">
								{plan.price}
							</strong>
							<a
								className="mw-pitch-plan-buy"
								href={plan.link}
								target="_blank"
								rel="noopener noreferrer"
							>
								{__('Buy now', 'moowoodle')}
								<span className="screen-reader-text">
									{` ${plan.label} `}
									{__('(opens in a new tab)', 'moowoodle')}
								</span>
							</a>
						</li>
					))}
				</ul>
			</section>

			<section className="mw-pitch-section">
				<h3>{__('Already bought MooWoodle Pro?', 'moowoodle')}</h3>
				<ol className="mw-pitch-steps">
					<li>
						<span
							className="mw-pitch-step-number"
							aria-hidden="true"
						>
							1
						</span>
						<span>
							<strong>{__('Download it', 'moowoodle')}</strong>
							<span>
								{__(
									'Get the plugin file and your license key from your account.',
									'moowoodle'
								)}{' '}
								<a
									href={`https://dualcube.com/my-account/?${UTM}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									{__('My account', 'moowoodle')}
									<span className="screen-reader-text">
										{__(
											'(opens in a new tab)',
											'moowoodle'
										)}
									</span>
								</a>
							</span>
						</span>
					</li>
					<li>
						<span
							className="mw-pitch-step-number"
							aria-hidden="true"
						>
							2
						</span>
						<span>
							<strong>
								{__('Install and activate it', 'moowoodle')}
							</strong>
							<span>
								{__(
									'Upload the file under Plugins → Add New Plugin, then activate it.',
									'moowoodle'
								)}{' '}
								<a
									href={`${appLocalizer.admin_url}plugin-install.php?tab=upload`}
								>
									{__('Upload plugin', 'moowoodle')}
								</a>
							</span>
						</span>
					</li>
					<li>
						<span
							className="mw-pitch-step-number"
							aria-hidden="true"
						>
							3
						</span>
						<span>
							<strong>
								{__('Enter your license key', 'moowoodle')}
							</strong>
							<span>
								{__(
									'Come back to this tab: the license form appears here once MooWoodle Pro is active.',
									'moowoodle'
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
