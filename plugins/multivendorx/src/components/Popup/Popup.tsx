/* global appLocalizer */
import React from 'react';
import { AdminButtonUI } from 'zyra';
import { __, sprintf } from '@wordpress/i18n';
import '../Popup/Popup.scss';

interface PopupProps {
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
			) : props.moduleName ? (

				<div className="popup-wrapper">
					<div className="popup-header">
						<i
							className={`adminfont-${props.moduleName}`}
						></i>
					</div>
					<div className="popup-body">
						<h2>
							Activate {props.moduleName}
						</h2>
						<p>This feature is currently unavailable. To activate it, please enable the {props.moduleName}</p>

						<AdminButtonUI
							position="center"
							buttons={[
								{
									icon: 'eye',
									text: __('Enable Now', 'multivendorx'),
									 onClick: () => {
										window.open(
											`${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=modules&module=${props.moduleName}`);
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
							<div className="heading">Upgrade every marketplace needs!</div>
							<div className="description"> Recurring revenue for you, empowered stores, automated operations</div>
							<div className="price">
								{/* {selectedBtn.price} */}
								$299
							</div>
							<div className="select-wrapper">
								For website with
								{/* <select
									value={selectedBtn.link}
									onChange={(e) => {
										const found = btnLink.find(
											(b) =>
												b.link === e.target.value
										);
										if (found) {
											setSelectedBtn(found);
										}
									}}
								>
									{btnLink.map((b, idx) => (
										<option
											key={idx}
											value={b.link}
										>
											{b.site}
										</option>
									))}
								</select> */}
								1
								site license
							</div>
							<a
								className="admin-btn"
								href={typeof appLocalizer !== 'undefined' ? appLocalizer.pro_url : '#'}
								target="_blank"
								rel="noreferrer"
							>
								Yes, Upgrade Me!
								<i className="adminfont-arrow-right arrow-icon"></i>
							</a>
						</div>
						<div className="popup-content">
							<div className="heading-text">
								Why should you upgrade?
							</div>

							<ul>
								{/* {props.messages?.map(
									(message, index) => ( */}
								<li>
									<div className="title">
										<i
											// className={
											//     message.icon  													
											// }
											className='adminfont-commission'
										></i>
										{/* {message.text} */}
										Membership Rewards & Commission
									</div>
									<div className="sub-text">
										{/* {message.des} */}
										Charge your sellers a monthly or yearly membership fee to sell on your marketplace - predictable revenue every month.
									</div>
								</li>
								{/* )
								)} */}
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
