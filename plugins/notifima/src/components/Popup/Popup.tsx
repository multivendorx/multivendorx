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
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				'notifima'
			),
		},
		{
			icon: 'ban-spam-mail',
			text: __('Ban Spam Mail', 'notifima'),
			des: __(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				'notifima'
			),
		},
		{
			icon: 'export-subscribers',
			text: __('Export Subscribers', 'notifima'),
			des: __(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				'notifima'
			),
		},
		{
			icon: 'subscription-dashboard',
			text: __('Subscription Dashboard', 'notifima'),
			des: __(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				'notifima'
			),
		},
		{
			icon: 'mailchimp',
			text: __('MailChimp Integration', 'notifima'),
			des: __(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				'notifima'
			),
		},
		{
			icon: 'form-recaptcha',
			text: __('Recaptcha Support', 'notifima'),
			des: __(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				'notifima'
			),
		},
		{
			icon: 'subscription-dashboard',
			text: __('Subscription Details', 'notifima'),
			des: __(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				'notifima'
			),
		},
		{
			icon: 'export-import-stock',
			text: __('Export/Import Stock', 'notifima'),
			des: __(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				'notifima'
			),
		},
	],
	btnLink: [
		{
			site: 'one',
			price: '$199',
			link: 'https://dualcube.com/product/moowoodle-pro/?add-to-cart=18156',
		},
		{
			site: 'three',
			price: '$349',
			link: 'https://dualcube.com/product/moowoodle-pro/?add-to-cart=18158',
		},
		{
			site: 'ten',
			price: '$499',
			link: 'https://dualcube.com/product/moowoodle-pro/?add-to-cart=18157',
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
									'Your students will love this!',
									'notifima'
								)}
							</div>
							<div className="description">
								{__(
									'Boost to Product Notifima Pro to access premium features!',
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
											<div className="desc">
												{' '}
												{message.des}
											</div>
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
