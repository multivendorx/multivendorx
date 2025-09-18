import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { BasicInput, ToggleSetting, getApiLink } from 'zyra';
console.log(appLocalizer?.store_id);

interface PaymentField {
  key: number;
  action: string;
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
						{Array.isArray(selectedProvider?.fields) && selectedProvider.fields.map((field, index) => {
							// Case 1: Raw HTML
							if (field.type === "html" && field.html) {
								return (
									<div
										key={`html-${index}`}
										className="form-group-wrapper"
										dangerouslySetInnerHTML={{ __html: field.html }}
									/>
								);
							}

							if (field.type === "button") {
								return (
								  <div className="form-group-wrapper" key={field.key || index}>
									<button
									  type="button"
									  className="btn btn-primary"
									  onClick={() => {
										axios.post(
										  appLocalizer.ajaxurl,
										  new URLSearchParams({
											action: field.action || "create_stripe_account",
											_ajax_nonce: appLocalizer.nonce,
											...formData,
										  }),
										  {
											headers: { "Content-Type": "application/x-www-form-urlencoded" },
										  }
										).then(res => {
										  if (res.data.success && res.data.data.onboarding_url) {
											window.location.href = res.data.data.onboarding_url;
										  } else {
											alert(res.data.data.message || "Something went wrong.");
										  }
										});
									  }}
									>
									  {field.label}
									</button>
								  </div>
								);
							  }
																	  
							{/* Case 3: Normal input field */}
						return (
							<div className="form-group-wrapper" key={field.key || index}>
							<div className="form-group">
								{field.label && <label htmlFor={field.key}>{field.label}</label>}
								<BasicInput
								name={field.key || ""}
								type={field.type || "text"}
								wrapperClass="setting-form-input"
								descClass="settings-metabox-description"
								placeholder={field.placeholder || ""}
								value={formData[field.key || ""] || ""}
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
