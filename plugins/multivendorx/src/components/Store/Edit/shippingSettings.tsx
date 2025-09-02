import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, NestedComponent, TextArea, ToggleSetting, getApiLink } from 'zyra';

const ShippingSettings = ({ id }: { id: string }) => {
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
						<div className="card-title">Shipping information</div>

						{/* Shipping Method Toggle */}
						<div className="form-group-wrapper">
							<div className="form-group">
								<label>Shipping Method</label>
								<ToggleSetting
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									description="Choose your preferred shipping method."
									options={[
										{ key: 'by_zone', value: 'by_zone', label: 'By Zone' },
										{ key: 'by_distance', value: 'by_distance', label: 'By Distance' },
									]}
									value={formData.shipping_method || ''}
									onChange={handleToggleChange}
								/>
							</div>
						</div>


						{formData.payment_method === 'by_distance' &&
							<>
								{/* Default Cost */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="default_cost">Default Cost</label>
										<BasicInput
											name="default_cost"
											type="number"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.default_cost}
											onChange={handleChange}
										/>
									</div>
								</div>

								{/* Max Distance (km) */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="max_distance">Max Distance (km)</label>
										<BasicInput
											name="max_distance"
											type="number"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.max_distance}
											onChange={handleChange}
										/>
									</div>
								</div>

								{/* Local Pickup Cost */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="local_pickup_cost">Local Pickup Cost</label>
										<BasicInput
											name="local_pickup_cost"
											type="number"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.local_pickup_cost || ""}
											onChange={handleChange}
										/>
									</div>
								</div>

								{/* Distance-Cost Rules: */}
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="distance_cost_rules">Distance-Cost Rules:</label>
										{/* <NestedComponent
											fields={nestedFields ?? []}
											value={value}
											value={formData.local_pickup_cost || ""}
											onChange={handleChange}
										/> */}

										<BasicInput
											name="distance_cost_rules"
											type="number"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.distance_cost_rules || ""}
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

export default ShippingSettings;