import { useEffect, useState } from 'react';
import axios from 'axios';
import {SuccessNotice, getApiLink, FormGroupWrapper, FormGroup, BasicInputUI, TextAreaUI } from 'zyra';
import { __ } from '@wordpress/i18n';

const GeneralSettings = () => {
	const id = appLocalizer.store_id;
	const [formData, setFormData] = useState<{ [key: string]: any }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const settings =
		appLocalizer.settings_databases_value['store-permissions']
			?.edit_store_info_activation || [];
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

	//Fixed: Corrected name and dynamic binding
	const handleChange = (
		key:string,
		value:string
	) => {
		const updated = { ...formData, [key]: value };
		setFormData(updated);
		autoSave(updated);
	};

	const autoSave = (updatedData: { [key: string]: any }) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data?.success) {
				setSuccessMsg('Store saved successfully!');
			}
		});
	};

	return (
		<>
			<FormGroupWrapper>

				<FormGroup
					label={__('Name', 'multivendorx')}
					htmlFor="name"
				>
					<BasicInputUI
						value={formData.name || ''}
						onChange={(value:string)=>handleChange('name',value)}
						readOnly={!settings.includes('store_name')}
					/>
				</FormGroup>

				<FormGroup
					label={__('Storefront link', 'multivendorx')}
					htmlFor="slug"
				>
					<BasicInputUI
						value={formData.slug || ''}
						onChange={(value:string)=>handleChange('slug',value)}
					/>
				</FormGroup>

				<FormGroup
					label={__('Description', 'multivendorx')}
					htmlFor="description"
				>
					<TextAreaUI
						name="description"
						value={formData.description || ''}
						onChange={(value:string)=>handleChange('description',value)}
						readOnly={!settings.includes('store_description')}
					/>
				</FormGroup>

				<FormGroup
					label={__(
						'Buyer welcome message after purchase',
						'multivendorx'
					)}
					htmlFor="messageToBuyer"
				>
					<BasicInputUI
						name="messageToBuyer"
						value={formData.messageToBuyer || ''}
						onChange={(value:string)=>handleChange('messageToBuyer',value)}
					/>
				</FormGroup>
			</FormGroupWrapper>


			<SuccessNotice message={successMsg} />
		</>
	);
};

export default GeneralSettings;
