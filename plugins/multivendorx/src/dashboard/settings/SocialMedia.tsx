import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, SuccessNotice, getApiLink } from 'zyra';
import { __ } from '@wordpress/i18n';

const SocialMedia = () => {
	const id = appLocalizer.store_id;
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		const updated = { ...formData, [name]: value };
		setFormData(updated);
		autoSave(updated);
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
			{/* Facebook */}
			<div className="form-group-wrapper">
				<div className="form-group">
					<label htmlFor="facebook">
						<i className="adminfont-facebook-fill"></i>{' '}
						{__('Facebook', 'multivendorx')}
					</label>
					<BasicInput
						name="facebook"
						 
						descClass="settings-metabox-description"
						value={formData.facebook}
						onChange={handleChange}
					/>
				</div>
			</div>

			{/* X / Twitter */}
			<div className="form-group-wrapper">
				<div className="form-group">
					<label htmlFor="twitter">
						<i className="adminfont-twitter"></i>{' '}
						{__('X', 'multivendorx')}
					</label>
					<BasicInput
						name="twitter"
						 
						descClass="settings-metabox-description"
						value={formData.twitter}
						onChange={handleChange}
					/>
				</div>
			</div>

			{/* LinkedIn */}
			<div className="form-group-wrapper">
				<div className="form-group">
					<label htmlFor="linkedin">
						<i className="adminfont-linkedin-border"></i>{' '}
						{__('LinkedIn', 'multivendorx')}
					</label>
					<BasicInput
						name="linkedin"
						 
						descClass="settings-metabox-description"
						value={formData.linkedin}
						onChange={handleChange}
					/>
				</div>
			</div>

			{/* YouTube */}
			<div className="form-group-wrapper">
				<div className="form-group">
					<label htmlFor="youtube">
						<i className="adminfont-youtube"></i>{' '}
						{__('YouTube', 'multivendorx')}
					</label>
					<BasicInput
						name="youtube"
						 
						descClass="settings-metabox-description"
						value={formData.youtube}
						onChange={handleChange}
					/>
				</div>
			</div>

			{/* Instagram */}
			<div className="form-group-wrapper">
				<div className="form-group">
					<label htmlFor="instagram">
						<i className="adminfont-mail"></i>{' '}
						{__('Instagram', 'multivendorx')}
					</label>
					<BasicInput
						name="instagram"
						 
						descClass="settings-metabox-description"
						value={formData.instagram}
						onChange={handleChange}
					/>
				</div>
			</div>

			<div className="form-group-wrapper">
				<div className="form-group">
					<label htmlFor="pinterest">
						<i className="adminfont-mail"></i>{' '}
						{__('Pinterest', 'multivendorx')}
					</label>
					<BasicInput
						name="pinterest"
						 
						descClass="settings-metabox-description"
						value={formData.pinterest}
						onChange={handleChange}
					/>
				</div>
			</div>

			<SuccessNotice message={successMsg} />
		</>
	);
};

export default SocialMedia;
