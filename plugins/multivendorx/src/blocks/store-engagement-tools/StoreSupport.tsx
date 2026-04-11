import { __ } from '@wordpress/i18n';
import axios from 'axios';
import React, { useState } from 'react';
import { getApiLink } from 'zyra';

const SupportIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		width="20"
		height="20"
	>
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
	</svg>
);

interface Props {
	productName: string;
	productId: number;
}

const StoreSupport: React.FC<Props> = ({ productName, productId }) => {
	const [isOpen, setIsOpen] = useState(false);

	const [formData, setFormData] = useState({
		subject: '',
		orderId: '',
		message: '',
	});

	const store = StoreInfo?.storeDetails;
	const orderOptions = store?.orderOptions || [];

	// Handle input change
	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = () => {
		if (!formData.subject || !formData.message) {
			alert(__('Subject and message are required', 'multivendorx'));
			return;
		}

		const payload = {
			store_supports: {
				id: `support_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
				subject: formData.subject,
				order_id: formData.orderId,
				message: formData.message,
				product_id: productId,
				status: 'open'
			},
			id: StoreInfo?.storeDetails?.storeId,
		};

		axios
			.post(
				getApiLink(
					StoreInfo,
					`store/${StoreInfo?.storeDetails?.storeId}`
				),
				payload,
				{
					headers: {
						'X-WP-Nonce': StoreInfo?.nonce,
					},
				}
			)
			.then((response) => {
				// Validate response
				if (!response || response.status !== 200) {
					throw new Error('Request failed');
				}

				// Reset form
				setFormData({
					subject: '',
					orderId: '',
					message: '',
				});

				setIsOpen(false);
			})
			.catch((error) => {
				console.error('Support submit error:', error);

				const message =
					error?.response?.data?.message ||
					error?.message ||
					__('Something went wrong', 'multivendorx');

				alert(message);
			});
	};

	return (
		<>
			<button
				className="wp-block-button__link has-border-color has-accent-1-border-color wp-element-button multivendorx-store-support-btn"
				onClick={() => setIsOpen(true)}
			>
				<SupportIcon />
				{__('Get Support', 'multivendorx')}
			</button>

			{isOpen && (
				<div
					className="store-support-popup multivendorx-popup"
					onClick={(e) => {
						if (e.target === e.currentTarget) setIsOpen(false);
					}}
				>
					<div className="woocommerce multivendorx-popup-content">
						<form
							className="woocommerce-form woocommerce-form-login login"
							onSubmit={(e) => e.preventDefault()}
						>
							<span
								className="popup-close"
								onClick={() => setIsOpen(false)}
							>
								<i className="dashicons dashicons-no-alt"></i>
							</span>

							<h3>{store?.storeName}</h3>
							<h2>{__('Create a new support', 'multivendorx')}</h2>

							{/* Subject */}
							<p className="woocommerce-form-row form-row form-row-wide">
								<label>{__('Subject', 'multivendorx')}</label>
								<input
									type="text"
									className="woocommerce-Input input-text"
									value={formData.subject}
									onChange={(e) =>
										handleChange('subject', e.target.value)
									}
								/>
							</p>

							{/* Order Dropdown */}
							<p className="woocommerce-form-row form-row form-row-wide">
								<label>{__('Order ID', 'multivendorx')}</label>
								<select
									className="woocommerce-Input input-select"
									value={formData.orderId}
									onChange={(e) =>
										handleChange('orderId', e.target.value)
									}
								>
									<option value="">
										{__('Select order id', 'multivendorx')}
									</option>

									{orderOptions.length > 0 ? (
										orderOptions.map((order: any) => (
											<option
												key={order.value}
												value={order.value}
											>
												{order.label}
											</option>
										))
									) : (
										<option disabled>
											{__('No orders found', 'multivendorx')}
										</option>
									)}
								</select>
							</p>

							{/* Message */}
							<p className="woocommerce-form-row form-row form-row-wide">
								<label>{__('Message', 'multivendorx')}</label>
								<textarea
									className="input-text"
									value={formData.message}
									onChange={(e) =>
										handleChange('message', e.target.value)
									}
								/>
							</p>

							{/* Submit */}
							<button
								type="button"
								onClick={handleSubmit}
								className="submit-report-abuse woocommerce-button button wp-element-button"
							>
								{__('Submit', 'multivendorx')}
							</button>
						</form>
					</div>
				</div>
			)}
		</>
	);
};

export default StoreSupport;