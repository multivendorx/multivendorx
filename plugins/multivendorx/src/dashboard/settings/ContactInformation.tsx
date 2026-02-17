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
	return (
		<>
			<SuccessNotice message={successMsg} />
			<FormGroupWrapper>
				<FormGroup
					label={__('Phone', 'multivendorx')}
					htmlFor="phone"
					cols={2}
				>
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
