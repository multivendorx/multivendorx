import { __ } from '@wordpress/i18n';
import axios from 'axios';
import React, { useState } from 'react';
import { getApiLink } from 'zyra';

interface Props {
	productName: string;
	productId: number;
}

const StoreSupport: React.FC<Props> = ({ productName, productId }) => {
	const [isOpen, setIsOpen] = useState(false);

	const [formData, setFormData] = useState({
		subject: '',
		message: '',
	});

	const store = StoreInfo?.storeDetails;

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
				message: formData.message,
				product_id: productId,
				status: 'open',
			},
			id: StoreInfo?.storeDetails?.storeId,
		};

		axios
			.post(getApiLink(StoreInfo, `store-supports`), payload, {
				headers: {
					'X-WP-Nonce': StoreInfo?.nonce,
				},
			})
			.then((response) => {
				if (!response || response.status !== 200) {
					throw new Error('Request failed');
				}

				// Reset form
				setFormData({
					subject: '',
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
				{__('Get Support', 'multivendorx')}
			</button>

			{isOpen && (
				<div
					className="store-support-popup multivendorx-popup"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							setIsOpen(false);
						}
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
							<h2>
								{__('Create a new support', 'multivendorx')}
							</h2>

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
