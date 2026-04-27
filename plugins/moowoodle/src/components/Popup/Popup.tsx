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
            icon: 'bulk-course-sync',
            text: __( 'Bulk Course Sync', 'moowoodle' ),
            des: __(
                'Sync multiple Moodle™ courses to WordPress with one click.',
                'moowoodle'
            ),
        },
        {
            icon: 'classroom-enrollment',
            text: __( 'Cohort Enrollment', 'moowoodle' ),
            des: __(
                'Sell and enroll entire Moodle™ cohorts via WooCommerce.',
                'moowoodle'
            ),
        },
        {
            icon: 'cohort',
            text: __( 'Group Enrollment', 'moowoodle' ),
            des: __(
                'Map course variations to Moodle™ groups for targeted enrollment.',
                'moowoodle'
            ),
        },
        {
            icon: 'global-community',
            text: __( 'Classroom Enrollment', 'moowoodle' ),
            des: __(
                'Buy multiple seats and assign them to students or teams.',
                'moowoodle'
            ),
        },
        {
            icon: 'gift-a-course',
            text: __( 'Gift a Course', 'moowoodle' ),
            des: __(
                'Let customers purchase and gift courses to others.',
                'moowoodle'
            ),
        },
        {
            icon: 'single-sign-On',
            text: __( 'Single Sign-On (SSO)', 'moowoodle' ),
            des: __(
                'Access Moodle™ and WordPress with one login.',
                'moowoodle'
            ),
        },
        {
            icon: 'single-sign-on',
            text: __( 'Smart Course Sync', 'moowoodle' ),
            des: __(
                'Keep course details updated between Moodle™ and WordPress.',
                'moowoodle'
            ),
        },
        {
            icon: 'subscription-courses',
            text: __( 'Subscription Courses', 'moowoodle' ),
            des: __(
                'Offer courses with recurring subscription plans.',
                'moowoodle'
            ),
        },
        {
            icon: 'user-network-icon',
            text: __( 'Unified Access', 'moowoodle' ),
            des: __(
                'Give learners one dashboard for all their courses.',
                'moowoodle'
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
