/* global appLocalizer */
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	BasicInputUI,
	FormGroup,
	FormGroupWrapper,
	ButtonInputUI,
	Notice,
} from 'zyra';
import axios from 'axios';
import { getApiLink } from 'zyra';

const ProfileUpdate: React.FC = () => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	const handleChange = (key: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleSave = () => {
		const isPasswordChanged = !!formData.password;

		axios({
			method: 'POST',
			url: `${appLocalizer.apiUrl}/wp/v2/users/me`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				first_name: formData.first_name || '',
				last_name: formData.last_name || '',
				...(isPasswordChanged && { password: formData.password }),
			},
		})
			.then((res) => {
				if (res.data?.id) {
					// 🔐 If password changed → logout
					if (isPasswordChanged) {
						setTimeout(() => {
							window.location.href = appLocalizer.user_logout_url;
						}, 1000);
					} else {
						setTimeout(() => {
							window.location.href = `${appLocalizer.site_url}/dashboard/`;
						}, 1000);
					}

					setFormData((prev) => ({
						...prev,
						password: '',
					}));
				}
			})
			.catch((err) => {
				console.error(err);
			});
	};
	return (
		<>

			<FormGroupWrapper>

				<FormGroup label={__('First Name', 'multivendorx-pro')}>
					<BasicInputUI
						value={formData.first_name || ''}
						onChange={(val) => handleChange('first_name', val)}
					/>
				</FormGroup>

				<FormGroup label={__('Last Name', 'multivendorx-pro')}>
					<BasicInputUI
						value={formData.last_name || ''}
						onChange={(val) => handleChange('last_name', val)}
					/>
				</FormGroup>

				<FormGroup label={__('New Password', 'multivendorx-pro')}>
					<BasicInputUI
						type="password"
						value={formData.password || ''}
						onChange={(val) => handleChange('password', val)}
					/>
				</FormGroup>
				<ButtonInputUI
					position="right"
					buttons={[
						{
							icon: 'plus',
							text: 'save',
							onClick: handleSave,
						},
					]}
				/>
			</FormGroupWrapper>
		</>
	);
};

export default ProfileUpdate;