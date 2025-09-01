import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, ToggleSetting, getApiLink } from 'zyra';

const PaymentSettings = ({ id }: { id: string }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setFormData((prev) => ({ ...prev, ...data }));
		});
	}, [id]);

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

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
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				setSuccessMsg('Store saved successfully!');
			}
		});
	};

	return (
		<>
			{successMsg && (
				<div className="admin-notice-wrapper">
					<i className="admin-font adminlib-icon-yes"></i>
					<div className="notice-details">
						<div className="title">Great!</div>
						<div className="desc">{successMsg}</div>
					</div>
				</div>
			)}

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
									options={[
										{ key: 'paypal_masspay', value: 'paypal_masspay', label: 'PayPal MassPay' },
										{ key: 'paypal_payout', value: 'paypal_payout', label: 'PayPal Payout' },
										{ key: 'stripe_connect', value: 'stripe_connect', label: 'Stripe Connect' },
										{ key: 'direct_bank', value: 'direct_bank', label: 'Direct Bank' },
									]}
									value={formData.payment_method || ''}
									onChange={handleToggleChange}
								/>
							</div>
						</div>

						{/* Commission Amount */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="commission_amount">Commission Amount</label>
								<BasicInput
									name="commission_amount"
									type="number"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									description='To set vendor commission as 0 pass "0" in the Commission Amount filed'
									value={formData.commission_amount}
									onChange={handleChange}
								/>
							</div>
						</div>

						{/* Paypal Email */}
						{(formData.payment_method === 'paypal_masspay' || formData.payment_method === 'paypal_payout') &&
							(
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="paypal_email">Paypal Email</label>
										<BasicInput
											name="paypal_email"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.paypal_email}
											onChange={handleChange}
										/>
									</div>
								</div>
							)
						}
						{formData.payment_method === 'direct_bank' &&
							<>
								{/* Bank Name */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="paypal_email">Bank Name</label>
										<BasicInput
											name="paypal_email"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.paypal_email}
											onChange={handleChange}
										/>
									</div>
								</div>
								{/* ABA Routing Number */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="aba_routing_number">ABA Routing Number</label>
										<BasicInput
											name="aba_routing_number"
											type="number"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.aba_routing_number}
											onChange={handleChange}
										/>
									</div>
								</div>
								{/* Destination Currency */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="destination_currency">Destination Currency</label>
										<BasicInput
											name="destination_currency"
											type="text"
											wrapperClass="setting-form-input"
											placeholder="Enter destination currency"
											descClass="settings-metabox-description"
											value={formData.destination_currency || ""}
											onChange={handleChange}
										/>
									</div>
								</div>

								{/* Bank Address */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="bank_address">Bank Address</label>
										<BasicInput
											name="bank_address"
											type="text"
											wrapperClass="setting-form-input"
											placeholder="Enter bank address"
											descClass="settings-metabox-description"
											value={formData.bank_address || ""}
											onChange={handleChange}
										/>
									</div>
								</div>

								{/* IBAN */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="iban">IBAN</label>
										<BasicInput
											name="iban"
											type="text"
											wrapperClass="setting-form-input"
											placeholder="Enter IBAN"
											descClass="settings-metabox-description"
											value={formData.iban || ""}
											onChange={handleChange}
										/>
									</div>
								</div>

								{/* Account Holder Name */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="account_holder_name">Account Holder Name</label>
										<BasicInput
											name="account_holder_name"
											type="text"
											wrapperClass="setting-form-input"
											placeholder="Enter account holder name"
											descClass="settings-metabox-description"
											value={formData.account_holder_name || ""}
											onChange={handleChange}
										/>
									</div>
								</div>

								{/* Account Number */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="account_number">Account Number</label>
										<BasicInput
											name="account_number"
											type="text"
											wrapperClass="setting-form-input"
											placeholder="Enter account number"
											descClass="settings-metabox-description"
											value={formData.account_number || ""}
											onChange={handleChange}
										/>
									</div>
								</div>

							</>
						}

					</div>
				</div>
			</div>
		</>
	);
};

export default PaymentSettings;