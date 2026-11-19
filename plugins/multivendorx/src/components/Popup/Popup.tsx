/* global appLocalizer */
import React, { useState } from 'react';
import { ButtonInput } from '@zyra/inputs';
import { PopupComponent } from '@zyra/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import '../Popup/Popup.scss';

/** The page or feature the upgrade was asked from, shown first in the Pro popup. */
export interface ProFeature {
	title: string;
	description: string;
	icon?: string;
}

interface PopupProps {
	/** What the upgrade was asked from; the Pro popup names it first. */
	feature?: ProFeature;
	moduleName?: string;
	wooSetting?: string;
	wooLink?: string;
	confirmMode?: boolean;
	title?: string;
	confirmMessage?: string;
	confirmYesText?: string;
	confirmNoText?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	plugin?: string;
}

const formatModuleName = (name: string): string => {
	return name
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

const proPopupContent = {
	messages: [
		{
			icon: 'commission',
			text: __('Membership Rewards & Commission', 'multivendorx'),
			des: __(
				'Charge your sellers a monthly or yearly membership fee to sell on your marketplace - predictable revenue every month.',
				'multivendorx'
			),
		},
		{
			icon: 'store-policy',
			text: __('Verified Stores Only', 'multivendorx'),
			des: __(
				'Screen stores with document verification and approval - build a trusted marketplace from day one.',
				'multivendorx'
			),
		},
		{
			icon: 'marketplace',
			text: __('Diversified Marketplace', 'multivendorx'),
			des: __(
				' Enable bookings, subscriptions, and auctions to boost sales and engagement.',
				'multivendorx'
			),
		},
		{
			icon: 'store-inventory',
			text: __('Vacation Mode for Stores', 'multivendorx'),
			des: __(
				'Stores can pause their stores temporarily with automatic buyer notifications - no missed messages.',
				'multivendorx'
			),
		},
		{
			icon: 'out-of-stock',
			text: __('Never Run Out of Stock', 'multivendorx'),
			des: __(
				' Real-time inventory tracking with automatic low-stock alerts keeps sellers prepared and buyers happy.',
				'multivendorx'
			),
		},
		{
			icon: 'notification',
			text: __('Autopilot Notifications', 'multivendorx'),
			des: __(
				'Automatic emails and alerts for every order, refund, and payout - everyone stays in the loop.',
				'multivendorx'
			),
		},
		{
			icon: 'staff-manager',
			text: __('Staff Manager', 'multivendorx'),
			des: __(
				'Empower stores to manage their team with role-based access and permissions.',
				'multivendorx'
			),
		},
		{
			icon: 'business-hours',
			text: __('Business Hours', 'multivendorx'),
			des: __(
				'Let stores set their operating hours for better customer expectations.',
				'multivendorx'
			),
		},
		{
			icon: 'wholesale',
			text: __('Wholesale', 'multivendorx'),
			des: __(
				'Enable bulk pricing and wholesale options to attract B2B buyers.',
				'multivendorx'
			),
		},
		{
			icon: 'paypal-marketplace',
			text: __('PayPal Marketplace', 'multivendorx'),
			des: __(
				'Split payments automatically to stores via PayPal - seamless payouts.',
				'multivendorx'
			),
		},
		{
			icon: 'stripe-marketplace',
			text: __('Stripe Marketplace', 'multivendorx'),
			des: __(
				'Instant vendor payouts with Stripe Connect - fast and secure.',
				'multivendorx'
			),
		},
		{
			icon: 'facilitator',
			text: __('Facilitator', 'multivendorx'),
			des: __(
				'Manage complex commission structures with advanced calculation rules.',
				'multivendorx'
			),
		},
		{
			icon: 'user-network-icon',
			text: __('Franchises', 'multivendorx'),
			des: __(
				'Create multi-location marketplace networks with centralized control.',
				'multivendorx'
			),
		},
		{
			icon: 'franchises-module',
			text: __('Invoice & Packing Slip', 'multivendorx'),
			des: __(
				'Professional invoices and packing slips for every order - build trust and credibility.',
				'multivendorx'
			),
		},
	],
	btnLink: [
		{
			site: '1',
			price: '$299',
			link: 'https://multivendorx.com/cart/?add-to-cart=143434&variation_id=143443&attribute_pa_site-license=1-site-yearly&utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
		},
		{
			site: '3',
			price: '$399',
			link: 'https://multivendorx.com/cart/?add-to-cart=143434&variation_id=143445&attribute_pa_site-license=3-site-yearly&utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
		},
		{
			site: '10',
			price: '$499',
			link: 'https://multivendorx.com/cart/?add-to-cart=143434&variation_id=143440&attribute_pa_site-license=10-site-yearly&utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
		},
	],
};

/** The Pro plans the popup offers, cheapest first: sites, price and the add-to-cart link. */
export const LICENSES = proPopupContent.btnLink;

const ShowProPopup: React.FC<PopupProps> = (props) => {
	const [license, setLicense] = useState(proPopupContent.btnLink[0]);
	if (props.plugin) {
		const pluginData =
			typeof props.plugin === 'string'
				? {
						slug: props.plugin,
						pluginName: props.plugin.split('/')[0],
						pluginLink: `${appLocalizer.admin_url}plugins.php`,
					}
				: {
						slug: props.plugin.requiredPlugin,
						pluginName: props.plugin.pluginName || props.plugin.key,
						pluginLink:
							props.plugin.pluginLink ||
							`${appLocalizer.admin_url}plugins.php`,
					};

		return (
			<div className="popup-wrapper">
				<div className="popup-header">
					<i className={`adminfont-${pluginData.pluginName}`} />
				</div>
				<div className="popup-body">
					<div className="module-name">
						{sprintf(
							/* translators: %s: Plugin name. */
							__('Plugin Required: %s', 'multivendorx'),
							pluginData.pluginName
						)}
					</div>
					<div className="module-desc">
						{sprintf(
							__(
								'This feature requires the "%s" plugin to be active.',
								'multivendorx'
							),
							pluginData.pluginName
						)}
					</div>
					<ButtonInput
						position="center"
						buttons={[
							{
								icon: 'eye',
								text: __('Activate Plugin', 'multivendorx'),
								onClick: () => {
									window.open(
										pluginData.pluginLink,
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
		<>
			{props.confirmMode ? (
				<div className="popup-confirm">
					<i className="popup-icon adminfont-suspended admin-badge red"></i>
					<div className="title">{props.title || 'Confirmation'}</div>
					<div className="desc">{props.confirmMessage}</div>
					<ButtonInput
						position="center"
						buttons={[
							{
								icon: 'close',
								text: props.confirmNoText || 'Cancel',
								color: 'red',
								onClick: props.onCancel,
							},
							{
								icon: 'delete',
								text: props.confirmYesText || 'Confirm',
								onClick: props.onConfirm,
							},
						]}
					/>
				</div>
			) : props.moduleName ? (
				<div className="popup-wrapper">
					<div className="popup-header">
						<i className={`adminfont-${props.moduleName}`} />
					</div>
					<div className="popup-body">
						<div className="module-name">
							{sprintf(
								/* translators: %s: Module name. */
								__('Activate %s', 'multivendorx'),
								formatModuleName(props.moduleName)
							)}
						</div>
						<div className="module-desc">
							{sprintf(
								/* translators: %s: Module name. */
								__(
									'This feature is currently unavailable. To activate it, please enable the %s',
									'multivendorx'
								),
								formatModuleName(props.moduleName)
							)}
						</div>

						<ButtonInput
							position="center"
							buttons={[
								{
									icon: 'eye',
									text: __('Enable Now', 'multivendorx'),
									onClick: () => {
										window.open(
											`${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=modules&module=${props.moduleName}`
										);
									},
								},
							]}
						/>
					</div>
				</div>
			) : (
				// The Pro upgrade popup: what was asked for, everything Pro adds, and the license picker with the buy
				// button, always in view. Same design as Notifima's, MooWoodle's and CatalogX's Pro popups.
				<div className="mvx-pro-popup">
					<div className="mvx-pro-popup-head">
						<span className="mvx-pro-popup-pill">
							<i
								className="adminfont-pro-tag"
								aria-hidden="true"
							/>
							{__('MultiVendorX Pro', 'multivendorx')}
						</span>
						<h2>
							{__(
								'Upgrade every marketplace needs',
								'multivendorx'
							)}
						</h2>
						<p>
							{__(
								'Recurring revenue for you, more ways for stores to sell, and operations that run themselves.',
								'multivendorx'
							)}
						</p>
						{props.feature && (
							<div className="mvx-pro-popup-feature">
								<span className="mvx-pro-popup-icon">
									<i
										className={`adminfont-${props.feature.icon ?? 'pro-tag'}`}
										aria-hidden="true"
									/>
								</span>
								<span>
									<strong>
										{sprintf(
											/* translators: %s: feature name, e.g. "Direct transactions". */
											__(
												'%s is included',
												'multivendorx'
											),
											props.feature.title
										)}
									</strong>
									{props.feature.description}
								</span>
								<i
									className="adminfont-check mvx-pro-popup-check"
									aria-hidden="true"
								/>
							</div>
						)}
					</div>
					<div className="mvx-pro-popup-body">
						<div className="mvx-pro-popup-label">
							{__('Everything in Pro', 'multivendorx')}
						</div>
						<ul>
							{proPopupContent.messages.map((message) => (
								<li key={message.text}>
									<span className="mvx-pro-popup-icon">
										<i
											className={`adminfont-${message.icon}`}
											aria-hidden="true"
										/>
									</span>
									<span>
										<strong>{message.text}</strong>
										<span>{message.des.trim()}</span>
									</span>
								</li>
							))}
						</ul>
					</div>
					<div className="mvx-pro-popup-foot">
						<label className="mvx-pro-popup-license">
							<span className="mvx-pro-popup-price">
								{license.price}
							</span>
							<select
								value={license.link}
								aria-label={__('License size', 'multivendorx')}
								onChange={(event) => {
									const chosen = proPopupContent.btnLink.find(
										(item) =>
											item.link === event.target.value
									);

									if (chosen) {
										setLicense(chosen);
									}
								}}
							>
								{proPopupContent.btnLink.map((item) => (
									<option key={item.link} value={item.link}>
										{sprintf(
											/* translators: %s: number of sites, e.g. "3". */
											_n(
												'%s site',
												'%s sites',
												Number(item.site),
												'multivendorx'
											),
											item.site
										)}
									</option>
								))}
							</select>
							<span>{__('license', 'multivendorx')}</span>
						</label>
						<a
							className="mvx-pro-popup-buy"
							href={license.link}
							target="_blank"
							rel="noreferrer"
						>
							{__('Upgrade to Pro', 'multivendorx')}
							<i
								className="adminfont-arrow-right"
								aria-hidden="true"
							/>
						</a>
					</div>
				</div>
			)}
		</>
	);
};

/**
 * The Pro popup in its lightbox, as every "Upgrade to Pro" button opens it. With Pro active and a `moduleName`, it asks
 * to switch that module on instead.
 */
export const ProPopupDialog: React.FC<{
	onClose: () => void;
	moduleName?: string;
}> = ({ onClose, moduleName }) => (
	<PopupComponent
		position="lightbox"
		open
		onClose={onClose}
		width={46}
		height="auto"
	>
		<ShowProPopup moduleName={moduleName} />
	</PopupComponent>
);

export default ShowProPopup;
