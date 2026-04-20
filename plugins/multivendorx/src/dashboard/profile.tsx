/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	BasicInputUI,
	FormGroup,
	FormGroupWrapper,
	ButtonInputUI,
	Card,
	Container,
	Column,
	TextAreaUI,
} from 'zyra';
import axios from 'axios';

const ProfileUpdate: React.FC = () => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [error, setError] = useState<string>('');
	const handleChange = (key: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleProfileSave = () => {
		axios({
			method: 'POST',
			url: `${appLocalizer.apiUrl}/wp/v2/users/me`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				first_name: formData.first_name || '',
				last_name: formData.last_name || '',
				nickname: formData.nickname || '',
				email: formData.email || '',
				url: formData.user_url || '',
				description: formData.description || '',
			},
		})
			.then((res) => {
				if (res.data?.id) {
					window.location.href = `${appLocalizer.site_url}/dashboard/`;
				}
			})
			.catch((err) => console.error(err));
	};
	const handlePasswordSave = () => {
		if (!formData.password) return;

		if (formData.password !== formData.confirm_password) {
			setError('Passwords do not match');
			return;
		}

		axios({
			method: 'POST',
			url: `${appLocalizer.apiUrl}/wp/v2/users/me`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				password: formData.password,
			},
		})
			.then((res) => {
				if (res.data?.id) {
					window.location.href = appLocalizer.user_logout_url;
				}
			})
			.catch((err) => console.error(err));
	};
	return (
		<>
			<Container>
				<Column row>

					<Card title={__('Personal Information', 'multivendorx-pro')}>
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

							<FormGroup label={__('Display Name', 'multivendorx-pro')}>
								<BasicInputUI
									value={formData.nickname || ''}
									onChange={(val) => handleChange('nickname', val)}
								/>
							</FormGroup>

							<FormGroup label={__('Email', 'multivendorx-pro')}>
								<BasicInputUI
									type="email"
									value={formData.email || ''}
									onChange={(val) => handleChange('email', val)}
								/>
							</FormGroup>

							<FormGroup label={__('Website', 'multivendorx-pro')}>
								<BasicInputUI
									value={formData.user_url || ''}
									onChange={(val) => handleChange('user_url', val)}
								/>
							</FormGroup>

							<FormGroup label={__('Bio', 'multivendorx-pro')}>
								<TextAreaUI
									value={formData.description || ''}
									onChange={(val) => handleChange('description', val)}
								/>
							</FormGroup>

							<ButtonInputUI
								position="right"
								buttons={[
									{
										icon: 'plus',
										text: __('Save', 'multivendorx-pro'),
										onClick: handleProfileSave,
									},
								]}
							/>

						</FormGroupWrapper>
					</Card>


					<Card title={__('Change Password', 'multivendorx-pro')}>
						<FormGroupWrapper>

							<FormGroup label={__('New Password', 'multivendorx-pro')}>
								<BasicInputUI
									type="password"
									value={formData.password || ''}
									onChange={(val) => handleChange('password', val)}
								/>
							</FormGroup>

							<FormGroup label={__('Confirm Password', 'multivendorx-pro')}>
								<BasicInputUI
									type="password"
									value={formData.confirm_password || ''}
									onChange={(val) => handleChange('confirm_password', val)}
									msg={{
										type: error,
										message: error
									}}
								/>
							</FormGroup>

							<ButtonInputUI
								position="right"
								buttons={[
									{
										icon: 'plus',
										text: __('Save', 'multivendorx-pro'),
										onClick: handlePasswordSave,
									},
								]}
							/>

						</FormGroupWrapper>
					</Card>

				</Column>
			</Container>
		</>
	);
};

export default ProfileUpdate;