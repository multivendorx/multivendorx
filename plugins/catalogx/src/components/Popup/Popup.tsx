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
			icon: 'personalized-pricing',
			text: __('Send custom quotes', 'catalogx'),
			des: __(
				'Create personalized pricing and quotation responses for customers.',
				'catalogx'
			),
		},
		{
			icon: 'multiple-products exclusive-forms',
			text: __('Multi-product enquiry cart', 'catalogx'),
			des: __(
				'Allow customers to enquire about multiple products in a single request.',
				'catalogx'
			),
		},
		{
			icon: 'add-file-uploads',
			text: __('File uploads & custom enquiry fields', 'catalogx'),
			des: __(
				'Collect additional files and custom information through enquiry forms.',
				'catalogx'
			),
		},
		{
			icon: 'different-users',
			text: __('Role-based pricing', 'catalogx'),
			des: __(
				'Show different pricing options based on user roles and customer types.',
				'catalogx'
			),
		},
		{
			icon: 'discounts',
			text: __('Category-based discounts', 'catalogx'),
			des: __(
				'Apply discounts automatically to selected product categories.',
				'catalogx'
			),
		},
		{
			icon: 'wholesale-order',
			text: __('Wholesale order forms', 'catalogx'),
			des: __(
				'Enable streamlined bulk and wholesale ordering workflows.',
				'catalogx'
			),
		},
		{
			icon: 'out-of-stock',
			text: __('Enquiry for hidden/out-of-stock products', 'catalogx'),
			des: __(
				'Allow customers to send enquiries for unavailable or hidden products.',
				'catalogx'
			),
		},
		{
			icon: 'shortcode',
			text: __('Enquiry button via shortcode', 'catalogx'),
			des: __(
				'Add enquiry buttons anywhere on your website using shortcodes.',
				'catalogx'
			),
		},
		{
			icon: 'emails',
			text: __('Auto-send branded enquiry emails', 'catalogx'),
			des: __(
				'Automatically send customized branded emails for customer enquiries.',
				'catalogx'
			),
		},
		{
			icon: 'dashboard',
			text: __('Track all enquiries in one dashboard', 'catalogx'),
			des: __(
				'Manage and monitor all customer enquiries from a centralized dashboard.',
				'catalogx'
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
									'moowoodle'
								)}
							</div>
							<div className="description">
								{__(
									'Better courses, bigger profits',
									'moowoodle'
								)}
							</div>
							<div className="price">{selectedBtn.price}</div>
							<div className="select-wrapper">
								{__('For website with', 'moowoodle')}
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
								{__('site license', 'moowoodle')}
							</div>
							<a
								className="admin-btn"
								href={selectedBtn.link}
								target="_blank"
								rel="noreferrer"
							>
								{__('Yes, Upgrade Me!', 'moowoodle')}
								<i className="adminfont-arrow-right arrow-icon"></i>
							</a>
						</div>
						<div className="popup-details">
							<div className="heading-text">
								{__('Why should you upgrade?', 'moowoodle')}
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
