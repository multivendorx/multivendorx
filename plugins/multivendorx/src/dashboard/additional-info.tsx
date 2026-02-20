import { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiLink, SuccessNotice, TextAreaUI, ToggleSettingUI } from 'zyra';

const AdditionalInformation = () => {
	const id = appLocalizer.store_id;
	const [formData, setFormData] = useState<{ [key: string] }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);

	// Fetch store data
	useEffect(() => {
		if (!id) {
			return;
		}
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setFormData((prev) => ({ ...prev, ...data }));
		});
	}, [id]);

	// Auto clear success message
	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	// Fetch states when country changes
	useEffect(() => {
		if (formData.country) {
			fetchStatesByCountry(formData.country);
		}
	}, [formData.country]);

	const fetchStatesByCountry = (countryCode: string) => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `states/${countryCode}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			setStateOptions(res.data || []);
		});
	};

	// Handle text input changes
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const updated = { ...prev, [name]: value };
			autoSave(updated);
			return updated;
		});
	};

	// Handle toggle changes (always save yes/no string)
	const handleToggleChange = (field: string, val) => {
		const newValue = typeof val === 'string' ? val : val?.value || 'no';
		setFormData((prev) => {
			const updated = { ...prev, [field]: newValue };
			autoSave(updated);
			return updated;
		});
	};

	// Auto-save to backend
	const autoSave = (updatedData: { [key: string] }) => {
		axios
			.put(getApiLink(appLocalizer, `store/${id}`), updatedData, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				if (res.data.success) {
					setSuccessMsg('Store saved successfully!');
				}
			});
	};

	return (
		<>
			<SuccessNotice message={successMsg} />

			<div className="container-wrapper">
				<div className="card-wrapper column-8">
					{/* Message to Buyer */}
					<div className="card-content">
						<div className="card-title">
							{__('Message to Buyer', 'multivendorx')}
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<TextAreaUI
									name="messageToBuyer"
									value={formData.messageToBuyer || ''}
									onChange={handleChange}
								/>
							</div>
						</div>
					</div>

					{/* Privacy Controls */}
					<div className="card-content">
						<div className="card-title">
							{__('Privacy Controls', 'multivendorx')}
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<label>
									{__('Hide Address', 'multivendorx')}
								</label>
								<ToggleSettingUI
									options={[
										{
											key: 'yes',
											value: 'yes',
											label: __('Yes', 'multivendorx'),
										},
										{
											key: 'no',
											value: 'no',
											label: __('No', 'multivendorx'),
										},
									]}
									value={formData.hideAddress || 'no'}
									onChange={(val) =>
										handleToggleChange('hideAddress', val)
									}
								/>
							</div>
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<label>
									{__('Hide Phone', 'multivendorx')}
								</label>
								<ToggleSettingUI
									options={[
										{
											key: 'yes',
											value: 'yes',
											label: __('Yes', 'multivendorx'),
										},
										{
											key: 'no',
											value: 'no',
											label: __('No', 'multivendorx'),
										},
									]}
									value={formData.hidePhone || 'no'}
									onChange={(val) =>
										handleToggleChange('hidePhone', val)
									}
								/>
							</div>
						</div>

						<div className="form-group-wrapper">
							<div className="form-group">
								<label>
									{__('Hide Email', 'multivendorx')}
								</label>
								<ToggleSettingUI
									options={[
										{
											key: 'yes',
											value: 'yes',
											label: __('Yes', 'multivendorx'),
										},
										{
											key: 'no',
											value: 'no',
											label: __('No', 'multivendorx'),
										},
									]}
									value={formData.hideEmail || 'no'}
									onChange={(val) =>
										handleToggleChange('hideEmail', val)
									}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default AdditionalInformation;
