import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { BasicInput, ToggleSetting, getApiLink } from 'zyra';
console.log(appLocalizer?.store_id);

interface PaymentField {
  html: string | TrustedHTML;
  name: string;
  type?: string;
  label: string;
  placeholder?: string;
}

interface PaymentProvider {
  id: string;
  label: string;
  fields?: PaymentField[];
}

interface StorePaymentConfig {
  [key: string]: PaymentProvider;
}

const Withdrawl: React.FC = () => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	// const [successMsg, setSuccessMsg] = useState<string | null>(null);

	const storePayment: StorePaymentConfig =
		(appLocalizer.store_payment_settings as StorePaymentConfig) || {};

	const filteredStorePayment = Object.fromEntries(
	Object.entries(storePayment).filter(([_, value]) => value !== null)
	);

	const paymentOptions = Object.values(filteredStorePayment).map((p) => ({
		key: p.id,
		value: p.id,
		label: p.label,
	}));

	const selectedProvider = storePayment[formData.payment_method];

	useEffect(() => {
		if (!appLocalizer.store_id) return;

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setFormData((prev) => ({ ...prev, ...data }));
		});
	}, [appLocalizer.store_id]);

	// useEffect(() => {
	// 	if (successMsg) {
	// 		const timer = setTimeout(() => setSuccessMsg(null), 3000);
	// 		return () => clearTimeout(timer);
	// 	}
	// }, [successMsg]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name]: value ?? '',
			};
			autoSave(updated);
			return updated;
		});
	};

	const handleToggleChange = (value: string) => {
		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				payment_method: value,
			};
			autoSave(updated);
			return updated;
		});
	};

	const autoSave = (updatedData: { [key: string]: string }) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${appLocalizer?.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				console.log('Store saved successfully!');
			}
		});
	};


    return (
        <>
            <div className="container-wrapper">
				<div className="card-wrapper width-65">
					<div className="card-content">
						<div className="card-title">Payment information</div>

						{/* Payment Method Toggle */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label>Payment Method</label>
								<ToggleSetting
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									description="Choose your preferred payment method."
									options={paymentOptions}
									value={formData.payment_method || ""}
									onChange={handleToggleChange}
									/>
							</div>
						</div>
		
						{/* Dynamic Fields */}
						{selectedProvider?.fields?.map((field, index) => {
							console.log('kk');
							// Case 1: PHP provided raw HTML block
							if (field.type === "html" && field.html) {
								return (
									<div
										key={`html-${index}`}
										className="form-group-wrapper"
										dangerouslySetInnerHTML={{ __html: field.html }}
									/>
								);
							}

							// Case 2: Normal input field
							return (
								<div className="form-group-wrapper" key={field.name || index}>
									<div className="form-group">
										{field.label && <label htmlFor={field.name}>{field.label}</label>}
										<BasicInput
											name={field.name || ""}
											type={field.type || "text"}
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											placeholder={field.placeholder || ""}
											value={formData[field.name || ""] || ""}
											onChange={handleChange}
										/>
									</div>
								</div>
							);
						})}

					</div>
				</div>
			</div>
        </>
    );
};

export default Withdrawl;
