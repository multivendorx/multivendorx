/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	FormGroupComponent,
	FormGroupWrapperComponent,
	CardComponent,
	ContainerComponent,
	ColumnComponent,
} from '@zyra/components';
import { TextInput, ButtonInput, TextAreaInput } from '@zyra/inputs';
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
				url: formData.user_url || '',
				description: formData.description || '',
			},
		})
			.then((res) => {
				if (res.data?.id) {
					window.location.assign(`${appLocalizer.site_url}/dashboard/`);
				}
			})
			.catch((err) => console.error(err));
	};
	const handlePasswordSave = () => {
		if (!formData.password) return;

		if (formData.password !== formData.confirm_password) {
			setError(__('Passwords do not match', 'multivendorx'));
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
					window.location.assign(appLocalizer.user_logout_url);
				}
			})
			.catch((err) => console.error(err));
	};
	return (
		<>
			<ContainerComponent>
				<ColumnComponent row>

					<CardComponent title={__('Personal Information', 'multivendorx')}>
						<FormGroupWrapperComponent>

							<FormGroupComponent label={__('First Name', 'multivendorx')}>
								<TextInput
									value={formData.first_name || ''}
									onChange={(val) => handleChange('first_name', val)}
								/>
							</FormGroupComponent>

							<FormGroupComponent label={__('Last Name', 'multivendorx')}>
								<TextInput
									value={formData.last_name || ''}
									onChange={(val) => handleChange('last_name', val)}
								/>
							</FormGroupComponent>

							<FormGroupComponent label={__('Display Name', 'multivendorx')}>
								<TextInput
									value={formData.nickname || ''}
									onChange={(val) => handleChange('nickname', val)}
								/>
							</FormGroupComponent>

							<FormGroupComponent label={__('Website', 'multivendorx')}>
								<TextInput
									value={formData.user_url || ''}
									onChange={(val) => handleChange('user_url', val)}
								/>
							</FormGroupComponent>

							<FormGroupComponent label={__('Bio', 'multivendorx')}>
								<TextAreaInput
									value={formData.description || ''}
									onChange={(val) => handleChange('description', val)}
								/>
							</FormGroupComponent>

							<ButtonInput
								position="right"
								buttons={[
									{
										icon: 'plus',
										text: __('Save', 'multivendorx'),
										onClick: handleProfileSave,
									},
								]}
							/>

						</FormGroupWrapperComponent>
					</CardComponent>


					<CardComponent title={__('Change Password', 'multivendorx')}>
						<FormGroupWrapperComponent>

							<FormGroupComponent label={__('New Password', 'multivendorx')}>
								<TextInput
									type="password"
									value={formData.password || ''}
									onChange={(val) => handleChange('password', val)}
								/>
							</FormGroupComponent>

							<FormGroupComponent label={__('Confirm Password', 'multivendorx')}>
								<TextInput
									type="password"
									value={formData.confirm_password || ''}
									onChange={(val) => handleChange('confirm_password', val)}
									msg={{
										type: error,
										message: error
									}}
								/>
							</FormGroupComponent>

							<ButtonInput
								position="right"
								buttons={[
									{
										icon: 'plus',
										text: __('Save', 'multivendorx'),
										onClick: handlePasswordSave,
									},
								]}
							/>

						</FormGroupWrapperComponent>
					</CardComponent>

				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default ProfileUpdate;