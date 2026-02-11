import { useEffect, useState } from 'react';
import axios from 'axios';
import {   BasicInputUI, SuccessNotice, getApiLink } from 'zyra';
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
					<BasicInputUI
						name="facebook"
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
					<BasicInputUI
						name="twitter"
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
					<BasicInputUI
						name="linkedin"
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
					<BasicInputUI
						name="youtube"
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
					<BasicInputUI
						name="instagram"
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
					<BasicInputUI
						name="pinterest"
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
