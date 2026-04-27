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
            icon: 'adminlib-Bulk-Course-Sync',
            text: __( 'Bulk Course Sync', 'moowoodle' ),
            des: __(
                'Sync multiple Moodle™ courses to WordPress with one click.',
                'moowoodle'
            ),
        },
        {
            icon: 'adminlib-classroom-enrollment',
            text: __( 'Cohort Enrollment', 'moowoodle' ),
            des: __(
                'Sell and enroll entire Moodle™ cohorts via WooCommerce.',
                'moowoodle'
            ),
        },
        {
            icon: 'adminlib-cohort',
            text: __( 'Group Enrollment', 'moowoodle' ),
            des: __(
                'Map course variations to Moodle™ groups for targeted enrollment.',
                'moowoodle'
            ),
        },
        {
            icon: 'adminlib-global-community',
            text: __( 'Classroom Enrollment', 'moowoodle' ),
            des: __(
                'Buy multiple seats and assign them to students or teams.',
                'moowoodle'
            ),
        },
        {
            icon: 'adminlib-Gift-a-Course',
            text: __( 'Gift a Course', 'moowoodle' ),
            des: __(
                'Let customers purchase and gift courses to others.',
                'moowoodle'
            ),
        },
        {
            icon: 'adminlib-Single-Sign-On',
            text: __( 'Single Sign-On (SSO)', 'moowoodle' ),
            des: __(
                'Access Moodle™ and WordPress with one login.',
                'moowoodle'
            ),
        },
        {
            icon: 'adminlib-Single-Sign-On',
            text: __( 'Smart Course Sync', 'moowoodle' ),
            des: __(
                'Keep course details updated between Moodle™ and WordPress.',
                'moowoodle'
            ),
        },
        {
            icon: 'adminlib-subscription-courses',
            text: __( 'Subscription Courses', 'moowoodle' ),
            des: __(
                'Offer courses with recurring subscription plans.',
                'moowoodle'
            ),
        },
        {
            icon: 'adminlib-user-network-icon',
            text: __( 'Unified Access', 'moowoodle' ),
            des: __(
                'Give learners one dashboard for all their courses.',
                'moowoodle'
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
									'Upgrade every marketplace needs!',
									'multivendorx'
								)}
							</div>
							<div className="description">
								{__(
									'Recurring revenue for you, empowered stores, automated operations',
									'multivendorx'
								)}{' '}
							</div>
							<div className="price">{selectedBtn.price}</div>
							<div className="select-wrapper">
								{__('For website with', 'multivendorx')}
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
								{__('site license', 'multivendorx')}
							</div>
							<a
								className="admin-btn"
								href={selectedBtn.link}
								target="_blank"
								rel="noreferrer"
							>
								{__('Yes, Upgrade Me!', 'multivendorx')}
								<i className="adminfont-arrow-right arrow-icon"></i>
							</a>
						</div>
						<div className="popup-details">
							<div className="heading-text">
								{__('Why should you upgrade?', 'multivendorx')}
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
