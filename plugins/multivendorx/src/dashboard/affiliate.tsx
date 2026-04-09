/* global appLocalizer */
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	ButtonInputUI,
	BasicInputUI,
	FormGroup,
	FormGroupWrapper,
	PopupUI,
	TextAreaUI,
	NavigatorHeader,
	Notice,
} from 'zyra';

const Affiliate: React.FC = () => {
	const [AddAffiliate, setAddAffiliate] = useState(false);
	return (
		<>
			<NavigatorHeader
				headerTitle={__('Affiliate', 'multivendorx')}
				headerDescription={__(
					'Create, view, and manage all your store coupons from one place.',
					'multivendorx'
				)}
				buttons={[
					{
						label: __('Add New Affiliate', 'multivendorx'),
						icon: 'plus',
						onClick: () => {
							setAddAffiliate(true);
						},
					},
				]}
			/>

			<PopupUI
				open={AddAffiliate}
				onClose={() => setAddAffiliate(false)}
				width={31.25}
				header={{
					icon: 'coupon',
					title: __('Request Vendor Affiliate', 'multivendorx'),
					description: __(
						'Expand your earning potential by partnering with existing vendors in your marketplace. When you add affiliates, you can earn commissions on sales generated through your referral links while vendors benefit from increased product visibility and sales.',
						'multivendorx'
					),
				}}
				footer={
					<ButtonInputUI
						buttons={[
							{
								icon: 'contact-form',
								text: __('Close', 'multivendorx'),
								color: 'red',
								onClick: () => setAddAffiliate(false),
							},
							{
								icon: 'save',
								text: __(
									'Send Affiliate Request',
									'multivendorx'
								),
								// onClick: () => handleSave('publish'),
							},
						]}
					/>
				}
			>
				<>
					<Notice
						type="info"
						displayPosition="inline-notice"
						title={__(
							'How Affiliate Requests Work',
							'multivendorx'
						)}
						message={__(
							'When you submit this request, the vendor will receive a notification and can choose to approve or decline your application. Once approved, youll gain access to promotional materials, unique tracking links, and commission tracking for all referred sales.',
							'multivendorx'
						)}
					/>
					<Notice
						type="warning"
						displayPosition="inline-notice"
						message={__(
							'<b> Required: </b>All fields marked with an asterisk (*) must be completed to submit your affiliate request.',
							'multivendorx'
						)}
					/>
					<FormGroupWrapper>
						<FormGroup
							label={__('Coupon code', 'multivendorx')}
							htmlFor="title"
							desc={__(
								'Enter the registered email address of the existing vendor you wish to partner with as an affiliate.',
								'multivendorx'
							)}
						>
							<BasicInputUI type="text" name="title" />
						</FormGroup>

						<FormGroup
							label={__('Description (optional)', 'multivendorx')}
							desc={__(
								'A personalized message increases your chances of approval. Share your marketing approach, audience demographics, or past affiliate experience.',
								'multivendorx'
							)}
							htmlFor="title"
						>
							<TextAreaUI name="content" rowNumber={6} />
						</FormGroup>
					</FormGroupWrapper>
				</>
			</PopupUI>
		</>
	);
};

export default Affiliate;
