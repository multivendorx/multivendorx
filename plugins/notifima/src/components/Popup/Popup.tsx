import React, { useState } from 'react';
import { ButtonInput } from '@zyra/inputs';
import { __, sprintf } from '@wordpress/i18n';
import './Popup.scss';
import { UTM } from '../../services/links';

/** The page or feature the upgrade was asked from, shown first in the Pro popup. */
export interface ProFeature {
	title: string;
	description: string;
	icon?: string;
}

/** What zyra passes for a field whose `dependentPlugin` is missing. */
interface RequiredPlugin {
	plugin: string;
	name: string;
	link?: string;
}

interface PopupProps {
	moduleName?: string;
	settings?: string;
	plugin?: RequiredPlugin | string;
	feature?: ProFeature;
}

/** Everything Notifima Pro adds, in the order the popup lists it. Also listed by Settings → License (ProPitch). */
export const PRO_FEATURES = [
	{
		icon: 'double-opt-in',
		name: __('Double Opt-in', 'notifima'),
		desc: __(
			'Confirm every signup via email for cleaner lists and better deliverability.',
			'notifima'
		),
	},
	{
		icon: 'ban-spam-mail',
		name: __('Ban Spam Mail', 'notifima'),
		desc: __(
			'Keep your subscriber list clean from bots and unwanted registrations.',
			'notifima'
		),
	},
	{
		icon: 'form-recaptcha',
		name: __('reCAPTCHA Support', 'notifima'),
		desc: __(
			'Protect waitlists from bots with built-in reCAPTCHA support.',
			'notifima'
		),
	},
	{
		icon: 'subscription-dashboard',
		name: __('Subscription Dashboard', 'notifima'),
		desc: __(
			'View all requests and demand trends from one centralized place.',
			'notifima'
		),
	},
	{
		icon: 'subscription-details',
		name: __('Subscription Details', 'notifima'),
		desc: __(
			'See who subscribed, which products are in demand, and track activity.',
			'notifima'
		),
	},
	{
		icon: 'export-subscribers',
		name: __('Export Subscribers', 'notifima'),
		desc: __(
			'Download waitlist data anytime for reporting, marketing, or backup.',
			'notifima'
		),
	},
	{
		icon: 'mailchimp',
		name: __('Mailchimp Integration', 'notifima'),
		desc: __(
			'Auto-sync subscribers for targeted email campaigns and nurture flows.',
			'notifima'
		),
	},
	{
		icon: 'export-import-stock',
		name: __('Inventory Manager', 'notifima'),
		desc: __(
			'Edit stock in one table, and import or export it with a CSV.',
			'notifima'
		),
	},
];

/** License tiers: how many sites, the price, and the add-to-cart link. */
export const LICENSES = [
	{
		id: 'one',
		label: __('1 site', 'notifima'),
		price: '$49',
		link: `https://notifima.com/cart/?add-to-cart=699&variation_id=836&${UTM}`,
	},
	{
		id: 'three',
		label: __('3 sites', 'notifima'),
		price: '$69',
		link: `https://notifima.com/cart/?add-to-cart=699&variation_id=807&${UTM}`,
	},
	{
		id: 'ten',
		label: __('10 sites', 'notifima'),
		price: '$99',
		link: `https://notifima.com/cart/?add-to-cart=699&variation_id=808&${UTM}`,
	},
];

/**
 * The popup zyra's InputRenderer opens when a locked field (`proSetting`, `dependentPlugin`) is clicked, passed as the
 * `Popup` prop of `<InputRenderer>` (components/SettingsNavigator), and the one every "Upgrade to Pro" button opens.
 *
 * The `plugin` branch says which plugin is required (zyra passes `{ plugin, name, link }`). The default branch is the
 * upgrade prompt: what was asked for first, then everything Pro adds, with the license picker and buy button always in
 * view.
 */
const ShowProPopup: React.FC<PopupProps> = (props) => {
	const [license, setLicense] = useState(LICENSES[0]);

	if (props.plugin) {
		const required: RequiredPlugin =
			'string' === typeof props.plugin
				? { plugin: props.plugin, name: props.plugin }
				: props.plugin;

		return (
			<div className="popup-wrapper">
				<div className="popup-header">
					<i className={`adminfont-${required.plugin}`} />
				</div>
				<div className="popup-body">
					<div className="module-name">
						{sprintf(
							/* translators: %s: Plugin name. */
							__('Plugin required: %s', 'notifima'),
							required.name
						)}
					</div>
					<div className="module-desc">
						{sprintf(
							/* translators: %s: Plugin name. */
							__(
								'This feature requires the "%s" plugin to be active.',
								'notifima'
							),
							required.name
						)}
					</div>
					<ButtonInput
						position="center"
						buttons={[
							{
								icon: 'eye',
								text: required.link
									? __('Get the plugin', 'notifima')
									: __('Manage plugins', 'notifima'),
								onClick: () => {
									// Every admin page lives under /wp-admin/, so `plugins.php` resolves to its plugins screen.
									window.open(
										required.link || 'plugins.php',
										'_blank'
									);
								},
							},
						]}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="nf-pro-popup">
			<div className="nf-pro-popup-head">
				<span className="nf-pro-popup-pill">
					<i className="adminfont-pro-tag" aria-hidden="true" />
					{__('Notifima Pro', 'notifima')}
				</span>
				<h2>{__('Never miss another sale', 'notifima')}</h2>
				<p>
					{__(
						'Double opt-in, spam protection, subscriber insights, Mailchimp and a full inventory manager, in the admin you already use.',
						'notifima'
					)}
				</p>
				{props.feature && (
					<div className="nf-pro-popup-feature">
						<span className="nf-pro-popup-icon">
							<i
								className={`adminfont-${props.feature.icon ?? 'pro-tag'}`}
								aria-hidden="true"
							/>
						</span>
						<span>
							<strong>
								{sprintf(
									/* translators: %s: feature name, e.g. "Subscribers". */
									__('%s is included', 'notifima'),
									props.feature.title
								)}
							</strong>
							{props.feature.description}
						</span>
						<i
							className="adminfont-check nf-pro-popup-check"
							aria-hidden="true"
						/>
					</div>
				)}
			</div>
			<div className="nf-pro-popup-body">
				<div className="nf-pro-popup-label">
					{__('Everything in Pro', 'notifima')}
				</div>
				<ul>
					{PRO_FEATURES.map((feature) => (
						<li key={feature.name}>
							<span className="nf-pro-popup-icon">
								<i
									className={`adminfont-${feature.icon}`}
									aria-hidden="true"
								/>
							</span>
							<span>
								<strong>{feature.name}</strong>
								<span>{feature.desc}</span>
							</span>
						</li>
					))}
				</ul>
			</div>
			<div className="nf-pro-popup-foot">
				<label className="nf-pro-popup-license">
					<span className="nf-pro-popup-price">{license.price}</span>
					<select
						value={license.id}
						aria-label={__('License size', 'notifima')}
						onChange={(event) => {
							const chosen = LICENSES.find(
								(item) => item.id === event.target.value
							);

							if (chosen) {
								setLicense(chosen);
							}
						}}
					>
						{LICENSES.map((item) => (
							<option key={item.id} value={item.id}>
								{item.label}
							</option>
						))}
					</select>
					<span>{__('license', 'notifima')}</span>
				</label>
				<a
					className="nf-pro-popup-buy"
					href={license.link}
					target="_blank"
					rel="noreferrer"
				>
					{__('Upgrade to Pro', 'notifima')}
					<i className="adminfont-arrow-right" aria-hidden="true" />
				</a>
			</div>
		</div>
	);
};

export default ShowProPopup;
