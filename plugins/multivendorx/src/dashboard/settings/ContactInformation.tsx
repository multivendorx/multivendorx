import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
	TextArea,
	FileInput,
	useModules,
	getApiLink,
	SuccessNotice,
	FormGroupWrapper,
	FormGroup,
	BasicInputUI,
	SelectInputUI,
	CountryCodes,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const ContactInformation = () => {
	const id = appLocalizer.store_id;
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const settings =
		appLocalizer.settings_databases_value['store-permissions']
			?.edit_store_info_activation || [];
	const { modules } = useModules();

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
		value:string
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

	const ensurePhonePrefix = (code: string, phone: string) => {
		if (!code) return phone || '';
	
		const raw = phone || '';
	
		// If already starts with correct code → keep typing
		if (raw.startsWith(code)) return raw;
	
		// Remove ONLY old prefix (not entire number)
		const withoutOldPrefix = raw.replace(/^\+\d{1,4}/, '');
	
		return code + withoutOldPrefix;
	};	


	return (
		<>
			<SuccessNotice message={successMsg} />
			<FormGroupWrapper>
				<FormGroup
					label={__('Phone', 'multivendorx')}
					htmlFor="phone"
					cols={2}
				>
					<SelectInputUI
						name="country_code"
						value={formData.country_code}
						options={CountryCodes}
						onChange={(selected: { value: string }) => {
							setFormData((prev) => {
								const newPhone = ensurePhonePrefix(
									selected.value,
									prev.phone || ''
								);

								const updated = {
									...prev,
									country_code: selected.value,
									phone: newPhone,
								};

								autoSave(updated);
								return updated;
							});
						}}
					/>
					<BasicInputUI
						value={formData.phone}
						onChange={(value:string)=>handleChange('phone',value)}
						readOnly={settings.includes('store_contact')}
					/>
				</FormGroup>
				<FormGroup
					label={__('Email / Additional Email', 'multivendorx')}
					htmlFor="email"
					cols={2}
				>
					<BasicInputUI
						type="email"
						value={formData.email}
						onChange={(value:string)=>handleChange('phone',value)}
						readOnly={settings.includes('store_contact')}
					/>
				</FormGroup>

				{modules.includes('live-chat') && (
					<FormGroup
						label={__(
							'Live Chat (Enable, WhatsApp, etc.)',
							'multivendorx'
						)}
						htmlFor="live_chat"
					>
						<BasicInputUI
							name="live_chat"
						/>
					</FormGroup>
				)}

			</FormGroupWrapper>

		</>
	);
};

export default ContactInformation;
