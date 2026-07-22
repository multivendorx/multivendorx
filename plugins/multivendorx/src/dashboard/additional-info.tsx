/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import {
	NoticeManager,
	ContainerComponent,
	ColumnComponent,
	CardComponent,
	FormGroupWrapperComponent,
	FormGroupComponent,
} from '@zyra/components';
import { TextAreaInput, ToggleInput } from '@zyra/inputs';
import { __ } from '@wordpress/i18n';

const AdditionalInformation = () => {
	const id = appLocalizer.store_id;
	const [formData, setFormData] = useState<{ [key: string] }>({});

	// Fetch store data
	useEffect(() => {
		if (!id) {
			return;
		}
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `stores/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setFormData((prev) => ({ ...prev, ...data }));
		});
	}, [id]);

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
			.post(getApiLink(appLocalizer, `stores/${id}`), updatedData, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				if (res.data.success) {
					NoticeManager.add({
						title: __('Great!', 'multivendorx'),
						message: __(
							'Store saved successfully!',
							'multivendorx'
						),
						type: 'success',
						position: 'float',
					});
				}
			});
	};

	return (
		<>
			<ContainerComponent general>
				<ColumnComponent grid={8}>
					{/* Message to Buyer */}
					<CardComponent title={__('Message to Buyer', 'multivendorx')}>
						<FormGroupWrapperComponent>
							<TextAreaInput
								name="messageToBuyer"
								value={formData.messageToBuyer || ''}
								onChange={handleChange}
							/>
						</FormGroupWrapperComponent>
					</CardComponent>

					{/* Privacy Controls */}
					<CardComponent title={__('Privacy Controls', 'multivendorx')}>
						<FormGroupWrapperComponent>
							<FormGroupComponent
								label={__('Hide Address', 'multivendorx')}
							>
								<ToggleInput
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
							</FormGroupComponent>

							<FormGroupComponent label={__('Hide Phone', 'multivendorx')}>
								<ToggleInput
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
							</FormGroupComponent>

							<FormGroupComponent label={__('Hide Phone', 'multivendorx')}>
								<ToggleInput
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
							</FormGroupComponent>
						</FormGroupWrapperComponent>
					</CardComponent>
				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default AdditionalInformation;
