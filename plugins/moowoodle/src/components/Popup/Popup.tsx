import React, { useState } from 'react';
import { ButtonInput } from '@zyra/inputs';
import { __, sprintf } from '@wordpress/i18n';
import './Popup.scss';

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
	wooSetting?: string;
	wooLink?: string;
	confirmMode?: boolean;
	title?: string;
	confirmMessage?: string;
	confirmYesText?: string;
	confirmNoText?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	plugin?: RequiredPlugin | string;
	feature?: ProFeature;
}

/** Everything MooWoodle Pro adds, in the order the popup lists it. Also listed by Settings → License (ProPitch). */
export const PRO_FEATURES = [
	{
		icon: 'bulk-course-sync',
		name: __('Bulk Course Sync', 'moowoodle'),
		desc: __(
			'Sync multiple Moodle™ courses to WordPress with one click.',
			'moowoodle'
		),
	},
	{
		icon: 'classroom-enrollment',
		name: __('Cohort Enrollment', 'moowoodle'),
		desc: __(
			'Sell and enroll entire Moodle™ cohorts via WooCommerce.',
			'moowoodle'
		),
	},
	{
		icon: 'cohort',
		name: __('Group Enrollment', 'moowoodle'),
		desc: __(
			'Map course variations to Moodle™ groups for targeted enrollment.',
			'moowoodle'
		),
	},
	{
		icon: 'global-community',
		name: __('Classroom Enrollment', 'moowoodle'),
		desc: __(
			'Buy multiple seats and assign them to students or teams.',
			'moowoodle'
		),
	},
	{
		icon: 'gift-a-course',
		name: __('Gift a Course', 'moowoodle'),
		desc: __(
			'Let customers purchase and gift courses to others.',
			'moowoodle'
		),
	},
	{
		icon: 'single-sign-on',
		name: __('Single Sign-On (SSO)', 'moowoodle'),
		desc: __('Access Moodle™ and WordPress with one login.', 'moowoodle'),
	},
	{
		icon: 'bulk-course-sync',
		name: __('Smart Course Sync', 'moowoodle'),
		desc: __(
			'Keep course details updated between Moodle™ and WordPress.',
			'moowoodle'
		),
	},
	{
		icon: 'subscription-courses',
		name: __('Subscription Courses', 'moowoodle'),
		desc: __(
			'Offer courses with recurring subscription plans.',
			'moowoodle'
		),
	},
	{
		icon: 'user-network-icon',
		name: __('Unified Access', 'moowoodle'),
		desc: __(
			'Give learners one dashboard for all their courses.',
			'moowoodle'
		),
	},
];

/** License tiers: how many sites, the price, and the add-to-cart link. */
export const LICENSES = [
	{
		id: 'one',
		label: __('1 site', 'moowoodle'),
		price: '$199',
		link: 'https://dualcube.com/product/moowoodle-pro/?add-to-cart=18156&utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=moowoodle',
	},
	{
		id: 'three',
		label: __('3 sites', 'moowoodle'),
		price: '$349',
		link: 'https://dualcube.com/product/moowoodle-pro/?add-to-cart=18158&utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=moowoodle',
	},
	{
		id: 'ten',
		label: __('10 sites', 'moowoodle'),
		price: '$499',
		link: 'https://dualcube.com/product/moowoodle-pro/?add-to-cart=18157&utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=moowoodle',
	},
];

/**
 * The popup zyra's InputRenderer opens when a locked field (`proSetting`, `dependentPlugin`) is clicked, passed as the
 * `Popup` prop of `<InputRenderer>` (components/SettingsNavigator). Also the confirmation dialog of the list screens
 * (`confirmMode`).
 *
 * The `plugin` branch says which plugin is required (zyra passes `{ plugin, name, link }`). The default branch is the upgrade prompt: what was asked for
 * first, then everything Pro adds, with the license picker and buy button always in view.
 */
const ShowProPopup: React.FC<PopupProps> = (props) => {
	const [license, setLicense] = useState(LICENSES[0]);

	if (props.confirmMode) {
		return (
			<div className="popup-confirm">
				<i className="popup-icon adminfont-suspended admin-badge red"></i>
				<div className="title">
					{props.title || __('Confirmation', 'moowoodle')}
				</div>
				<div className="desc">{props.confirmMessage}</div>
				<ButtonInput
					position="center"
					buttons={[
						{
							icon: 'close',
							text:
								props.confirmNoText ||
								__('Cancel', 'moowoodle'),
							color: 'red',
							onClick: props.onCancel,
						},
						{
							icon: 'delete',
							text:
								props.confirmYesText ||
								__('Confirm', 'moowoodle'),
							onClick: props.onConfirm,
						},
					]}
				/>
			</div>
		);
	}

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
							__('Plugin required: %s', 'moowoodle'),
							required.name
						)}
					</div>
					<div className="module-desc">
						{sprintf(
							/* translators: %s: Plugin name. */
							__(
								'This feature requires the "%s" plugin to be active.',
								'moowoodle'
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
									? __('Get the plugin', 'moowoodle')
									: __('Manage plugins', 'moowoodle'),
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
		<div className="mw-pro-popup">
			<div className="mw-pro-popup-head">
				<span className="mw-pro-popup-pill">
					<i className="adminfont-pro-tag" aria-hidden="true" />
					{__('MooWoodle Pro', 'moowoodle')}
				</span>
				<h2>{__('Your students will love this', 'moowoodle')}</h2>
				<p>
					{__(
						'Bulk sync, cohort and group enrollment, single sign-on and subscriptions, in the admin you already use.',
						'moowoodle'
					)}
				</p>
				{props.feature && (
					<div className="mw-pro-popup-feature">
						<span className="mw-pro-popup-icon">
							<i
								className={`adminfont-${props.feature.icon ?? 'pro-tag'}`}
								aria-hidden="true"
							/>
						</span>
						<span>
							<strong>
								{sprintf(
									/* translators: %s: feature name, e.g. "Cohort Enrollment". */
									__('%s is included', 'moowoodle'),
									props.feature.title
								)}
							</strong>
							{props.feature.description}
						</span>
						<i
							className="adminfont-check mw-pro-popup-check"
							aria-hidden="true"
						/>
					</div>
				)}
			</div>
			<div className="mw-pro-popup-body">
				<div className="mw-pro-popup-label">
					{__('Everything in Pro', 'moowoodle')}
				</div>
				<ul>
					{PRO_FEATURES.map((feature) => (
						<li key={feature.name}>
							<span className="mw-pro-popup-icon">
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
			<div className="mw-pro-popup-foot">
				<label className="mw-pro-popup-license">
					<span className="mw-pro-popup-price">{license.price}</span>
					<select
						value={license.id}
						aria-label={__('License size', 'moowoodle')}
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
					<span>{__('license', 'moowoodle')}</span>
				</label>
				<a
					className="mw-pro-popup-buy"
					href={license.link}
					target="_blank"
					rel="noreferrer"
				>
					{__('Upgrade to Pro', 'moowoodle')}
					<i className="adminfont-arrow-right" aria-hidden="true" />
				</a>
			</div>
		</div>
	);
};

export default ShowProPopup;
