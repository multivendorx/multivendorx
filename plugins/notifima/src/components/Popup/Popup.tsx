/* global appLocalizer */
import React, { useState } from 'react';
import { ButtonInputUI } from 'zyra';
import { __ } from '@wordpress/i18n';
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
	plugin?: string;
}


const proPopupContent = {
	messages: [
		{
			icon: 'double-opt-in',
			text: __('Double Opt-in', 'notifima'),
			des: __(
				'Confirm every signup via email for cleaner lists and better deliverability.',
				'notifima'
			),
		},
		{
			icon: 'ban-spam-mail',
			text: __('Ban Spam Mail', 'notifima'),
			des: __(
				'Keep your subscriber list clean from bots and unwanted registrations.',
				'notifima'
			),
		},
		{
			icon: 'export-subscribers',
			text: __('Export Subscribers', 'notifima'),
			des: __(
				'Download waitlist data anytime for reporting, marketing, or backup.',
				'notifima'
			),
		},
		{
			icon: 'subscription-dashboard',
			text: __('Subscription Dashboard', 'notifima'),
			des: __(
				'View all requests and demand trends from one centralized place.',
				'notifima'
			),
		},
		{
			icon: 'mailchimp',
			text: __('MailChimp Integration', 'notifima'),
			des: __(
				'Auto-sync subscribers for targeted email campaigns and nurture flows.',
				'notifima'
			),
		},
		{
			icon: 'form-recaptcha',
			text: __('Recaptcha Support', 'notifima'),
			des: __(
				'Protect waitlists from bots with built-in reCAPTCHA support.',
				'notifima'
			),
		},
		{
			icon: 'subscription-dashboard',
			text: __('Subscription Details', 'notifima'),
			des: __(
				'See who subscribed, which products are in demand, and track activity.',
				'notifima'
			),
		},
		{
			icon: 'export-import-stock',
			text: __('Export/Import Stock', 'notifima'),
			des: __(
				'Migrate or bulk manage stock data with one-click import and export.',
				'notifima'
			),
		},
	],
	btnLink: [
		{
			site: 'one',
			price: '$49',
			link: 'https://notifima.com/cart/?add-to-cart=699&variation_id=836&utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima'
		},
		{
			site: 'three',
			price: '$69',
			link: 'https://notifima.com/cart/?add-to-cart=699&variation_id=807&utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima',
		},
		{
			site: 'ten',
			price: '$99',
			link: 'https://notifima.com/cart/?add-to-cart=699&variation_id=808&utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima',
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
					<div className="desc">{props.confirmMessage}</div>
					<ButtonInputUI
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
			) : (
				<>
					{/* pro */}
					<div className="popup-wrapper">
						<div className="top-section">
							<div className="heading">
								{__(
									'Upgrade to Notifima Pro & never miss another sale',
									'notifima'
								)}
							</div>
							<div className="description">
								{__(
									'Recover more sales, manage inventory smarter, and deliver a seamless back-in-stock experience with premium features built for growing WooCommerce stores.',
									'notifima'
								)}
							</div>
							<div className="price">{selectedBtn.price}</div>
							<div className="select-wrapper">
								{__('For website with', 'notifima')}
								<select
									value={selectedBtn.link}
									onChange={(e) => {
										const found =
											proPopupContent.btnLink.find(
												(b) => b.link === e.target.value
											);
										if (found) {
											setSelectedBtn(found);
										}
									}}
								>
									{proPopupContent.btnLink.map((b, idx) => (
										<option key={idx} value={b.link}>
											{b.site}
										</option>
									))}
								</select>
								{__('site license', 'notifima')}
							</div>
							<a
								className="admin-btn"
								href={selectedBtn.link}
								target="_blank"
								rel="noreferrer"
							>
								{__('Yes, Upgrade Me!', 'notifima')}
								<i className="adminfont-arrow-right arrow-icon"></i>
							</a>
						</div>
						<div className="popup-details">
							<div className="heading-text">
								{__('Why should you upgrade?', 'notifima')}
							</div>

							<ul>
								{proPopupContent.messages.map(
									(message, index) => (
										<li key={index}>
											<div className="title">
												<i
													className={`adminfont-${message.icon}`}
												/>
												{message.text}
											</div>
											<div className="desc">{message.des}</div>
										</li>
									)
								)}
							</ul>
						</div>
					</div>
				</>
			)}
		</>
	);
};

export default ShowProPopup;
