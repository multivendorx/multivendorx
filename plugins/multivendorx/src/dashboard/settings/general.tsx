import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, SuccessNotice, getApiLink, FormGroupWrapper, FormGroup } from 'zyra';
import { __ } from '@wordpress/i18n';

const GeneralSettings = () => {
	const id = appLocalizer.store_id;
	const [formData, setFormData] = useState<{ [key: string]: any }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const settings =
		appLocalizer.settings_databases_value['store-capability']
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

	useEffect(() => {
		if (formData.country) {
			fetchStatesByCountry(formData.country);
		}
	}, [formData.country]);

	const fetchStatesByCountry = (countryCode: string) => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `states/${countryCode}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			setStateOptions(res.data || []);
		});
	};

	//Fixed: Corrected name and dynamic binding
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		const updated = { ...formData, [name]: value };
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
					<BasicInput
						name="name"
						 
						descClass="settings-metabox-description"
						value={formData.name || ''}
						onChange={handleChange}
						readOnly={settings.includes('store_name')}
					/>
				</FormGroup>

				<FormGroup
					label={__('Storefront link', 'multivendorx')}
					htmlFor="slug"
				>
					<BasicInput
						name="slug"
						 
						descClass="settings-metabox-description"
						value={formData.slug || ''}
						onChange={handleChange}
					/>
				</FormGroup>

				<FormGroup
					label={__('Description', 'multivendorx')}
					htmlFor="description"
				>
					<TextArea
						name="description"
						value={formData.description || ''}
						onChange={handleChange}
						readOnly={settings.includes('store_description')}
					/>
				</FormGroup>

				<FormGroup
					label={__(
						'Buyer welcome message after purchase',
						'multivendorx'
					)}
					htmlFor="messageToBuyer"
				>
					<BasicInput
						name="messageToBuyer"
						 
						descClass="settings-metabox-description"
						value={formData.messageToBuyer || ''}
						onChange={handleChange}
					/>
				</FormGroup>
			</FormGroupWrapper>


			<SuccessNotice message={successMsg} />
		</>
	);
};

export default GeneralSettings;
