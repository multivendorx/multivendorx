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
	plugin?: string;
	name: string;
	link?: string;
}

interface PopupProps {
	/** A module that has to be switched on first: the popup links to it on Settings → Modules. */
	moduleName?: string;
	plugin?: RequiredPlugin | string;
	feature?: ProFeature;
	/** A yes/no confirmation instead of an upgrade prompt (used by CatalogX Pro's list screens). */
	confirmMode?: boolean;
	title?: string;
	confirmMessage?: string;
	confirmYesText?: string;
	confirmNoText?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	[key: string]: unknown;
}

/** Everything CatalogX Pro adds, in the order the popup lists it. Also listed by Settings → License (ProPitch). */
export const PRO_FEATURES = [
	{
		icon: 'quote',
		name: __('Professional quotations', 'catalogx'),
		desc: __(
			'Create, send and approve quotes with expiry dates and PDF downloads.',
			'catalogx'
		),
	},
	{
		icon: 'wholesale',
		name: __('Wholesale selling', 'catalogx'),
		desc: __(
			'Wholesale roles, pricing and order forms for your B2B buyers.',
			'catalogx'
		),
	},
	{
		icon: 'rules',
		name: __('Dynamic pricing rules', 'catalogx'),
		desc: __(
			'Prices by role, customer, product, category or quantity.',
			'catalogx'
		),
	},
	{
		icon: 'multi-product',
		name: __('Multi-product enquiries', 'catalogx'),
		desc: __(
			'One enquiry cart for several products, so one request covers them all.',
			'catalogx'
		),
	},
	{
		icon: 'enquiry',
		name: __('Enquiry conversations', 'catalogx'),
		desc: __(
			'Reply to every enquiry from one inbox, with files, tags and quotes.',
			'catalogx'
		),
	},
	{
		icon: 'form-email',
		name: __('Form builder', 'catalogx'),
		desc: __(
			'Enquiry, quote and wholesale forms that ask exactly what you need.',
			'catalogx'
		),
	},
	{
		icon: 'catalog',
		name: __('Catalog Showcase', 'catalogx'),
		desc: __(
			'Hide prices and Add to cart, or show buying and enquiring side by side.',
			'catalogx'
		),
	},
	{
		icon: 'mail',
		name: __('Email templates', 'catalogx'),
		desc: __(
			'Design the enquiry, quote and wholesale emails your customers get.',
			'catalogx'
		),
	},
];

/** License tiers: how many sites, the price, and the add-to-cart link. */
export const LICENSES = [
	{
		id: 'one',
		label: __('1 site', 'catalogx'),
		price: '$129',
		link: `https://catalogx.com/cart/?add-to-cart=329&variation_id=3380&${UTM}`,
	},
	{
		id: 'three',
		label: __('3 sites', 'catalogx'),
		price: '$199',
		link: `https://catalogx.com/cart/?add-to-cart=329&variation_id=3381&${UTM}`,
	},
	{
		id: 'ten',
		label: __('10 sites', 'catalogx'),
		price: '$299',
		link: `https://catalogx.com/cart/?add-to-cart=329&variation_id=3382&${UTM}`,
	},
];

/** "wholesale" → "Wholesale", "customer-engagement" → "Customer Engagement". */
const formatModuleName = (name: string): string =>
	name
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

/**
 * The popup zyra's InputRenderer opens when a locked field (`proSetting`, `moduleEnabled`, `dependentPlugin`) is
 * clicked, passed as the `Popup` prop of `<InputRenderer>` (components/SettingsNavigator). Also the module grid's Pro
 * popup, and the upgrade prompt of every Pro-only page.
 *
 * The `confirmMode` branch is a yes/no dialog. The `moduleName` branch says which module to switch on, and the
 * `plugin` branch which plugin is required. The default branch is the upgrade prompt: what was asked for first, then
 * everything Pro adds, with the license picker and buy button always in view.
 */
const ShowProPopup: React.FC<PopupProps> = (props) => {
	const [license, setLicense] = useState(LICENSES[0]);

	if (props.confirmMode) {
		return (
			<div className="popup-confirm">
				<i className="popup-icon adminfont-suspended admin-badge red"></i>
				<div className="title">
					{props.title || __('Confirmation', 'catalogx')}
				</div>
				<div className="desc">{props.confirmMessage}</div>
				<ButtonInput
					position="center"
					buttons={[
						{
							icon: 'close',
							text: props.confirmNoText || __('Cancel', 'catalogx'),
							color: 'red',
							onClick: props.onCancel,
						},
						{
							icon: 'delete',
							text:
								props.confirmYesText || __('Confirm', 'catalogx'),
							onClick: props.onConfirm,
						},
					]}
				/>
			</div>
		);
	}

	if (props.moduleName) {
		const moduleLabel = formatModuleName(props.moduleName);

		return (
			<div className="popup-wrapper">
				<div className="popup-header">
					<i className={`adminfont-${props.moduleName}`} />
				</div>
				<div className="popup-body">
					<div className="module-name">
						{sprintf(
							/* translators: %s: module name, e.g. "Wholesale". */
							__('Turn on %s', 'catalogx'),
							moduleLabel
						)}
					</div>
					<div className="module-desc">
						{sprintf(
							/* translators: %s: module name, e.g. "Wholesale". */
							__(
								'This needs the %s module. Switch it on under Settings → Modules, then come back.',
								'catalogx'
							),
							moduleLabel
						)}
					</div>
					<ButtonInput
						position="center"
						buttons={[
							{
								icon: 'eye',
								text: __('Open Modules', 'catalogx'),
								onClick: () => {
									window.location.hash = `&tab=settings&subtab=modules&module=${props.moduleName}`;
								},
							},
						]}
					/>
				</div>
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
					<i className={`adminfont-${required.plugin ?? 'download'}`} />
				</div>
				<div className="popup-body">
					<div className="module-name">
						{sprintf(
							/* translators: %s: Plugin name. */
							__('Plugin required: %s', 'catalogx'),
							required.name
						)}
					</div>
					<div className="module-desc">
						{sprintf(
							/* translators: %s: Plugin name. */
							__(
								'This feature requires the "%s" plugin to be active.',
								'catalogx'
							),
							required.name
						)}
					</div>
					<ButtonInput
						position="center"
						buttons={[
							{
								icon: 'download',
								text: required.link
									? __('Get the plugin', 'catalogx')
									: __('Manage plugins', 'catalogx'),
								onClick: () => {
									// Every admin page lives under /wp-admin/, so `plugins.php` resolves to its plugins screen.
									window.open(
										required.link || 'plugins.php',
										'_blank',
										'noopener,noreferrer'
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
		<div className="cx-pro-popup">
			<div className="cx-pro-popup-head">
				<span className="cx-pro-popup-pill">
					<i className="adminfont-pro-tag" aria-hidden="true" />
					{__('CatalogX Pro', 'catalogx')}
				</span>
				<h2>{__('Turn product interest into sales', 'catalogx')}</h2>
				<p>
					{__(
						'Quotations, wholesale selling, dynamic pricing and a real enquiry inbox, in the admin you already use.',
						'catalogx'
					)}
				</p>
				{props.feature && (
					<div className="cx-pro-popup-feature">
						<span className="cx-pro-popup-icon">
							<i
								className={`adminfont-${props.feature.icon ?? 'pro-tag'}`}
								aria-hidden="true"
							/>
						</span>
						<span>
							<strong>
								{sprintf(
									/* translators: %s: feature name, e.g. "Wholesale Users". */
									__('%s is included', 'catalogx'),
									props.feature.title
								)}
							</strong>
							{props.feature.description}
						</span>
						<i
							className="adminfont-check cx-pro-popup-check"
							aria-hidden="true"
						/>
					</div>
				)}
			</div>
			<div className="cx-pro-popup-body">
				<div className="cx-pro-popup-label">
					{__('Everything in Pro', 'catalogx')}
				</div>
				<ul>
					{PRO_FEATURES.map((feature) => (
						<li key={feature.name}>
							<span className="cx-pro-popup-icon">
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
			<div className="cx-pro-popup-foot">
				<label className="cx-pro-popup-license">
					<span className="cx-pro-popup-price">{license.price}</span>
					<select
						value={license.id}
						aria-label={__('License size', 'catalogx')}
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
					<span>{__('license', 'catalogx')}</span>
				</label>
				<a
					className="cx-pro-popup-buy"
					href={license.link}
					target="_blank"
					rel="noreferrer"
				>
					{__('Upgrade to Pro', 'catalogx')}
					<i className="adminfont-arrow-right" aria-hidden="true" />
					<span className="screen-reader-text">
						{__('(opens in a new tab)', 'catalogx')}
					</span>
				</a>
			</div>
		</div>
	);
};

export default ShowProPopup;
