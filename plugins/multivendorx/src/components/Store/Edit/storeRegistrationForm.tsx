import { useEffect, useState } from 'react';
import axios from 'axios';
import { TextArea, getApiLink } from 'zyra';

const StoreRegistration = ({ id }: { id: string }) => {
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
	
	const handleSubmit = (status: 'active' | 'reject') => {
		const updatedData = { ...formData, status };
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				setSuccessMsg(
					status === 'active'
						? 'Store approved successfully!'
						: 'Store rejected successfully!'
				);
				setFormData(updatedData); // update local state
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
			<label htmlFor="product-name">Note</label>
				<div className="card-wrapper width-65">
					<div className="card-content">
						<div className="form-group-wrapper">
							<div className="form-group">
								<TextArea name="note" wrapperClass="setting-from-textarea"
									placeholder='Optional note for approval or rejection'
									inputClass="textarea-input"
									descClass="settings-metabox-description" value={formData.note} onChange={handleChange} />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="buttons-wrapper" >
				<button
					className="admin-btn btn-green"
					onClick={() => handleSubmit('active')}
				>
					Approve
				</button>

				<button
					className="admin-btn btn-red"
					onClick={() => handleSubmit('reject')}
				>
					Reject
				</button>
			</div>
		</>
	);
};

export default StoreRegistration;