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
		key:string,
		value: string
	) => {
		const updated = { ...formData, [key]: value };
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
						value={formData.facebook}
						onChange={(value:string)=>handleChange('facebook',value)}
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
						value={formData.twitter}
						onChange={(value:string)=>handleChange('twitter',value)}
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
						value={formData.linkedin}
						onChange={(value:string)=>handleChange('linkedin',value)}
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
						value={formData.youtube}
						onChange={(value:string)=>handleChange('youtube',value)}
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
						value={formData.instagram}
						onChange={(value:string)=>handleChange('instagram',value)}
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
						value={formData.pinterest}
						onChange={(value:string)=>handleChange('pinterest',value)}
					/>
				</div>
			</div>

			<SuccessNotice message={successMsg} />
		</>
	);
};

export default SocialMedia;
