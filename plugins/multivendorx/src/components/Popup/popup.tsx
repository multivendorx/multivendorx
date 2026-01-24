/* global appLocalizer */
import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { ProPopup } from 'zyra';

interface PopupProps {
	moduleName?: string;
	wooSetting?: string;
	wooLink?: string;
}

export const proPopupContent = {
	proUrl: typeof appLocalizer !== 'undefined' ? appLocalizer.pro_url : '#',
	title: __('Upgrade every marketplace needs!', 'multivendorx'),
	moreText: __(
		'Recurring revenue for you, empowered stores, automated operations',
		'multivendorx'
	),
	upgradeBtnText: __('Yes, Upgrade Me!', 'multivendorx'),
	messages: [
		{
			icon: 'adminfont-commission',
			text: __('Membership Rewards & Commission', 'multivendorx'),
			des: __(
				'Charge your sellers a monthly or yearly membership fee to sell on your marketplace - predictable revenue every month.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-store-policy',
			text: __('Verified Stores Only', 'multivendorx'),
			des: __(
				'Screen stores with document verification and approval - build a trusted marketplace from day one.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-marketplace',
			text: __('Diversified Marketplace', 'multivendorx'),
			des: __(
				' Enable bookings, subscriptions, and auctions to boost sales and engagement.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-store-inventory',
			text: __('Vacation Mode for Stores', 'multivendorx'),
			des: __(
				'Stores can pause their stores temporarily with automatic buyer notifications - no missed messages.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-out-of-stock',
			text: __('Never Run Out of Stock', 'multivendorx'),
			des: __(
				' Real-time inventory tracking with automatic low-stock alerts keeps sellers prepared and buyers happy.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-notification',
			text: __('Autopilot Notifications', 'multivendorx'),
			des: __(
				'Automatic emails and alerts for every order, refund, and payout - everyone stays in the loop.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-staff-manager',
			text: __('Staff Manager', 'multivendorx'),
			des: __(
				'Empower stores to manage their team with role-based access and permissions.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-business-hours',
			text: __('Business Hours', 'multivendorx'),
			des: __(
				'Let stores set their operating hours for better customer expectations.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-wholesale',
			text: __('Wholesale', 'multivendorx'),
			des: __(
				'Enable bulk pricing and wholesale options to attract B2B buyers.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-paypal-marketplace',
			text: __('PayPal Marketplace', 'multivendorx'),
			des: __(
				'Split payments automatically to stores via PayPal - seamless payouts.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-stripe-marketplace',
			text: __('Stripe Marketplace', 'multivendorx'),
			des: __(
				'Instant vendor payouts with Stripe Connect - fast and secure.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-facilitator',
			text: __('Facilitator', 'multivendorx'),
			des: __(
				'Manage complex commission structures with advanced calculation rules.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-user-network-icon',
			text: __('Franchises', 'multivendorx'),
			des: __(
				'Create multi-location marketplace networks with centralized control.',
				'multivendorx'
			),
		},
		{
			icon: 'adminfont-franchises-module',
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
			link: 'https://multivendorx.com/cart/?add-to-cart=143434&variation_id=143443&attribute_pa_site-license=1-site-yearly',
		},
		{
			site: '3',
			price: '$399',
			link: 'https://multivendorx.com/cart/?add-to-cart=143434&variation_id=143445&attribute_pa_site-license=3-site-yearly',
		},
		{
			site: '10',
			price: '$599',
			link: 'https://multivendorx.com/cart/?add-to-cart=143434&variation_id=143440&attribute_pa_site-license=10-site-yearly',
		},
	],
};

const ShowProPopup: React.FC<PopupProps> = (props) => {
	const modulePopupContent = {
		moduleName: props.moduleName,
		message: sprintf(
			__(
				'This feature is currently unavailable. To activate it, please enable the %s',
				'multivendorx'
			),
			props.moduleName
		),
		moduleButton: __('Enable Now', 'multivendorx'),
		modulePageUrl:
			typeof appLocalizer !== 'undefined'
				? `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=modules&module=${props.moduleName}`
				: '#',
	};

	const wooPopupContent = {
		wooSetting: props.wooSetting,
		message: sprintf(
			__(
				'To enable this feature, please configure WooCommerce settings: %s',
				'multivendorx'
			),
			props.wooSetting
		),
		wooButton: __('Go to WooCommerce Settings', 'multivendorx'),
		wooPageUrl:
			typeof appLocalizer !== 'undefined' && props.wooLink
				? `${appLocalizer.site_url}/wp-admin/admin.php?${props.wooLink}`
				: '#',
	};
	return (
		<>
			{props.moduleName ? (
				<ProPopup {...modulePopupContent} />
			) : props.wooSetting ? (
				<ProPopup {...wooPopupContent} />
			) : (
				<ProPopup {...proPopupContent} />
			)}
		</>
	);
};

export default ShowProPopup;
