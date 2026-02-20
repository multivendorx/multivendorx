/* global appLocalizer */
import React, { useState } from 'react';
import { AdminButtonUI } from 'zyra';
import { __, sprintf } from '@wordpress/i18n';
import '../Popup/Popup.scss';

interface PopupProps {
	moduleId?: string;
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
}

const proPopupContent = {
	messages: [
		{
			icon: 'commission',
			text: __('Membership Rewards & Commission', 'multivendorx'),
			des: __( 'Charge your sellers a monthly or yearly membership fee to sell on your marketplace - predictable revenue every month.', 'multivendorx'),
		},
		{
			icon: 'store-policy',
			text: __('Verified Stores Only', 'multivendorx'),
			des: __( 'Screen stores with document verification and approval - build a trusted marketplace from day one.', 'multivendorx' ),
		},
		{
			icon: 'marketplace',
			text: __('Diversified Marketplace', 'multivendorx'),
			des: __( ' Enable bookings, subscriptions, and auctions to boost sales and engagement.', 'multivendorx' ),
		},
		{
			icon: 'store-inventory',
			text: __('Vacation Mode for Stores', 'multivendorx'),
			des: __( 'Stores can pause their stores temporarily with automatic buyer notifications - no missed messages.', 'multivendorx' ),
		},
		{
			icon: 'out-of-stock',
			text: __('Never Run Out of Stock', 'multivendorx'),
			des: __(' Real-time inventory tracking with automatic low-stock alerts keeps sellers prepared and buyers happy.', 'multivendorx')
		},
		{
			icon: 'notification',
			text: __('Autopilot Notifications', 'multivendorx'),
			des: __( 'Automatic emails and alerts for every order, refund, and payout - everyone stays in the loop.', 'multivendorx' ),
		},
		{
			icon: 'staff-manager',
			text: __('Staff Manager', 'multivendorx'),
			des: __( 'Empower stores to manage their team with role-based access and permissions.', 'multivendorx' ),
		},
		{
			icon: 'business-hours',
			text: __('Business Hours', 'multivendorx'),
			des: __('Let stores set their operating hours for better customer expectations.','multivendorx')
		},
		{
			icon: 'wholesale',
			text: __('Wholesale', 'multivendorx'),
			des: __('Enable bulk pricing and wholesale options to attract B2B buyers.','multivendorx')
		},
		{
			icon: 'paypal-marketplace',
			text: __('PayPal Marketplace', 'multivendorx'),
			des: __('Split payments automatically to stores via PayPal - seamless payouts.','multivendorx')
		},
		{
			icon: 'stripe-marketplace',
			text: __('Stripe Marketplace', 'multivendorx'),
			des: __('Instant vendor payouts with Stripe Connect - fast and secure.','multivendorx')
		},
		{
			icon: 'facilitator',
			text: __('Facilitator', 'multivendorx'),
			des: __('Manage complex commission structures with advanced calculation rules.','multivendorx')
		},
		{
			icon: 'user-network-icon',
			text: __('Franchises', 'multivendorx'),
			des: __('Create multi-location marketplace networks with centralized control.','multivendorx')
		},
		{
			icon: 'franchises-module',
			text: __('Invoice & Packing Slip', 'multivendorx'),
			des: __('Professional invoices and packing slips for every order - build trust and credibility.','multivendorx')
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
	const [selectedBtn, setSelectedBtn] = useState(proPopupContent.btnLink[0]);

	return (
		<>
			{props.confirmMode ? (
				<div className="popup-confirm">
                    <i className="popup-icon adminfont-suspended admin-badge red"></i>
                    <div className="title">{props.title || 'Confirmation'}</div>
                    <p className="desc">{props.confirmMessage}</p>
                    <AdminButtonUI
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
			) : props.moduleId ? (

				<div className="popup-wrapper">
					<div className="popup-header">
						<i className={`adminfont-${props.moduleId}`} />
					</div>
					<div className="popup-body">
						<h2>
						{sprintf( __('Activate %s', 'multivendorx'), props.moduleName)}
						</h2>
						<p>{sprintf( __('This feature is currently unavailable. To activate it, please enable the %s', 'multivendorx'), props.moduleName)}</p>

						<AdminButtonUI
							position="center"
							buttons={[
								{
									icon: 'eye',
									text: __('Enable Now', 'multivendorx'),
									 onClick: () => {
										window.open(
											`${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=modules&module=${props.moduleId}`);
									}
								},
							]}
						/>
					</div>
				</div>
			) : (
				<>
					{/* pro */}
					<div className="popup-wrapper">
						<div className="top-section">
							<div className="heading">{__( 'Upgrade every marketplace needs!', 'multivendorx')}</div>
							<div className="description">{__( 'Recurring revenue for you, empowered stores, automated operations', 'multivendorx')} </div>
							<div className="price">
								{selectedBtn.price}
							</div>
							<div className="select-wrapper">
								{__('For website with', 'multivendorx')}
								<select
									value={selectedBtn.link}
									onChange={(e) => {
										const found = proPopupContent.btnLink.find(
											(b) =>
												b.link === e.target.value
										);
										if (found) {
											setSelectedBtn(found);
										}
									}}
								>
									{proPopupContent.btnLink.map((b, idx) => (
										<option
											key={idx}
											value={b.link}
										>
											{b.site}
										</option>
									))}
								</select>
								{__('site license', 'multivendorx')}
							</div>
							<a
								className="admin-btn"
								href={selectedBtn.link}
								target="_blank"
								rel="noreferrer"
							>
								{__( 'Yes, Upgrade Me!', 'multivendorx')}
								<i className="adminfont-arrow-right arrow-icon"></i>
							</a>
						</div>
						<div className="popup-details">
							<div className="heading-text">
								{__( 'Why should you upgrade?', 'multivendorx')}
							</div>

							<ul>
								{proPopupContent.messages.map(
									(message, index) => (
								<li key={index}>
									<div className="title">
										<i className={`adminfont-${message.icon}`}/>
										{message.text}
									</div>
									<div className="desc"> {message.des}</div>
								</li>
								)
								)}
							</ul>
						</div>
					</div>
				</>
			)
			}
		</>
	);
};

export default ShowProPopup;