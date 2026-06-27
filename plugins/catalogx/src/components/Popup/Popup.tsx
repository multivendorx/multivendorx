/* global appLocalizer */
import React, { useState } from 'react';
import { ButtonInputUI } from 'zyra';
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
			icon: 'dollar',
			text: __('Personalized quote requests', 'catalogx'),
			des: __(
				'Let customers request custom quotes and negotiate pricing to convert high-intent visitors.',
				'catalogx'
			),
		},
		{
			icon: 'wholesale',
			text: __('Wholesale pricing & order forms', 'catalogx'),
			des: __(
				'Offer bulk pricing and dedicated order forms to attract B2B buyers and grow large-volume sales.',
				'catalogx'
			),
		},
		{
			icon: 'multi-product',
			text: __('Multi-product enquiries', 'catalogx'),
			des: __(
				'Let customers enquire about multiple products in a single request for better engagement.',
				'catalogx'
			),
		},
		{
			icon: 'cloud-upload',
			text: __('Advanced enquiry management', 'catalogx'),
			des: __(
				'Use file attachments, internal tagging, and organized workflows for a smoother sales process.',
				'catalogx'
			),
		},
		{
			icon: 'person',
			text: __('Role-based pricing', 'catalogx'),
			des: __(
				'Show different prices to wholesalers, members, or VIP customers with personalized offers.',
				'catalogx'
			),
		},
		{
			icon: 'category',
			text: __('Category-based pricing rules', 'catalogx'),
			des: __(
				'Set custom pricing at the category level to run targeted promotions across your catalog.',
				'catalogx'
			),
		},
	],
	btnLink: [
		{
			site: 'one',
			price: '$129',
			link: 'https://catalogx.com/cart/?add-to-cart=329&variation_id=3380',
		},
		{
			site: 'three',
			price: '$199',
			link: 'https://catalogx.com/cart/?add-to-cart=329&variation_id=3381',
		},
		{
			site: 'ten',
			price: '$299',
			link: 'https://catalogx.com/cart/?add-to-cart=329&variation_id=3382',
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
			) : props.moduleName ? (
				<div className="popup-wrapper">
					<div className="popup-header">
						<i className={`adminfont-${props.moduleName}`} />
					</div>
					<div className="popup-body">
						<div className="module-name">
							{sprintf(
								__('Activate %s', 'catalogx'),
								formatModuleName(props.moduleName)
							)}
						</div>
						<div className="module-desc">
							{sprintf(
								__(
									'This feature is currently unavailable. To activate it, please enable the %s',
									'catalogx'
								),
								formatModuleName(props.moduleName)
							)}
						</div>

						<ButtonInputUI
							position="center"
							buttons={[
								{
									icon: 'eye',
									text: __('Enable Now', 'catalogx'),
									onClick: () => {
										window.open(
											`${appLocalizer.admin_url}#&tab=modules&module=${props.moduleName}`
										);
									},
								},
							]}
						/>
					</div>
				</div>
			) : props.plugin ? (
				<div className="popup-wrapper">
					<div className="popup-header">
						<i className="adminfont-plugin" />
					</div>

					<div className="popup-body">
						<div className="module-name">
							{sprintf(
								__('Install %s', 'catalogx'),
								props.plugin.name
							)}
						</div>

						<div className="module-desc">
							{sprintf(
								__(
									'This feature requires the %s plugin. Please install and activate it to continue.',
									'catalogx'
								),
								props.plugin.name
							)}
						</div>

						<ButtonInputUI
							position="center"
							buttons={[
								{
									icon: 'download',
									text: __('Install Plugin', 'catalogx'),
									onClick: () => {
										if (props.plugin?.link) {
											window.open(
												props.plugin.link,
												'_blank',
												'noopener,noreferrer'
											);
										}
									},
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
							<div className="heading">
								{__(
									'Upgrade to CatalogX Pro & turn product interest into more sales',
									'catalogx'
								)}
							</div>
							<div className="description">
								{__(
									'Unlock powerful tools that help you generate more enquiries, close deals faster, and increase revenue with flexible pricing and quotation features.',
									'catalogx'
								)}{' '}
							</div>
							<div className="price">{selectedBtn.price}</div>
							<div className="select-wrapper">
								{__('For website with', 'catalogx')}
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
								{__('site license', 'catalogx')}
							</div>
							<a
								className="admin-btn"
								href={selectedBtn.link}
								target="_blank"
								rel="noreferrer"
							>
								{__('Yes, Upgrade Me!', 'catalogx')}
								<i className="adminfont-arrow-right arrow-icon"></i>
							</a>
						</div>
						<div className="popup-details">
							<div className="heading-text">
								{__('Why should you upgrade?', 'catalogx')}
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
